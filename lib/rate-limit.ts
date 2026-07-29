/**
 * Simple in-memory rate limiter (per IP, per endpoint).
 * Resets on server restart — good enough for Vercel serverless (short-lived instances).
 * For persistent limits across instances, swap the Map for a Redis/Upstash store.
 */

interface RateLimitEntry {
  count:     number
  resetAt:   number  // Unix ms
}

// Keyed by `${endpoint}:${ip}`
const store = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  /** Max allowed requests per window */
  limit:  number
  /** Window duration in seconds */
  window: number
}

export interface RateLimitResult {
  allowed:    boolean
  remaining:  number
  resetAt:    number  // Unix ms
}

export function rateLimit(
  ip: string,
  endpoint: string,
  { limit, window: windowSecs }: RateLimitOptions,
): RateLimitResult {
  const key = `${endpoint}:${ip}`
  const now = Date.now()

  let entry = store.get(key)

  // Expired or first visit — start fresh
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowSecs * 1000 }
  }

  entry.count += 1
  store.set(key, entry)

  // Prune stale entries periodically (every ~100 calls to avoid O(n) on every request)
  if (Math.random() < 0.01) {
    for (const [k, v] of store) {
      if (now >= v.resetAt) store.delete(k)
    }
  }

  return {
    allowed:   entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt:   entry.resetAt,
  }
}

/** Extract the real client IP from a Next.js request */
export function getClientIp(req: { headers: { get(key: string): string | null } }): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
