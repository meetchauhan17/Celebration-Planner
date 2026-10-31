import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { SummarySheet } from "../../src/components/summary/SummarySheet";
import { AnnounceProvider } from "../../src/components/shell/AnnounceContext";
import { PlannedEvent } from "../../src/lib/domain";
import * as storage from "../../src/lib/storage";

expect.extend(toHaveNoViolations);

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/events/test/summary",
}));

const sampleEvent: PlannedEvent = {
  brief: {
    id: "f8d8c366-0275-4ee6-8575-cf6d1fb525f2",
    name: "Aarav & Meera's Grand Wedding",
    type: "wedding",
    date: "2026-12-15",
    guestCount: 150,
    totalBudget: 1500000,
    currency: "INR",
    city: "Jaipur",
    cityTier: "tier2",
    venueType: "hybrid",
    priorities: ["venue", "food"],
    dietaryNeeds: ["Vegetarian", "Jain"],
  },
  budgetLines: [
    { category: "venue", plannedAmount: 375000, actualAmount: 375000 },
    { category: "catering", plannedAmount: 450000, actualAmount: 460000 },
  ],
  tasks: [
    { id: "t1", title: "Book Heritage Palace Venue", category: "venue", dueDate: "2026-06-15", isCritical: true, status: "done" },
    { id: "t2", title: "Confirm Master Caterer", category: "catering", dueDate: "2026-08-10", isCritical: true, status: "doing" },
    { id: "t3", title: "Finalize Invitations Design", category: "invitations", dueDate: "2026-09-01", isCritical: false, status: "todo" },
  ],
  vendors: [
    { id: "v1", category: "venue", label: "Heritage Palace", status: "booked", quoteAmount: 375000, contact: "+91 98765 43210" },
    { id: "v2", category: "catering", label: "Royal Flavors", status: "quoted", quoteAmount: 460000, notes: "Vegetarian only" },
  ],
  guests: [
    { id: "g1", name: "Rohan Sharma", group: "Family", rsvp: "yes", dietary: "Vegetarian", plusOnes: 1 },
    { id: "g2", name: "Priya Patel", group: "Friends", rsvp: "yes", dietary: "Jain", plusOnes: 0 },
  ],
  ideas: [
    { id: "i1", title: "Royal Turban Welcome", description: "Traditional safa tying at entry.", tag: "Tradition", saved: true },
  ],
  schemaVersion: 1,
};

function renderSummary(event = sampleEvent) {
  return render(
    <AnnounceProvider>
      <SummarySheet event={event} />
    </AnnounceProvider>
  );
}

describe("Summary Page (/events/[id]/summary)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the continuous newspaper sheet with all key sections visible on screen", () => {
    renderSummary();

    // 1. Event headline & overview
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Aarav & Meera's Grand Wedding"
    );

    // 2. Budget table
    expect(screen.getByText("Budget Allocation & Expenditure")).toBeInTheDocument();
    expect(screen.getAllByText("catering").length).toBeGreaterThan(0);

    // 3. Milestones table (all critical + next 10)
    expect(screen.getByText("Milestone Schedule (3 Key Tasks)")).toBeInTheDocument();
    expect(screen.getByText("Book Heritage Palace Venue")).toBeInTheDocument();
    expect(screen.getAllByText("Confirm Master Caterer").length).toBeGreaterThan(0);

    // 4. Vendor roster
    expect(screen.getByText("Vendor Roster & Commitments")).toBeInTheDocument();
    expect(screen.getByText("Heritage Palace")).toBeInTheDocument();
    expect(screen.getByText("Royal Flavors")).toBeInTheDocument();

    // 5. Catering & dietary breakdown
    expect(screen.getByText("Catering Headcount & Dietary Breakdown")).toBeInTheDocument();
    expect(screen.getByText(/Vegetarian:/i)).toBeInTheDocument();

    // 6. Curated ideas
    expect(screen.getByText("Curated Event Concepts (1)")).toBeInTheDocument();
    expect(screen.getByText("Royal Turban Welcome")).toBeInTheDocument();

    // 7. Action buttons are rendered on screen
    expect(screen.getByRole("button", { name: "Print this plan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download calendar (.ics)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export plan as JSON" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import plan from JSON" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete all my data" })).toBeInTheDocument();

    // 8. Footer disclaimer
    expect(
      screen.getByText(/Planning guidance only. Confirm prices, availability and legal requirements/i)
    ).toBeInTheDocument();
  });

  it("calls window.print when 'Print this plan' is clicked", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    renderSummary();

    fireEvent.click(screen.getByRole("button", { name: "Print this plan" }));
    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it("handles valid JSON plan import with fresh ID assignment", async () => {
    const saveSpy = vi.spyOn(storage, "saveEvent").mockReturnValue({ ok: true, data: sampleEvent } as any);
    renderSummary();

    const fileInput = screen.getByLabelText("Import plan file input");
    const validPlan = JSON.stringify(sampleEvent);
    const file = new File([validPlan], "plan.json", { type: "application/json" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          brief: expect.objectContaining({
            name: "Aarav & Meera's Grand Wedding",
            // Fresh ID was assigned
            id: expect.not.stringMatching(sampleEvent.brief.id),
          }),
        })
      );
    });
  });

  it("rejects oversized JSON plan import exceeding 1 MB", async () => {
    renderSummary();

    const fileInput = screen.getByLabelText("Import plan file input");
    // Create oversized file (> 1 MB)
    const largeBlob = new Blob(["x".repeat(1024 * 1024 + 10)], { type: "application/json" });
    const file = new File([largeBlob], "huge.json", { type: "application/json" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(
        screen.getByText("File exceeds 1 MB size limit. Please choose a valid event plan file.")
      ).toBeInTheDocument();
    });
  });

  it("rejects invalid JSON plan structure with clear error message", async () => {
    renderSummary();

    const fileInput = screen.getByLabelText("Import plan file input");
    const invalidPlan = JSON.stringify({ foo: "bar" });
    const file = new File([invalidPlan], "invalid.json", { type: "application/json" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(
        screen.getByText("Invalid plan format. The selected file does not match the event plan schema.")
      ).toBeInTheDocument();
    });
  });

  it("wipes storage when 'Delete all my data' is confirmed", () => {
    const clearSpy = vi.spyOn(storage, "clearAllEvents").mockReturnValue({ ok: true, data: true } as any);
    renderSummary();

    // First click asks for confirmation
    fireEvent.click(screen.getByRole("button", { name: "Delete all my data" }));
    expect(screen.getByText("Wipe all plans?")).toBeInTheDocument();

    // Confirm click
    fireEvent.click(screen.getByRole("button", { name: "Yes, delete all" }));
    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it("passes accessibility scan with zero violations", async () => {
    const { container } = renderSummary();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
