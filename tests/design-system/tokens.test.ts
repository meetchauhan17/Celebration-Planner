import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Organic Design System - Tokens & Accessibility", () => {
  const tokensFilePath = path.resolve(__dirname, "../../src/styles/tokens.css");
  const tokensCss = fs.readFileSync(tokensFilePath, "utf8");

  it("defines EXACTLY all 21 specified variables in /src/styles/tokens.css on :root", () => {
    // Expected exact list of authoritative variable definitions for Organic Design System
    const expectedTokens: Record<string, string> = {
      "--dp-color-ground": "#eee6d6",
      "--dp-color-surface": "#f5eddf",
      "--dp-color-ink": "#29251d",
      "--dp-color-primary": "#35422d",
      "--dp-color-field": "#694737",
      "--dp-color-art-accent": "#ad7d62",
      "--dp-color-surface-muted": "#ddd5c3",
      "--dp-color-highlight": "#b9b28b",
      "--dp-color-ink-muted": "#443b2f",
      "--dp-typography-display": '"Organic Source Serif", Georgia, serif',
      "--dp-typography-reading": '"Organic Instrument Sans", sans-serif',
      "--dp-typography-body": "16px",
      "--dp-typography-reading-small": "15px",
      "--dp-typography-control": "14px",
      "--dp-typography-caption": "13px",
      "--dp-typography-metadata": "12px",
      "--dp-typography-reading-leading": "1.8",
      "--dp-spacing-content-gap": "24px",
      "--dp-radius-control": "27px 19px 29px 16px / 22px 26px 19px 29px",
      "--dp-border-hairline": "1px",
      "--dp-motion-interaction": "240ms ease",
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

    const ground = "#eee6d6";
    const surface = "#f5eddf";
    const ink = "#29251d";
    const inkMuted = "#443b2f";
    const primary = "#35422d";
    const field = "#694737";

    // 1. Ink on ground (dominant text)
    const inkRatio = getContrast(ink, ground);
    expect(inkRatio).toBeGreaterThanOrEqual(7); // AAA standard (>7:1, actual ~12.29)

    // 2. Ink on surface (paper cards)
    const surfaceInkRatio = getContrast(ink, surface);
    expect(surfaceInkRatio).toBeGreaterThanOrEqual(7); // AAA standard (>7:1, actual ~13.12)

    // 3. Ink-muted on ground
    const inkMutedRatio = getContrast(inkMuted, ground);
    expect(inkMutedRatio).toBeGreaterThanOrEqual(4.5); // Exceeds WCAG AA (actual ~8.85:1)

    // 4. Primary on ground (moss badges/headings)
    const primaryRatio = getContrast(primary, ground);
    expect(primaryRatio).toBeGreaterThanOrEqual(4.5); // Exceeds WCAG AA (actual ~8.60:1)

    // 5. Light text on darker fields: surface paper on moss
    const mossTextRatio = getContrast(surface, primary);
    expect(mossTextRatio).toBeGreaterThanOrEqual(7); // AAA standard (actual ~9.18:1)

    // 6. Light text on darker fields: surface paper on fired clay
    const clayTextRatio = getContrast(surface, field);
    expect(clayTextRatio).toBeGreaterThanOrEqual(4.5); // Exceeds WCAG AA (actual ~7.06:1)
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

    // Must enforce organic radius token and calm flat styling
    expect(globalsCss).toContain("border-radius: var(--dp-radius-control)");
    expect(globalsCss).toContain("box-shadow: none");
  });
});
