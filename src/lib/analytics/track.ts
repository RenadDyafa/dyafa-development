// Fire-and-forget client event beacon -> POST /api/events (first-party,
// no PII: the API hashes IP+UA server-side, never stores raw values).
// Analytics must never break the calling UI, so every failure is swallowed.
export function track(name: string, extra?: Record<string, string>) {
  if (typeof window === "undefined") return;

  try {
    const payload = JSON.stringify({
      name,
      path: window.location.pathname,
      ...(extra ? { utm: extra } : {}),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
    }
  } catch {
    // Non-fatal - analytics is an enhancement, never a blocker.
  }
}
