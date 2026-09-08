import { env } from "@/lib/env";

// Defense-in-depth same-origin check for admin mutations, on top of the
// NextAuth session cookie's SameSite=Lax protection (which already blocks
// cross-site fetch/XHR from attaching credentials).
export function assertSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin requests from same-site navigations may omit Origin
  try {
    return new URL(origin).origin === new URL(env.siteUrl).origin;
  } catch {
    return false;
  }
}
