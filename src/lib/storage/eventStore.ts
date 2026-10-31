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

export function listEvents(): Result<PlannedEvent[]> {
  if (typeof window === "undefined") {
    return err({ code: "UNAVAILABLE", message: "window is undefined" });
  }
  syncCache();
  return ok(cachedEvents);
}

export function getEvent(id: string): Result<PlannedEvent | null> {
  const listRes = listEvents();
  if (!listRes.ok) return listRes;
  const found = listRes.data.find((e) => e.brief.id === id) ?? null;
  return ok(found);
}

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

export function useEvent(id: string): PlannedEvent | null {
  const events = useEvents();
  return events.find((e) => e.brief.id === id) ?? null;
}
