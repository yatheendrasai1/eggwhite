import { connectDB } from "@/lib/db";
import { AppSettingModel } from "@/lib/models/AppSetting";

/** Grading models an admin can pick between from the dashboard. */
export const GEMINI_MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.1-pro"] as const;
export type GeminiModel = (typeof GEMINI_MODELS)[number];

const DEFAULT_GEMINI_MODEL: GeminiModel = "gemini-3.8-flash";
const GEMINI_MODEL_SETTING_KEY = "geminiModel";

function isGeminiModel(v: unknown): v is GeminiModel {
  return (GEMINI_MODELS as readonly string[]).includes(v as string);
}

/** The Gemini model grading calls currently use — admin-configurable, see setGeminiModel. */
export async function getGeminiModel(): Promise<GeminiModel> {
  await connectDB();
  const doc = await AppSettingModel.findOne({ key: GEMINI_MODEL_SETTING_KEY }).lean();
  return isGeminiModel(doc?.value) ? doc.value : DEFAULT_GEMINI_MODEL;
}

export async function setGeminiModel(modelName: GeminiModel): Promise<void> {
  await connectDB();
  await AppSettingModel.findOneAndUpdate(
    { key: GEMINI_MODEL_SETTING_KEY },
    { $set: { value: modelName } },
    { upsert: true }
  );
}

/**
 * Calls Gemini with a single user-turn prompt and returns the raw text of
 * the first candidate. Callers that need structured output should instruct
 * the model (via the prompt) to return JSON and parse it themselves.
 *
 * This is the sole network seam for Gemini — tests mock this function
 * (`vi.mock("@/lib/gemini")`) instead of hitting the real API, since a real
 * call costs tokens and money on every test run.
 */
export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set — see web/.env.example");

  const model = await getGeminiModel();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Gemini response missing candidate text");
  }
  return text;
}
