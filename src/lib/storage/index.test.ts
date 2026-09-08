import { describe, it, expect, afterEach } from "vitest";
import { unlink } from "fs/promises";
import path from "path";
import { detectMimeFromMagicBytes, publicStorageUrl, storeUploadedFile, StorageValidationError } from "./index";

const PNG_BYTES = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");
const PDF_BYTES = Buffer.from("%PDF-1.4\n%fake");
const MP4_BYTES = Buffer.concat([Buffer.from([0x00, 0x00, 0x00, 0x20]), Buffer.from("ftypisom"), Buffer.alloc(16)]);
const WEBM_BYTES = Buffer.concat([Buffer.from("1a45dfa3", "hex"), Buffer.alloc(16)]);

const written: string[] = [];

afterEach(async () => {
  await Promise.all(written.splice(0).map((p) => unlink(p).catch(() => undefined)));
});

describe("detectMimeFromMagicBytes", () => {
  it("identifies PNG and PDF content by magic bytes, not by declared type", () => {
    expect(detectMimeFromMagicBytes(PNG_BYTES)).toBe("image/png");
    expect(detectMimeFromMagicBytes(PDF_BYTES)).toBe("application/pdf");
  });

  it("identifies MP4 (ISO base media, ftyp box) and WebM (EBML header) content", () => {
    expect(detectMimeFromMagicBytes(MP4_BYTES)).toBe("video/mp4");
    expect(detectMimeFromMagicBytes(WEBM_BYTES)).toBe("video/webm");
  });

  it("returns null for content that matches no known signature", () => {
    expect(detectMimeFromMagicBytes(Buffer.from("not a real file"))).toBeNull();
  });
});

describe("storeUploadedFile", () => {
  it("rejects content whose magic bytes don't match an allowed type, even with a spoofed declared mime", async () => {
    await expect(
      storeUploadedFile("evil.pdf", Buffer.from("<script>alert(1)</script>"), "application/pdf", {
        allowedMimes: ["application/pdf"],
        namespace: "leads",
      }),
    ).rejects.toBeInstanceOf(StorageValidationError);
  });

  it("stores a lead upload under the leads/ namespace with a random filename", async () => {
    const result = await storeUploadedFile("site-plan.pdf", PDF_BYTES, "application/pdf", {
      allowedMimes: ["application/pdf"],
      namespace: "leads",
    });
    written.push(path.resolve(process.cwd(), "storage/uploads", "leads", result.path.replace("local:leads/", "")));

    expect(result.path).toMatch(/^local:leads\/[0-9a-f-]{36}\.pdf$/);
    expect(result.mime).toBe("application/pdf");
  });

  it("stores a media upload under the media/ namespace", async () => {
    const result = await storeUploadedFile("cover.png", PNG_BYTES, "image/png", {
      allowedMimes: ["image/png", "image/jpeg", "image/webp"],
      namespace: "media",
    });
    written.push(path.resolve(process.cwd(), "storage/uploads", "media", result.path.replace("local:media/", "")));

    expect(result.path).toMatch(/^local:media\/[0-9a-f-]{36}\.png$/);
  });

  it("stores an mp4 video upload under the media/ namespace when video mimes are allowed", async () => {
    const result = await storeUploadedFile("slide.mp4", MP4_BYTES, "video/mp4", {
      allowedMimes: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"],
      namespace: "media",
    });
    written.push(path.resolve(process.cwd(), "storage/uploads", "media", result.path.replace("local:media/", "")));

    expect(result.path).toMatch(/^local:media\/[0-9a-f-]{36}\.mp4$/);
    expect(result.mime).toBe("video/mp4");
  });
});

describe("publicStorageUrl", () => {
  it("builds a public /api/media URL for a media-namespace path", () => {
    expect(publicStorageUrl("local:media/abc-123.png")).toBe("/api/media/abc-123.png");
  });

  it("refuses to build a public URL for a leads-namespace path, so private lead documents can never be linked as public media", () => {
    expect(publicStorageUrl("local:leads/abc-123.pdf")).toBeNull();
  });
});
