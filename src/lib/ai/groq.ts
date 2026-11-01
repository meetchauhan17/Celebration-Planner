import "server-only";
import Groq from "groq-sdk";

export const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Validates if a usable Groq API key is present in environment variables.
 * @returns Boolean flag indicating whether the API key is configured.
 */
export function checkAiConfigured(): boolean {
  const key = process.env.GROQ_API_KEY;
  return Boolean(
    key &&
      key.trim().length > 0 &&
      key !== "your_key_here" &&
      key !== "placeholder"
  );
}

/**
 * Indicates whether AI capabilities are configured and ready.
 */
export const isAiConfigured: boolean = checkAiConfigured();

/**
 * Creates or retrieves the thin Groq SDK client instance.
 * Configured with 15-second timeout and 2 retries with exponential backoff.
 * @returns Groq SDK client instance or null if unconfigured.
 */
export function createGroqClient(): Groq | null {
  if (!checkAiConfigured()) {
    return null;
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: 15000,
    maxRetries: 2,
  });
}

/**
 * Singleton client instance for reuse across server requests.
 */
export const groq: Groq | null = createGroqClient();

