import { PlannedEvent } from "../domain/plan";

/**
 * Escapes characters in iCalendar text values according to RFC 5545:
 * backslash, semicolon, comma, and newline (\n).
 */
export function escapeIcsText(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Folds lines at 75 octets (bytes) max per line as per RFC 5545 Section 3.1.
 * Folded lines start with a space or tab.
 */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const maxBytes = 75;

  const encoded = encoder.encode(line);
  if (encoded.length <= maxBytes) {
    return line;
  }

  // Slice at byte boundaries
  const parts: string[] = [];
  let currentBytes = 0;
  const chars = Array.from(line);
  let isFirst = true;

  let currentPart = "";
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const charBytes = encoder.encode(char).length;
    const limit = isFirst ? maxBytes : maxBytes - 1; // 1 space prefix on continuation lines

    if (currentBytes + charBytes > limit) {
      parts.push(currentPart);
      currentPart = " " + char;
      currentBytes = 1 + charBytes;
      isFirst = false;
    } else {
      currentPart += char;
      currentBytes += charBytes;
    }
  }

  if (currentPart) {
    parts.push(currentPart);
  }

  return parts.join("\r\n");
}

/**
 * Formats a Date or ISO string into iCalendar DTSTART / DTEND value format:
 * All-day: YYYYMMDD
 * Timestamp: YYYYMMDDTHHMMSSZ
 */
export function formatIcsDate(dateInput: string | Date, allDay = true): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    // Return today formatted if invalid
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    return `${y}${m}${day}`;
  }

  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  if (allDay) {
    return `${y}${m}${day}`;
  }

  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

/**
 * Generates an RFC 5545 compliant iCalendar string (.ics) for an event.
 * Includes:
 * - Event day all-day VEVENT
 * - One all-day VEVENT per timeline task with stable UID, DTSTAMP, and proper folding.
 */
export function buildIcs(event: PlannedEvent, now: Date = new Date()): string {
  const { brief, tasks = [] } = event;
  const dtstamp = formatIcsDate(now, false);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Celebration Planner//Newsprint Engine//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  // Event day entry
  const eventStart = formatIcsDate(brief.date, true);
  // All day end date in iCalendar is non-inclusive (start + 1 day)
  const eventDateObj = new Date(brief.date);
  const nextDay = new Date(eventDateObj.getTime() + 24 * 60 * 60 * 1000);
  const eventEnd = formatIcsDate(nextDay, true);

  const eventSummary = escapeIcsText(brief.name);
  const eventDesc = escapeIcsText(
    `${brief.type.toUpperCase()} celebration: ${brief.name} in ${brief.city}. Planned guest count: ${brief.guestCount}.`
  );
  const eventUid = `event-${brief.id}@celebration-planner`;

  lines.push("BEGIN:VEVENT");
  lines.push(`UID:${eventUid}`);
  lines.push(`DTSTAMP:${dtstamp}`);
  lines.push(`DTSTART;VALUE=DATE:${eventStart}`);
  lines.push(`DTEND;VALUE=DATE:${eventEnd}`);
  lines.push(`SUMMARY:${eventSummary}`);
  lines.push(`DESCRIPTION:${eventDesc}`);
  lines.push("STATUS:CONFIRMED");
  lines.push("END:VEVENT");

  // Tasks entries
  for (const task of tasks) {
    const taskStart = formatIcsDate(task.dueDate, true);
    const taskDateObj = new Date(task.dueDate);
    const taskNextDay = new Date(taskDateObj.getTime() + 24 * 60 * 60 * 1000);
    const taskEnd = formatIcsDate(taskNextDay, true);

    const taskSummary = escapeIcsText(
      `${task.isCritical ? "[CRITICAL] " : ""}${task.title}`
    );
    const taskDesc = escapeIcsText(
      `Task for ${brief.name}. Category: ${task.category}. Status: ${task.status}.${task.reason ? ` Note: ${task.reason}` : ""}`
    );
    const taskUid = `task-${task.id}-${brief.id}@celebration-planner`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${taskUid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;VALUE=DATE:${taskStart}`);
    lines.push(`DTEND;VALUE=DATE:${taskEnd}`);
    lines.push(`SUMMARY:${taskSummary}`);
    lines.push(`DESCRIPTION:${taskDesc}`);
    lines.push(task.status === "done" ? "STATUS:COMPLETED" : "STATUS:CONFIRMED");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  // Fold long lines at 75 octets and join with CRLF
  const foldedLines = lines.map((l) => foldIcsLine(l));
  return foldedLines.join("\r\n") + "\r\n";
}

