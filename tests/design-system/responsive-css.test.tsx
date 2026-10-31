import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import React from "react";
import { render, screen } from "@testing-library/react";
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
} from "../../src/components/ui";

function StyleguideFixture() {
  return (
    <div id="styleguide-root">
      <SectionLabel>Design Verification</SectionLabel>
      <Masthead
        kicker="Volume IX · No. 42"
        title="The Daily Chronicle"
        subtitle="Setting the visual foundation in ink, rules, and typography"
      />
      <Rule variant="hairline" />
      <Rule variant="section" />
      <Columns lead id="columns-lead-test">
        <div>Lead Col</div>
        <div>Side Col</div>
      </Columns>
      <Columns spread id="columns-spread-test">
        <div>Left Col</div>
        <div>Right Col</div>
      </Columns>
      <Columns layout="equal" id="columns-equal-test">
        <div>Col 1</div>
        <div>Col 2</div>
      </Columns>
      <Button>Default Button</Button>
      <Button selected>Selected State (Inverted)</Button>
      <Button variant="link">Link Style Button</Button>
      <Button disabled>Disabled Button</Button>
      <Field id="field-valid" label="Event Name" />
      <Field id="field-error" label="Event Capacity" error="Capacity must be numeric" />
      <Select id="select-valid" label="Milestone Phase" options={[{ value: "1", label: "Phase 1" }]} />
      <Select id="select-error" label="Catering Tier" error="Catering required" />
      <Textarea id="textarea-valid" label="Logistical Notes" />
      <Textarea id="textarea-error" label="Safety Briefing" error="Briefing required" />
      <Checkbox id="check-1" label="Vendor contract fully signed" />
      <Radio id="radio-1" name="mode" label="Plated Dinner Service" />
      <Disclosure question="What is the deposit requirement for reserving prime weekend venues?">
        Answer text
      </Disclosure>
      <Disclosure defaultOpen question="How are overtime and strike hours calculated?">
        Answer text
      </Disclosure>
      <Listing
        featured
        featuredLabel="Featured Vendor"
        identity="Symphonic Brass Ensemble"
        terms="$3,400"
        details="Details"
      />
      <Listing
        identity="Highland Floral Design"
        terms="$1,850"
        details="Details"
      />
    </div>
  );
}

describe("Newsprint Responsive Verification (1280px, 1100px, 700px, 375px)", () => {
  const cssPath = path.resolve(__dirname, "../../src/styles/newsprint.css");
  const newsprintCss = fs.readFileSync(cssPath, "utf8");

  it("verifies 1280px desktop grid rules: 3:1 lead split and 1:2 spread with vertical dividers", () => {
    // 3:1 Lead Split
    expect(newsprintCss).toContain(".np-columns-lead");
    expect(newsprintCss).toMatch(/\.np-columns-lead\s*\{\s*grid-template-columns:\s*3fr\s+1fr/);

    // 1:2 Spread
    expect(newsprintCss).toContain(".np-columns-spread");
    expect(newsprintCss).toMatch(/\.np-columns-spread\s*\{\s*grid-template-columns:\s*1fr\s+2fr/);

    // Vertical dividers between columns above 700px
    expect(newsprintCss).toMatch(/@media\s*\(\s*min-width:\s*701px\s*\)/);
    expect(newsprintCss).toContain("border-left: var(--dp-border-hairline) solid var(--dp-color-rule)");
    expect(newsprintCss).toContain("padding-left: var(--dp-spacing-column)");
  });

  it("verifies 1100px breakpoint: narrows lead split from 3:1 to 2:1", () => {
    // Media query narrowing lead split at max-width 1100px
    expect(newsprintCss).toMatch(/@media\s*\(\s*max-width:\s*1100px\s*\)/);
    // Narrowed lead split: 2fr 1fr
    expect(newsprintCss).toMatch(/grid-template-columns:\s*2fr\s+1fr/);
  });

  it("verifies 700px and 375px mobile breakpoint: stacks columns and replaces vertical dividers with horizontal rules", () => {
    // Media query at max-width 700px (covers 700px, 375px, etc.)
    expect(newsprintCss).toMatch(/@media\s*\(\s*max-width:\s*700px\s*\)/);

    // Stacks columns
    expect(newsprintCss).toMatch(/grid-template-columns:\s*1fr\s*!important/);

    // Replaces vertical divider with horizontal rule
    expect(newsprintCss).toContain("border-left: none !important");
    expect(newsprintCss).toContain("padding-left: 0 !important");
    expect(newsprintCss).toContain("border-top: var(--dp-border-hairline) solid var(--dp-color-rule)");
    expect(newsprintCss).toContain("padding-top: var(--dp-spacing-column)");
  });

  it("verifies fixture renders all primitives and test IDs across all states", () => {
    const { container } = render(<StyleguideFixture />);

    // Root container
    expect(container.querySelector("#styleguide-root")).toBeInTheDocument();

    // 1. Masthead
    expect(screen.getByText("The Daily Chronicle")).toBeInTheDocument();
    expect(screen.getByText("Volume IX · No. 42")).toBeInTheDocument();

    // 2. Rules
    expect(container.querySelectorAll(".np-rule-hairline").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".np-rule-section").length).toBeGreaterThan(0);

    // 3. SectionLabel
    expect(screen.getByText("Design Verification")).toBeInTheDocument();

    // 4. Columns
    expect(container.querySelector("#columns-lead-test")).toHaveClass("np-columns-lead");
    expect(container.querySelector("#columns-spread-test")).toHaveClass("np-columns-spread");
    expect(container.querySelector("#columns-equal-test")).toHaveClass("np-columns-equal");

    // 5. Buttons
    expect(screen.getByRole("button", { name: "Default Button" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Selected State (Inverted)" })).toHaveClass("is-active");
    expect(screen.getByRole("button", { name: "Link Style Button" })).toHaveClass("np-button-link");
    expect(screen.getByRole("button", { name: "Disabled Button" })).toBeDisabled();

    // 6. Form Controls
    expect(screen.getByLabelText(/Event Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Capacity/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Milestone Phase/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Catering Tier/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Logistical Notes/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Safety Briefing/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Vendor contract fully signed/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Plated Dinner Service/)).toBeInTheDocument();

    // 7. Disclosures
    expect(screen.getByText("What is the deposit requirement for reserving prime weekend venues?")).toBeInTheDocument();
    expect(screen.getByText("How are overtime and strike hours calculated?")).toBeInTheDocument();

    // 8. Listings
    expect(screen.getByText("Symphonic Brass Ensemble")).toBeInTheDocument();
    expect(screen.getByText("Highland Floral Design")).toBeInTheDocument();
    expect(screen.getByText("Featured Vendor")).toBeInTheDocument();
  });
});
