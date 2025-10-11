import { CONFIG } from './constants';

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or Upstash
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if request should be rate limited
 * Returns true if rate limit exceeded
 */
export function isRateLimited(
  identifier: string,
  limitSeconds: number = CONFIG.RATE_LIMIT_POST_SECONDS,
  burst: number = CONFIG.RATE_LIMIT_BURST
): boolean {
  const now = Date.now();
  const key = `post:${identifier}`;
  
  const entry = rateLimitStore.get(key);

  if (!entry) {
    // First request
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + limitSeconds * 1000,
    });
    return false;
  }

  // Check if window has expired
  if (entry.resetAt < now) {
    // Reset window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + limitSeconds * 1000,
    });
    return false;
  }

  // Check if burst limit exceeded
  if (entry.count >= burst) {
    return true; // Rate limited
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  return false;
}

/**
 * Get remaining time until rate limit reset
 */
export function getRateLimitReset(identifier: string): number {
  const key = `post:${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return 0;
  }

  const now = Date.now();
  const remaining = Math.max(0, entry.resetAt - now);
  return Math.ceil(remaining / 1000); // Return seconds
}

/**
 * Clear rate limit for identifier (for testing or admin override)
 */
export function clearRateLimit(identifier: string): void {
  const key = `post:${identifier}`;
  rateLimitStore.delete(key);
}

