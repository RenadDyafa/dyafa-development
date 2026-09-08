import type { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { ok } from "@/lib/api/response";
import { getPublishedOpportunities } from "@/lib/opportunities/service";

export async function GET(req: NextRequest) {
  if (!env.featureOpportunities) {
    return ok({ items: [], featureEnabled: false });
  }

  const { searchParams } = req.nextUrl;
  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";
  const type = searchParams.get("type") as "land_offering" | "development_partnership" | "existing_asset" | null;
  const city = searchParams.get("city") ?? undefined;

  const items = await getPublishedOpportunities({ locale, type: type ?? undefined, city });
  return ok({ items, featureEnabled: true });
}
