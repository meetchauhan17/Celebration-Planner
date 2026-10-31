import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import EventVendorsPage from "@/app/events/[id]/vendors/page";
import { AnnounceProvider } from "@/components/shell";
import * as eventStore from "@/lib/storage/eventStore";
import { PlannedEvent } from "@/lib/domain";

expect.extend(toHaveNoViolations);

const sampleEvent: PlannedEvent = {
  brief: {
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    name: "Meera & Siddharth Sangeet",
    type: "wedding",
    date: "2026-12-15",
    guestCount: 200,
    totalBudget: 1800000,
    currency: "INR",
    city: "Jaipur",
    cityTier: "tier2",
    venueType: "hybrid",
    priorities: ["food", "photography"],
    dietaryNeeds: ["jain"],
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  budgetLines: [
    { category: "catering", plannedAmount: 500000, actualAmount: 0 },
    { category: "venue", plannedAmount: 450000, actualAmount: 0 },
    { category: "photography", plannedAmount: 180000, actualAmount: 0 },
    { category: "decor", plannedAmount: 150000, actualAmount: 0 },
  ],
  tasks: [
    {
      id: "task-1",
      title: "Reserve palace courtyard venue",
      dueDate: "2026-03-01",
      category: "Venue",
      status: "done",
      isCritical: true,
    },
    {
      id: "task-2",
      title: "Book primary royal photographer",
      dueDate: "2026-04-01",
      category: "Photography",
      status: "todo",
      isCritical: true, // Earliest pending critical task -> Photography is Next to Book!
    },
    {
      id: "task-3",
      title: "Select feast banquet caterer",
      dueDate: "2026-05-01",
      category: "Catering",
      status: "todo",
      isCritical: true,
    },
  ],
  vendors: [
    {
      id: "ven-1",
      category: "Photography",
      label: "Studio Lumina Cine",
      status: "quoted",
      quoteAmount: 200000, // Planned is 180,000 -> 11% above planned
      contact: "+91 98765 43210",
      notes: "Quoted for 2 drone operators and raw cinematography reels.",
      whatToAsk: "1. Are licensed drone clearances included? 2. How many shooters cover the stage?",
    },
    {
      id: "ven-2",
      category: "Catering",
      label: "Heritage Royal Banquets",
      status: "booked",
      quoteAmount: 480000, // Planned is 500,000 -> 4% below planned
      contact: "manager@heritagefeasts.in",
      notes: "Agreed on 6 welcome appetizers and dedicated jain kitchen counter.",
      whatToAsk: "1. Can you prepare dedicated isolated stations for Jain dietary needs?",
    },
    {
      id: "ven-3",
      category: "Venue",
      label: "Palace Courtyard & Heritage Gardens",
      status: "paid",
      quoteAmount: 450000,
      contact: "0141 2345678",
      notes: "Advance deposit paid.",
      whatToAsk: "1. What is the transition time in case of rain?",
    },
    {
      id: "ven-4",
      category: "Decor",
      label: "Flora & Lights Event Styling",
      status: "to-contact",
      whatToAsk: "1. Are floral stage backdrops reusable across ceremonies?",
    },
  ],
  guests: [],
  ideas: [],
  schemaVersion: 1,
};

describe("Vendors Page (/events/[id]/vendors)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventStore.resetCacheForTesting();
    window.localStorage.clear();
  });

  const renderVendors = (id: string = sampleEvent.brief.id) => {
    return render(
      <AnnounceProvider>
        <EventVendorsPage params={{ id }} />
      </AnnounceProvider>
    );
  };

  it("renders lead section with progress headline, progress bar, counts strip, and visible reminder", async () => {
    eventStore.saveEvent(sampleEvent);
    renderVendors();

    await waitFor(() => {
      // Exactly one h1 on page with vendor progress
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("2 of 4 Booked"); // booked (1) + paid (1) = 2
    });

    // Progress bar text equivalent
    expect(screen.getByLabelText("50% of vendors secured")).toBeInTheDocument();

    // Counts strip
    const factStrip = screen.getByTestId("vendor-fact-strip");
    expect(factStrip).toBeInTheDocument();
    expect(factStrip).toHaveTextContent("1"); // To Contact
    expect(factStrip).toHaveTextContent("1"); // Quoted
    expect(factStrip).toHaveTextContent("1"); // Booked
    expect(factStrip).toHaveTextContent("1"); // Paid

    // Visible reminder
    expect(
      screen.getByText("Prices shown are quotes you entered. Confirm availability and terms in writing.")
    ).toBeInTheDocument();
  });

  it("identifies the single category with the earliest critical task as 'Next to book'", async () => {
    eventStore.saveEvent(sampleEvent);
    renderVendors();

    await waitFor(() => {
      // Photography has the earliest pending critical task -> flagged with "Next to book"
      const photoRow = screen.getByTestId("vendor-row-ven-1");
      expect(photoRow).toHaveTextContent("Next to book");

      // Other vendors should NOT have "Next to book"
      const caterRow = screen.getByTestId("vendor-row-ven-2");
      expect(caterRow).not.toHaveTextContent("Next to book");
    });
  });

  it("displays quote comparison with planned budget and renders telephone link if phone detected", async () => {
    eventStore.saveEvent(sampleEvent);
    renderVendors();

    await waitFor(() => {
      expect(screen.getByTestId("vendor-row-ven-1")).toBeInTheDocument();
    });

    const photoRow = screen.getByTestId("vendor-row-ven-1");
    // Planned 180,000 vs Quote 200,000 -> 11% above planned photography
    expect(photoRow).toHaveTextContent("Quote is 11% above planned photography");

    // Phone link rendered with tel: scheme
    const phoneLink = photoRow.querySelector('a[href^="tel:"]');
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink).toHaveAttribute("href", "tel:+919876543210");
    expect(phoneLink).toHaveTextContent("Call +91 98765 43210");

    // Catering row with email contact should render as plain text, not tel: link
    const caterRow = screen.getByTestId("vendor-row-ven-2");
    expect(caterRow).toHaveTextContent("manager@heritagefeasts.in");
    expect(caterRow.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it("offers 'Use quote as actual spend' button for booked/paid vendors and updates the budget", async () => {
    const user = userEvent.setup();
    eventStore.saveEvent(sampleEvent);
    renderVendors();

    await waitFor(() => {
      expect(screen.getByTestId("vendor-row-ven-2")).toBeInTheDocument();
    });

    // Catering is 'booked' with quote 480,000
    const caterRow = screen.getByTestId("vendor-row-ven-2");
    const useQuoteBtn = caterRow.querySelector("button")!;
    expect(useQuoteBtn).toHaveTextContent("Use quote as actual spend");

    await user.click(useQuoteBtn);

    await waitFor(() => {
      const stored = eventStore.getEvent(sampleEvent.brief.id);
      expect(stored.ok).toBe(true);
      if (!stored.ok) throw new Error("Event not stored");
      const caterBudget = stored.data?.budgetLines.find((l) => l.category.toLowerCase() === "catering");
      expect(caterBudget?.actualAmount).toBe(480000);
    });
  });

  it("updates vendor status and quote amount immediately and persists changes", async () => {
    eventStore.saveEvent(sampleEvent);
    renderVendors();

    await waitFor(() => {
      expect(screen.getByLabelText("Status for Studio Lumina Cine")).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText("Status for Studio Lumina Cine");
    fireEvent.change(statusSelect, { target: { value: "booked" } });

    await waitFor(() => {
      const stored = eventStore.getEvent(sampleEvent.brief.id);
      expect(stored.ok).toBe(true);
      if (!stored.ok) throw new Error("Event not stored");
      const updated = stored.data?.vendors.find((v) => v.id === "ven-1");
      expect(updated?.status).toBe("booked");
    });
  });

  it("adds a custom vendor with validation and renders it in the directory", async () => {
    const user = userEvent.setup();
    eventStore.saveEvent(sampleEvent);
    renderVendors();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "+ Add custom vendor" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "+ Add custom vendor" }));

    await user.type(screen.getByLabelText("Category"), "Transportation");
    await user.type(screen.getByLabelText("Vendor or Studio Name"), "Royal Heritage Vintage Fleet");
    await user.type(screen.getByLabelText("Quote Amount (₹, optional)"), "65000");
    await user.type(screen.getByLabelText("Contact Information (Free Text)"), "+91 99999 11111");

    await user.click(screen.getByRole("button", { name: "Save Vendor" }));

    await waitFor(() => {
      expect(screen.getByText("Royal Heritage Vintage Fleet")).toBeInTheDocument();
      expect(screen.getByText("Transportation")).toBeInTheDocument();

      const stored = eventStore.getEvent(sampleEvent.brief.id);
      expect(stored.ok).toBe(true);
      if (!stored.ok) throw new Error("Event not stored");
      const customVen = stored.data?.vendors.find((v) => v.label === "Royal Heritage Vintage Fleet");
      expect(customVen).toBeDefined();
      expect(customVen?.quoteAmount).toBe(65000);
    });
  });

  it("verifies column stacking hierarchy for mobile screens", async () => {
    eventStore.saveEvent(sampleEvent);
    renderVendors();

    await waitFor(() => {
      expect(screen.getByTestId("vendor-row-ven-1")).toBeInTheDocument();
    });

    const row = screen.getByTestId("vendor-row-ven-1");
    // Verify columns exist in correct DOM order: identity, terms, details
    const columns = row.querySelectorAll(".np-listing-column");
    expect(columns.length).toBe(3);
    expect(columns[0]).toHaveClass("np-listing-identity");
    expect(columns[1]).toHaveClass("np-listing-terms");
    expect(columns[2]).toHaveClass("np-listing-details");
  });

  it("passes accessibility scan with zero violations", async () => {
    eventStore.saveEvent(sampleEvent);
    const { container } = renderVendors();

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

