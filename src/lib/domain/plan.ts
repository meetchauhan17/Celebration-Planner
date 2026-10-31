import { z } from "zod";
import { EventBriefSchema } from "./brief";
import { TaskStatusSchema, VendorStatusSchema, RsvpStatusSchema } from "./types";

export const BudgetLineSchema = z.object({
  category: z.string().min(1, "Category is required"),
  plannedAmount: z.number().int().nonnegative("Planned amount must be non-negative"),
  actualAmount: z.number().int().nonnegative("Actual amount must be non-negative").optional(),
  note: z.string().optional(),
});
export type BudgetLine = z.infer<typeof BudgetLineSchema>;

export const TimelineTaskSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().min(1, "Due date is required"),
  category: z.string().default("general"),
  status: TaskStatusSchema.default("todo"),
  isCritical: z.boolean().default(false),
  atRisk: z.boolean().optional(),
  reason: z.string().optional(),
  completed: z.boolean().optional(),
  phase: z.string().optional(),
  isCustom: z.boolean().optional(),
});
export type TimelineTask = z.infer<typeof TimelineTaskSchema>;

export const VendorItemSchema = z.object({
  id: z.string().min(1, "Vendor ID is required"),
  category: z.string().min(1, "Category is required"),
  label: z.string().min(1, "Vendor label is required"),
  status: VendorStatusSchema,
  quoteAmount: z.number().nonnegative().optional(),
  contact: z.string().optional(),
  notes: z.string().optional(),
  whatToAsk: z.string().or(z.array(z.string())).optional(),
});
export type VendorItem = z.infer<typeof VendorItemSchema>;

export const GuestSchema = z.object({
  id: z.string().min(1, "Guest ID is required"),
  name: z.string().min(1, "Guest name is required").max(80, "Name cannot exceed 80 characters"),
  group: z.string().min(1, "Group is required"),
  rsvp: RsvpStatusSchema,
  dietary: z.string().optional(),
  plusOnes: z.number().int().min(0, "plusOnes must be at least 0").max(5, "plusOnes cannot exceed 5").default(0),
});
export type Guest = z.infer<typeof GuestSchema>;

export const IdeaSchema = z.object({
  id: z.string().min(1, "Idea ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  tag: z.string().default(""),
  saved: z.boolean().default(false),
});
export type Idea = z.infer<typeof IdeaSchema>;

export const PlannedEventSchema = z.object({
  brief: EventBriefSchema,
  budgetLines: z.array(BudgetLineSchema).default([]),
  tasks: z.array(TimelineTaskSchema).default([]),
  vendors: z.array(VendorItemSchema).default([]),
  guests: z.array(GuestSchema).default([]),
  ideas: z.array(IdeaSchema).default([]),
  schemaVersion: z.number().int().default(1),
});
export type PlannedEvent = z.infer<typeof PlannedEventSchema>;
