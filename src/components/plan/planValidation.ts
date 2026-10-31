import { z } from "zod";
import {
  EventTypeSchema,
  CityTierSchema,
  VenueTypeSchema,
  PrioritySchema,
  isTodayOrLater,
} from "@/lib/domain";

export const DRAFT_STORAGE_KEY = "celebration-planner:draft:v1";

export const PRIORITY_OPTIONS = [
  { id: "food", label: "Food & Catering" },
  { id: "venue", label: "Venue & Staging" },
  { id: "decor", label: "Decor & Production" },
  { id: "entertainment", label: "Live Entertainment & Audio" },
  { id: "photography", label: "Photography & Video" },
  { id: "guest-comfort", label: "Guest Comfort & Transport" },
] as const;

export const STANDARD_DIETARY = ["Vegetarian", "Jain", "Vegan", "Halal", "Gluten-free"];

export const Step1Schema = z.object({
  type: EventTypeSchema,
  name: z.string().trim().min(1, "Event name is required").max(80, "Name cannot exceed 80 characters"),
  date: z
    .string()
    .min(1, "Event date is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid ISO date format")
    .refine((val) => isTodayOrLater(val), "Event date must be today or later"),
});

export const Step2Schema = z.object({
  guestCount: z.coerce
    .number()
    .int("Guest count must be an integer")
    .min(1, "Guest count must be at least 1")
    .max(2000, "Guest count cannot exceed 2,000"),
  city: z.string().trim().min(1, "City is required").max(60, "City cannot exceed 60 characters"),
  cityTier: CityTierSchema,
  venueType: VenueTypeSchema,
});

export const Step3Schema = z.object({
  totalBudget: z.coerce.number().int("Total budget must be an integer").positive("Total budget must be greater than 0"),
  currency: z.string().min(1, "Currency is required").max(10),
});

export const Step4Schema = z.object({
  priorities: z.array(PrioritySchema).max(3, "You can select at most 3 priorities"),
  dietaryNeeds: z.array(z.string()),
  otherDietary: z.string().max(50, "Dietary note too long").optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters"),
});

export interface PlanFormData {
  type: "wedding" | "birthday" | "community";
  name: string;
  date: string;
  guestCount: number | "";
  city: string;
  cityTier: "metro" | "tier2" | "town";
  venueType: "indoor" | "outdoor" | "hybrid";
  totalBudget: number | "";
  currency: string;
  priorities: Array<"food" | "venue" | "decor" | "entertainment" | "photography" | "guest-comfort">;
  dietaryNeeds: string[];
  otherDietary: string;
  notes: string;
}

export const INITIAL_PLAN_FORM: PlanFormData = {
  type: "wedding",
  name: "",
  date: "",
  guestCount: 100,
  city: "",
  cityTier: "tier2",
  venueType: "indoor",
  totalBudget: 500000,
  currency: "INR",
  priorities: [],
  dietaryNeeds: [],
  otherDietary: "",
  notes: "",
};

export function validateStepForm(step: number, data: PlanFormData): { success: boolean; errors: Record<string, string> } {
  const schemas = [Step1Schema, Step2Schema, Step3Schema, Step4Schema];
  const result = schemas[step - 1].safeParse(data);
  if (result.success) return { success: true, errors: {} };

  const errors: Record<string, string> = {};
  for (const err of result.error.errors) {
    const key = String(err.path[0]);
    if (!errors[key]) errors[key] = err.message;
  }
  return { success: false, errors };
}

export function loadDraft(): PlanFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(data: PlanFormData): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {}
}
