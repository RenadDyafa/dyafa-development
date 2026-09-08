export const UTM_COOKIE_NAME = "dyafa_attribution";
export const UTM_COOKIE_MAX_AGE_DAYS = 90;

export type UtmAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  campaignId?: string;
};

export function parseUtmCookie(raw: string | undefined): UtmAttribution {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as UtmAttribution;
  } catch {
    return {};
  }
}

export function extractUtmFromSearchParams(searchParams: URLSearchParams): UtmAttribution {
  const attribution: UtmAttribution = {};
  const map: Record<string, keyof UtmAttribution> = {
    utm_source: "utmSource",
    utm_medium: "utmMedium",
    utm_campaign: "utmCampaign",
    utm_term: "utmTerm",
    utm_content: "utmContent",
  };
  for (const [param, key] of Object.entries(map)) {
    const value = searchParams.get(param);
    if (value) attribution[key] = value;
  }
  return attribution;
}
