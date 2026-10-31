import { z } from "zod";

export const MAX_BODY_BYTES = 20 * 1024; // 20 KB
export const DEFAULT_RATE_LIMIT = 20; // 20 requests
export const DEFAULT_RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Resets the in-memory rate limit store (useful for automated testing).
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}

/**
 * Extracts client IP from incoming request headers or falls back to local IP.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Enforces per-IP sliding window rate limiting.
 */
export function checkRateLimit(
  ip: string,
  limit: number = DEFAULT_RATE_LIMIT,
  windowMs: number = DEFAULT_RATE_WINDOW_MS
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (record && now < record.resetTime) {
    if (record.count >= limit) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }
    record.count += 1;
    return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
  }

  const resetTime = now + windowMs;
  rateLimitStore.set(ip, { count: 1, resetTime });
  return { allowed: true, remaining: limit - 1, resetTime };
}

/**
 * Parses and strictly validates JSON body against size limits and Zod schema.
 * Rejects oversized payloads (>20KB) and invalid schemas with generic error messages.
 */
export async function parseSecureJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<{ success: true; data: T } | { success: false; status: number; error: string }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return { success: false, status: 413, error: "Payload too large." };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { success: false, status: 400, error: "Invalid request payload." };
  }

  const byteLength = new TextEncoder().encode(text).length;
  if (byteLength > MAX_BODY_BYTES) {
    return { success: false, status: 413, error: "Payload too large." };
  }

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(text);
  } catch {
    return { success: false, status: 400, error: "Invalid request payload." };
  }

  const parseResult = schema.safeParse(rawJson);
  if (!parseResult.success) {
    return { success: false, status: 400, error: "Invalid request payload." };
  }

  return { success: true, data: parseResult.data };
}

