import { z } from "zod";

export const IdeasRequestSchema = z
  .object({
    type: z.enum(["wedding", "birthday", "community"]).optional(),
    eventType: z.enum(["wedding", "birthday", "community"]).optional(),
    focus: z.enum(["theme", "menu", "activities", "decor", "surprises"]),
    mood: z.string().max(100).optional(),
    name: z.string().max(80).optional(),
    date: z.string().max(50).optional(),
    guestCount: z.number().int().min(1).max(2000).optional(),
    totalBudget: z.number().int().min(1).max(1000000000).optional(),
    currency: z.string().max(10).optional(),
    city: z.string().max(60).optional(),
    cityTier: z.enum(["metro", "tier2", "town"]).optional(),
    venueType: z.enum(["indoor", "outdoor", "hybrid"]).optional(),
    priorities: z.array(z.string().max(50)).max(3).optional(),
    dietaryNeeds: z.array(z.string().max(50)).max(20).optional(),
    notes: z.string().max(500).optional(),
    eventSummary: z.string().max(3000).optional(),
  })
  .strict();

export const IdeaItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  tag: z.string().min(1).max(50),
  estimatedCost: z.enum(["low", "medium", "high"]),
});

export const IdeasResponseSchema = z.object({
  ideas: z.array(IdeaItemSchema).min(1).max(10),
});

export const AssistantRequestSchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z.string().min(1).max(800),
          })
          .strict()
      )
      .min(1)
      .max(12),
    eventSummary: z.string().max(3000).default(""),
  })
  .strict();

