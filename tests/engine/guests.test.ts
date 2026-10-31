import { describe, it, expect } from "vitest";
import {
  cateringHeadcount,
  summarizeGuests,
  getDietaryBreakdown,
  sanitizeCsvCell,
  exportGuestsToCsv,
} from "../../src/lib/engine/guests";
import { Guest } from "../../src/lib/domain/plan";

describe("cateringHeadcount", () => {
  it("returns 0 if there are no guests or no confirmed guests", () => {
    expect(cateringHeadcount([])).toBe(0);
    const declinedGuests: Guest[] = [
      { id: "1", name: "Alice", group: "Friends", rsvp: "no", plusOnes: 1 },
      { id: "2", name: "Bob", group: "Family", rsvp: "pending", plusOnes: 0 },
    ];
    expect(cateringHeadcount(declinedGuests)).toBe(0);
  });

  it("adds 10% buffer and rounds up for confirmed guests including plus-ones", () => {
    // 1 guest with 0 plus-ones = 1 confirmed => ceil(1 * 1.1) = 2
    const single: Guest[] = [
      { id: "1", name: "Alice", group: "Friends", rsvp: "yes", plusOnes: 0 },
    ];
    expect(cateringHeadcount(single)).toBe(2);

    // 10 confirmed = 10 => ceil(10 * 1.1) = 11
    const tenGuests: Guest[] = [
      { id: "1", name: "Alice", group: "Friends", rsvp: "yes", plusOnes: 4 }, // 5
      { id: "2", name: "Bob", group: "Friends", rsvp: "yes", plusOnes: 4 }, // 5
    ];
    expect(cateringHeadcount(tenGuests)).toBe(11);

    // 15 confirmed => ceil(15 * 1.1) = ceil(16.5) = 17
    const fifteenGuests: Guest[] = [
      { id: "1", name: "Alice", group: "Friends", rsvp: "yes", plusOnes: 4 }, // 5
      { id: "2", name: "Bob", group: "Friends", rsvp: "yes", plusOnes: 4 }, // 5
      { id: "3", name: "Charlie", group: "Friends", rsvp: "yes", plusOnes: 4 }, // 5
    ];
    expect(cateringHeadcount(fifteenGuests)).toBe(17);
  });
});

describe("summarizeGuests", () => {
  it("computes accurate counts for invited, confirmed, declined, and pending", () => {
    const guests: Guest[] = [
      { id: "1", name: "Alice", group: "Friends", rsvp: "yes", plusOnes: 1 }, // 2 confirmed
      { id: "2", name: "Bob", group: "Family", rsvp: "yes", plusOnes: 0 }, // 1 confirmed
      { id: "3", name: "Charlie", group: "Colleagues", rsvp: "no", plusOnes: 2 }, // 1 declined
      { id: "4", name: "Diana", group: "Neighbours", rsvp: "pending", plusOnes: 1 }, // 2 pending
    ];

    const summary = summarizeGuests(guests);
    expect(summary.totalInvited).toBe(4);
    expect(summary.confirmedHeadcount).toBe(3); // (1+1) + (1+0)
    expect(summary.declinedCount).toBe(1);
    expect(summary.pendingHeadcount).toBe(2);
    expect(summary.suggestedCatering).toBe(4); // ceil(3 * 1.1) = 4
  });
});

describe("getDietaryBreakdown", () => {
  it("tallies dietary requirements for confirmed guests only", () => {
    const guests: Guest[] = [
      { id: "1", name: "Alice", group: "Friends", rsvp: "yes", dietary: "Vegetarian", plusOnes: 1 },
      { id: "2", name: "Bob", group: "Friends", rsvp: "yes", dietary: "Vegetarian", plusOnes: 0 },
      { id: "3", name: "Charlie", group: "Friends", rsvp: "yes", dietary: "Vegan", plusOnes: 0 },
      { id: "4", name: "David", group: "Friends", rsvp: "no", dietary: "Jain", plusOnes: 0 },
      { id: "5", name: "Eve", group: "Friends", rsvp: "yes", dietary: "none", plusOnes: 0 },
    ];

    const breakdown = getDietaryBreakdown(guests);
    expect(breakdown).toEqual([
      { diet: "Vegetarian", count: 3 }, // 2 (Alice+1) + 1 (Bob)
      { diet: "Vegan", count: 1 },
    ]);
  });
});

describe("CSV Sanitization and Export", () => {
  it("sanitizes cells starting with =, +, -, @ to prevent formula injection", () => {
    expect(sanitizeCsvCell("=1+1")).toBe("'=1+1");
    expect(sanitizeCsvCell("+cmd")).toBe("'+cmd");
    expect(sanitizeCsvCell("-calc")).toBe("'-calc");
    expect(sanitizeCsvCell("@sum(A1)")).toBe("'@sum(A1)");
    expect(sanitizeCsvCell("Normal Name")).toBe("Normal Name");
  });

  it("escapes quotes and wraps in quotes when cell contains commas or quotes", () => {
    expect(sanitizeCsvCell('Doe, "Jane"')).toBe('"Doe, ""Jane"""');
    expect(sanitizeCsvCell("=SUM(1,2)")).toBe('"\'=SUM(1,2)"');
  });

  it("exports a full CSV document properly formatted", () => {
    const guests: Guest[] = [
      { id: "1", name: "=Malicious", group: "Friends", rsvp: "yes", dietary: "Vegan", plusOnes: 1 },
      { id: "2", name: "Safe, Person", group: "Family", rsvp: "no", dietary: "None", plusOnes: 0 },
    ];

    const csv = exportGuestsToCsv(guests);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe("Name,Group,RSVP,Dietary,Plus Ones");
    expect(lines[1]).toBe("'=Malicious,Friends,yes,Vegan,1");
    expect(lines[2]).toBe('"Safe, Person",Family,no,None,0');
  });
});
