import { z } from "zod";
import {
  EventTypeSchema,
  CityTierSchema,
  VenueTypeSchema,
  PrioritySchema,
} from "./types";

/**
 * Validates that an ISO date string represents today or a date in the future.
 */
export function isTodayOrLater(dateStr: string): boolean {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;

  const now = new Date();
  const todayLocal = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  const targetLocal = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  ).getTime();
  const targetUtc = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate()
  );

  return targetLocal >= todayLocal || targetUtc >= todayUtc;
}

export const EventBriefSchema = z
  .object({
    id: z.string().uuid("Invalid event ID, must be a valid UUID"),
    name: z
      .string()
      .min(1, "Name must be at least 1 character")
      .max(80, "Name cannot exceed 80 characters"),
    type: EventTypeSchema,
    date: z
      .string()
      .min(1, "Event date is required")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid ISO date format",
      }),
    guestCount: z
      .number()
      .int("Guest count must be an integer")
      .min(1, "Guest count must be at least 1")
      .max(2000, "Guest count cannot exceed 2000"),
    totalBudget: z
      .number()
      .int("Total budget must be an integer")
      .positive("Total budget must be greater than 0"),
    currency: z.string().default("INR"),
    city: z
      .string()
      .min(1, "City must be at least 1 character")
      .max(60, "City cannot exceed 60 characters"),
    cityTier: CityTierSchema,
    venueType: VenueTypeSchema,
    priorities: z
      .array(PrioritySchema)
      .max(3, "Maximum 3 priorities allowed")
      .default([]),
    dietaryNeeds: z.array(z.string()).default([]),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
    createdAt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.date || isNaN(Date.parse(data.date))) return;

    // Check if event was created historically: if date is on or after createdAt
    if (data.createdAt && !isNaN(Date.parse(data.createdAt))) {
      const createdDate = new Date(data.createdAt);
      const createdMidnight = new Date(
        createdDate.getFullYear(),
        createdDate.getMonth(),
        createdDate.getDate()
      ).getTime();
      const eventDate = new Date(data.date);
      const eventMidnight = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate()
      ).getTime();

      if (eventMidnight >= createdMidnight) {
        return; // Valid at creation!
      }
    }

    if (!isTodayOrLater(data.date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Event date must be today or later at creation",
        path: ["date"],
      });
    }
  });

export type EventBrief = z.infer<typeof EventBriefSchema>;
