import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { env } from "@/lib/env";

export type StoredFile = {
  path: string;
  filename: string;
  mime: string;
  size: number;
};

const EXT_BY_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const MAGIC_BYTES: Array<{ mime: string; check: (buf: Buffer) => boolean }> = [
  { mime: "application/pdf", check: (buf) => buf.subarray(0, 4).toString("latin1") === "%PDF" },
  { mime: "image/jpeg", check: (buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[buf.length - 2] === 0xff },
  { mime: "image/png", check: (buf) => buf.subarray(0, 8).toString("hex") === "89504e470d0a1a0a" },
  {
    mime: "image/webp",
    check: (buf) => buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP",
  },
  // ISO base media file format (MP4/MOV/...) box structure: the first box's
  // size is 4 bytes, followed by a 4-byte box type - "ftyp" for any MP4-family
  // file, regardless of the size value in the first 4 bytes.
  { mime: "video/mp4", check: (buf) => buf.subarray(4, 8).toString("latin1") === "ftyp" },
  // WebM/Matroska container: EBML header magic number.
  { mime: "video/webm", check: (buf) => buf.subarray(0, 4).toString("hex") === "1a45dfa3" },
];

export function detectMimeFromMagicBytes(buffer: Buffer): string | null {
  const match = MAGIC_BYTES.find((entry) => entry.check(buffer));
  return match?.mime ?? null;
}

// Two separate on-disk namespaces so a public-serving route for CMS media
// can never accidentally reach a lead's private uploaded documents:
//   storage/uploads/leads/  — never served without admin auth (FEATURES §7)
//   storage/uploads/media/  — served publicly once attached to published content
export type StorageNamespace = "leads" | "media";

// Local-disk implementation for dev; an S3-compatible adapter would satisfy
// the same interface and is selected via STORAGE_DRIVER in production.
export async function storeUploadedFile(
  originalFilename: string,
  buffer: Buffer,
  _declaredMime: string,
  options: { allowedMimes?: string[]; namespace: StorageNamespace },
): Promise<StoredFile> {
  if (env.storageDriver !== "local") {
    throw new Error(`Storage driver "${env.storageDriver}" is not configured. Set S3_* env vars and implement lib/storage/s3.ts.`);
  }

  const detected = detectMimeFromMagicBytes(buffer);
  const allowed = options.allowedMimes ?? ["application/pdf", "image/jpeg"];
  if (!detected || !allowed.includes(detected)) {
    throw new StorageValidationError(`File content does not match an accepted type (${allowed.join(", ")}).`);
  }

  const safeName = `${randomUUID()}.${EXT_BY_MIME[detected]}`;
  const dir = path.resolve(process.cwd(), env.storageLocalDir, options.namespace);
  await mkdir(dir, { recursive: true });
  const fullPath = path.join(dir, safeName);
  await writeFile(fullPath, buffer);

  return {
    path: `local:${options.namespace}/${safeName}`,
    filename: originalFilename,
    mime: detected,
    size: buffer.length,
  };
}

// Converts a stored "local:media/<file>" path into a URL the browser can
// load directly. Only ever call this for Media rows (never for LeadFile
// paths, which must stay behind the authenticated admin storage route).
export function publicStorageUrl(storedPath: string): string | null {
  const match = /^local:media\/(.+)$/.exec(storedPath);
  if (!match) return null;
  return `/api/media/${match[1]}`;
}

export class StorageValidationError extends Error {}
