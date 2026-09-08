import type { NextRequest } from "next/server";
import { getPublishedInsights } from "@/lib/insights/service";
import { ok, fail } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";
  const pillarKey = searchParams.get("pillar") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = 12;

  if (!Number.isFinite(page) || page < 1) {
    return fail("VALIDATION_ERROR", "Invalid page", 422);
  }

  const insights = await getPublishedInsights({ locale, limit: limit * page, pillarKey });
  const paged = insights.slice((page - 1) * limit, page * limit);

  return ok({ items: paged, page, hasMore: insights.length > page * limit });
}
