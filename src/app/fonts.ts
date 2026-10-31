import { Source_Serif_4, EB_Garamond } from "next/font/google";

/**
 * Newsprint Design System Fonts
 * Source Serif 4 covers weights 200-900 (regular 400, 650, and 900).
 * EB Garamond covers regular (400) and italic styles.
 */
export const newsprintDisplay = Source_Serif_4({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  fallback: ["Georgia", "serif"],
  variable: "--font-newsprint-display",
  display: "swap",
});

export const newsprintReading = EB_Garamond({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  fallback: ["Georgia", "serif"],
  variable: "--font-newsprint-reading",
  display: "swap",
});
