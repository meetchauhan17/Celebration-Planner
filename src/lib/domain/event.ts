import { z } from "zod";

export const EventTypeSchema = z.enum([
  "birthday",
  "wedding",
  "anniversary",
  "graduation",
  "baby_shower",
  "dinner_party",
  "holiday",
  "corporate",
  "other",
]);
export type EventType = z.infer<typeof EventTypeSchema>;

export const BudgetItemSchema = z.object({
  id: z.string().uuid(),
  category: z.string().min(1),
  title: z.string().min(1),
  allocatedAmount: z.number().nonnegative(),
  actualAmount: z.number().nonnegative().default(0),
  isPaid: z.boolean().default(false),
});
export type BudgetItem = z.infer<typeof BudgetItemSchema>;

export const TimelineTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  dueDate: z.string(), // ISO date string
  completed: z.boolean().default(false),
  assignedTo: z.string().optional(),
  phase: z.enum(["initial_planning", "vendor_booking", "invitations", "week_of", "day_of"]),
});
export type TimelineTask = z.infer<typeof TimelineTaskSchema>;

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
  title: z.string().min(1, "Event title is required"),
  eventType: EventTypeSchema,
  date: z.string(), // ISO string
  guestCount: z.number().int().positive().default(50),
  totalBudget: z.number().nonnegative(),
  location: z.string().optional(),
  budgetItems: z.array(BudgetItemSchema).default([]),
  timeline: z.array(TimelineTaskSchema).default([]),
  vendors: z.array(VendorSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CelebrationEvent = z.infer<typeof CelebrationEventSchema>;
