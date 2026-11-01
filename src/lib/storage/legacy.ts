/**
 * @fileoverview Legacy single-event storage shim retained for backward compatibility.
 * @deprecated Use eventStore from "@/lib/storage/eventStore" for modern event persistence and subscriptions.
 */

import { CelebrationEvent, CelebrationEventSchema } from "../domain";

const STORAGE_KEY_PREFIX = "celebration_planner_event_";
const RECENT_IDS_KEY = "celebration_planner_recent_ids";

export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__cp_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function saveEventToStorage(event: CelebrationEvent): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    const serialized = JSON.stringify(event);
    window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${event.id}`, serialized);
    const recentIds = getRecentEventIds();
    if (!recentIds.includes(event.id)) {
      recentIds.unshift(event.id);
      window.localStorage.setItem(RECENT_IDS_KEY, JSON.stringify(recentIds.slice(0, 10)));
    }
    return true;
  } catch {
    return false;
  }
}

export function loadEventFromStorage(id: string): CelebrationEvent | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const validated = CelebrationEventSchema.safeParse(parsed);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}

export function deleteEventFromStorage(id: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
    const recentIds = getRecentEventIds().filter((existingId) => existingId !== id);
    window.localStorage.setItem(RECENT_IDS_KEY, JSON.stringify(recentIds));
    return true;
  } catch {
    return false;
  }
}

export function getRecentEventIds(): string[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(RECENT_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

