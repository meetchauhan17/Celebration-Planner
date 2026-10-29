import { describe, it, expect, beforeEach } from "vitest";
import {
  saveEventToStorage,
  loadEventFromStorage,
  deleteEventFromStorage,
  getRecentEventIds,
  isLocalStorageAvailable,
} from "@/lib/storage";
import { CelebrationEvent } from "@/lib/domain";

describe("Storage Layer", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("checks local storage availability in jsdom", () => {
    expect(isLocalStorageAvailable()).toBe(true);
  });

  it("saves and loads an event correctly", () => {
    const event: CelebrationEvent = {
      id: "987e6543-e21b-12d3-a456-426614174000",
      title: "Birthday Bash",
      eventType: "birthday",
      date: "2026-11-20T19:00:00.000Z",
      guestCount: 30,
      totalBudget: 2500,
      budgetItems: [],
      timeline: [],
      vendors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = saveEventToStorage(event);
    expect(saved).toBe(true);

    const loaded = loadEventFromStorage(event.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.title).toBe("Birthday Bash");
    expect(getRecentEventIds()).toContain(event.id);

    const deleted = deleteEventFromStorage(event.id);
    expect(deleted).toBe(true);
    expect(loadEventFromStorage(event.id)).toBeNull();
  });
});
