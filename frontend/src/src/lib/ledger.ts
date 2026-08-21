import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI, Type } from "@google/genai";

export type AlertCategory =
  | "fish_kill"
  | "chemical_dump"
  | "oil_sighting"
  | "algae_bloom"
  | "sewage"
  | "other"
  | "none";

export interface AlertClassification {
  isAlertWorthy: boolean;
  category: AlertCategory;
  aiSeverity: "low" | "moderate" | "high" | "critical";
  keyPhrases: string[];
  reasoning: string;
  source: "gemini" | "keyword_fallback";
}

const alertSchema = {
  type: Type.OBJECT,
  properties: {
    isAlertWorthy: { type: Type.BOOLEAN },
    category: {
      type: Type.STRING,
      enum: ["fish_kill", "chemical_dump", "oil_sighting", "algae_bloom", "sewage", "other", "none"],
    },
    aiSeverity: {
      type: Type.STRING,
      enum: ["low", "moderate", "high", "critical"],
    },
    keyPhrases: { type: Type.ARRAY, items: { type: Type.STRING } },
    reasoning: { type: Type.STRING },
  },
  required: ["isAlertWorthy", "category", "aiSeverity", "keyPhrases", "reasoning"],
};

const SYSTEM_PROMPT = `You are a water-quality incident triage assistant for Lake Victoria community reports (fishers, beach management units).
Flag as alert-worthy if the report describes: dead/dying fish in numbers, visible chemical discharge, oil sheen,
unusual algae bloom, sewage discharge, fish surfacing/gasping (low oxygen sign), or strong chemical/rotten odor.
Do NOT flag normal/calm condition reports. Extract the exact phrases from the text that drove your decision.
Set aiSeverity based on scale and immediacy described, not just presence of a keyword.`;

const URGENT_KEYWORDS = [
  "dead fish", "fish dying", "fish dead", "mortality", "oil", "chemical",
  "sewage", "rotten", "smell", "foam", "gasping", "surfacing", "brown water",
];

function keywordFallback(text: string): AlertClassification {
  const lower = text.toLowerCase();
  const hits = URGENT_KEYWORDS.filter((kw) => lower.includes(kw));
  return {
    isAlertWorthy: hits.length > 0,
    category: "other",
    aiSeverity: hits.length > 1 ? "high" : hits.length === 1 ? "moderate" : "low",
    keyPhrases: hits,
    reasoning: "Keyword fallback used (Gemini unavailable or unset API key)",
    source: "keyword_fallback",
  };
}

export const classifyReport = createServerFn({ method: "POST" })
  .validator((text: string) => text)
  .handler(async ({ data: reportText }): Promise<AlertClassification> => {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) {
      console.warn("[ai-alerts] GEMINI_API_KEY not set, using keyword fallback");
      return keywordFallback(reportText);
    }

    try {
      const client = new GoogleGenAI({ apiKey });
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Report text: "${reportText}"`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: alertSchema,
          temperature: 0.1,
        },
      });

      const rawText = response.text;
      if (!rawText) {
        console.error("[ai-alerts] Gemini returned empty response, falling back");
        return keywordFallback(reportText);
      }

      const parsed = JSON.parse(rawText) as Omit<AlertClassification, "source">;
      return { ...parsed, source: "gemini" };
    } catch (err) {
      console.error("[ai-alerts] Gemini call failed:", err);
      return keywordFallback(reportText);
    }
  });