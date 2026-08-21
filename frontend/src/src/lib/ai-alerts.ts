import { GoogleGenAI, Type } from "@google/genai";

export interface AlertClassification {
  isAlertWorthy: boolean;
  category: "fish_kill" | "chemical_dump" | "oil_sighting" | "algae_bloom" | "sewage" | "other" | "none";
  severity: "low" | "medium" | "high" | "critical";
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
    severity: {
      type: Type.STRING,
      enum: ["low", "medium", "high", "critical"],
    },
    keyPhrases: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    reasoning: { type: Type.STRING },
  },
  required: ["isAlertWorthy", "category", "severity", "keyPhrases", "reasoning"],
};

const SYSTEM_PROMPT = `You are a water-quality incident triage assistant for Lake Victoria community reports.
Classify the report for urgency. Flag as alert-worthy if it describes: dead/dying fish in numbers,
visible chemical discharge, oil sheen, unusual algae bloom, sewage discharge, or strong chemical odor.
Do NOT flag routine complaints, general questions, or vague statements with no observable incident.
Extract the specific phrases from the text that drove your decision.`;

export async function classifyReport(reportText: string): Promise<AlertClassification> {
  const apiKey = process.env["GEMINI_API_KEY"];

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set, using keyword fallback");
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
      console.error("Gemini returned empty response, falling back to keyword match");
      return keywordFallback(reportText);
    }

    const parsed = JSON.parse(rawText) as Omit<AlertClassification, "source">;
    return { ...parsed, source: "gemini" };
  } catch (err) {
    console.error("Gemini classification failed, falling back to keyword match:", err);
    return keywordFallback(reportText);
  }
}

const URGENT_KEYWORDS = ["dead fish", "fish dying", "oil", "chemical", "sewage", "smell", "foam", "discolor"];

function keywordFallback(text: string): AlertClassification {
  const lower = text.toLowerCase();
  const hits = URGENT_KEYWORDS.filter((kw) => lower.includes(kw));
  return {
    isAlertWorthy: hits.length > 0,
    category: "other",
    severity: hits.length > 1 ? "high" : hits.length === 1 ? "medium" : "low",
    keyPhrases: hits,
    reasoning: "Keyword fallback (AI unavailable)",
    source: "keyword_fallback",
  };
}