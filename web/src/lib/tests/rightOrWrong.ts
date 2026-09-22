/* =========================================================================
   "Right or Wrong" — 20 workplace phrases, some clean and some wrong. The
   test taker delivers a verdict (Correct/Incorrect) on each; a correct call
   is worth +1, a wrong call costs -0.5. Convicting a genuinely wrong phrase
   and then naming the issue + writing a fix earns a bonus +1, graded by an
   LLM against a rubric (free text, so it can't be scored by exact match) —
   a wrong explanation just forfeits the bonus, no extra penalty.

   Client-safe types + pure helpers only — no server-only imports (Gemini,
   Mongo/mongoose). RightOrWrongRunner/RightOrWrongResults import from here;
   the Gemini-calling evaluator lives in rightOrWrongEval.ts so importing it
   doesn't drag mongoose into the browser bundle.
   ========================================================================= */

import type { DrillBand } from "@/lib/tests/drill";

export type RightOrWrongItem = {
  phrase: string;
  /** Ground truth: is the phrase grammatically fine as written? */
  correct: boolean;
  /** Only meaningful when correct is false. Given to the grader as the anchor — never shown to the candidate while taking the test. */
  issue: string;
  fix: string;
};

export type RightOrWrongConfig = {
  id: string;
  slug: string;
  href: string;
  eyebrow: string;
  titleLead: string;
  titleEm: string;
  titleTail: string;
  lede: string;
  howto: string[]; // each entry may contain <b>…</b>
  items: RightOrWrongItem[];
  /** Key into the `prompts` collection for the bonus-grading instructions template. */
  promptKey: string;
  bands: DrillBand[];
};

export type RightOrWrongVerdict = "correct" | "incorrect";

export type RightOrWrongAnswers = {
  verdicts: Record<number, RightOrWrongVerdict>;
  issues: Record<number, string>;
  fixes: Record<number, string>;
};

/** Only the verdict counts toward "answered" — the bonus explanation is optional. */
export function countDoneRightOrWrong(answers: RightOrWrongAnswers): number {
  const verdicts = answers.verdicts ?? {};
  return Object.values(verdicts).filter((v) => v === "correct" || v === "incorrect").length;
}

export type RightOrWrongItemResult = {
  n: number;
  phrase: string;
  actual: boolean; // ground truth
  verdict: RightOrWrongVerdict | undefined;
  basePts: number; // +1 or -0.5
  attemptedBonus: boolean;
  bonusEarned: boolean;
  bonusFeedback: string;
  yourIssue: string;
  yourFix: string;
  /** The canonical fix — blank when the phrase was actually correct (nothing to fix). */
  correctFix: string;
};

export type RightOrWrongResult = {
  total: number; // sum of basePts + bonus across all items — can go negative
  maxScore: number; // items.length + (number of actually-wrong items)
  pct: number; // clamped at 0 for band lookup / display
  band: DrillBand;
  bandIdx: number;
  rows: RightOrWrongItemResult[];
  summaryLine: string;
};
