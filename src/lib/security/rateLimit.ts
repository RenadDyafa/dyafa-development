import { env } from "@/lib/env";

type Bucket = { count: number; resetAt: number };

// In-memory fixed-window limiter, keyed by "route:ip". Sufficient for a
// single-instance Node deployment; a multi-instance deployment needs a
// shared store (Redis) instead — see README "Scaling notes".
const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + env.rateLimitWindowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count >= env.rateLimitMax) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
