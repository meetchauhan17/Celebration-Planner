import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import EventTimelinePage from "@/app/events/[id]/timeline/page";
import { AnnounceProvider } from "@/components/shell";
import * as eventStore from "@/lib/storage/eventStore";
import { PlannedEvent } from "@/lib/domain";

expect.extend(toHaveNoViolations);

// Fixed test dates relative to a reference day
const sampleEvent: PlannedEvent = {
  brief: {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    name: "Aanya First Birthday Celebration",
    type: "birthday",
    date: "2026-12-30",
    guestCount: 60,
    totalBudget: 350000,
    currency: "INR",
    city: "Bengaluru",
    cityTier: "metro",
    venueType: "indoor",
    priorities: ["food", "entertainment"],
    dietaryNeeds: ["vegetarian"],
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  budgetLines: [],
  tasks: [
    {
      id: "task-overdue-1",
      title: "Confirm children party entertainer",
      dueDate: "2026-02-01", // Past date -> Overdue
      category: "Entertainment",
      status: "todo",
      isCritical: true,
      atRisk: true,
      reason: "Urgent milestone",
    },
    {
      id: "task-week-1",
      title: "Order custom themed cartoon cake",
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0], // 3 days ahead -> This week
      category: "Catering",
      status: "doing",
      isCritical: false,
    },
    {
      id: "task-month-1",
      title: "Send digital RSVP invitations",
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0], // 15 days ahead -> This month
      category: "Stationery",
      status: "todo",
      isCritical: true,
    },
    {
      id: "task-later-1",
      title: "Finalize return gift hampers",
      dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0], // 45 days ahead -> Later
      category: "Favors",
      status: "todo",
      isCritical: false,
    },
    {
      id: "task-done-1",
      title: "Book indoor banquet hall",
      dueDate: "2026-03-01",
      category: "Venue",
      status: "done",
      completed: true,
      isCritical: true,
    },
  ],
  vendors: [],
  guests: [],
  ideas: [],
  schemaVersion: 1,
};

describe("Timeline Page (/events/[id]/timeline)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventStore.resetCacheForTesting();
    window.localStorage.clear();
  });

  const renderTimeline = (id: string = sampleEvent.brief.id) => {
    return render(
      <AnnounceProvider>
        <EventTimelinePage params={{ id }} />
      </AnnounceProvider>
    );
  };

  it("renders lead section with feasibility headline, explanation, and counts strip", async () => {
    eventStore.saveEvent(sampleEvent);
    renderTimeline();

    await waitFor(() => {
      // Exactly one h1 on page with Feasibility
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent(/Feasibility:/i);
    });

    const factStrip = screen.getByTestId("timeline-fact-strip");
    expect(factStrip).toBeInTheDocument();
    expect(factStrip).toHaveTextContent("1"); // Done
    expect(factStrip).toHaveTextContent("1"); // Doing
    expect(factStrip).toHaveTextContent("3"); // To Do
    expect(factStrip).toHaveTextContent("1"); // Overdue
  });

  it("groups tasks into Overdue, This week, This month, Later, and Done with date formatting", async () => {
    eventStore.saveEvent(sampleEvent);
    renderTimeline();

    await waitFor(() => {
      expect(screen.getByTestId("timeline-group-overdue")).toBeInTheDocument();
      expect(screen.getByTestId("timeline-group-this-week")).toBeInTheDocument();
      expect(screen.getByTestId("timeline-group-this-month")).toBeInTheDocument();
      expect(screen.getByTestId("timeline-group-later")).toBeInTheDocument();
      expect(screen.getByTestId("timeline-group-done")).toBeInTheDocument();
    });

    // Overdue group contains overdue task
    const overdueGroup = screen.getByTestId("timeline-group-overdue");
    expect(overdueGroup).toHaveTextContent("Confirm children party entertainer");
    expect(overdueGroup).toHaveTextContent("Critical");
    expect(overdueGroup).toHaveTextContent("At risk: Urgent milestone");

    // Unambiguous <time> element format e.g. "1 Feb 2026"
    const timeEl = overdueGroup.querySelector("time");
    expect(timeEl).toBeInTheDocument();
    expect(timeEl).toHaveAttribute("datetime", "2026-02-01");
    expect(timeEl?.textContent).toMatch(/1 Feb 2026/);

    // Done group contains completed task
    const doneGroup = screen.getByTestId("timeline-group-done");
    expect(doneGroup).toHaveTextContent("Book indoor banquet hall");
  });

  it("changes task status to Done, saves immediately to store, moves task, and retains focus", async () => {
    eventStore.saveEvent(sampleEvent);
    renderTimeline();

    await waitFor(() => {
      expect(screen.getByLabelText("Status for Order custom themed cartoon cake")).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText("Status for Order custom themed cartoon cake");
    expect(statusSelect).toHaveValue("doing");

    // Change status to done
    fireEvent.change(statusSelect, { target: { value: "done" } });

    await waitFor(() => {
      // Check stored task was updated
      const stored = eventStore.getEvent(sampleEvent.brief.id);
      expect(stored.ok).toBe(true);
      if (!stored.ok) throw new Error("Event not stored");
      const updated = stored.data?.tasks.find((t) => t.id === "task-week-1");
      expect(updated?.status).toBe("done");

      // Verify the task moved to the Done group in the DOM
      const doneGroup = screen.getByTestId("timeline-group-done");
      expect(doneGroup).toHaveTextContent("Order custom themed cartoon cake");

      // Focus is maintained on the same task control
      const refocusedControl = screen.getByLabelText("Status for Order custom themed cartoon cake");
      expect(document.activeElement).toBe(refocusedControl);
    });
  });

  it("filters tasks by category and status using native selects", async () => {
    eventStore.saveEvent(sampleEvent);
    renderTimeline();

    await waitFor(() => {
      expect(screen.getByLabelText("Filter by Category")).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText("Filter by Category");
    fireEvent.change(categorySelect, { target: { value: "Catering" } });

    await waitFor(() => {
      // Only Catering task is rendered
      expect(screen.getByText("Order custom themed cartoon cake")).toBeInTheDocument();
      expect(screen.queryByText("Confirm children party entertainer")).not.toBeInTheDocument();
    });

    // Reset filter
    fireEvent.change(categorySelect, { target: { value: "all" } });
    await waitFor(() => {
      expect(screen.getByText("Confirm children party entertainer")).toBeInTheDocument();
    });
  });

  it("adds a custom task with validation, sets isCritical=false, and allows deleting custom tasks only", async () => {
    const user = userEvent.setup();
    eventStore.saveEvent(sampleEvent);
    renderTimeline();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "+ Add custom milestone" })).toBeInTheDocument();
    });

    // Generated tasks do not have delete buttons
    expect(
      screen.queryByRole("button", { name: "Delete custom task Confirm children party entertainer" })
    ).not.toBeInTheDocument();

    // Open add task form
    await user.click(screen.getByRole("button", { name: "+ Add custom milestone" }));

    // Fill form
    await user.type(screen.getByLabelText("Milestone Title"), "Custom Handcrafted Pinata");
    await user.type(screen.getByLabelText("Target Due Date"), "2026-11-10");
    await user.type(screen.getByLabelText("Category"), "Activities");

    await user.click(screen.getByRole("button", { name: "Save Milestone" }));

    await waitFor(() => {
      expect(screen.getByText("Custom Handcrafted Pinata")).toBeInTheDocument();

      const stored = eventStore.getEvent(sampleEvent.brief.id);
      expect(stored.ok).toBe(true);
      if (!stored.ok) throw new Error("Event not stored");
      const customTask = stored.data?.tasks.find((t) => t.title === "Custom Handcrafted Pinata");
      expect(customTask).toBeDefined();
      expect(customTask?.isCritical).toBe(false);
      expect(customTask?.isCustom).toBe(true);

      // Custom task has a Delete button
      expect(
        screen.getByRole("button", { name: "Delete custom task Custom Handcrafted Pinata" })
      ).toBeInTheDocument();
    });

    // Delete custom task
    const deleteBtn = screen.getByRole("button", {
      name: "Delete custom task Custom Handcrafted Pinata",
    });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("Custom Handcrafted Pinata")).not.toBeInTheDocument();
    });
  });

  it("regenerates timeline preserving completed and custom tasks after confirmation", async () => {
    const user = userEvent.setup();
    eventStore.saveEvent(sampleEvent);
    renderTimeline();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Regenerate timeline" })).toBeInTheDocument();
    });

    const regenBtn = screen.getByRole("button", { name: "Regenerate timeline" });
    await user.click(regenBtn);

    // Warning confirmation appears
    expect(
      screen.getByText(/Warning: Regenerating the timeline recalculates milestone schedules/i)
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Confirm Regenerate" });
    await user.click(confirmBtn);

    await waitFor(() => {
      // Completed task remains present
      const doneGroup = screen.getByTestId("timeline-group-done");
      expect(doneGroup).toHaveTextContent("Book indoor banquet hall");
    });
  });

  it("passes accessibility scan with zero violations", async () => {
    eventStore.saveEvent(sampleEvent);
    const { container } = renderTimeline();

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

