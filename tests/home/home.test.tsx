import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import { ShellHeader } from "@/components/shell";

// Mock next/navigation
import * as navigation from "next/navigation";
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

describe("Home Page (Newsprint Layout)", () => {
  it("renders lead spread with headline, reading summary, and Start Here box", () => {
    render(<Home />);

    // Large heavy headline
    const headline = screen.getByRole("heading", {
      level: 2,
      name: "Plan the whole celebration, not just the guest list.",
    });
    expect(headline).toBeInTheDocument();
    expect(headline).toHaveClass("np-lead-headline");

    // Reading font summary
    expect(
      screen.getByText(/Celebration Planner coordinates your budget allocations/i)
    ).toBeInTheDocument();

    // Boxed-by-rules "Start here" block
    expect(screen.getByText("Start Here")).toBeInTheDocument();
    const planButtons = screen.getAllByRole("button", { name: "Plan an event" });
    expect(planButtons.length).toBeGreaterThan(0);

    const savedEventsLinks = screen.getAllByRole("link", { name: "View saved events" });
    expect(savedEventsLinks.length).toBeGreaterThan(0);
    expect(savedEventsLinks[0]).toHaveAttribute("href", "/events");
  });

  it("renders compact factual strip as a ruled row with true app facts", () => {
    const { container } = render(<Home />);

    const factStrip = container.querySelector(".np-fact-strip");
    expect(factStrip).toBeInTheDocument();

    expect(screen.getByText(/3 event types:/i)).toBeInTheDocument();
    expect(screen.getByText(/Budget, timeline and vendors generated/i)).toBeInTheDocument();
    expect(screen.getByText(/Works in your browser; data stays on your device/i)).toBeInTheDocument();
  });

  it("renders main spread with event types and 4-step editorial methodology with drop cap", () => {
    const { container } = render(<Home />);

    // 3 Event Types with links to /plan?type=...
    expect(screen.getByRole("heading", { level: 3, name: "Wedding" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Plan a wedding →" })).toHaveAttribute(
      "href",
      "/plan?type=wedding"
    );

    expect(screen.getByRole("heading", { level: 3, name: "Birthday" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Plan a birthday →" })).toHaveAttribute(
      "href",
      "/plan?type=birthday"
    );

    expect(screen.getByRole("heading", { level: 3, name: "Community" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Plan a community event →" })).toHaveAttribute(
      "href",
      "/plan?type=community"
    );

    // Drop cap paragraph
    const dropCapPara = container.querySelector(".np-drop-cap");
    expect(dropCapPara).toBeInTheDocument();

    // 4 Numbered Steps
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Tell us about the event" })).toBeInTheDocument();

    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Get a budget" })).toBeInTheDocument();

    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Follow a dated timeline" })).toBeInTheDocument();

    expect(screen.getByText("04")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Ask the assistant" })).toBeInTheDocument();
  });

  it("renders native Disclosure FAQ questions and closing invitation block", () => {
    render(<Home />);

    // 5 Disclosures
    expect(screen.getByText("Is my data stored online?")).toBeInTheDocument();
    expect(screen.getByText("How are budgets calculated?")).toBeInTheDocument();
    expect(screen.getByText("Can I change the suggested budget?")).toBeInTheDocument();
    expect(screen.getByText("What does the AI do?")).toBeInTheDocument();
    expect(screen.getByText("Is this professional advice?")).toBeInTheDocument();

    // Closing invitation
    expect(screen.getByRole("heading", { level: 3, name: "Ready to begin?" })).toBeInTheDocument();
  });

  it("verifies strictly valid heading hierarchy (h1 -> h2 -> h3) without level skips", () => {
    render(
      <div>
        <ShellHeader />
        <Home />
      </div>
    );

    // Exactly one h1 for the entire page
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Celebration Planner");

    // All section headlines are h2
    const h2s = screen.getAllByRole("heading", { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);
    expect(h2s.map((h) => h.textContent)).toEqual(
      expect.arrayContaining([
        "Plan the whole celebration, not just the guest list.",
        "How celebration planning works",
        "Frequently Asked Questions",
      ])
    );

    // Sub-items are h3
    const h3s = screen.getAllByRole("heading", { level: 3 });
    expect(h3s.length).toBeGreaterThanOrEqual(8);
  });

  it("verifies sequential tab order through home page interactive elements", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Tab 1: Primary action button in Start Here box
    await user.tab();
    const firstPlanBtn = screen.getAllByRole("button", { name: "Plan an event" })[0];
    expect(firstPlanBtn).toHaveFocus();

    // Tab 2: View saved events link
    await user.tab();
    const firstSavedEventsLink = screen.getAllByRole("link", { name: "View saved events" })[0];
    expect(firstSavedEventsLink).toHaveFocus();

    // Tab 3: Plan wedding link
    await user.tab();
    expect(screen.getByRole("link", { name: "Plan a wedding →" })).toHaveFocus();

    // Tab 4: Plan birthday link
    await user.tab();
    expect(screen.getByRole("link", { name: "Plan a birthday →" })).toHaveFocus();

    // Tab 5: Plan community link
    await user.tab();
    expect(screen.getByRole("link", { name: "Plan a community event →" })).toHaveFocus();
  });
});
