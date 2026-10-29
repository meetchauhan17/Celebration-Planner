import { describe, it, expect } from "vitest";
import { CelebrationEventSchema, BudgetItemSchema } from "@/lib/domain";

describe("Domain Models", () => {
  it("validates a valid celebration event", () => {
    const validEvent = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Silver Jubilee Anniversary",
      eventType: "anniversary",
      date: "2026-12-25T18:00:00.000Z",
      guestCount: 80,
      totalBudget: 10000,
      budgetItems: [],
      timeline: [],
      vendors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const parsed = CelebrationEventSchema.safeParse(validEvent);
    expect(parsed.success).toBe(true);
  });

  it("fails validation for negative budget in budget item", () => {
    const invalidBudgetItem = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      category: "Catering",
      title: "Dinner buffet",
      allocatedAmount: -500,
    };

    const parsed = BudgetItemSchema.safeParse(invalidBudgetItem);
    expect(parsed.success).toBe(false);
  });
});
