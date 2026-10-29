import { describe, it, expect } from "vitest";
import { calculateTaskProgress, generateDefaultMilestones } from "@/lib/engine";

describe("Timeline Engine", () => {
  it("calculates progress percentage correctly", () => {
    const tasks = [
      { id: "1", title: "Task 1", dueDate: "2026-11-01", completed: true, phase: "initial_planning" as const },
      { id: "2", title: "Task 2", dueDate: "2026-11-05", completed: false, phase: "vendor_booking" as const },
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
    expect(milestones[0].phase).toBe("initial_planning");
  });
});
