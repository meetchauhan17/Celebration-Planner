import { describe, it, expect } from "vitest";
import {
  generateTimeline,
  calculateTaskProgress,
  generateDefaultMilestones,
  mergeTimeline,
} from "@/lib/engine";
import { EventBrief } from "@/lib/domain";

describe("Timeline Engine - generateTimeline", () => {
  const fixedToday = new Date("2026-10-30T00:00:00.000Z");

  const createBrief = (daysFromToday: number, overrides?: Partial<EventBrief>): EventBrief => {
    const eventDate = new Date(fixedToday.getTime() + daysFromToday * 86400000);
    return {
      id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      name: "Celebration Event",
      type: "wedding",
      date: eventDate.toISOString().split("T")[0],
      guestCount: 120,
      totalBudget: 1500000,
      currency: "INR",
      city: "Udaipur",
      cityTier: "tier2",
      venueType: "indoor",
      priorities: ["venue", "food"],
      dietaryNeeds: [],
      notes: "",
      createdAt: fixedToday.toISOString(),
      ...overrides,
    };
  };

  it("ensures all generated tasks are sorted strictly by dueDate ascending", () => {
    const brief = createBrief(150);
    const { tasks } = generateTimeline(brief, fixedToday);

    expect(tasks.length).toBeGreaterThan(0);
    for (let i = 0; i < tasks.length - 1; i++) {
      const current = new Date(tasks[i].dueDate).getTime();
      const next = new Date(tasks[i + 1].dueDate).getTime();
      expect(current).toBeLessThanOrEqual(next);
    }
  });

  it("staggers overdue tasks across sequential days rather than stacking them on day one", () => {
    // 40 days away: multiple wedding tasks with leadTime 270, 240, 180, 150, 90, 75, 60 days are overdue
    const brief = createBrief(40);
    const { tasks } = generateTimeline(brief, fixedToday);

    const todayStr = fixedToday.toISOString().split("T")[0];
    const tasksOnToday = tasks.filter((t) => t.dueDate === todayStr);

    // Overdue tasks should NOT all be piled on today
    expect(tasksOnToday.length).toBeLessThanOrEqual(1);

    // Check that early tasks have distinct sequential staggered dates (today, today+1, today+2...)
    const earlyDueDates = tasks.slice(0, 4).map((t) => t.dueDate);
    const uniqueDates = new Set(earlyDueDates);
    expect(uniqueDates.size).toBeGreaterThan(1);

    // Critical overdue tasks appear first in the staggered sequence
    const firstTwoTasks = tasks.slice(0, 2);
    expect(firstTwoTasks.every((t) => t.isCritical)).toBe(true);
  });

  it("flags atRisk: true with reason for a wedding only 20 days away", () => {
    // 20 days is far below minimumLeadDays for venue (60d), photographer (45d), attire (30d), catering (30d)
    const shortNoticeBrief = createBrief(20);
    const { tasks, feasibility } = generateTimeline(shortNoticeBrief, fixedToday);

    const atRiskTasks = tasks.filter((t) => t.atRisk === true);
    expect(atRiskTasks.length).toBeGreaterThan(0);

    // Check venue task is at risk
    const venueTask = tasks.find((t) => t.title.toLowerCase().includes("venue"));
    expect(venueTask).toBeDefined();
    expect(venueTask?.atRisk).toBe(true);
    expect(venueTask?.reason).toContain("Requires at least");
    expect(venueTask?.reason).toContain("20 days remain");

    // Feasibility reflects risk
    expect(feasibility.status).toBe("very-tight");
  });

  it("adds conditional tasks only when relevant", () => {
    // 1. Outdoor venue
    const outdoorBrief = createBrief(180, { venueType: "outdoor" });
    const outdoorTimeline = generateTimeline(outdoorBrief, fixedToday);
    expect(outdoorTimeline.tasks.some((t) => t.title.toLowerCase().includes("weather backup"))).toBe(true);

    const indoorBrief = createBrief(180, { venueType: "indoor" });
    const indoorTimeline = generateTimeline(indoorBrief, fixedToday);
    expect(indoorTimeline.tasks.some((t) => t.title.toLowerCase().includes("weather backup"))).toBe(false);

    // 2. Dietary needs
    const dietaryBrief = createBrief(180, { dietaryNeeds: ["Jain", "Vegan"] });
    const dietaryTimeline = generateTimeline(dietaryBrief, fixedToday);
    const dietaryTask = dietaryTimeline.tasks.find((t) => t.title.toLowerCase().includes("dietary") || t.title.includes("Jain"));
    expect(dietaryTask).toBeDefined();
    expect(dietaryTask?.title).toContain("Jain, Vegan");

    const noDietaryBrief = createBrief(180, { dietaryNeeds: [] });
    const noDietaryTimeline = generateTimeline(noDietaryBrief, fixedToday);
    expect(noDietaryTimeline.tasks.some((t) => t.title.startsWith("Plan separate menu"))).toBe(false);

    // 3. Community event with guestCount > 200
    const crowdBrief = createBrief(60, { type: "community", guestCount: 250 });
    const crowdTimeline = generateTimeline(crowdBrief, fixedToday);
    expect(crowdTimeline.tasks.some((t) => t.title.toLowerCase().includes("crowd management"))).toBe(true);

    const smallCommunityBrief = createBrief(60, { type: "community", guestCount: 150 });
    const smallCommTimeline = generateTimeline(smallCommunityBrief, fixedToday);
    expect(smallCommTimeline.tasks.some((t) => t.title.toLowerCase().includes("crowd management"))).toBe(false);

    // 4. Large guestCount > 150 adds transport/parking
    const largeGuestBrief = createBrief(180, { guestCount: 180 });
    const largeGuestTimeline = generateTimeline(largeGuestBrief, fixedToday);
    expect(largeGuestTimeline.tasks.some((t) => t.title.toLowerCase().includes("parking") || t.title.toLowerCase().includes("transport"))).toBe(true);
  });

  it("evaluates feasibility correctly for 300 days, 60 days, and 10 days", () => {
    // 300 days: plenty of lead time, no compressed tasks
    const longNotice = createBrief(300);
    const res300 = generateTimeline(longNotice, fixedToday);
    expect(res300.feasibility.status).toBe("comfortable");
    expect(String(res300.feasibility)).toBe("comfortable");

    // 60 days: compressed long-lead tasks but not sub-minimum
    const medNotice = createBrief(60);
    const res60 = generateTimeline(medNotice, fixedToday);
    expect(res60.feasibility.status).toBe("tight");
    expect(String(res60.feasibility)).toBe("tight");

    // 10 days: severe risk for wedding tasks
    const shortNotice = createBrief(10);
    const res10 = generateTimeline(shortNotice, fixedToday);
    expect(res10.feasibility.status).toBe("very-tight");
    expect(String(res10.feasibility)).toBe("very-tight");
  });
});

describe("Timeline Engine - Backward Compatibility", () => {
  it("calculates progress percentage correctly", () => {
    const tasks = [
      { id: "1", title: "Task 1", dueDate: "2026-11-01", status: "done" as const },
      { id: "2", title: "Task 2", dueDate: "2026-11-05", status: "todo" as const },
    ];

    const progress = calculateTaskProgress(tasks);
    expect(progress.totalTasks).toBe(2);
    expect(progress.completedTasks).toBe(1);
    expect(progress.percentage).toBe(50);
    expect(progress.pendingTasks).toBe(1);
  });

  it("handles empty tasks safely", () => {
    const progress = calculateTaskProgress([]);
    expect(progress.totalTasks).toBe(0);
    expect(progress.percentage).toBe(0);
  });

  it("generates default milestones backward-scheduled from event date", () => {
    const milestones = generateDefaultMilestones("2026-12-31T00:00:00.000Z", "wedding");
    expect(milestones.length).toBeGreaterThan(0);
    expect(milestones[0].dueDate).toBeDefined();
  });
});

describe("Timeline Engine - mergeTimeline", () => {
  it("keeps completed tasks and custom tasks while replacing pending generated tasks", () => {
    const existing = [
      {
        id: "task-1",
        title: "Book venue",
        dueDate: "2026-03-01",
        category: "Venue",
        status: "done" as const,
        isCritical: true,
      },
      {
        id: "task-2",
        title: "Book photographer",
        dueDate: "2026-04-01",
        category: "Media",
        status: "todo" as const, // Pending generated task -> should be replaced
        isCritical: true,
      },
      {
        id: "custom-123",
        title: "Buy bespoke traditional turbans",
        dueDate: "2026-05-10",
        category: "Attire",
        status: "todo" as const, // Custom task -> must be kept
        isCritical: false,
        isCustom: true,
      },
    ];

    const regenerated = [
      {
        id: "gen-1",
        title: "Book venue",
        dueDate: "2026-03-05", // Duplicate of completed task -> should not re-add
        category: "Venue",
        status: "todo" as const,
        isCritical: true,
      },
      {
        id: "gen-2",
        title: "Book photographer",
        dueDate: "2026-04-15", // Updated regenerated task
        category: "Media",
        status: "todo" as const,
        isCritical: true,
      },
      {
        id: "gen-3",
        title: "Finalize catering menu",
        dueDate: "2026-05-01", // Brand new generated task
        category: "Catering",
        status: "todo" as const,
        isCritical: true,
      },
    ];

    const merged = mergeTimeline(existing, regenerated);

    // Completed task-1 is kept as done
    const venue = merged.find((t) => t.title === "Book venue");
    expect(venue).toBeDefined();
    expect(venue?.status).toBe("done");
    expect(venue?.dueDate).toBe("2026-03-01");

    // Custom task is preserved
    const custom = merged.find((t) => t.id === "custom-123");
    expect(custom).toBeDefined();
    expect(custom?.title).toBe("Buy bespoke traditional turbans");

    // Old pending task-2 was replaced by gen-2 with updated dueDate
    const photographer = merged.find((t) => t.title === "Book photographer");
    expect(photographer).toBeDefined();
    expect(photographer?.dueDate).toBe("2026-04-15");

    // New generated task is included
    expect(merged.some((t) => t.title === "Finalize catering menu")).toBe(true);

    // No duplicate Book venue
    expect(merged.filter((t) => t.title === "Book venue").length).toBe(1);

    // Sorted by dueDate ascending
    for (let i = 0; i < merged.length - 1; i++) {
      expect(merged[i].dueDate <= merged[i + 1].dueDate).toBe(true);
    }
  });
});
