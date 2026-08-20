// ===========================================
// FoundIt — Rate Limiting
// ===========================================
// In-memory rate limiter per IP address.
// ===========================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Check rate limit for a given key and IP
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  category: string,
  identifier: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  if (!stores.has(category)) {
    stores.set(category, new Map());
  }
  const store = stores.get(category)!;
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

/**
 * Rate limit helper for server actions
 * Throws error if rate limited
 */
export function enforceRateLimit(
  category: string,
  identifier: string,
  max: number,
  windowMs: number
): void {
  const result = checkRateLimit(category, identifier, max, windowMs);
  if (!result.allowed) {
    throw new Error('Too many requests. Please try again later.');
  }
}

// Periodic cleanup of expired entries (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const store of Array.from(stores.values())) {
      for (const [key, entry] of Array.from(store.entries())) {
        if (now > entry.resetAt) {
          store.delete(key);
        }
      }
    }
  }, 5 * 60 * 1000);
}
