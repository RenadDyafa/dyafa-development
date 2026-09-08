"use client";

import { useEffect } from "react";
import { UTM_COOKIE_NAME, UTM_COOKIE_MAX_AGE_DAYS, extractUtmFromSearchParams } from "@/lib/utm";

function getCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

// First-touch UTM capture: writes the cookie once and never overwrites it,
// so a lead's original acquisition source survives later navigation.
export function UtmCapture() {
  useEffect(() => {
    if (getCookie(UTM_COOKIE_NAME)) return;

    const params = new URLSearchParams(window.location.search);
    const attribution = extractUtmFromSearchParams(params);
    const campaignMatch = window.location.pathname.match(/\/campaigns\/([^/]+)/);
    if (campaignMatch) attribution.campaignId = campaignMatch[1];

    if (Object.keys(attribution).length === 0) return;

    const maxAge = UTM_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
    document.cookie = `${UTM_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(attribution))}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }, []);

  return null;
}
