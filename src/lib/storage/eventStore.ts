"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";
import { PlannedEvent, PlannedEventSchema } from "../domain";
import { Result, StorageError, StorageErrorCode, ok, err } from "./types";

export const STORAGE_KEY = "celebration-planner:v1";
export const QUARANTINE_PREFIX = "celebration-planner:v1:quarantined:";

const StoredEventsSchema = z.array(PlannedEventSchema);
const listeners = new Set<() => void>();
let cachedEvents: PlannedEvent[] = [];
let cacheInitialized = false;
let lastKnownStorageString: string | null = null;
const EMPTY_EVENTS: PlannedEvent[] = [];

function toError(e: unknown, code: StorageErrorCode, msg: string): StorageError {
  const errObj = e as { name?: string; message?: string; code?: number };
  if (errObj?.name === "QuotaExceededError" || errObj?.code === 22 || errObj?.message?.includes("quota")) {
    return { code: "QUOTA_EXCEEDED", message: "Storage quota exceeded", cause: e };
  }
  if (errObj?.name === "SecurityError") {
    return { code: "UNAVAILABLE", message: "Storage unavailable (private mode)", cause: e };
  }
  return { code, message: errObj?.message || msg, cause: e };
}

function quarantineAndReset(raw: string): void {
  try {
    window.localStorage.setItem(`${QUARANTINE_PREFIX}${Date.now()}`, raw);
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function syncCache(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === lastKnownStorageString && cacheInitialized) {
      return;
    }
    lastKnownStorageString = raw;
    if (!raw) {
      cachedEvents = EMPTY_EVENTS;
      cacheInitialized = true;
      return;
    }
    const json = JSON.parse(raw);
    const parsed = StoredEventsSchema.safeParse(json);
    if (!parsed.success) {
      quarantineAndReset(raw);
      cachedEvents = EMPTY_EVENTS;
    } else {
      cachedEvents = parsed.data;
    }
  } catch {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) quarantineAndReset(raw);
    lastKnownStorageString = null;
    cachedEvents = EMPTY_EVENTS;
  }
  cacheInitialized = true;
}

function notify(): void {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      syncCache();
      notify();
    }
  });
}

function writeEvents(events: PlannedEvent[]): Result<PlannedEvent[]> {
  if (typeof window === "undefined") {
    return err({ code: "UNAVAILABLE", message: "window is undefined" });
  }
  try {
    const serialized = JSON.stringify(events);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    lastKnownStorageString = serialized;
    cachedEvents = events;
    notify();
    return ok(events);
  } catch (e) {
    return err(toError(e, "QUOTA_EXCEEDED", "Failed to write event data"));
  }
}

export function resetCacheForTesting(): void {
  cachedEvents = EMPTY_EVENTS;
  cacheInitialized = false;
  lastKnownStorageString = null;
  listeners.clear();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Retrieves all stored celebration events from local browser storage.
 * @returns Result containing array of PlannedEvent objects.
 */
export function listEvents(): Result<PlannedEvent[]> {
  if (typeof window === "undefined") {
    return err({ code: "UNAVAILABLE", message: "window is undefined" });
  }
  syncCache();
  return ok(cachedEvents);
}

/**
 * Retrieves a single celebration event by its unique brief ID.
 * @param id - The unique ID of the event brief.
 * @returns Result containing the matched PlannedEvent or null if not found.
 */
export function getEvent(id: string): Result<PlannedEvent | null> {
  const listRes = listEvents();
  if (!listRes.ok) return listRes;
  const found = listRes.data.find((e) => e.brief.id === id) ?? null;
  return ok(found);
}

/**
 * Persists an event into local storage after full Zod schema validation.
 * @param event - The PlannedEvent instance to validate and store.
 * @returns Result containing the saved event or validation error.
 */
export function saveEvent(event: PlannedEvent): Result<PlannedEvent> {
  const valid = PlannedEventSchema.safeParse(event);
  if (!valid.success) {
    return err({ code: "VALIDATION_ERROR", message: valid.error.message, cause: valid.error });
  }
  const listRes = listEvents();
  if (!listRes.ok) return listRes;
  const current = listRes.data;
  const idx = current.findIndex((e) => e.brief.id === event.brief.id);
  const next = idx >= 0 ? current.map((e, i) => (i === idx ? event : e)) : [...current, event];
  const writeRes = writeEvents(next);
  if (!writeRes.ok) return writeRes;
  return ok(event);
}

/**
 * Deletes an event by its brief ID from local storage.
 * @param id - The unique ID of the event to remove.
 * @returns Result containing boolean indicating whether an event was deleted.
 */
export function deleteEvent(id: string): Result<boolean> {
  const listRes = listEvents();
  if (!listRes.ok) return listRes;
  const current = listRes.data;
  const next = current.filter((e) => e.brief.id !== id);
  if (next.length === current.length) return ok(false);
  const writeRes = writeEvents(next);
  if (!writeRes.ok) return writeRes;
  return ok(true);
}

/**
 * Wipes all event data from the application local storage namespace.
 * @returns Result indicating success or failure.
 */
export function clearAllEvents(): Result<boolean> {
  if (typeof window === "undefined") {
    return err({ code: "UNAVAILABLE", message: "window is undefined" });
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    lastKnownStorageString = null;
    cachedEvents = EMPTY_EVENTS;
    notify();
    return ok(true);
  } catch (e) {
    return err(toError(e, "UNKNOWN", "Failed to clear all events"));
  }
}

export type EventPatch = Partial<Omit<PlannedEvent, "brief">> & { brief?: Partial<PlannedEvent["brief"]> };

/**
 * Surgically updates an existing event using a patch object or updater function.
 * @param id - The ID of the event to update.
 * @param patch - Partial fields to merge or a transformer function.
 * @returns Result containing the updated PlannedEvent.
 */
export function updateEvent(
  id: string,
  patch: EventPatch | ((prev: PlannedEvent) => PlannedEvent)
): Result<PlannedEvent> {
  const existingRes = getEvent(id);
  if (!existingRes.ok) return existingRes;
  if (!existingRes.data) return err({ code: "NOT_FOUND", message: `Event ${id} not found` });
  const prev = existingRes.data;
  const updatedCandidate: PlannedEvent =
    typeof patch === "function"
      ? patch(prev)
      : { ...prev, ...patch, brief: patch.brief ? { ...prev.brief, ...patch.brief } : prev.brief };
  return saveEvent(updatedCandidate);
}

/**
 * React hook subscribing to reactive updates of all stored celebration events.
 * @returns Array of PlannedEvent objects currently saved.
 */
export function useEvents(): PlannedEvent[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (!cacheInitialized) syncCache();
      return cachedEvents;
    },
    () => EMPTY_EVENTS
  );
}

/**
 * React hook subscribing to a single celebration event by ID.
 * @param id - The unique event ID.
 * @returns The PlannedEvent instance or null if not found.
 */
export function useEvent(id: string): PlannedEvent | null {
  const events = useEvents();
  return events.find((e) => e.brief.id === id) ?? null;
}
