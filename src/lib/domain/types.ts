import { z } from "zod";

/**
 * Event core types and enums for the Newsprint celebration domain.
 */
export const EventTypeSchema = z.enum(["wedding", "birthday", "community"]);
export type EventType = z.infer<typeof EventTypeSchema>;

export const CityTierSchema = z.enum(["metro", "tier2", "town"]);
export type CityTier = z.infer<typeof CityTierSchema>;

export const VenueTypeSchema = z.enum(["indoor", "outdoor", "hybrid"]);
export type VenueType = z.infer<typeof VenueTypeSchema>;

export const PrioritySchema = z.enum([
  "food",
  "venue",
  "decor",
  "entertainment",
  "photography",
  "guest-comfort",
]);
export type Priority = z.infer<typeof PrioritySchema>;

export const TaskStatusSchema = z.enum(["todo", "doing", "done"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const VendorStatusSchema = z.enum([
  "to-contact",
  "quoted",
  "booked",
  "paid",
]);
export type VendorStatus = z.infer<typeof VendorStatusSchema>;

export const RsvpStatusSchema = z.enum(["pending", "yes", "no"]);
export type RsvpStatus = z.infer<typeof RsvpStatusSchema>;

