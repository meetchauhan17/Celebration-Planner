"use client";

import { generateBudget, generateTimeline, generateVendorChecklist } from "@/lib/engine";
import { saveEvent, Result } from "@/lib/storage";
import { PlannedEvent, EventBrief } from "@/lib/domain";
import { PlanFormData } from "./planValidation";

export const FIELD_ID_MAP: Record<string, string> = {
  name: "plan-name",
  date: "plan-date",
  type: "type-wedding",
  guestCount: "plan-guests",
  city: "plan-city",
  cityTier: "plan-tier",
  venueType: "venue-indoor",
  totalBudget: "plan-budget",
  currency: "plan-currency",
  priorities: "priority-food",
  notes: "plan-notes",
};

export function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function executePlanCreation(formData: PlanFormData): Result<PlannedEvent> {
  const brief: EventBrief = {
    id: generateUuid(),
    name: formData.name.trim(),
    type: formData.type,
    date: formData.date,
    guestCount: Number(formData.guestCount),
    totalBudget: Number(formData.totalBudget),
    currency: formData.currency,
    city: formData.city.trim(),
    cityTier: formData.cityTier,
    venueType: formData.venueType,
    priorities: formData.priorities,
    dietaryNeeds: [
      ...formData.dietaryNeeds,
      ...(formData.otherDietary.trim() ? [formData.otherDietary.trim()] : []),
    ],
    notes: formData.notes.trim(),
    createdAt: new Date().toISOString(),
  };

  const budgetRes = generateBudget({
    type: brief.type,
    totalBudget: brief.totalBudget,
    guestCount: brief.guestCount,
    priorities: brief.priorities,
    venueType: brief.venueType,
    cityTier: brief.cityTier,
  });

  const timelineRes = generateTimeline(brief, new Date());
  const vendorRes = generateVendorChecklist(brief);

  const plannedEvent: PlannedEvent = {
    brief,
    budgetLines: budgetRes.lines,
    tasks: timelineRes.tasks,
    vendors: vendorRes,
    guests: [],
    ideas: [],
    schemaVersion: 1,
  };

  const saveRes = saveEvent(plannedEvent);
  if (!saveRes.ok) {
    return saveRes;
  }

  return { ok: true, data: plannedEvent };
}
