import type { NextRequest } from "next/server";
import { ok, fail, rateLimited } from "@/lib/api/response";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimit";
import { searchSite } from "@/lib/search/service";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterMs } = checkRateLimit(`search:${ip}`);
  if (!allowed) return rateLimited(retryAfterMs);

  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q") ?? "";
  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";

  if (query.trim().length < 2) {
    return fail("VALIDATION_ERROR", "Query must be at least 2 characters", 422);
  }

  const results = await searchSite(query, locale);
  return ok({ results, query });
}
