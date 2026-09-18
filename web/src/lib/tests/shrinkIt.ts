/* =========================================================================
   "Shrink It!" — a two-section pro test.

   Section A (free text, 5 items): the candidate is given a 25-40 word
   sentence and rewrites it as short as possible without losing the meaning.
   Scored on two axes, each banded into 0-5 points (10 per item, 50 total):
     - shrinkage % (word-count reduction) — computed locally, no AI needed.
     - information-loss % — how much of the original meaning survived,
       judged by an LLM since that can't be measured by word count alone.

   Section B (MCQ, 10 items): given a moderately advanced word, pick its
   plain-English synonym from 4 options (tough distractors — sound-alikes,
   near-synonyms). Flat +1 per correct, 10 total, deterministic.

   Client-safe types + pure helpers only — no server-only imports (Gemini,
   Mongo/mongoose). ShrinkItRunner/ShrinkItResults import from here; the
   Gemini-calling evaluator lives in shrinkItEval.ts so importing it doesn't
   drag mongoose into the browser bundle.
   ========================================================================= */

import type { DrillBand } from "@/lib/tests/drill";

export type ShrinkItSentence = {
  /** 25-40 words. */
  original: string;
};

export type SynonymItem = {
  word: string;
  /** The word used in a natural sentence — written to give context without spelling out the meaning. */
  example: string;
  options: string[]; // exactly 4
  correct: number; // index into options
  why: string;
};

export type ShrinkItConfig = {
  id: string;
  slug: string;
  href: string;
  eyebrow: string;
  titleLead: string;
  titleEm: string;
  titleTail: string;
  lede: string;
  howto: string[]; // each entry may contain <b>…</b>
  sentences: ShrinkItSentence[]; // Section A
  synonyms: SynonymItem[]; // Section B
  /** Key into the `prompts` collection for the information-loss grading instructions template. */
  promptKey: string;
  bands: DrillBand[];
};

export type ShrinkItAnswers = {
  shrinks: Record<number, string>; // Section A: sentence index -> candidate's shrunken version
  picks: Record<number, number>; // Section B: synonym index -> chosen option index
};

export function countWords(text: string): number {
  const trimmed = (text || "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countDoneShrinkIt(answers: ShrinkItAnswers): number {
  const shrinks = answers.shrinks ?? {};
  const picks = answers.picks ?? {};
  const shrinkDone = Object.values(shrinks).filter((v) => (v || "").trim()).length;
  const pickDone = Object.values(picks).filter((v) => typeof v === "number").length;
  return shrinkDone + pickDone;
}

/** 0-100 shrinkage, clamped so a rewrite that's the same length or longer scores 0, not negative. */
export function shrinkPercent(originalWords: number, yourWords: number): number {
  if (originalWords <= 0) return 0;
  return Math.max(0, Math.round((1 - yourWords / originalWords) * 100));
}

/** Bands a shrinkage % into 0-5 points. */
export function shrinkPointsFor(shrinkPct: number): number {
  if (shrinkPct >= 60) return 5;
  if (shrinkPct >= 45) return 4;
  if (shrinkPct >= 30) return 3;
  if (shrinkPct >= 15) return 2;
  if (shrinkPct >= 1) return 1;
  return 0;
}

/** Bands an information-loss % (lower is better) into 0-5 points. */
export function infoPointsFor(infoLossPct: number): number {
  if (infoLossPct <= 5) return 5;
  if (infoLossPct <= 15) return 4;
  if (infoLossPct <= 30) return 3;
  if (infoLossPct <= 50) return 2;
  if (infoLossPct <= 75) return 1;
  return 0;
}

export const SECTION_A_MAX_PER_ITEM = 10; // 5 shrink pts + 5 info pts
export const SECTION_B_MAX_PER_ITEM = 1;

export type ShrinkItSentenceResult = {
  n: number;
  original: string;
  yours: string;
  originalWords: number;
  yourWords: number;
  shrinkPct: number;
  infoLossPct: number;
  shrinkPts: number;
  infoPts: number;
  pts: number; // shrinkPts + infoPts, out of SECTION_A_MAX_PER_ITEM
  feedback: string;
};

export type ShrinkItSynonymResult = {
  n: number;
  word: string;
  example: string;
  options: string[];
  correct: number;
  picked: number | undefined;
  ok: boolean;
  why: string;
};

export type ShrinkItResult = {
  sectionATotal: number;
  sectionAMax: number;
  sectionBTotal: number;
  sectionBMax: number;
  total: number;
  maxScore: number;
  pct: number;
  band: DrillBand;
  bandIdx: number;
  sentenceRows: ShrinkItSentenceResult[];
  synonymRows: ShrinkItSynonymResult[];
  summaryLine: string;
};
