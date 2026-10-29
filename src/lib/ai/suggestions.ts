import "server-only";
import { getGroqClient } from "./client";

export interface AISuggestionParams {
  eventType: string;
  guestCount: number;
  totalBudget: number;
  themeOrVision?: string;
}

export interface AISuggestionResponse {
  themeIdeas: string[];
  budgetTips: string[];
  timelineHighlights: string[];
  vendorRecommendations: string[];
}

export async function generateEventPlanSuggestions(
  params: AISuggestionParams
): Promise<AISuggestionResponse> {
  const groq = getGroqClient();

  const prompt = `You are an expert celebration and event planning assistant. Provide actionable planning recommendations for the following celebration:
Event Type: ${params.eventType}
Guest Count: ${params.guestCount}
Budget: $${params.totalBudget}
${params.themeOrVision ? `Theme/Vision: ${params.themeOrVision}` : ""}

Respond in strict JSON with the following structure:
{
  "themeIdeas": ["string"],
  "budgetTips": ["string"],
  "timelineHighlights": ["string"],
  "vendorRecommendations": ["string"]
}`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a professional event planning engine. Always respond in valid JSON format.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(content) as AISuggestionResponse;
    return {
      themeIdeas: parsed.themeIdeas || [],
      budgetTips: parsed.budgetTips || [],
      timelineHighlights: parsed.timelineHighlights || [],
      vendorRecommendations: parsed.vendorRecommendations || [],
    };
  } catch {
    return {
      themeIdeas: [],
      budgetTips: [],
      timelineHighlights: [],
      vendorRecommendations: [],
    };
  }
}
