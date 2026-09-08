import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

// Signed, non-indexed draft preview links (FEATURES §5 "Preview mode").
export function signPreviewToken(entityId: string): string {
  return createHmac("sha256", env.nextAuthSecret).update(entityId).digest("hex").slice(0, 32);
}

export function verifyPreviewToken(entityId: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = signPreviewToken(entityId);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
