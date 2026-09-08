import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, unauthorized, forbidden } from "@/lib/api/response";
import { requireUser, AuthError } from "@/lib/authz";
import { assertSameOrigin } from "@/lib/security/csrf";
import { storeUploadedFile, StorageValidationError } from "@/lib/storage";

export async function GET() {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return ok(media);
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return forbidden();

  let user;
  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError) return error.status === 401 ? unauthorized() : forbidden();
    throw error;
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return fail("VALIDATION_ERROR", "No file provided", 422);

  const altEn = String(formData.get("altEn") ?? "");
  const altAr = String(formData.get("altAr") ?? "");
  const isConceptVisual = formData.get("isConceptVisual") === "true";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storeUploadedFile(file.name, buffer, file.type, {
      allowedMimes: ["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4", "video/webm"],
      namespace: "media",
    });

    const kind = stored.mime === "application/pdf" ? "document" : stored.mime.startsWith("video/") ? "video" : "image";

    const media = await prisma.media.create({
      data: {
        path: stored.path,
        altEn,
        altAr,
        kind,
        isConceptVisual,
        createdById: user.id,
      },
    });

    return ok(media, 201);
  } catch (error) {
    if (error instanceof StorageValidationError) return fail("VALIDATION_ERROR", error.message, 422);
    throw error;
  }
}
