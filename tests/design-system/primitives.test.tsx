import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Masthead,
  Rule,
  Columns,
  SectionLabel,
  Button,
  Field,
  Select,
  Textarea,
  Checkbox,
  Radio,
  Disclosure,
  Listing,
} from "@/components/ui";

describe("Newsprint UI Primitives", () => {
  describe("Rule", () => {
    it("renders hairline rule by default", () => {
      const { container } = render(<Rule data-testid="rule-hairline" />);
      const hr = container.querySelector("hr");
      expect(hr).toBeInTheDocument();
      expect(hr).toHaveClass("np-rule");
      expect(hr).toHaveClass("np-rule-hairline");
    });

    it("renders section rule variant", () => {
      const { container } = render(<Rule variant="section" data-testid="rule-section" />);
      const hr = container.querySelector("hr");
      expect(hr).toHaveClass("np-rule-section");
    });
  });

  describe("Masthead", () => {
    it("renders title, kicker, subtitle, and top/bottom rules", () => {
      const { container } = render(
        <Masthead
          kicker="Special Edition"
          title="The Gazette"
          subtitle="All the news printed cleanly"
        />
      );

      expect(screen.getByText("The Gazette")).toBeInTheDocument();
      expect(screen.getByText("Special Edition")).toBeInTheDocument();
      expect(screen.getByText("All the news printed cleanly")).toBeInTheDocument();

      // Should contain 2 rules (hairline top, section bottom)
      const rules = container.querySelectorAll("hr");
      expect(rules.length).toBe(2);
      expect(rules[0]).toHaveClass("np-rule-hairline");
      expect(rules[1]).toHaveClass("np-rule-section");
    });
  });

  describe("Columns", () => {
    it("renders 3:1 lead split", () => {
      const { container } = render(
        <Columns lead>
          <div>Lead Col</div>
          <div>Side Col</div>
        </Columns>
      );
      const colDiv = container.firstChild as HTMLElement;
      expect(colDiv).toHaveClass("np-columns-lead");
      expect(colDiv).toHaveAttribute("data-layout", "lead");
    });

    it("renders 1:2 spread", () => {
      const { container } = render(
        <Columns spread>
          <div>Left Col</div>
          <div>Right Col</div>
        </Columns>
      );
      const colDiv = container.firstChild as HTMLElement;
      expect(colDiv).toHaveClass("np-columns-spread");
      expect(colDiv).toHaveAttribute("data-layout", "spread");
    });

    it("renders equal columns", () => {
      const { container } = render(
        <Columns layout="equal">
          <div>Col 1</div>
          <div>Col 2</div>
        </Columns>
      );
      const colDiv = container.firstChild as HTMLElement;
      expect(colDiv).toHaveClass("np-columns-equal");
    });
  });

  describe("SectionLabel", () => {
    it("renders uppercase label with marker", () => {
      const { container } = render(<SectionLabel>Features</SectionLabel>);
      expect(screen.getByText("Features")).toBeInTheDocument();
      const marker = container.querySelector(".np-section-label-marker");
      expect(marker).toBeInTheDocument();
    });

    it("renders with custom polymorphic tag", () => {
      render(<SectionLabel as="h3">Heading 3 Label</SectionLabel>);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Heading 3 Label");
    });
  });

  describe("Button", () => {
    it("renders default button with square styling class", () => {
      render(<Button>Click Me</Button>);
      const btn = screen.getByRole("button", { name: "Click Me" });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveClass("np-button-default");
    });

    it("renders link variant", () => {
      render(<Button variant="link">Link Style</Button>);
      const btn = screen.getByRole("button", { name: "Link Style" });
      expect(btn).toHaveClass("np-button-link");
    });

    it("sets aria-pressed and active classes when selected or pressed", () => {
      const { rerender } = render(<Button pressed>Toggle</Button>);
      const btn = screen.getByRole("button", { name: "Toggle" });
      expect(btn).toHaveAttribute("aria-pressed", "true");
      expect(btn).toHaveClass("is-active");

      rerender(<Button selected>Toggle</Button>);
      expect(btn).toHaveClass("is-active");
      expect(btn).toHaveAttribute("data-selected", "true");
    });

    it("handles click events", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Action</Button>);
      await user.click(screen.getByRole("button", { name: "Action" }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Form Controls (Field, Select, Textarea, Checkbox, Radio)", () => {
    it("Field renders visible label, input and links error text via aria-describedby", () => {
      render(
        <Field
          id="custom-field"
          label="Test Field"
          error="This is an error"
          description="Helpful note"
        />
      );

      const label = screen.getByText("Test Field");
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute("for", "custom-field");

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("id", "custom-field");
      expect(input).toHaveAttribute("aria-invalid", "true");

      const describedBy = input.getAttribute("aria-describedby");
      expect(describedBy).toContain("custom-field-error");
      expect(describedBy).toContain("custom-field-desc");

      const errorEl = screen.getByRole("alert");
      expect(errorEl).toHaveTextContent("This is an error");
      expect(errorEl).toHaveAttribute("id", "custom-field-error");
    });

    it("Select renders visible label, options, and error linked via aria-describedby", () => {
      render(
        <Select
          id="custom-select"
          label="Choose Option"
          error="Selection required"
          options={[
            { value: "1", label: "Option One" },
            { value: "2", label: "Option Two" },
          ]}
        />
      );

      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("aria-invalid", "true");
      expect(select).toHaveAttribute("aria-describedby", "custom-select-error");
      expect(screen.getByRole("alert")).toHaveTextContent("Selection required");
      expect(screen.getByText("Option One")).toBeInTheDocument();
    });

    it("Textarea renders visible label and error linked via aria-describedby", () => {
      render(
        <Textarea
          id="custom-textarea"
          label="Your Comments"
          error="Comment is required"
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-invalid", "true");
      expect(textarea).toHaveAttribute("aria-describedby", "custom-textarea-error");
      expect(screen.getByRole("alert")).toHaveTextContent("Comment is required");
    });

    it("Checkbox renders square box with visible label and aria-describedby error", () => {
      render(
        <Checkbox
          id="custom-check"
          label="I Agree to Terms"
          error="Must agree"
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-invalid", "true");
      expect(checkbox).toHaveAttribute("aria-describedby", "custom-check-error");
      expect(screen.getByText("I Agree to Terms")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent("Must agree");
    });

    it("Radio renders square radio with visible label and aria-describedby error", () => {
      render(
        <Radio
          id="custom-radio"
          name="choice"
          label="Choice A"
          error="Selection mandatory"
        />
      );

      const radio = screen.getByRole("radio");
      expect(radio).toHaveAttribute("aria-describedby", "custom-radio-error");
      expect(screen.getByText("Choice A")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent("Selection mandatory");
    });
  });

  describe("Disclosure", () => {
    it("renders native details and summary with question and indicator", () => {
      const { container } = render(
        <Disclosure question="Frequently Asked Question?">
          Detailed answer content.
        </Disclosure>
      );

      const details = container.querySelector("details");
      expect(details).toBeInTheDocument();
      expect(details).toHaveClass("np-disclosure");

      const summary = container.querySelector("summary");
      expect(summary).toBeInTheDocument();
      expect(summary).toHaveTextContent("Frequently Asked Question?");

      const indicator = container.querySelector(".np-disclosure-indicator");
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute("aria-hidden", "true");
    });

    it("supports open / defaultOpen prop", () => {
      const { container } = render(
        <Disclosure defaultOpen question="Open Question?">
          Visible answer.
        </Disclosure>
      );

      const details = container.querySelector("details");
      expect(details).toHaveAttribute("open");
    });
  });

  describe("Listing", () => {
    it("renders horizontal row with separate identity, terms, details columns", () => {
      render(
        <Listing
          identity="Vendor Name Alpha"
          terms="$3,000 / Deposit Paid"
          details="Full sound stage production"
        />
      );

      expect(screen.getByText("Vendor Name Alpha")).toBeInTheDocument();
      expect(screen.getByText("$3,000 / Deposit Paid")).toBeInTheDocument();
      expect(screen.getByText("Full sound stage production")).toBeInTheDocument();
    });

    it("renders red featured label when featured prop is true", () => {
      const { container } = render(
        <Listing
          featured
          featuredLabel="Top Selection"
          identity="Featured Venue"
          terms="Premium Tier"
          details="Exclusive estate access"
        />
      );

      expect(screen.getByText("Top Selection")).toBeInTheDocument();
      const marker = container.querySelector(".np-listing-featured-marker");
      expect(marker).toBeInTheDocument();
      expect(container.querySelector(".np-listing")).toHaveClass("is-featured");
    });
  });
});

