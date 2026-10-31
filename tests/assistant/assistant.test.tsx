import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { AssistantView } from "../../src/components/assistant/AssistantView";
import { AnnounceProvider } from "../../src/components/shell/AnnounceContext";
import { PlannedEvent } from "../../src/lib/domain";

expect.extend(toHaveNoViolations);

const sampleEvent: PlannedEvent = {
  brief: {
    id: "f8d8c366-0275-4ee6-8575-cf6d1fb525f2",
    name: "Rohan & Priya's Sangeet",
    type: "wedding",
    date: "2026-11-20",
    guestCount: 150,
    totalBudget: 1200000,
    currency: "INR",
    city: "Mumbai",
    cityTier: "metro",
    venueType: "indoor",
    priorities: ["food", "entertainment"],
    dietaryNeeds: ["Vegetarian", "Jain"],
  },
  budgetLines: [
    { category: "catering", plannedAmount: 360000, actualAmount: 370000 },
    { category: "venue", plannedAmount: 300000 },
  ],
  tasks: [
    { id: "t1", title: "Book DJ & Sound", category: "entertainment", dueDate: "2026-10-01", isCritical: true, status: "todo" },
  ],
  vendors: [
    { id: "v1", category: "catering", label: "Spice Route", status: "booked" },
  ],
  guests: [
    { id: "g1", name: "Secret VIP", group: "Family", rsvp: "yes", plusOnes: 1 },
  ],
  ideas: [],
  schemaVersion: 1,
};

function renderAssistant(event = sampleEvent) {
  return render(
    <AnnounceProvider>
      <AssistantView event={event} />
    </AnnounceProvider>
  );
}

describe("Assistant Page (/events/[id]/assistant)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders two-column spread with 'Try asking' suggestion buttons and empty state", () => {
    renderAssistant();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Event Planning Assistant"
    );
    expect(screen.getByText("Try Asking")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "What should I do this week?" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No messages yet. Ask a question or select one of the suggestions/i)
    ).toBeInTheDocument();
  });

  it("enforces composer 800 character length limit and displays character counter", () => {
    renderAssistant();

    const textarea = screen.getByLabelText(/Ask your planning question/i) as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(800);
    expect(screen.getByText("0/800")).toBeInTheDocument();

    const longText = "a".repeat(805);
    fireEvent.change(textarea, { target: { value: longText.slice(0, 800) } });

    expect(screen.getByText("800/800")).toBeInTheDocument();
  });

  it("sends question to /api/assistant with buildEventContext without guest names, preserving line breaks", async () => {
    let capturedBody: any = null;
    global.fetch = vi.fn().mockImplementation(async (url, init) => {
      capturedBody = JSON.parse(init.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          message: "Here is your plan update:\n- Catering is booked.\n- Book DJ soon.",
          source: "ai",
        }),
      };
    });

    renderAssistant();

    const textarea = screen.getByLabelText(/Ask your planning question/i);
    fireEvent.change(textarea, { target: { value: "Who should I book first?" } });

    const sendBtn = screen.getByRole("button", { name: "Send" });
    fireEvent.click(sendBtn);

    // Verify loading status
    expect(screen.getByTestId("assistant-thinking-status")).toHaveTextContent(
      "Assistant is reviewing your plan and composing an answer…"
    );

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText("Answered by AI")).toBeInTheDocument();
    });

    // Verify privacy: captured eventSummary MUST NOT include guest names ("Secret VIP")
    expect(capturedBody).not.toBeNull();
    expect(capturedBody.eventSummary).not.toContain("Secret VIP");
    expect(capturedBody.eventSummary).toContain("RSVPs: 1 confirmed");

    // Line breaks preserved in answer
    const replyParagraph = screen.getByText(/Here is your plan update:/i);
    expect(replyParagraph).toHaveStyle({ whiteSpace: "pre-wrap" });
  });

  it("renders honest label when assistant response comes from fallback source", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        message: "Fallback answer based on plan data.",
        source: "fallback",
      }),
    } as any);

    renderAssistant();

    // Click suggestion button
    const suggestionBtn = screen.getByRole("button", { name: "What should I do this week?" });
    fireEvent.click(suggestionBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Answered from your plan data (AI unavailable)")
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Fallback answer based on plan data.")).toBeInTheDocument();
  });

  it("handles 429 rate limit errors with retry button", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: "Too many requests" }),
    } as any);

    renderAssistant();

    const textarea = screen.getByLabelText(/Ask your planning question/i);
    fireEvent.change(textarea, { target: { value: "Rate limit test" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      const alert = screen.getByTestId("assistant-error-alert");
      expect(alert).toHaveTextContent(
        "We've hit a temporary rate limit. Please wait a moment and try again."
      );
    });

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("allows clearing conversation from component state", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        message: "First answer.",
        source: "ai",
      }),
    } as any);

    renderAssistant();

    const textarea = screen.getByLabelText(/Ask your planning question/i);
    fireEvent.change(textarea, { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(screen.getByText("First answer.")).toBeInTheDocument();
    });

    const clearBtn = screen.getByRole("button", { name: "Clear conversation" });
    fireEvent.click(clearBtn);

    expect(screen.queryByText("First answer.")).not.toBeInTheDocument();
    expect(
      screen.getByText(/No messages yet. Ask a question or select one of the suggestions/i)
    ).toBeInTheDocument();
  });

  it("passes accessibility scan with zero violations", async () => {
    const { container } = renderAssistant();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
