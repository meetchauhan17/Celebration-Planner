import { Source_Serif_4, Instrument_Sans } from "next/font/google";

/**
 * Organic Design System Fonts
 * Source Serif 4 covers medium-weight statements and headings, bound to "Organic Source Serif".
 * Instrument Sans covers reading and controls, bound to "Organic Instrument Sans".
 */
export const organicDisplay = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  fallback: ["Georgia", "serif"],
  variable: "--font-organic-display",
  display: "swap",
});

export const organicReading = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  fallback: ["sans-serif"],
  variable: "--font-organic-reading",
  display: "swap",
});

// Backward-compatible font exports for legacy references
export const newsprintDisplay = organicDisplay;
export const newsprintReading = organicReading;
