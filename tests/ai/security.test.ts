import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";
import {
  checkRateLimit,
  resetRateLimitStore,
  getClientIp,
  parseSecureJsonBody,
  MAX_BODY_BYTES,
} from "@/lib/ai/security";

describe("Security: Rate Limiting & Body Protection", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("extracts client IP from x-forwarded-for header", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("falls back to x-real-ip if x-forwarded-for is missing", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { "x-real-ip": "198.51.100.1" },
    });
    expect(getClientIp(req)).toBe("198.51.100.1");
  });

  it("falls back to 127.0.0.1 if no IP headers are present", () => {
    const req = new Request("http://localhost/api/test");
    expect(getClientIp(req)).toBe("127.0.0.1");
  });

  it("allows requests under the rate limit (20 requests) and blocks the 21st", () => {
    const ip = "192.168.1.10";
    for (let i = 1; i <= 20; i++) {
      const res = checkRateLimit(ip, 20, 60000);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(20 - i);
    }

    // 21st request should be blocked
    const blockedRes = checkRateLimit(ip, 20, 60000);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });

  it("isolates rate limits by IP address", () => {
    const ip1 = "10.0.0.1";
    const ip2 = "10.0.0.2";

    for (let i = 0; i < 20; i++) {
      checkRateLimit(ip1, 20);
    }
    expect(checkRateLimit(ip1, 20).allowed).toBe(false);
    expect(checkRateLimit(ip2, 20).allowed).toBe(true);
  });

  it("rejects request bodies larger than 20 KB with status 413", async () => {
    const oversizedString = "A".repeat(MAX_BODY_BYTES + 50);
    const body = JSON.stringify({ data: oversizedString });

    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });

    const schema = z.object({ data: z.string() });
    const result = await parseSecureJsonBody(req, schema);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(413);
      expect(result.error).toBe("Payload too large.");
    }
  });

  it("rejects request with content-length header exceeding 20 KB immediately", async () => {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": "30000",
      },
      body: JSON.stringify({ focus: "theme" }),
    });

    const schema = z.object({ focus: z.string() });
    const result = await parseSecureJsonBody(req, schema);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(413);
      expect(result.error).toBe("Payload too large.");
    }
  });

  it("returns generic 400 error on malformed JSON without leaking error details", async () => {
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{ broken json...",
    });

    const schema = z.object({ any: z.string() });
    const result = await parseSecureJsonBody(req, schema);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(400);
      expect(result.error).toBe("Invalid request payload.");
      expect(result.error).not.toContain("SyntaxError");
    }
  });
});

