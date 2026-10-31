import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Newsprint Shell Responsive CSS Rules (1280px and 700px/375px)", () => {
  const cssPath = path.resolve(__dirname, "../../src/styles/newsprint.css");
  const newsprintCss = fs.readFileSync(cssPath, "utf8");

  it("verifies event sub-navigation renders as a two-column grid under 700px with no horizontal scrolling", () => {
    // Media query at max-width 700px
    expect(newsprintCss).toMatch(/@media\s*\(\s*max-width:\s*700px\s*\)[\s\S]*?\.np-event-subnav-list/);

    // Two-column grid
    expect(newsprintCss).toContain("grid-template-columns: 1fr 1fr !important");

    // No horizontal scrolling
    expect(newsprintCss).toContain("overflow-x: visible !important");
  });

  it("verifies directory footer becomes two columns under 700px", () => {
    expect(newsprintCss).toMatch(
      /@media\s*\(\s*max-width:\s*700px\s*\)[\s\S]*?\.np-shell-footer-directory\s*\{[\s\S]*?grid-template-columns:\s*1fr\s+1fr\s*!important/
    );
  });

  it("verifies skip link is positioned offscreen and moves into focus view", () => {
    expect(newsprintCss).toContain(".np-skip-link");
    expect(newsprintCss).toContain("top: -9999px");
    expect(newsprintCss).toMatch(/\.np-skip-link:focus[\s\S]*?top:\s*16px/);
  });

  it("verifies strict document flow without sticky or fixed headers that could trap focus", () => {
    expect(newsprintCss).toContain(".np-shell-header");
    expect(newsprintCss).toContain("position: static");
    // Site-header should not have sticky
    expect(newsprintCss).not.toMatch(/\.site-header\s*\{[\s\S]*?position:\s*sticky/);
    expect(newsprintCss).not.toMatch(/\.np-shell-header\s*\{[\s\S]*?position:\s*sticky/);
  });

  it("verifies home layout responsive breakpoints at 1280px, 1100px, 700px, and 375px", () => {
    // 1280px: 3:1 lead split and 1:2 spread
    expect(newsprintCss).toMatch(/\.np-columns-lead\s*\{\s*grid-template-columns:\s*3fr\s+1fr/);
    expect(newsprintCss).toMatch(/\.np-columns-spread\s*\{\s*grid-template-columns:\s*1fr\s+2fr/);
    expect(newsprintCss).toMatch(/\.np-fact-strip\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*1fr\)/);

    // 1100px: narrows lead split to 2:1
    expect(newsprintCss).toMatch(/@media\s*\(\s*max-width:\s*1100px\s*\)[\s\S]*?grid-template-columns:\s*2fr\s+1fr/);

    // 700px and 375px: stacks columns and stacks fact strip
    expect(newsprintCss).toMatch(/@media\s*\(\s*max-width:\s*700px\s*\)[\s\S]*?grid-template-columns:\s*1fr\s*!important/);
    expect(newsprintCss).toMatch(/@media\s*\(\s*max-width:\s*700px\s*\)[\s\S]*?\.np-fact-strip\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  });

  it("verifies drop cap styles on first paragraph", () => {
    expect(newsprintCss).toContain(".np-drop-cap::first-letter");
    expect(newsprintCss).toMatch(/\.np-drop-cap::first-letter\s*\{[\s\S]*?float:\s*left/);
    expect(newsprintCss).toMatch(/\.np-drop-cap::first-letter\s*\{[\s\S]*?font-family:\s*var\(--dp-typography-display\)/);
  });
});

