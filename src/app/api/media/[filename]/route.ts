import { stat } from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import type { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { notFound, fail } from "@/lib/api/response";

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
};

function nodeStreamToWebStream(nodeStream: NodeJS.ReadableStream): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk as Buffer)));
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      if ("destroy" in nodeStream && typeof nodeStream.destroy === "function") nodeStream.destroy();
    },
  });
}

// Public, unauthenticated file serving for CMS media (site logo, insight/
// opportunity/news cover images, team photos, home-slider video/image
// slides) — scoped to the "media" storage namespace only. Lead documents
// stay behind /api/admin/storage/[filename] (authenticated, "leads"
// namespace) — the two namespaces must never share a serving route
// (FEATURES §7).
//
// Range-request support (206 Partial Content) is required for video: without
// it, browsers can't seek/scrub, and Safari in particular will refuse to
// play some video at all. Images ignore Range and always get a plain 200.
export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  const filename = path.basename(params.filename);
  const ext = filename.split(".").pop() ?? "";
  const mime = MIME_BY_EXT[ext];
  if (!mime) return notFound();

  const filePath = path.resolve(process.cwd(), env.storageLocalDir, "media", filename);

  let size: number;
  try {
    size = (await stat(filePath)).size;
  } catch {
    return notFound();
  }

  const range = req.headers.get("range");
  if (!range) {
    return new Response(nodeStreamToWebStream(createReadStream(filePath)), {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) return fail("VALIDATION_ERROR", "Invalid Range header", 416);

  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : size - 1;
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= size) {
    return fail("VALIDATION_ERROR", "Invalid Range header", 416);
  }

  return new Response(nodeStreamToWebStream(createReadStream(filePath, { start, end })), {
    status: 206,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
