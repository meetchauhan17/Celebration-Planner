import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/assistant/route";
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

describe("POST /api/assistant", () => {
  beforeEach(() => {
    resetRateLimitStore();
    mockChatCreate.mockReset();
    isConfigured = true;
  });

  const validPayload = {
    messages: [
      { role: "user" as const, content: "What should I prioritize this week?" },
    ],
    eventSummary: "Event Type: wedding\nDate: 2026-11-28 (30 days remaining)\nGuest Count: 200",
  };

  it("returns AI response when Groq succeeds and wraps input in delimiters", async () => {
    mockChatCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content:
              "Finalize your venue coordinator deposit and confirm photographer availability this week.",
          },
        },
      ],
    });

    const request = new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "2.2.2.1" },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(request);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.source).toBe("ai");
    expect(data.message).toContain("Finalize your venue");

    // Check system prompt and delimiter wrapping
    const callArgs = mockChatCreate.mock.calls[0][0];
    const systemMsg = callArgs.messages.find((m: { role: string; content: string }) => m.role === "system");
    expect(systemMsg.content).toContain("practical event planning assistant");
    expect(systemMsg.content).toContain("<event_summary>");

    const userMsg = callArgs.messages.find((m: { role: string; content: string }) => m.role === "user");
    expect(userMsg.content).toContain("<user_data>");
    expect(userMsg.content).toContain("What should I prioritize this week?");
  });

  it("returns fallback answer when API key is not configured", async () => {
    isConfigured = false;

    const request = new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "2.2.2.2" },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(request);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.source).toBe("fallback");
    expect(typeof data.message).toBe("string");
    expect(data.message.length).toBeGreaterThan(10);
    expect(mockChatCreate).not.toHaveBeenCalled();
  });

  it("returns fallback answer when Groq throws an unexpected error", async () => {
    mockChatCreate.mockRejectedValueOnce(new Error("Groq upstream 503 error"));

    const request = new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "2.2.2.3" },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(request);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.source).toBe("fallback");
    expect(typeof data.message).toBe("string");
  });

  it("rejects messages with content exceeding 800 characters", async () => {
    const oversizedMsgPayload = {
      messages: [{ role: "user" as const, content: "Z".repeat(801) }],
      eventSummary: "Event Type: birthday",
    };

    const request = new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "2.2.2.4" },
      body: JSON.stringify(oversizedMsgPayload),
    });

    const res = await POST(request);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid request payload.");
  });

  it("rejects message history exceeding 12 messages", async () => {
    const tooManyMessages = Array.from({ length: 13 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `Message ${i + 1}`,
    }));

    const request = new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "2.2.2.5" },
      body: JSON.stringify({ messages: tooManyMessages }),
    });

    const res = await POST(request);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid request payload.");
  });

  it("rejects oversized request bodies with 413", async () => {
    const payload = {
      messages: [{ role: "user" as const, content: "Hello" }],
      eventSummary: "E".repeat(25000), // > 20 KB
    };

    const request = new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "2.2.2.6" },
      body: JSON.stringify(payload),
    });

    const res = await POST(request);
    expect(res.status).toBe(413);

    const data = await res.json();
    expect(data.error).toBe("Payload too large.");
  });

  it("triggers rate limiting after 20 requests with 429", async () => {
    mockChatCreate.mockResolvedValue({
      choices: [{ message: { content: "Sample advice." } }],
    });

    const ip = "2.2.2.7";
    for (let i = 0; i < 20; i++) {
      const req = new Request("http://localhost/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // 21st request
    const blockedReq = new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(validPayload),
    });
    const res = await POST(blockedReq);
    expect(res.status).toBe(429);

    const data = await res.json();
    expect(data.error).toBe("Too many requests. Please try again later.");
  });
});

