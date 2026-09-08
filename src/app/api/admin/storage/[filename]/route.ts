import { readFile } from "fs/promises";
import path from "path";
import type { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { unauthorized, forbidden, notFound } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

// Authenticated-only file serving for LEAD documents specifically (scoped to
// the "leads" storage namespace) — these are never publicly listed or
// linked (FEATURES §7). CMS media (e.g. insight cover images) lives in a
// separate "media" namespace served publicly by /api/media/[filename].
export async function GET(_req: NextRequest, { params }: { params: { filename: string } }) {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const filename = path.basename(params.filename);
  const ext = filename.split(".").pop() ?? "";
  const mime = MIME_BY_EXT[ext];
  if (!mime) return notFound();

  try {
    const buffer = await readFile(path.resolve(process.cwd(), env.storageLocalDir, "leads", filename));
    return new Response(new Uint8Array(buffer), { headers: { "Content-Type": mime } });
  } catch {
    return notFound();
  }
}
