import { describe, it, expect } from "vitest";
import { buildEventContext } from "@/lib/ai/context";
import type { PlannedEvent } from "@/lib/domain/plan";

describe("buildEventContext", () => {
  const mockPlannedEvent: PlannedEvent = {
    brief: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Radhika & Aman Wedding",
      type: "wedding",
      date: "2026-11-28",
      guestCount: 250,
      totalBudget: 1500000,
      currency: "INR",
      city: "Udaipur",
      cityTier: "tier2",
      venueType: "outdoor",
      priorities: ["food", "venue", "photography"],
      dietaryNeeds: ["vegetarian", "jain"],
      notes: "Traditional sunset ceremony with palace backdrop.",
      createdAt: "2026-10-01T00:00:00Z",
    },
    budgetLines: [
      { category: "catering", plannedAmount: 450000, actualAmount: 480000 },
      { category: "venue", plannedAmount: 375000, actualAmount: 375000 },
      { category: "decor", plannedAmount: 150000 },
    ],
    tasks: [
      {
        id: "t1",
        title: "Book Mandap Decorator",
        dueDate: "2026-10-15", // overdue relative to 2026-10-29
        category: "decor",
        status: "todo",
        isCritical: true,
      },
      {
        id: "t2",
        title: "Arrange Weather Contingency Tent",
        dueDate: "2026-11-10",
        category: "venue",
        status: "doing",
        isCritical: true,
        atRisk: true,
      },
      {
        id: "t3",
        title: "Order Invitations",
        dueDate: "2026-10-05",
        category: "invitations",
        status: "done",
        isCritical: false,
      },
    ],
    vendors: [
      {
        id: "v1",
        category: "catering",
        label: "Royal Caterers Ltd",
        status: "quoted",
        quoteAmount: 480000,
        contact: "chef.kapoor@example.com, +919876543210",
        notes: "Strict Jain counter required",
      },
      {
        id: "v2",
        category: "venue",
        label: "Udaipur Palace Gardens",
        status: "booked",
        quoteAmount: 375000,
        contact: "manager.sharma@palace.com, +919988776655",
      },
      {
        id: "v3",
        category: "photography",
        label: "Lens & Lights Studio",
        status: "to-contact",
      },
    ],
    guests: [
      {
        id: "g1",
        name: "Vikram Malhotra",
        group: "Groom Family",
        rsvp: "yes",
        dietary: "jain",
        plusOnes: 1,
      },
      {
        id: "g2",
        name: "Simran Kaur",
        group: "Bride Friends",
        rsvp: "pending",
        dietary: "vegetarian",
        plusOnes: 0,
      },
      {
        id: "g3",
        name: "Dev Patel",
        group: "Colleagues",
        rsvp: "no",
        plusOnes: 0,
      },
    ],
    ideas: [],
    schemaVersion: 1,
  };

  const fixedToday = new Date("2026-10-29T12:00:00Z");

  it("includes all required summary fields", () => {
    const summary = buildEventContext(mockPlannedEvent, fixedToday);

    expect(summary).toContain("Event Type: wedding");
    expect(summary).toContain("Date: 2026-11-28 (30 days remaining)");
    expect(summary).toContain("Guest Count: 250");
    expect(summary).toContain("Budget: 1500000 INR (Per-Guest: 6000 INR)");
    expect(summary).toContain("City Tier: tier2");
    expect(summary).toContain("Venue Type: outdoor");
    expect(summary).toContain("Priorities: food, venue, photography");
    expect(summary).toContain("Dietary Needs: vegetarian, jain");
  });

  it("summarizes budget lines with planned vs actual amounts", () => {
    const summary = buildEventContext(mockPlannedEvent, fixedToday);

    expect(summary).toContain("catering: planned 450000, actual 480000");
    expect(summary).toContain("venue: planned 375000, actual 375000");
    expect(summary).toContain("decor: planned 150000");
  });

  it("identifies overdue and at-risk tasks while ignoring completed ones", () => {
    const summary = buildEventContext(mockPlannedEvent, fixedToday);

    expect(summary).toContain('"Book Mandap Decorator" (overdue, due 2026-10-15)');
    expect(summary).toContain('"Arrange Weather Contingency Tent" (at-risk, due 2026-11-10)');
    expect(summary).not.toContain("Order Invitations");
  });

  it("summarizes vendor counts by status without exposing vendor names", () => {
    const summary = buildEventContext(mockPlannedEvent, fixedToday);

    expect(summary).toContain("Vendor Status Summary: to-contact: 1, quoted: 1, booked: 1, paid: 0");
    expect(summary).not.toContain("Royal Caterers Ltd");
    expect(summary).not.toContain("Udaipur Palace Gardens");
    expect(summary).not.toContain("Lens & Lights Studio");
  });

  it("PRIVACY RULE: never includes guest names or contact information", () => {
    const summary = buildEventContext(mockPlannedEvent, fixedToday);

    // Guest names
    expect(summary).not.toContain("Vikram Malhotra");
    expect(summary).not.toContain("Simran Kaur");
    expect(summary).not.toContain("Dev Patel");

    // Vendor and guest contact details
    expect(summary).not.toContain("chef.kapoor@example.com");
    expect(summary).not.toContain("+919876543210");
    expect(summary).not.toContain("manager.sharma@palace.com");
    expect(summary).not.toContain("+919988776655");

    // Aggregates must be present
    expect(summary).toContain("RSVPs: 1 confirmed, 1 pending, 1 declined");
    expect(summary).toContain("jain: 2");
    expect(summary).toContain("vegetarian: 1");
  });
});

