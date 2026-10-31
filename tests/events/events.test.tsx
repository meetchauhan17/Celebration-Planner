import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import EventsPage from "@/app/events/page";
import { AnnounceProvider } from "@/components/shell";
import * as eventStore from "@/lib/storage/eventStore";
import { PlannedEvent } from "@/lib/domain";

expect.extend(toHaveNoViolations);

const sampleEvent1: PlannedEvent = {
  brief: {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Aarav & Diya Wedding",
    type: "wedding",
    date: "2026-12-15",
    guestCount: 250,
    totalBudget: 1500000,
    currency: "INR",
    city: "Mumbai",
    cityTier: "metro",
    venueType: "hybrid",
    priorities: ["food", "venue"],
    dietaryNeeds: ["vegetarian", "jain"],
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  budgetLines: [
    { category: "catering", plannedAmount: 500000 },
    { category: "venue", plannedAmount: 400000 },
  ],
  tasks: [
    { id: "t-1", title: "Book venue", dueDate: "2026-04-01", category: "Venue", status: "done", isCritical: true, completed: true },
    { id: "t-2", title: "Book photographer", dueDate: "2026-05-01", category: "Media", status: "todo", isCritical: true },
  ],
  vendors: [
    { id: "v-1", category: "Venue", label: "Grand Ballroom", status: "booked" },
    { id: "v-2", category: "Catering", label: "Royal Caterers", status: "to-contact" },
  ],
  guests: [
    { id: "g-1", name: "Guest One", group: "Family", rsvp: "yes", plusOnes: 1 },
  ],
  ideas: [],
  schemaVersion: 1,
};

const sampleEvent2Soonest: PlannedEvent = {
  ...sampleEvent1,
  brief: {
    ...sampleEvent1.brief,
    id: "22222222-2222-4222-8222-222222222222",
    name: "Kabir 10th Birthday",
    type: "birthday",
    date: "2026-11-20", // Soonest upcoming
    createdAt: "2026-01-01T00:00:00.000Z",
  },
};

const samplePastEvent: PlannedEvent = {
  ...sampleEvent1,
  brief: {
    ...sampleEvent1.brief,
    id: "33333333-3333-4333-8333-333333333333",
    name: "Summer Charity Gala",
    type: "community",
    date: "2025-05-10", // In the past
    createdAt: "2025-01-01T00:00:00.000Z",
  },
};

describe("Events Directory Page (/events)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventStore.resetCacheForTesting();
    window.localStorage.clear();
  });

  const renderEventsPage = () => {
    return render(
      <AnnounceProvider>
        <EventsPage />
      </AnnounceProvider>
    );
  };

  it("renders empty state with button to /plan when no events are saved", () => {
    renderEventsPage();

    expect(screen.getByTestId("events-empty-state")).toBeInTheDocument();
    expect(screen.getByText("No Celebrations Recorded")).toBeInTheDocument();
    const planBtn = screen.getByRole("button", { name: "Plan an event" });
    expect(planBtn).toHaveAttribute("href", "/plan");
  });

  it("lists saved events as horizontal Listing rows with identity, terms, details", () => {
    eventStore.saveEvent(sampleEvent1);
    renderEventsPage();

    expect(screen.getByTestId(`event-listing-${sampleEvent1.brief.id}`)).toBeInTheDocument();

    // Identity column: name link & type
    const nameLink = screen.getByRole("link", { name: "Aarav & Diya Wedding" });
    expect(nameLink).toHaveAttribute("href", `/events/${sampleEvent1.brief.id}`);
    expect(screen.getByText(/Wedding · Mumbai/i)).toBeInTheDocument();

    // Terms column: date, guests
    expect(screen.getByText("250 guests")).toBeInTheDocument();

    // Details column: budget & progress
    expect(screen.getByText(/₹15,00,000/)).toBeInTheDocument();
    expect(screen.getByText(/50% tasks done · 50% vendors booked/i)).toBeInTheDocument();
  });

  it("sorts upcoming events by soonest date first and puts past events in a separate section", () => {
    // Save out of order
    eventStore.saveEvent(sampleEvent1); // Dec 15 2026
    eventStore.saveEvent(samplePastEvent); // Past
    eventStore.saveEvent(sampleEvent2Soonest); // Nov 20 2026

    renderEventsPage();

    // Check that "Past Celebrations" section is present
    expect(screen.getByRole("region", { name: "Past celebrations" })).toBeInTheDocument();
    expect(screen.getByText("Summer Charity Gala")).toBeInTheDocument();

    // Check order of upcoming listings
    const upcomingRegion = screen.getByRole("region", { name: "Upcoming celebrations" });
    const links = upcomingRegion.querySelectorAll(".np-event-title-link");
    expect(links.length).toBe(2);
    expect(links[0].textContent).toBe("Kabir 10th Birthday");
    expect(links[1].textContent).toBe("Aarav & Diya Wedding");
  });

  it("opens delete dialog with confirmation text, supports cancel and confirm", async () => {
    const user = userEvent.setup();
    eventStore.saveEvent(sampleEvent1);
    renderEventsPage();

    const deleteBtn = screen.getByRole("button", { name: "Delete Aarav & Diya Wedding" });
    await user.click(deleteBtn);

    // Dialog appears with exact clear text
    expect(
      screen.getByText("Delete Aarav & Diya Wedding? This cannot be undone.")
    ).toBeInTheDocument();

    // Cancel closes dialog without deleting
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelBtn);

    await waitFor(() => {
      expect(
        screen.queryByText("Delete Aarav & Diya Wedding? This cannot be undone.")
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("Aarav & Diya Wedding")).toBeInTheDocument();

    // Re-open and confirm delete
    await user.click(screen.getByRole("button", { name: "Delete Aarav & Diya Wedding" }));
    const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
    await user.click(confirmDeleteBtn);

    // Should now show empty state
    await waitFor(() => {
      expect(screen.getByTestId("events-empty-state")).toBeInTheDocument();
    });
  });

  it("passes accessibility scan with zero violations", async () => {
    eventStore.saveEvent(sampleEvent1);
    const { container } = renderEventsPage();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
