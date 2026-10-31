import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import EventOverviewPage from "@/app/events/[id]/page";
import { AnnounceProvider } from "@/components/shell";
import * as eventStore from "@/lib/storage/eventStore";
import { PlannedEvent } from "@/lib/domain";

expect.extend(toHaveNoViolations);

const sampleEvent: PlannedEvent = {
  brief: {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Rohan & Priya Wedding",
    type: "wedding",
    date: "2026-12-25",
    guestCount: 300,
    totalBudget: 2400000,
    currency: "INR",
    city: "Jaipur",
    cityTier: "tier2",
    venueType: "outdoor",
    priorities: ["food", "photography", "decor"],
    dietaryNeeds: ["jain", "vegan"],
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  budgetLines: [
    { category: "catering", plannedAmount: 800000 },
    { category: "venue", plannedAmount: 600000 },
    { category: "decor", plannedAmount: 300000 },
  ],
  tasks: [
    {
      id: "t-crit-1",
      title: "Reserve outdoor tent and backup venue",
      dueDate: "2026-03-01",
      category: "Venue",
      status: "todo",
      isCritical: true,
      atRisk: true,
      reason: "Lead time exceeds remaining days",
    },
    {
      id: "t-crit-2",
      title: "Confirm head chef for jain and vegan menu",
      dueDate: "2026-04-10",
      category: "Catering",
      status: "todo",
      isCritical: true,
    },
    { id: "t-3", title: "Select invitation card typography", dueDate: "2026-05-15", category: "Stationery", status: "todo", isCritical: false },
    { id: "t-4", title: "Book wedding cinematographer", dueDate: "2026-06-01", category: "Media", status: "todo", isCritical: true },
    { id: "t-5", title: "Schedule outfit trials", dueDate: "2026-07-20", category: "Attire", status: "todo", isCritical: false },
    { id: "t-6", title: "Order return favors", dueDate: "2026-08-15", category: "Favors", status: "todo", isCritical: false },
  ],
  vendors: [
    { id: "v-1", category: "Venue", label: "Palace Courtyard", status: "booked" },
    { id: "v-2", category: "Catering", label: "Heritage Feasts", status: "quoted" },
  ],
  guests: [
    { id: "g-1", name: "Ananya Sharma", group: "Family", rsvp: "yes", plusOnes: 1 },
    { id: "g-2", name: "Vikram Malhotra", group: "Friends", rsvp: "no", plusOnes: 0 },
  ],
  ideas: [],
  schemaVersion: 1,
};

describe("Event Overview Page (/events/[id])", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventStore.resetCacheForTesting();
    window.localStorage.clear();
  });

  const renderOverview = (id: string) => {
    return render(
      <AnnounceProvider>
        <EventOverviewPage params={{ id }} />
      </AnnounceProvider>
    );
  };

  it("renders friendly not-found state with link to /plan when id is missing or not in store", async () => {
    renderOverview("non-existent-id");

    await waitFor(() => {
      expect(screen.getByTestId("event-not-found")).toBeInTheDocument();
      expect(screen.getByText("Celebration Plan Not Located")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Plan an event" })).toHaveAttribute("href", "/plan");
    });
  });

  it("renders lead spread (3:1) with event name as h1 and reading-font data-generated summary", async () => {
    eventStore.saveEvent(sampleEvent);
    renderOverview(sampleEvent.brief.id);

    await waitFor(() => {
      // Exactly one h1 on page with event name
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Rohan & Priya Wedding");
    });

    // Code-generated summary includes type, guests, city, venue, date, days remaining
    const summary = screen.getByText(/A wedding celebration organized for 300 guests in Jaipur/i);
    expect(summary).toBeInTheDocument();
    expect(summary).toHaveTextContent("outdoor venue");
    expect(summary).toHaveTextContent("24,00,000"); // formatted budget (en-IN)
    expect(summary).toHaveTextContent("₹8,000 per guest"); // per guest
  });

  it("renders next action in narrow column with earliest at-risk/overdue critical task and timeline link", async () => {
    eventStore.saveEvent(sampleEvent);
    renderOverview(sampleEvent.brief.id);

    await waitFor(() => {
      const nextActionBox = screen.getByTestId("overview-next-action");
      expect(nextActionBox).toBeInTheDocument();
      expect(nextActionBox).toHaveTextContent("Reserve outdoor tent and backup venue");
      expect(nextActionBox).toHaveTextContent("Lead time exceeds remaining days");

      const timelineLink = screen.getByRole("link", { name: "Go to timeline →" });
      expect(timelineLink).toHaveAttribute("href", `/events/${sampleEvent.brief.id}/timeline`);
    });
  });

  it("renders factual strip with 5 honestly computed figures", async () => {
    eventStore.saveEvent(sampleEvent);
    renderOverview(sampleEvent.brief.id);

    await waitFor(() => {
      const factStrip = screen.getByTestId("overview-fact-strip");
      expect(factStrip).toBeInTheDocument();
      expect(factStrip).toHaveTextContent("₹8,000"); // per guest
      expect(factStrip).toHaveTextContent("0%"); // 0 of 6 tasks done
      expect(factStrip).toHaveTextContent("50%"); // 1 of 2 vendors booked
      expect(factStrip).toHaveTextContent("1 confirmed"); // 1 yes RSVP
    });
  });

  it("honestly displays 0 or 'None yet' in factual strip when no guests exist", async () => {
    const eventWithoutGuests = { ...sampleEvent, guests: [] };
    eventStore.saveEvent(eventWithoutGuests);
    renderOverview(sampleEvent.brief.id);

    await waitFor(() => {
      expect(screen.getByText("None yet")).toBeInTheDocument();
    });
  });

  it("renders feasibility assessment and red marker when schedule is tight or very tight", async () => {
    // Event date very close to today creates tight/very-tight feasibility
    const tightDate = new Date();
    tightDate.setDate(tightDate.getDate() + 10);
    const tightEvent: PlannedEvent = {
      ...sampleEvent,
      brief: {
        ...sampleEvent.brief,
        date: tightDate.toISOString().slice(0, 10),
      },
    };

    eventStore.saveEvent(tightEvent);
    renderOverview(sampleEvent.brief.id);

    await waitFor(() => {
      const feasibility = screen.getByTestId("overview-feasibility");
      expect(feasibility).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "High schedule pressure alert" })).toBeInTheDocument();
    });
  });

  it("renders main spread with section links and coming up story showing next 5 tasks", async () => {
    eventStore.saveEvent(sampleEvent);
    renderOverview(sampleEvent.brief.id);

    await waitFor(() => {
      // Section links
      expect(screen.getByRole("link", { name: "Budget →" })).toHaveAttribute(
        "href",
        `/events/${sampleEvent.brief.id}/budget`
      );
      expect(screen.getByRole("link", { name: "Timeline →" })).toHaveAttribute(
        "href",
        `/events/${sampleEvent.brief.id}/timeline`
      );
      expect(screen.getByRole("link", { name: "Vendors →" })).toHaveAttribute(
        "href",
        `/events/${sampleEvent.brief.id}/vendors`
      );

      // Coming up story with 5 tasks (out of 6)
      const comingUp = screen.getByTestId("overview-coming-up");
      expect(comingUp).toHaveTextContent("Reserve outdoor tent and backup venue");
      expect(comingUp).toHaveTextContent("Confirm head chef for jain and vegan menu");
      expect(comingUp).toHaveTextContent("Select invitation card typography");
      expect(comingUp).toHaveTextContent("Book wedding cinematographer");
      expect(comingUp).toHaveTextContent("Schedule outfit trials");
      // 6th task should not appear in top 5
      expect(comingUp).not.toHaveTextContent("Order return favors");
    });
  });

  it("passes accessibility scan with zero violations", async () => {
    eventStore.saveEvent(sampleEvent);
    const { container } = renderOverview(sampleEvent.brief.id);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
