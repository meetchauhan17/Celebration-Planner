import { describe, it, expect } from "vitest";
import {
  escapeIcsText,
  foldIcsLine,
  formatIcsDate,
  buildIcs,
} from "../../src/lib/engine/ics";
import { PlannedEvent } from "../../src/lib/domain";

describe("ICS Builder", () => {
  describe("escapeIcsText", () => {
    it("escapes semicolons, commas, backslashes and newlines", () => {
      const raw = "Dinner, dancing; fun & games \\ outdoor\nNext line";
      const escaped = escapeIcsText(raw);
      expect(escaped).toBe(
        "Dinner\\, dancing\\; fun & games \\\\ outdoor\\nNext line"
      );
    });

    it("handles empty or falsy strings", () => {
      expect(escapeIcsText("")).toBe("");
    });
  });

  describe("foldIcsLine", () => {
    it("leaves lines shorter than 75 octets untouched", () => {
      const shortLine = "SUMMARY:Short wedding task title";
      expect(foldIcsLine(shortLine)).toBe(shortLine);
    });

    it("folds long lines at 75 octets with space continuation", () => {
      const longText =
        "DESCRIPTION:This is an extremely long description that describes everything about the wedding setup, catering, musical arrangements, decor, and transportation in vivid detail.";
      const folded = foldIcsLine(longText);

      const segments = folded.split("\r\n");
      expect(segments.length).toBeGreaterThan(1);

      // Verify each continuation line starts with a whitespace
      for (let i = 1; i < segments.length; i++) {
        expect(segments[i].startsWith(" ")).toBe(true);
      }

      // Verify all segments do not exceed 75 octets in UTF-8
      const encoder = new TextEncoder();
      for (const seg of segments) {
        expect(encoder.encode(seg).length).toBeLessThanOrEqual(75);
      }
    });
  });

  describe("formatIcsDate", () => {
    it("formats all-day dates as YYYYMMDD", () => {
      const formatted = formatIcsDate("2026-12-15", true);
      expect(formatted).toBe("20261215");
    });

    it("formats datetime stamps as YYYYMMDDTHHMMSSZ", () => {
      const d = new Date(Date.UTC(2026, 11, 15, 14, 30, 0));
      const formatted = formatIcsDate(d, false);
      expect(formatted).toBe("20261215T143000Z");
    });
  });

  describe("buildIcs", () => {
    const mockEvent: PlannedEvent = {
      brief: {
        id: "b45a6c38-04fe-48aa-b541-e945c50eb81a",
        name: "Mira & Kabir's Wedding Celebration",
        type: "wedding",
        date: "2026-12-25",
        guestCount: 200,
        totalBudget: 2500000,
        currency: "INR",
        city: "Udaipur",
        cityTier: "tier2",
        venueType: "hybrid",
        priorities: ["venue", "food"],
        dietaryNeeds: ["Vegetarian"],
      },
      budgetLines: [],
      tasks: [
        {
          id: "task-1",
          title: "Book lakeside palace venue, secure deposit",
          dueDate: "2026-06-15",
          isCritical: true,
          status: "todo",
          category: "venue",
        },
        {
          id: "task-2",
          title: "Finalize catering menu",
          dueDate: "2026-11-10",
          isCritical: false,
          status: "done",
          category: "catering",
        },
      ],
      vendors: [],
      guests: [],
      ideas: [],
      schemaVersion: 1,
    };

    it("generates a valid RFC 5545 calendar with CRLF endings, event day, and tasks", () => {
      const fixedNow = new Date(Date.UTC(2026, 9, 31, 10, 0, 0));
      const ics = buildIcs(mockEvent, fixedNow);

      expect(ics).toContain("BEGIN:VCALENDAR\r\n");
      expect(ics).toContain("VERSION:2.0\r\n");
      expect(ics).toContain("END:VCALENDAR\r\n");

      // Verify CRLF line endings throughout
      expect(ics.includes("\n")).toBe(true);
      const linesWithoutCr = ics.split("\r\n").filter((l) => l.includes("\r"));
      expect(linesWithoutCr.length).toBe(0);

      // Verify event day VEVENT
      expect(ics).toContain("UID:event-b45a6c38-04fe-48aa-b541-e945c50eb81a@celebration-planner\r\n");
      expect(ics).toContain("DTSTART;VALUE=DATE:20261225\r\n");
      expect(ics).toContain("DTEND;VALUE=DATE:20261226\r\n");
      expect(ics).toContain("SUMMARY:Mira & Kabir's Wedding Celebration\r\n");

      // Verify task VEVENTs with escaping and critical tag
      expect(ics).toContain("SUMMARY:[CRITICAL] Book lakeside palace venue\\, secure deposit\r\n");
      expect(ics).toContain("STATUS:COMPLETED\r\n"); // task-2 is done
    });
  });
});

