import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import EventBudgetPage from "@/app/events/[id]/budget/page";
import { AnnounceProvider } from "@/components/shell";
import * as eventStore from "@/lib/storage/eventStore";
import { PlannedEvent } from "@/lib/domain";

expect.extend(toHaveNoViolations);

const sampleEvent: PlannedEvent = {
  brief: {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "Rhea 25th Birthday",
    type: "birthday",
    date: "2026-11-20",
    guestCount: 50,
    totalBudget: 500000,
    currency: "INR",
    city: "Mumbai",
    cityTier: "metro",
    venueType: "indoor",
    priorities: ["food", "entertainment"],
    dietaryNeeds: ["vegetarian"],
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  budgetLines: [
    { category: "venue", plannedAmount: 115000, actualAmount: 110000 },
    { category: "catering", plannedAmount: 160000, actualAmount: 185000 }, // Over planned by >10% (160k * 1.1 = 176k, 185k > 176k)
    { category: "entertainment", plannedAmount: 90000, actualAmount: 90000 },
    { category: "decor", plannedAmount: 55000, actualAmount: 50000 },
    { category: "cake", plannedAmount: 35000, actualAmount: 35000 },
    { category: "photography", plannedAmount: 15000, actualAmount: 0 },
    { category: "contingency", plannedAmount: 30000, actualAmount: 0 }, // 4% of 500k is 20,000. Buffer = 10,000.
  ],
  tasks: [],
  vendors: [],
  guests: [],
  ideas: [],
  schemaVersion: 1,
};

describe("Budget Page (/events/[id]/budget)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventStore.resetCacheForTesting();
    window.localStorage.clear();
  });

  const renderBudgetPage = (id: string = sampleEvent.brief.id) => {
    return render(
      <AnnounceProvider>
        <EventBudgetPage params={{ id }} />
      </AnnounceProvider>
    );
  };

  it("renders lead section with total budget headline, per-guest cost, and factual strip", async () => {
    eventStore.saveEvent(sampleEvent);
    renderBudgetPage();

    await waitFor(() => {
      // Exactly one h1 on page with total budget
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("5,00,000");
    });

    expect(screen.getByText(/₹10,000 per guest/i)).toBeInTheDocument();

    const factStrip = screen.getByTestId("budget-fact-strip");
    expect(factStrip).toBeInTheDocument();
    expect(factStrip).toHaveTextContent("5,00,000"); // Planned
    expect(factStrip).toHaveTextContent("4,70,000"); // Actual spend total
    expect(factStrip).toHaveTextContent("Under"); // Variance is under budget overall
  });

  it("displays allocation table with semantics, visible input labels, and progress bars", async () => {
    eventStore.saveEvent(sampleEvent);
    renderBudgetPage();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    // Caption exists
    expect(screen.getByText("Category Allocations & Variance Accounting")).toBeInTheDocument();

    // Table column headers
    expect(screen.getByRole("columnheader", { name: "Category" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Planned" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Actual Spend" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Variance" })).toBeInTheDocument();

    // Every actual input and planned input has a visible label
    const cateringRow = screen.getByTestId("budget-row-catering");
    expect(cateringRow).toBeInTheDocument();
    expect(screen.getAllByText("Planned").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Actual Spend").length).toBeGreaterThan(0);

    // Progress bar text equivalent exists
    expect(screen.getByLabelText("116% of planned")).toBeInTheDocument();
  });

  it("identifies over-budget category with red styling and the text word 'Over'", async () => {
    eventStore.saveEvent(sampleEvent);
    renderBudgetPage();

    await waitFor(() => {
      const cateringRow = screen.getByTestId("budget-row-catering");
      expect(cateringRow).toHaveClass("is-over-budget");

      // Verifies the word "Over" is present in text so color is not the only signal
      expect(cateringRow).toHaveTextContent("Over");
      expect(cateringRow).toHaveTextContent("Over limit");
    });
  });

  it("adjusts a category planned amount and rebalances via contingency, saving to store", async () => {
    eventStore.saveEvent(sampleEvent);
    renderBudgetPage();

    await waitFor(() => {
      expect(screen.getByLabelText("Planned amount for Venue")).toBeInTheDocument();
    });

    const venuePlannedInput = screen.getByLabelText("Planned amount for Venue");
    // Increase venue by 5,000 (from 115,000 to 120,000). Contingency has 10,000 buffer (30k - 20k floor).
    fireEvent.change(venuePlannedInput, { target: { value: "120000" } });
    fireEvent.blur(venuePlannedInput);

    await waitFor(() => {
      const stored = eventStore.getEvent(sampleEvent.brief.id);
      expect(stored.ok).toBe(true);
      if (!stored.ok) throw new Error("Event not stored");
      const venueLine = stored.data?.budgetLines.find((l) => l.category === "venue");
      const contingencyLine = stored.data?.budgetLines.find((l) => l.category === "contingency");

      expect(venueLine?.plannedAmount).toBe(120000);
      expect(contingencyLine?.plannedAmount).toBe(25000); // 30,000 - 5,000
    });
  });

  it("refuses an excessive planned adjustment that violates contingency floor and shows clear error", async () => {
    eventStore.saveEvent(sampleEvent);
    renderBudgetPage();

    await waitFor(() => {
      expect(screen.getByLabelText("Planned amount for Venue")).toBeInTheDocument();
    });

    const venuePlannedInput = screen.getByLabelText("Planned amount for Venue");
    // Exceed budget enormously
    fireEvent.change(venuePlannedInput, { target: { value: "800000" } });
    fireEvent.blur(venuePlannedInput);

    await waitFor(() => {
      const alert = screen.getByText(/insufficient funds/i);
      expect(alert).toBeInTheDocument();
    });
  });

  it("updates actual spend input immediately and announces 'Budget saved'", async () => {
    eventStore.saveEvent(sampleEvent);
    renderBudgetPage();

    await waitFor(() => {
      expect(screen.getByLabelText("Actual spend for Decor")).toBeInTheDocument();
    });

    const decorActualInput = screen.getByLabelText("Actual spend for Decor");
    fireEvent.change(decorActualInput, { target: { value: "52000" } });

    await waitFor(() => {
      const stored = eventStore.getEvent(sampleEvent.brief.id);
      expect(stored.ok).toBe(true);
      if (!stored.ok) throw new Error("Event not stored");
      const decorLine = stored.data?.budgetLines.find((l) => l.category === "decor");
      expect(decorLine?.actualAmount).toBe(52000);
    });
  });

  it("resets budget to suggested allocations upon confirmation", async () => {
    const user = userEvent.setup();
    eventStore.saveEvent(sampleEvent);
    renderBudgetPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Reset to suggested budget" })).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole("button", { name: "Reset to suggested budget" });
    await user.click(resetBtn);

    // Confirmation step appears
    expect(screen.getByText(/Reset all categories to original suggested allocations/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Confirm Reset" });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Confirmation Required/i)).not.toBeInTheDocument();
    });
  });

  it("displays editorial notes explaining why the allocation looks the way it does", async () => {
    eventStore.saveEvent(sampleEvent);
    renderBudgetPage();

    await waitFor(() => {
      const editorialNotes = screen.getByTestId("budget-editorial-notes");
      expect(editorialNotes).toBeInTheDocument();
      expect(editorialNotes).toHaveTextContent("metro city");
      expect(editorialNotes).toHaveTextContent("food");
    });
  });

  it("passes accessibility scan with zero violations", async () => {
    eventStore.saveEvent(sampleEvent);
    const { container } = renderBudgetPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
