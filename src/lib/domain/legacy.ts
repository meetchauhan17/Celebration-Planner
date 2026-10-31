import { z } from "zod";

export const LegacyEventTypeSchema = z.enum([
  "birthday",
  "wedding",
  "community",
  "anniversary",
  "graduation",
  "baby_shower",
  "dinner_party",
  "holiday",
  "corporate",
  "other",
]);
export type LegacyEventType = z.infer<typeof LegacyEventTypeSchema>;

export const BudgetItemSchema = z.object({
  id: z.string().uuid(),
  category: z.string().min(1),
  title: z.string().min(1),
  allocatedAmount: z.number().nonnegative(),
  actualAmount: z.number().nonnegative().default(0),
  isPaid: z.boolean().default(false),
});
export type BudgetItem = z.infer<typeof BudgetItemSchema>;

export const VendorCategorySchema = z.enum([
  "venue",
  "catering",
  "photography",
  "music_dj",
  "florist",
  "decor",
  "cake",
  "attire",
  "invitations",
  "other",
]);
export type VendorCategory = z.infer<typeof VendorCategorySchema>;

export const VendorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  category: VendorCategorySchema,
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  status: z.enum(["researching", "contacted", "quoted", "booked", "declined"]),
  estimatedCost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});
export type Vendor = z.infer<typeof VendorSchema>;

export const CelebrationEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  eventType: LegacyEventTypeSchema,
  date: z.string(),
  guestCount: z.number().int().positive().default(50),
  totalBudget: z.number().nonnegative(),
  location: z.string().optional(),
  budgetItems: z.array(BudgetItemSchema).default([]),
  timeline: z.array(z.any()).default([]),
  vendors: z.array(VendorSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CelebrationEvent = z.infer<typeof CelebrationEventSchema>;

