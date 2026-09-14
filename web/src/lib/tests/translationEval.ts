/* =========================================================================
   Server-only Gemini grading for the translation test. Kept separate from
   translation.ts (client-safe types) so client components never pull in
   the Gemini client or the Mongo-backed prompt lookup.
   ========================================================================= */

import { callGemini } from "@/lib/gemini";
import { getPromptTemplate } from "@/lib/prompts";
import type {
  TranslationConfig,
  TranslationAnswers,
  TranslationItemResult,
  TranslationResult,
} from "@/lib/tests/translation";

/** Raw shape we instruct Gemini to return — validated before use. */
type GeminiTranslationGrade = {
  n: number;
  score: number;
  verdict: "correct" | "partial" | "incorrect";
  feedback: string;
};

function isGeminiTranslationGrade(v: unknown): v is GeminiTranslationGrade {
  if (!v || typeof v !== "object") return false;
  const g = v as Record<string, unknown>;
  return (
    typeof g.n === "number" &&
    typeof g.score === "number" &&
    (g.verdict === "correct" || g.verdict === "partial" || g.verdict === "incorrect") &&
    typeof g.feedback === "string"
  );
}

function buildPrompt(template: string, config: TranslationConfig, fills: Record<number, string>): string {
  const itemsBlock = config.items
    .map((it, i) => {
      const yours = (fills[i] ?? "").trim();
      return `${i + 1}. Telugu: "${it.telugu}" | Tinglish: "${it.tinglish}" | Hinglish: "${it.hinglish}"\n   Candidate's English translation: "${yours || "(blank)"}"`;
    })
    .join("\n");

  return `${template}\n\nItems to grade:\n${itemsBlock}\n\nRespond with JSON only, matching this exact shape:\n{"results": [{"n": 1, "score": 0-100, "verdict": "correct" | "partial" | "incorrect", "feedback": "one short sentence"}, ...]}\nInclude exactly one entry per item, in order, with "n" matching the item number.`;
}

/**
 * Grades every item in one Gemini call. Throws if Gemini's response can't be
 * parsed/validated — callers should let that fail the attempt-completion
 * request rather than silently score as zero.
 */
export async function evaluateTranslation(
  config: TranslationConfig,
  answers: TranslationAnswers
): Promise<TranslationResult> {
  const fills = answers.fills ?? {};
  const template = await getPromptTemplate(config.promptKey);
  const prompt = buildPrompt(template, config, fills);
  const raw = await callGemini(prompt);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini returned invalid JSON for translation grading");
  }

  const results = (parsed as { results?: unknown[] })?.results;
  if (!Array.isArray(results) || results.length !== config.items.length) {
    throw new Error("Gemini grading response has the wrong shape or item count");
  }
  const grades = results.map((r, i) => {
    if (!isGeminiTranslationGrade(r)) {
      throw new Error(`Gemini grading response item ${i + 1} is malformed`);
    }
    return r;
  });

  const rows: TranslationItemResult[] = config.items.map((it, i) => {
    const grade = grades.find((g) => g.n === i + 1) ?? grades[i];
    return {
      n: i + 1,
      telugu: it.telugu,
      tinglish: it.tinglish,
      hinglish: it.hinglish,
      yours: fills[i] ?? "",
      score: Math.max(0, Math.min(100, Math.round(grade.score))),
      verdict: grade.verdict,
      feedback: grade.feedback,
    };
  });

  const total = rows.reduce((sum, r) => sum + r.score, 0) / rows.length;
  const pct = total;
  const band = config.bands.find((b) => pct <= b.max) ?? config.bands[config.bands.length - 1];
  const bandIdx = config.bands.indexOf(band);

  return {
    total,
    pct,
    band,
    bandIdx,
    rows,
    summaryLine: `${band.code} · ${Math.round(total)}%`,
  };
}
