import { TimelineTask, EventType } from "../domain";

export interface TimelineProgress {
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  pendingTasks: number;
}

export function calculateTaskProgress(tasks: TimelineTask[]): TimelineProgress {
  if (tasks.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      percentage: 0,
      pendingTasks: 0,
    };
  }

  const completed = tasks.filter((t) => t.completed).length;
  return {
    totalTasks: tasks.length,
    completedTasks: completed,
    percentage: Math.round((completed / tasks.length) * 100),
    pendingTasks: tasks.length - completed,
  };
}

export function sortTasksByDueDate(tasks: TimelineTask[]): TimelineTask[] {
  return [...tasks].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

export function generateDefaultMilestones(
  eventDateString: string,
  _eventType: EventType
): Omit<TimelineTask, "id">[] {
  const eventDate = new Date(eventDateString);

  const subtractDays = (days: number) => {
    const d = new Date(eventDate);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  return [
    {
      title: "Establish celebration theme & finalize guest count",
      dueDate: subtractDays(90),
      completed: false,
      phase: "initial_planning",
    },
    {
      title: "Research and book primary venue",
      dueDate: subtractDays(75),
      completed: false,
      phase: "vendor_booking",
    },
    {
      title: "Contract caterer and entertainment/music",
      dueDate: subtractDays(60),
      completed: false,
      phase: "vendor_booking",
    },
    {
      title: "Send out invitations & monitor RSVPs",
      dueDate: subtractDays(45),
      completed: false,
      phase: "invitations",
    },
    {
      title: "Confirm final headcount and dietary requests",
      dueDate: subtractDays(14),
      completed: false,
      phase: "week_of",
    },
    {
      title: "Final vendor confirmations & day-of schedule distribution",
      dueDate: subtractDays(3),
      completed: false,
      phase: "week_of",
    },
    {
      title: "Day-of celebration execution and coordination",
      dueDate: eventDate.toISOString(),
      completed: false,
      phase: "day_of",
    },
  ];
}
