import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SkipLink,
  PrimaryNav,
  EventSubNav,
  ShellHeader,
  ShellFooter,
  AnnounceProvider,
  useAnnounce,
  EventProvider,
  EventNotFound,
} from "@/components/shell";
import * as navigation from "next/navigation";
import * as eventStore from "@/lib/storage/eventStore";
import type { PlannedEvent } from "@/lib/domain";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

describe("Shared App Shell Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (navigation.usePathname as any).mockReturnValue("/");
  });

  describe("SkipLink", () => {
    it("renders with correct default label and target href", () => {
      render(<SkipLink targetId="main-content" />);
      const link = screen.getByRole("link", { name: "Skip to main content" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "#main-content");
    });
  });

  describe("PrimaryNav", () => {
    it("renders <nav aria-label='Primary'> with all 3 primary links", () => {
      (navigation.usePathname as any).mockReturnValue("/");
      render(<PrimaryNav />);

      const nav = screen.getByRole("navigation", { name: "Primary" });
      expect(nav).toBeInTheDocument();

      const homeLink = screen.getByRole("link", { name: "Home" });
      const planLink = screen.getByRole("link", { name: "Plan an event" });
      const myEventsLink = screen.getByRole("link", { name: "My events" });

      expect(homeLink).toBeInTheDocument();
      expect(planLink).toBeInTheDocument();
      expect(myEventsLink).toBeInTheDocument();
    });

    it("applies aria-current='page' to active link based on current path", () => {
      // 1. Home active
      (navigation.usePathname as any).mockReturnValue("/");
      const { rerender } = render(<PrimaryNav />);
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
      expect(screen.getByRole("link", { name: "Plan an event" })).not.toHaveAttribute("aria-current");

      // 2. Plan active
      (navigation.usePathname as any).mockReturnValue("/plan");
      rerender(<PrimaryNav />);
      expect(screen.getByRole("link", { name: "Plan an event" })).toHaveAttribute("aria-current", "page");
      expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");

      // 3. Events active
      (navigation.usePathname as any).mockReturnValue("/events");
      rerender(<PrimaryNav />);
      expect(screen.getByRole("link", { name: "My events" })).toHaveAttribute("aria-current", "page");
    });
  });

  describe("EventSubNav", () => {
    it("does not render when not on an /events/[id]/* route", () => {
      (navigation.usePathname as any).mockReturnValue("/");
      const { container } = render(<EventSubNav />);
      expect(container.firstChild).toBeNull();

      (navigation.usePathname as any).mockReturnValue("/plan");
      const { container: planContainer } = render(<EventSubNav />);
      expect(planContainer.firstChild).toBeNull();
    });

    it("renders <nav aria-label='Event sections'> with 8 links when on an event route", () => {
      (navigation.usePathname as any).mockReturnValue("/events/abc-123/budget");
      render(<EventSubNav />);

      const nav = screen.getByRole("navigation", { name: "Event sections" });
      expect(nav).toBeInTheDocument();

      const sections = ["Overview", "Budget", "Timeline", "Vendors", "Guests", "Ideas", "Assistant", "Summary"];
      for (const section of sections) {
        expect(screen.getByRole("link", { name: section })).toBeInTheDocument();
      }

      // Budget should be active
      expect(screen.getByRole("link", { name: "Budget" })).toHaveAttribute("aria-current", "page");
      expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
    });
  });

  describe("ShellHeader", () => {
    it("renders masthead title and primary navigation", () => {
      (navigation.usePathname as any).mockReturnValue("/");
      render(<ShellHeader />);

      expect(screen.getByText("Celebration Planner")).toBeInTheDocument();
      expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    });

    it("ensures exactly one <h1> on home page via Masthead title", () => {
      (navigation.usePathname as any).mockReturnValue("/");
      render(<ShellHeader />);

      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent("Celebration Planner");
    });

    it("renders Masthead title as div on subpages to allow page content to own the single <h1>", () => {
      (navigation.usePathname as any).mockReturnValue("/plan");
      render(
        <div>
          <ShellHeader />
          <main>
            <h1>Plan a New Gathering</h1>
          </main>
        </div>
      );

      const h1s = screen.getAllByRole("heading", { level: 1 });
      expect(h1s).toHaveLength(1);
      expect(h1s[0]).toHaveTextContent("Plan a New Gathering");
    });
  });

  describe("ShellFooter", () => {
    it("renders directory links and mandatory planning guidance advisory notice", () => {
      render(<ShellFooter />);

      expect(screen.getByText("Navigation")).toBeInTheDocument();
      expect(screen.getByText("Event Modules")).toBeInTheDocument();
      expect(screen.getByText("Intelligence")).toBeInTheDocument();

      expect(
        screen.getByText(
          "Planning guidance only. Confirm prices, availability and legal requirements with vendors and local authorities."
        )
      ).toBeInTheDocument();
    });
  });

  describe("AnnounceContext & Live Region", () => {
    const TestAnnounceComponent = () => {
      const { announce } = useAnnounce();
      return (
        <button onClick={() => announce("Budget saved", "polite")}>
          Save Budget
        </button>
      );
    };

    it("renders polite live region and updates with announced message", async () => {
      const user = userEvent.setup();
      render(
        <AnnounceProvider>
          <TestAnnounceComponent />
        </AnnounceProvider>
      );

      const politeRegion = screen.getByTestId("live-region-polite");
      expect(politeRegion).toHaveAttribute("aria-live", "polite");
      expect(politeRegion).toHaveTextContent("");

      const button = screen.getByRole("button", { name: "Save Budget" });
      await user.click(button);

      // Wait for announce microtask/tick
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 80));
      });

      expect(politeRegion).toHaveTextContent("Budget saved");
    });
  });

  describe("EventProvider & useEvent", () => {
    it("renders friendly not-found view with link to /plan when event does not exist", () => {
      vi.spyOn(eventStore, "useEvents").mockReturnValue([]);

      render(
        <EventProvider eventId="non-existent-id">
          <div>Protected Content</div>
        </EventProvider>
      );

      expect(screen.getByText("Celebration Plan Not Located")).toBeInTheDocument();
      const planLink = screen.getByRole("link", { name: "Plan an event" });
      expect(planLink).toHaveAttribute("href", "/plan");
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("renders children when event is found in storage", () => {
      const mockEvent: PlannedEvent = {
        brief: {
          id: "valid-evt-1",
          name: "Golden Jubilee",
          type: "birthday",
          date: "2026-11-20",
          guestCount: 80,
          totalBudget: 400000,
          currency: "INR",
          city: "Delhi",
          cityTier: "metro",
          venueType: "indoor",
          priorities: ["food"],
          dietaryNeeds: [],
          notes: "",
          createdAt: "2026-10-01T00:00:00Z",
        },
        budgetLines: [],
        tasks: [],
        vendors: [],
        guests: [],
        ideas: [],
        schemaVersion: 1,
      };

      vi.spyOn(eventStore, "useEvents").mockReturnValue([mockEvent]);

      render(
        <EventProvider eventId="valid-evt-1">
          <div>Golden Jubilee Dashboard</div>
        </EventProvider>
      );

      expect(screen.getByText("Golden Jubilee Dashboard")).toBeInTheDocument();
      expect(screen.queryByText("Celebration Plan Not Located")).not.toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("allows keyboard tabbing across skip link, primary navigation, and footer links", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <SkipLink targetId="main-content" />
          <PrimaryNav />
          <main id="main-content" tabIndex={-1}>
            <button>Main Action</button>
          </main>
          <ShellFooter />
        </div>
      );

      // Initial tab lands on skip link (first focusable element)
      await user.tab();
      expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveFocus();

      // Next tab lands on PrimaryNav "Home"
      await user.tab();
      const homeLinks = screen.getAllByRole("link", { name: "Home" });
      expect(homeLinks[0]).toHaveFocus();

      // Next tab lands on "Plan an event"
      await user.tab();
      const planLinks = screen.getAllByRole("link", { name: "Plan an event" });
      expect(planLinks[0]).toHaveFocus();

      // Next tab lands on "My events"
      await user.tab();
      const eventsLinks = screen.getAllByRole("link", { name: "My events" });
      expect(eventsLinks[0]).toHaveFocus();

      // Next tab lands on main button
      await user.tab();
      expect(screen.getByRole("button", { name: "Main Action" })).toHaveFocus();
    });
  });
});
