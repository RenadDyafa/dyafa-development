import type { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { ok } from "@/lib/api/response";
import { getPublishedNews } from "@/lib/news/service";

export async function GET(req: NextRequest) {
  if (!env.featureNews) {
    return ok({ items: [], featureEnabled: false });
  }

  const { searchParams } = req.nextUrl;
  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";
  const items = await getPublishedNews({ locale });
  return ok({ items, featureEnabled: true });
}
