import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  STORAGE_KEY,
  QUARANTINE_PREFIX,
  listEvents,
  getEvent,
  saveEvent,
  deleteEvent,
  updateEvent,
  subscribe,
  useEvents,
  useEvent,
  resetCacheForTesting,
} from "@/lib/storage/eventStore";
import { PlannedEvent } from "@/lib/domain";

describe("Event Store - CRUD Operations", () => {
  const sampleEvent: PlannedEvent = {
    brief: {
      id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      name: "Grand Diwali Gala",
      type: "community",
      date: "2026-11-20",
      guestCount: 200,
      totalBudget: 800000,
      currency: "INR",
      city: "Bengaluru",
      cityTier: "metro",
      venueType: "indoor",
      priorities: ["food", "entertainment"],
      dietaryNeeds: ["vegetarian", "jain"],
      notes: "Stage lighting check required at 4 PM.",
      createdAt: new Date().toISOString(),
    },
    budgetLines: [
      { category: "Venue", plannedAmount: 300000, actualAmount: 290000, note: "Paid deposit" },
    ],
    tasks: [
      { id: "task-1", title: "Sound Check", dueDate: "2026-11-19", category: "Audio", status: "todo", isCritical: true },
    ],
    vendors: [
      { id: "ven-1", category: "Catering", label: "South Feast Caterers", status: "booked", quoteAmount: 250000 },
    ],
    guests: [
      { id: "gst-1", name: "Ananya Roy", group: "VIP", rsvp: "yes", plusOnes: 1 },
    ],
    ideas: [
      { id: "idea-1", title: "Diya Lighting Entry", description: "Clay diyas along entrance", tag: "decor", saved: true },
    ],
    schemaVersion: 1,
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("lists empty array when storage is empty", () => {
    const result = listEvents();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual([]);
    }
  });

  it("saves a valid PlannedEvent and retrieves it with getEvent", () => {
    const saveRes = saveEvent(sampleEvent);
    expect(saveRes.ok).toBe(true);
    if (saveRes.ok) {
      expect(saveRes.data.brief.id).toBe(sampleEvent.brief.id);
    }

    const getRes = getEvent(sampleEvent.brief.id);
    expect(getRes.ok).toBe(true);
    if (getRes.ok) {
      expect(getRes.data).not.toBeNull();
      expect(getRes.data?.brief.name).toBe("Grand Diwali Gala");
      expect(getRes.data?.budgetLines.length).toBe(1);
    }
  });

  it("returns ok(null) when querying non-existent event ID", () => {
    const res = getEvent("00000000-0000-0000-0000-000000000000");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data).toBeNull();
    }
  });

  it("updates an existing event with a partial patch", () => {
    saveEvent(sampleEvent);

    const updateRes = updateEvent(sampleEvent.brief.id, {
      brief: { name: "Updated Diwali Celebration" },
      budgetLines: [
        { category: "Venue", plannedAmount: 320000, actualAmount: 310000 },
        { category: "Sweets", plannedAmount: 50000 },
      ],
    });

    expect(updateRes.ok).toBe(true);
    if (updateRes.ok) {
      expect(updateRes.data.brief.name).toBe("Updated Diwali Celebration");
      expect(updateRes.data.budgetLines.length).toBe(2);
    }

    // Verify persisted
    const loaded = getEvent(sampleEvent.brief.id);
    if (loaded.ok && loaded.data) {
      expect(loaded.data.brief.name).toBe("Updated Diwali Celebration");
    }
  });

  it("returns NOT_FOUND when updating an event that does not exist", () => {
    const res = updateEvent("00000000-0000-0000-0000-000000000000", {
      brief: { name: "New Name" },
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("NOT_FOUND");
    }
  });

  it("deletes an event by ID", () => {
    saveEvent(sampleEvent);
    const delRes = deleteEvent(sampleEvent.brief.id);
    expect(delRes.ok).toBe(true);
    if (delRes.ok) {
      expect(delRes.data).toBe(true);
    }

    const getRes = getEvent(sampleEvent.brief.id);
    if (getRes.ok) {
      expect(getRes.data).toBeNull();
    }

    // Deleting again returns ok(false) because it's already gone
    const delAgain = deleteEvent(sampleEvent.brief.id);
    expect(delAgain.ok).toBe(true);
    if (delAgain.ok) {
      expect(delAgain.data).toBe(false);
    }
  });
});

describe("Event Store - Quarantine on Corrupted or Incompatible Data", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("recovers from corrupted JSON by quarantining it under a backup key and starting clean", () => {
    const corruptJsonString = "{invalid-json-string-not-closed";
    window.localStorage.setItem(STORAGE_KEY, corruptJsonString);

    // Reading should NOT throw
    const result = listEvents();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual([]);
    }

    // Check that primary key was cleaned and a quarantine key exists
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    let foundQuarantineKey: string | null = null;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(QUARANTINE_PREFIX)) {
        foundQuarantineKey = key;
        break;
      }
    }

    expect(foundQuarantineKey).not.toBeNull();
    expect(window.localStorage.getItem(foundQuarantineKey!)).toBe(corruptJsonString);
  });

  it("recovers from schema-incompatible data by quarantining and starting clean", () => {
    const incompatibleData = JSON.stringify([
      { invalidProperty: "unknown", missingBrief: true },
    ]);
    window.localStorage.setItem(STORAGE_KEY, incompatibleData);

    // Should quarantine and return clean empty list
    const result = listEvents();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual([]);
    }

    // Check quarantine key exists
    let foundQuarantineKey: string | null = null;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(QUARANTINE_PREFIX)) {
        foundQuarantineKey = key;
        break;
      }
    }

    expect(foundQuarantineKey).not.toBeNull();
    expect(window.localStorage.getItem(foundQuarantineKey!)).toBe(incompatibleData);
  });
});

describe("Event Store - Quota and Storage Error Handling", () => {
  const testEvent: PlannedEvent = {
    brief: {
      id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
      name: "Birthday Party",
      type: "birthday",
      date: "2026-11-25",
      guestCount: 50,
      totalBudget: 100000,
      currency: "INR",
      city: "Delhi",
      cityTier: "metro",
      venueType: "indoor",
      priorities: ["food"],
      dietaryNeeds: [],
      notes: "",
      createdAt: new Date().toISOString(),
    },
    budgetLines: [],
    tasks: [],
    vendors: [],
    guests: [],
    ideas: [],
    schemaVersion: 1,
  };

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("handles localStorage quota exceeded without throwing", () => {
    // Mock setItem to simulate browser QuotaExceededError
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      const error = new DOMException("The quota has been exceeded.", "QuotaExceededError");
      throw error;
    });

    const result = saveEvent(testEvent);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("QUOTA_EXCEEDED");
      expect(result.error.message).toContain("quota");
    }
  });

  it("handles private browsing security restrictions without throwing", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      const error = new DOMException("Access is denied", "SecurityError");
      throw error;
    });

    const result = saveEvent(testEvent);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("UNAVAILABLE");
    }
  });
});

describe("Event Store - React Hooks & Subscription", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    resetCacheForTesting();
  });

  const eventA: PlannedEvent = {
    brief: {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Event Alpha",
      type: "wedding",
      date: "2026-12-01",
      guestCount: 100,
      totalBudget: 500000,
      currency: "INR",
      city: "Jaipur",
      cityTier: "tier2",
      venueType: "hybrid",
      priorities: ["venue"],
      dietaryNeeds: [],
      notes: "",
      createdAt: new Date().toISOString(),
    },
    budgetLines: [],
    tasks: [],
    vendors: [],
    guests: [],
    ideas: [],
    schemaVersion: 1,
  };

  it("notifies subscribers when data changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    saveEvent(eventA);
    expect(listener).toHaveBeenCalledTimes(1);

    deleteEvent(eventA.brief.id);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    saveEvent(eventA);
    expect(listener).toHaveBeenCalledTimes(2); // no further calls
  });

  it("useEvents and useEvent re-renders with fresh data when store updates", () => {
    const { result: eventsResult } = renderHook(() => useEvents());
    const { result: singleEventResult } = renderHook(() => useEvent(eventA.brief.id));

    expect(eventsResult.current).toEqual([]);
    expect(singleEventResult.current).toBeNull();

    act(() => {
      saveEvent(eventA);
    });

    expect(eventsResult.current.length).toBe(1);
    expect(eventsResult.current[0].brief.name).toBe("Event Alpha");
    expect(singleEventResult.current).not.toBeNull();
    expect(singleEventResult.current?.brief.name).toBe("Event Alpha");

    act(() => {
      deleteEvent(eventA.brief.id);
    });

    expect(eventsResult.current.length).toBe(0);
    expect(singleEventResult.current).toBeNull();
  });
});
