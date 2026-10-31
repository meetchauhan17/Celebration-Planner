import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Newsprint Design System - Tokens & Accessibility", () => {
  const tokensFilePath = path.resolve(__dirname, "../../src/styles/tokens.css");
  const tokensCss = fs.readFileSync(tokensFilePath, "utf8");

  it("defines EXACTLY all 23 specified variables in /src/styles/tokens.css on :root", () => {
    // Expected exact list of variable definitions
    const expectedTokens: Record<string, string> = {
      "--dp-color-ground": "#f3efe5",
      "--dp-color-ink": "#191916",
      "--dp-color-secondary": "#494843",
      "--dp-color-rule": "#9b978e",
      "--dp-color-accent": "#a3231d",
      "--dp-typography-display": '"Newsprint Display", Georgia, serif',
      "--dp-typography-reading": '"Newsprint Reading", Georgia, serif',
      "--dp-typography-body": "20px",
      "--dp-typography-reading-compact": "19px",
      "--dp-typography-label": "12px",
      "--dp-typography-control": "15px",
      "--dp-typography-label-weight": "650",
      "--dp-typography-display-weight": "900",
      "--dp-typography-body-leading": "1.3",
      "--dp-typography-control-leading": "1.2",
      "--dp-typography-label-tracking": "0.09em",
      "--dp-spacing-column": "24px",
      "--dp-spacing-story": "22px",
      "--dp-radius-control": "0",
      "--dp-border-hairline": "1px",
      "--dp-border-section": "4px",
      "--dp-border-focus": "2px",
      "--dp-motion-transition": "none",
    };

    // Parse variables declared on :root
    const rootBlockMatch = tokensCss.match(/:root\s*\{([^}]+)\}/);
    expect(rootBlockMatch).not.toBeNull();
    const rootContent = rootBlockMatch![1];

    const declaredTokens: Record<string, string> = {};
    const lines = rootContent
      .split(";")
      .map((l) => l.trim())
      .filter(Boolean);

    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        declaredTokens[key] = value;
      }
    }

    // Verify all expected tokens exist and match value
    for (const [key, expectedVal] of Object.entries(expectedTokens)) {
      expect(declaredTokens).toHaveProperty(key);
      // Normalize whitespace for comparisons
      const actualValNormalized = declaredTokens[key].replace(/\s+/g, " ");
      const expectedValNormalized = expectedVal.replace(/\s+/g, " ");
      expect(actualValNormalized).toBe(expectedValNormalized);
    }

    // Verify exactly these variables are declared (no extraneous tokens)
    expect(Object.keys(declaredTokens).length).toBe(Object.keys(expectedTokens).length);
  });

  it("verifies text contrast at WCAG AA or better (>4.5:1 for normal text, >7:1 for AAA)", () => {
    function luminance(r: number, g: number, b: number): number {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function hexToRgb(hex: string): [number, number, number] {
      const cleanHex = hex.replace("#", "");
      return [
        parseInt(cleanHex.substring(0, 2), 16),
        parseInt(cleanHex.substring(2, 4), 16),
        parseInt(cleanHex.substring(4, 6), 16),
      ];
    }

    function getContrast(color1: string, color2: string): number {
      const [r1, g1, b1] = hexToRgb(color1);
      const [r2, g2, b2] = hexToRgb(color2);
      const l1 = luminance(r1, g1, b1);
      const l2 = luminance(r2, g2, b2);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    const ground = "#f3efe5";
    const ink = "#191916";
    const secondary = "#494843";
    const accent = "#a3231d";

    // 1. Ink on ground (dominant text)
    const inkRatio = getContrast(ink, ground);
    expect(inkRatio).toBeGreaterThanOrEqual(7); // AAA standard (>7:1, actual ~15.34)

    // 2. Secondary on ground (crucial requirement from user prompt)
    const secondaryRatio = getContrast(secondary, ground);
    expect(secondaryRatio).toBeGreaterThanOrEqual(4.5); // Exceeds WCAG AA (actual ~7.98:1, even meets AAA!)

    // 3. Accent on ground
    const accentRatio = getContrast(accent, ground);
    expect(accentRatio).toBeGreaterThanOrEqual(4.5); // Exceeds WCAG AA (actual ~6.50:1)
  });

  it("verifies global CSS contains prefers-reduced-motion block and focus outline specs", () => {
    const globalsFilePath = path.resolve(__dirname, "../../src/styles/globals.css");
    const globalsCss = fs.readFileSync(globalsFilePath, "utf8");

    // Must have prefers-reduced-motion
    expect(globalsCss).toContain("@media (prefers-reduced-motion: reduce)");

    // Must enforce focus outlines visible on ground
    expect(globalsCss).toContain("var(--dp-border-focus)");
    expect(globalsCss).toContain("var(--dp-color-ink)");
    expect(globalsCss).toContain("outline-offset");

    // Must enforce flat and square (no border-radius, no box-shadow, no animation)
    expect(globalsCss).toContain("border-radius: var(--dp-radius-control)");
    expect(globalsCss).toContain("box-shadow: none");
  });
});

