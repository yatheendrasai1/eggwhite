/* =========================================================================
   Generic "translation" test — free-text English translations of sentences
   given in a native language/script, graded by an LLM (Gemini) against a
   rubric instead of exact-match string comparison. Pro-gated: see
   isProTest() in lib/tests/proTests.ts.

   Client-safe types + pure helpers only — no server-only imports (Gemini,
   Mongo/mongoose). Client components (TranslationRunner/TranslationResults)
   import from here; the Gemini-calling evaluator lives in translationEval.ts
   so importing it doesn't drag mongoose into the browser bundle.
   ========================================================================= */

import type { DrillBand } from "@/lib/tests/drill";

export type TranslationItem = {
  /** Same sentence rendered three ways; the candidate reads whichever they find easiest. */
  telugu: string;
  tinglish: string;
  hinglish: string;
};

export type TranslationConfig = {
  id: string;
  slug: string;
  href: string;
  eyebrow: string;
  titleLead: string;
  titleEm: string;
  titleTail: string;
  lede: string;
  howto: string[]; // each entry may contain <b>…</b>
  items: TranslationItem[];
  /** Key into the `prompts` collection for the grading-instructions template. */
  promptKey: string;
  bands: DrillBand[];
};

export type TranslationAnswers = {
  fills: Record<number, string>;
};

export function countDoneTranslation(answers: TranslationAnswers): number {
  const fills = answers.fills ?? {};
  return Object.values(fills).filter((v) => (v || "").trim()).length;
}

export type TranslationItemResult = {
  n: number;
  telugu: string;
  tinglish: string;
  hinglish: string;
  yours: string;
  score: number; // 0-100, from Gemini
  verdict: "correct" | "partial" | "incorrect";
  feedback: string;
};

export type TranslationResult = {
  total: number; // average item score, 0-100
  pct: number;
  band: DrillBand;
  bandIdx: number;
  rows: TranslationItemResult[];
  summaryLine: string;
};
