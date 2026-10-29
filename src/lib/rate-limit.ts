type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Simple in-memory rate limiter (per-instance). Suitable for basic abuse prevention. */
export function rateLimit(
  key: string,
  limit = 8,
  windowMs = 60_000,
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count };
}

export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + (process.env.RATE_LIMIT_SALT ?? "minicowfarm"));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}
