const hits = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_HITS = 20;

export function checkRateLimit(key: string, maxHits = MAX_HITS): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_HITS - 1 };
  }

  entry.count++;

  if (entry.count > maxHits) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxHits - entry.count };
}

export function rateLimitKey(ip: string, route: string): string {
  return `${route}:${ip}`;
}
