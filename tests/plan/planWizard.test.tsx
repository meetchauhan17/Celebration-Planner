import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { PlanWizard } from "@/components/plan";
import { AnnounceProvider } from "@/components/shell";
import * as eventStore from "@/lib/storage/eventStore";
import * as navigation from "next/navigation";

expect.extend(toHaveNoViolations);

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/plan",
}));

describe("PlanWizard Multi-Step Accessible Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventStore.resetCacheForTesting();
    window.sessionStorage.clear();
    mockSearchParams = new URLSearchParams();
  });

  const renderWizard = () => {
    return render(
      <AnnounceProvider>
        <PlanWizard />
      </AnnounceProvider>
    );
  };

  it("renders step 1 with indicator and pre-selects query param type if provided", () => {
    mockSearchParams = new URLSearchParams("type=community");
    renderWizard();

    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "The basics" })).toBeInTheDocument();

    const communityRadio = screen.getByRole("radio", { name: "Community" });
    expect(communityRadio).toBeChecked();
  });

  it("submits invalid data on step 1 and confirms focus shift and aria-describedby errors", async () => {
    const user = userEvent.setup();
    renderWizard();

    // Click Next with empty name and date
    const nextBtn = screen.getByRole("button", { name: "Next" });
    await user.click(nextBtn);

    // Error summary alert should appear
    const alert = screen.getByRole("alert", { name: /Please correct the following errors/i });
    expect(alert).toBeInTheDocument();
    expect(screen.getAllByText("Event name is required")).toHaveLength(2);
    expect(screen.getAllByText("Event date is required")).toHaveLength(2);

    // Focus must move to first invalid field (Name field)
    const nameInput = screen.getByLabelText(/Event Name/i);
    await waitFor(() => {
      expect(nameInput).toHaveFocus();
    });
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
  });

  it("navigates back and forth without data loss", async () => {
    const user = userEvent.setup();
    renderWizard();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().split("T")[0];

    // Fill Step 1
    await user.type(screen.getByLabelText(/Event Name/i), "Rohan 30th Gala");
    await user.type(screen.getByLabelText(/Celebration Date/i), dateStr);
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Advance to Step 2
    expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Scale and place" })).toBeInTheDocument();

    // Click Back
    await user.click(screen.getByRole("button", { name: "Back" }));

    // Should return to Step 1 with preserved values
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Name/i)).toHaveValue("Rohan 30th Gala");
    expect(screen.getByLabelText(/Celebration Date/i)).toHaveValue(dateStr);
  });

  it("displays live per-guest calculation and low-budget floor warning on step 3", async () => {
    const user = userEvent.setup();
    renderWizard();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);
    const dateStr = futureDate.toISOString().split("T")[0];

    // Step 1
    await user.type(screen.getByLabelText(/Event Name/i), "Grand Wedding");
    await user.type(screen.getByLabelText(/Celebration Date/i), dateStr);
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Step 2 (Wedding with 500 guests)
    await user.clear(screen.getByLabelText(/Target Guest Count/i));
    await user.type(screen.getByLabelText(/Target Guest Count/i), "500");
    await user.type(screen.getByLabelText(/Host City/i), "Jaipur");
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Step 3
    expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();

    // Enter very low budget: 50,000 for 500 guests = 100/guest (Floor for wedding is 600)
    const budgetInput = screen.getByLabelText(/Total Celebration Budget/i);
    await user.clear(budgetInput);
    await user.type(budgetInput, "50000");

    expect(screen.getByText(/About ₹100 per guest/i)).toBeInTheDocument();
    expect(screen.getByText(/total funds are below the typical catering floor of ₹600 for a wedding/i)).toBeInTheDocument();
  });

  it("disables unselected priorities when 3 are chosen on step 4 and updates live character counter", async () => {
    const user = userEvent.setup();
    renderWizard();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);
    const dateStr = futureDate.toISOString().split("T")[0];

    // Step 1
    await user.type(screen.getByLabelText(/Event Name/i), "Annual Gathering");
    await user.type(screen.getByLabelText(/Celebration Date/i), dateStr);
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Step 2
    await user.type(screen.getByLabelText(/Host City/i), "Delhi");
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Step 3
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Step 4
    expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();

    // Select 3 priorities
    await user.click(screen.getByLabelText("Food & Catering"));
    await user.click(screen.getByLabelText("Venue & Staging"));
    await user.click(screen.getByLabelText("Photography & Video"));

    // Check message and disabled state for remaining priorities
    expect(screen.getByText(/Maximum of 3 priorities selected\. Uncheck one to change\./i)).toBeInTheDocument();
    expect(screen.getByLabelText("Decor & Production")).toBeDisabled();
    expect(screen.getByLabelText("Live Entertainment & Audio")).toBeDisabled();

    // Notes live counter
    const notesInput = screen.getByLabelText(/Logistical Notes & Vision/i);
    await user.type(notesInput, "Need quiet seating area.");
    expect(screen.getByText("24 / 500 characters")).toBeInTheDocument();

    // Review definition list summary must be visible
    expect(screen.getByText("Review your answers")).toBeInTheDocument();
    expect(screen.getByText(/Annual Gathering/i)).toBeInTheDocument();
  });

  it("completes full wizard with valid data, persists event in storage, announces creation, and redirects", async () => {
    const user = userEvent.setup();
    renderWizard();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    const dateStr = futureDate.toISOString().split("T")[0];

    // Step 1
    await user.type(screen.getByLabelText(/Event Name/i), "Diwali Festival 2026");
    await user.type(screen.getByLabelText(/Celebration Date/i), dateStr);
    await user.click(screen.getByRole("radio", { name: "Community" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Step 2
    await user.clear(screen.getByLabelText(/Target Guest Count/i));
    await user.type(screen.getByLabelText(/Target Guest Count/i), "300");
    await user.type(screen.getByLabelText(/Host City/i), "Ahmedabad");
    await user.click(screen.getByRole("radio", { name: "Outdoor" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Step 3
    await user.clear(screen.getByLabelText(/Total Celebration Budget/i));
    await user.type(screen.getByLabelText(/Total Celebration Budget/i), "300000");
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Step 4
    await user.click(screen.getByLabelText("Food & Catering"));
    await user.click(screen.getByLabelText("Vegetarian"));
    await user.type(screen.getByLabelText(/Other Dietary Needs/i), "Nut allergy");
    await user.type(screen.getByLabelText(/Logistical Notes & Vision/i), "Outdoor stage setup required.");

    // Final Create
    const createBtn = screen.getByRole("button", { name: "Create celebration plan" });
    await user.click(createBtn);

    // Confirm plan saved in store
    const listRes = eventStore.listEvents();
    expect(listRes.ok).toBe(true);
    if (listRes.ok) {
      expect(listRes.data).toHaveLength(1);
      const saved = listRes.data[0];
      expect(saved.brief.name).toBe("Diwali Festival 2026");
      expect(saved.brief.type).toBe("community");
      expect(saved.brief.city).toBe("Ahmedabad");
      expect(saved.budgetLines.length).toBeGreaterThan(0);
      const budgetSum = saved.budgetLines.reduce((acc, l) => acc + l.plannedAmount, 0);
      expect(budgetSum).toBe(300000);
      expect(saved.tasks.length).toBeGreaterThanOrEqual(10);
      expect(saved.tasks.some((t) => t.isCritical)).toBe(true);
      expect(saved.vendors.length).toBeGreaterThanOrEqual(5);

      // Verify redirect
      expect(mockPush).toHaveBeenCalledWith(`/events/${saved.brief.id}`);
    }

    // Verify sessionStorage draft is cleared
    expect(window.sessionStorage.getItem("celebration-planner:draft:v1")).toBeNull();
  });

  it("passes jest-axe accessibility checks on form steps", async () => {
    const { container } = renderWizard();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
