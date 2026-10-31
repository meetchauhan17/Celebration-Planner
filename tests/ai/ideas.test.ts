import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ideas/route";
import { resetRateLimitStore } from "@/lib/ai/security";

const mockChatCreate = vi.fn();
let isConfigured = true;

vi.mock("@/lib/ai/groq", () => ({
  GROQ_MODEL: "llama-3.3-70b-versatile",
  checkAiConfigured: () => isConfigured,
  isAiConfigured: true,
  groq: {
    chat: {
      completions: {
        create: (...args: unknown[]) => mockChatCreate(...args),
      },
    },
  },
}));

describe("POST /api/ideas", () => {
  beforeEach(() => {
    resetRateLimitStore();
    mockChatCreate.mockReset();
    isConfigured = true;
  });

  const validIdeasPayload = {
    eventType: "wedding",
    focus: "theme",
    venueType: "outdoor",
    cityTier: "tier2",
    guestCount: 200,
    totalBudget: 1000000,
    mood: "Heritage Rustic",
  };

  const sampleMockIdeas = {
    ideas: [
      { title: "Marigold Courtyard", description: "Rustic decor with fresh florals", tag: "theme", estimatedCost: "medium" },
      { title: "Brass Diya Trail", description: "Pathways lit by hand-carved diyas", tag: "theme", estimatedCost: "low" },
      { title: "Linen Canopy", description: "Draped unbleached linen with botanicals", tag: "theme", estimatedCost: "medium" },
      { title: "Terracotta Lounge", description: "Low seating with earthen vessels", tag: "theme", estimatedCost: "low" },
      { title: "Acoustic Sangeet Stage", description: "Intimate platform for live sitar", tag: "theme", estimatedCost: "high" },
    ],
  };

  it("returns AI generated ideas on valid JSON response", async () => {
    mockChatCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(sampleMockIdeas) } }],
    });

    const request = new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.1.1.1" },
      body: JSON.stringify(validIdeasPayload),
    });

    const res = await POST(request);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.source).toBe("ai");
    expect(data.ideas).toHaveLength(5);
    expect(data.ideas[0].title).toBe("Marigold Courtyard");
    expect(mockChatCreate).toHaveBeenCalledTimes(1);
  });

  it("retries once when initial JSON is invalid, and succeeds if retry is valid", async () => {
    // 1st call: invalid JSON missing ideas array
    mockChatCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "{\"error\": \"not the right schema\"}" } }],
    });
    // 2nd call: valid response
    mockChatCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(sampleMockIdeas) } }],
    });

    const request = new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.1.1.2" },
      body: JSON.stringify(validIdeasPayload),
    });

    const res = await POST(request);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.source).toBe("ai");
    expect(data.ideas).toHaveLength(5);
    expect(mockChatCreate).toHaveBeenCalledTimes(2);
  });

  it("falls back to deterministic template ideas if retry is still invalid", async () => {
    // 1st call: malformed JSON
    mockChatCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "NOT_JSON_AT_ALL" } }],
    });
    // 2nd call: still invalid schema
    mockChatCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "{\"ideas\": \"not-an-array\"}" } }],
    });

    const request = new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.1.1.3" },
      body: JSON.stringify(validIdeasPayload),
    });

    const res = await POST(request);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.source).toBe("fallback");
    expect(data.ideas).toHaveLength(5);
    expect(mockChatCreate).toHaveBeenCalledTimes(2);
  });

  it("returns fallback ideas when API key is missing", async () => {
    isConfigured = false;

    const request = new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.1.1.4" },
      body: JSON.stringify(validIdeasPayload),
    });

    const res = await POST(request);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.source).toBe("fallback");
    expect(data.ideas).toHaveLength(5);
    expect(mockChatCreate).not.toHaveBeenCalled();
  });

  it("rejects unknown fields with 400 (strict zod schema)", async () => {
    const request = new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.1.1.5" },
      body: JSON.stringify({
        ...validIdeasPayload,
        unauthorizedField: "malicious_injection",
      }),
    });

    const res = await POST(request);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid request payload.");
  });

  it("rejects oversized request bodies with 413", async () => {
    const hugePayload = {
      ...validIdeasPayload,
      mood: "x".repeat(30000), // > 20 KB
    };

    const request = new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.1.1.6" },
      body: JSON.stringify(hugePayload),
    });

    const res = await POST(request);
    expect(res.status).toBe(413);

    const data = await res.json();
    expect(data.error).toBe("Payload too large.");
  });

  it("triggers rate limiting after 20 requests with 429", async () => {
    mockChatCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(sampleMockIdeas) } }],
    });

    const ip = "1.1.1.7";
    for (let i = 0; i < 20; i++) {
      const req = new Request("http://localhost/api/ideas", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify(validIdeasPayload),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // 21st request
    const blockedReq = new Request("http://localhost/api/ideas", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(validIdeasPayload),
    });
    const res = await POST(blockedReq);
    expect(res.status).toBe(429);

    const data = await res.json();
    expect(data.error).toBe("Too many requests. Please try again later.");
  });
});

