import { describe, it, expect } from "vitest";
import {
  EventBriefSchema,
  BudgetLineSchema,
  TimelineTaskSchema,
  VendorItemSchema,
  GuestSchema,
  IdeaSchema,
  PlannedEventSchema,
} from "@/lib/domain";

describe("Domain Layer - EventBriefSchema", () => {
  const getTodayISO = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  const getFutureISO = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split("T")[0];
  };

  const getPastISO = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  const validBriefInput = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Aarav & Diya Wedding Celebration",
    type: "wedding" as const,
    date: getFutureISO(60),
    guestCount: 350,
    totalBudget: 2500000,
    currency: "INR",
    city: "Mumbai",
    cityTier: "metro" as const,
    venueType: "hybrid" as const,
    priorities: ["food", "venue", "photography"] as ("food" | "venue" | "photography")[],
    dietaryNeeds: ["vegetarian", "jain", "vegan"],
    notes: "Requires valet parking and priority seating for elders.",
    createdAt: new Date().toISOString(),
  };

  it("validates a complete, valid event brief", () => {
    const result = EventBriefSchema.safeParse(validBriefInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Aarav & Diya Wedding Celebration");
      expect(result.data.currency).toBe("INR");
      expect(result.data.guestCount).toBe(350);
    }
  });

  it("accepts an event date set to today", () => {
    const todayBrief = {
      ...validBriefInput,
      date: getTodayISO(),
    };
    const result = EventBriefSchema.safeParse(todayBrief);
    expect(result.success).toBe(true);
  });

  it("rejects an event date in the past", () => {
    const pastBrief = {
      ...validBriefInput,
      date: getPastISO(2), // 2 days ago
    };
    const result = EventBriefSchema.safeParse(pastBrief);
    expect(result.success).toBe(false);
    if (!result.success) {
      const dateError = result.error.issues.find((i) => i.path.includes("date"));
      expect(dateError).toBeDefined();
      expect(dateError?.message).toContain("today or later");
    }
  });

  it("rejects invalid date formats", () => {
    const invalidDateBrief = {
      ...validBriefInput,
      date: "not-a-valid-date-string",
    };
    const result = EventBriefSchema.safeParse(invalidDateBrief);
    expect(result.success).toBe(false);
  });

  it("rejects name if empty or exceeds 80 characters", () => {
    expect(EventBriefSchema.safeParse({ ...validBriefInput, name: "" }).success).toBe(false);
    expect(
      EventBriefSchema.safeParse({
        ...validBriefInput,
        name: "A".repeat(81),
      }).success
    ).toBe(false);
  });

  it("rejects guest counts outside 1 to 2000 or non-integers", () => {
    expect(EventBriefSchema.safeParse({ ...validBriefInput, guestCount: 0 }).success).toBe(false);
    expect(EventBriefSchema.safeParse({ ...validBriefInput, guestCount: 2001 }).success).toBe(false);
    expect(EventBriefSchema.safeParse({ ...validBriefInput, guestCount: 50.5 }).success).toBe(false);
  });

  it("rejects totalBudget if zero, negative, or not an integer", () => {
    expect(EventBriefSchema.safeParse({ ...validBriefInput, totalBudget: 0 }).success).toBe(false);
    expect(EventBriefSchema.safeParse({ ...validBriefInput, totalBudget: -500 }).success).toBe(false);
    expect(EventBriefSchema.safeParse({ ...validBriefInput, totalBudget: 1000.75 }).success).toBe(false);
  });

  it("rejects if more than 3 priorities are specified", () => {
    const tooManyPriorities = {
      ...validBriefInput,
      priorities: ["food", "venue", "decor", "entertainment"],
    };
    const result = EventBriefSchema.safeParse(tooManyPriorities);
    expect(result.success).toBe(false);
  });

  it("rejects notes exceeding 500 characters", () => {
    const longNotes = {
      ...validBriefInput,
      notes: "N".repeat(501),
    };
    expect(EventBriefSchema.safeParse(longNotes).success).toBe(false);
  });

  it("rejects invalid UUID for id", () => {
    expect(EventBriefSchema.safeParse({ ...validBriefInput, id: "bad-id" }).success).toBe(false);
  });
});

describe("Domain Layer - Other Schemas", () => {
  it("validates BudgetLineSchema", () => {
    const valid = { category: "Catering", plannedAmount: 50000, actualAmount: 48000, note: "Deposit paid" };
    expect(BudgetLineSchema.safeParse(valid).success).toBe(true);
    expect(BudgetLineSchema.safeParse({ category: "", plannedAmount: -1 }).success).toBe(false);
  });

  it("validates TimelineTaskSchema", () => {
    const valid = {
      id: "t1",
      title: "Confirm caterer",
      dueDate: "2026-11-15",
      category: "Catering",
      status: "todo" as const,
      isCritical: true,
    };
    expect(TimelineTaskSchema.safeParse(valid).success).toBe(true);
    expect(TimelineTaskSchema.safeParse({ ...valid, status: "unknown" }).success).toBe(false);
  });

  it("validates VendorItemSchema", () => {
    const valid = {
      id: "v1",
      category: "Photography",
      label: "Studio Lumina",
      status: "quoted" as const,
      quoteAmount: 85000,
    };
    expect(VendorItemSchema.safeParse(valid).success).toBe(true);
    expect(VendorItemSchema.safeParse({ ...valid, status: "invalid-status" }).success).toBe(false);
  });

  it("validates GuestSchema including plusOnes boundaries (0 to 5)", () => {
    const valid = { id: "g1", name: "Rohan Verma", group: "Family", rsvp: "yes" as const, plusOnes: 2 };
    expect(GuestSchema.safeParse(valid).success).toBe(true);
    expect(GuestSchema.safeParse({ ...valid, plusOnes: 6 }).success).toBe(false);
    expect(GuestSchema.safeParse({ ...valid, plusOnes: -1 }).success).toBe(false);
  });

  it("validates IdeaSchema", () => {
    const valid = { id: "i1", title: "Sunset welcome drinks", description: "Serve seasonal mocktails", tag: "drinks", saved: true };
    expect(IdeaSchema.safeParse(valid).success).toBe(true);
  });

  it("validates a full PlannedEvent structure", () => {
    const plannedEvent = {
      brief: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Golden Milestone Anniversary",
        type: "community" as const,
        date: "2026-12-30",
        guestCount: 120,
        totalBudget: 450000,
        currency: "INR",
        city: "Pune",
        cityTier: "tier2" as const,
        venueType: "outdoor" as const,
        priorities: ["food", "guest-comfort"] as ("food" | "guest-comfort")[],
        dietaryNeeds: ["vegetarian"],
        notes: "Wheelchair ramp needed.",
        createdAt: new Date().toISOString(),
      },
      budgetLines: [{ category: "Venue", plannedAmount: 150000 }],
      tasks: [{ id: "t1", title: "Book grounds", dueDate: "2026-11-01", category: "Venue", status: "done" as const, isCritical: true }],
      vendors: [{ id: "v1", category: "Decor", label: "Flora Studio", status: "booked" as const }],
      guests: [{ id: "g1", name: "Sunil Patil", group: "Organizers", rsvp: "yes" as const, plusOnes: 1 }],
      ideas: [{ id: "i1", title: "Acoustic music set", description: "Local guitarist", tag: "music", saved: true }],
      schemaVersion: 1,
    };

    const result = PlannedEventSchema.safeParse(plannedEvent);
    expect(result.success).toBe(true);
  });
});

