import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);
import { GuestListView } from "../../src/components/guests/GuestListView";
import { AnnounceProvider } from "../../src/components/shell/AnnounceContext";
import { PlannedEvent } from "../../src/lib/domain";
import * as storage from "../../src/lib/storage";

const mockEvent: PlannedEvent = {
  brief: {
    id: "f8d8c366-0275-4ee6-8575-cf6d1fb525f2",
    name: "Aarav & Meera's Wedding",
    type: "wedding",
    date: "2026-12-15",
    guestCount: 100,
    totalBudget: 1500000,
    currency: "INR",
    city: "Jaipur",
    cityTier: "tier2",
    venueType: "hybrid",
    priorities: ["food", "venue"],
    dietaryNeeds: ["Vegetarian", "Jain", "Vegan"],
  },
  budgetLines: [],
  tasks: [],
  vendors: [],
  guests: [
    { id: "g1", name: "Rohan Sharma", group: "Family", rsvp: "yes", dietary: "Vegetarian", plusOnes: 1 }, // 2 heads
    { id: "g2", name: "Priya Patel", group: "Friends", rsvp: "yes", dietary: "Jain", plusOnes: 0 }, // 1 head
    { id: "g3", name: "Amit Verma", group: "Colleagues", rsvp: "no", dietary: undefined, plusOnes: 0 },
    { id: "g4", name: "Ananya Rao", group: "Friends", rsvp: "pending", dietary: "Vegan", plusOnes: 2 }, // 3 heads
  ],
  ideas: [],
  schemaVersion: 1,
};

function renderGuests(event = mockEvent) {
  return render(
    <AnnounceProvider>
      <GuestListView event={event} />
    </AnnounceProvider>
  );
}

describe("Guests Page (/events/[id]/guests)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(storage, "updateEvent").mockReturnValue({ ok: true, data: mockEvent } as any);
  });

  it("renders lead strip with invited, confirmed, declined, pending and planned comparison", () => {
    renderGuests();

    // 4 invited, 3 confirmed headcount (Rohan 1+1, Priya 1+0), 1 declined, 3 pending (Ananya 1+2)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("3 Confirmed of 4 Invited");
    expect(screen.getByText(/You planned for 100; 3 confirmed, 97 under/i)).toBeInTheDocument();

    // Fact strip values
    const factStrip = screen.getByRole("heading", { level: 1 }).parentElement!;
    expect(within(factStrip).getByText("Total Invited").parentElement).toHaveTextContent("4");
    expect(within(factStrip).getByText("Confirmed (w/ +1s)").parentElement).toHaveTextContent("3");
    expect(within(factStrip).getByText("Declined").parentElement).toHaveTextContent("1");
    expect(within(factStrip).getByText("Pending").parentElement).toHaveTextContent("3");
  });

  it("shows catering headcount and dietary breakdown with buffer", () => {
    renderGuests();

    // Confirmed = 3. Suggested catering = ceil(3 * 1.1) = 4 servings
    expect(screen.getByText("Confirmed Headcount").parentElement).toHaveTextContent("3 guests");
    expect(screen.getByText(/Suggested Catering Headcount/i).parentElement).toHaveTextContent("4 servings");

    // Dietary list
    const dietSection = screen.getByLabelText("Dietary breakdown");
    expect(within(dietSection).getByText(/Vegetarian:/i).parentElement).toHaveTextContent("2");
    expect(within(dietSection).getByText(/Jain:/i).parentElement).toHaveTextContent("1");
  });

  it("displays privacy note in chat / page", () => {
    renderGuests();
    expect(
      screen.getByText(/Guest names stay in this browser and are never sent to the AI assistant/i)
    ).toBeInTheDocument();
  });

  it("shows planned headcount update prompt when discrepancy exceeds 10%", () => {
    // mockEvent: planned is 100, confirmed is 3 (97% diff > 10%)
    renderGuests();

    expect(screen.getByLabelText("Guest count discrepancy notice")).toBeInTheDocument();
    const updateBtn = screen.getByRole("button", { name: /Update planned guest count to 3/i });
    expect(updateBtn).toBeInTheDocument();

    fireEvent.click(updateBtn);
    expect(storage.updateEvent).toHaveBeenCalledWith(
      mockEvent.brief.id,
      expect.objectContaining({
        brief: expect.objectContaining({ guestCount: 3 }),
      })
    );
  });

  it("adds an individual guest with validation", () => {
    renderGuests();

    const nameInput = screen.getByLabelText(/Guest Name/i);
    fireEvent.change(nameInput, { target: { value: "Karan Johar" } });

    const submitBtn = screen.getByRole("button", { name: /Add Guest/i });
    fireEvent.click(submitBtn);

    expect(storage.updateEvent).toHaveBeenCalledWith(
      mockEvent.brief.id,
      expect.objectContaining({
        guests: expect.arrayContaining([
          expect.objectContaining({ name: "Karan Johar" }),
        ]),
      })
    );
  });

  it("supports bulk adding guests with deduplication preview", () => {
    renderGuests();

    const bulkTab = screen.getByRole("button", { name: /Bulk Add/i });
    fireEvent.click(bulkTab);

    const textarea = screen.getByLabelText(/Names \(one per line\)/i);
    // Include duplicates and empty lines
    fireEvent.change(textarea, {
      target: { value: "Deepak\nSuresh\nDeepak\n\nRavi" },
    });

    expect(screen.getByText(/3 valid unique names ready to add/i)).toBeInTheDocument();

    const addBulkBtn = screen.getByRole("button", { name: /Add 3 Guests/i });
    fireEvent.click(addBulkBtn);

    expect(storage.updateEvent).toHaveBeenCalledWith(
      mockEvent.brief.id,
      expect.objectContaining({
        guests: expect.arrayContaining([
          expect.objectContaining({ name: "Deepak" }),
          expect.objectContaining({ name: "Suresh" }),
          expect.objectContaining({ name: "Ravi" }),
        ]),
      })
    );
  });

  it("filters guests by search query and group with pagination", () => {
    renderGuests();

    // Initial counter: "Showing 1-4 of 4"
    expect(screen.getByText(/Showing 1-4 of 4/i)).toBeInTheDocument();

    // Search query
    const searchInput = screen.getByLabelText(/Search guests by name or group/i);
    fireEvent.change(searchInput, { target: { value: "Rohan" } });

    expect(screen.getByText(/Showing 1-1 of 1/i)).toBeInTheDocument();
    expect(screen.getByText("Rohan Sharma")).toBeInTheDocument();
    expect(screen.queryByText("Priya Patel")).not.toBeInTheDocument();
  });

  it("passes accessibility scan with zero violations", async () => {
    const { container } = renderGuests();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
