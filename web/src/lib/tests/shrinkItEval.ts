/* =========================================================================
   Server-only Gemini grading for Shrink It's Section A (the information-loss
   half — shrinkage % is plain word-count math and needs no LLM). Kept
   separate from shrinkIt.ts (client-safe types) so client components never
   pull in the Gemini client or the Mongo-backed prompt lookup.
   ========================================================================= */

import { callGemini } from "@/lib/gemini";
import { getPromptTemplate } from "@/lib/prompts";
import {
  countWords,
  shrinkPercent,
  shrinkPointsFor,
  infoPointsFor,
  SECTION_A_MAX_PER_ITEM,
  SECTION_B_MAX_PER_ITEM,
  type ShrinkItConfig,
  type ShrinkItAnswers,
  type ShrinkItSentenceResult,
  type ShrinkItSynonymResult,
  type ShrinkItResult,
} from "@/lib/tests/shrinkIt";

type GeminiInfoLossGrade = { n: number; infoLossPct: number; feedback: string };

function isGeminiInfoLossGrade(v: unknown): v is GeminiInfoLossGrade {
  if (!v || typeof v !== "object") return false;
  const g = v as Record<string, unknown>;
  return typeof g.n === "number" && typeof g.infoLossPct === "number" && typeof g.feedback === "string";
}

function buildPrompt(
  template: string,
  items: { n: number; original: string; yours: string }[]
): string {
  const block = items
    .map((it) => `${it.n}. Original: "${it.original}"\n   Candidate's shrunk version: "${it.yours}"`)
    .join("\n");

  return `${template}\n\nItems to grade:\n${block}\n\nRespond with JSON only, matching this exact shape:\n{"results": [{"n": 1, "infoLossPct": 0, "feedback": "one short sentence"}, ...]}\n"infoLossPct" must be an integer 0-100. Include exactly one entry per item, in order, with "n" matching the item number.`;
}

/**
 * Grades Section A (one Gemini call for information loss across all
 * sentences) and Section B (plain rule-based MCQ matching), then combines
 * them into the overall result. Throws if the Gemini call's response can't
 * be parsed/validated — callers should let that fail the
 * attempt-completion request rather than silently score Section A as zero.
 */
export async function evaluateShrinkIt(
  config: ShrinkItConfig,
  answers: ShrinkItAnswers
): Promise<ShrinkItResult> {
  const shrinks = answers.shrinks ?? {};
  const picks = answers.picks ?? {};

  const sentenceInputs = config.sentences.map((s, i) => ({
    n: i + 1,
    original: s.original,
    yours: (shrinks[i] ?? "").trim(),
  }));

  const gradeCandidates = sentenceInputs.filter((it) => it.yours.length > 0);
  const grades = new Map<number, { infoLossPct: number; feedback: string }>();

  if (gradeCandidates.length > 0) {
    const template = await getPromptTemplate(config.promptKey);
    const prompt = buildPrompt(template, gradeCandidates);
    const raw = await callGemini(prompt);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Gemini returned invalid JSON for shrink it grading");
    }

    const results = (parsed as { results?: unknown[] })?.results;
    if (!Array.isArray(results) || results.length !== gradeCandidates.length) {
      throw new Error("Gemini grading response has the wrong shape or item count");
    }
    for (const r of results) {
      if (!isGeminiInfoLossGrade(r)) {
        throw new Error("Gemini grading response item is malformed");
      }
      grades.set(r.n - 1, {
        infoLossPct: Math.max(0, Math.min(100, Math.round(r.infoLossPct))),
        feedback: r.feedback,
      });
    }
  }

  const sentenceRows: ShrinkItSentenceResult[] = config.sentences.map((s, i) => {
    const yours = (shrinks[i] ?? "").trim();
    const originalWords = countWords(s.original);
    const yourWords = countWords(yours);
    if (!yours) {
      return {
        n: i + 1,
        original: s.original,
        yours: "",
        originalWords,
        yourWords: 0,
        shrinkPct: 0,
        infoLossPct: 100,
        shrinkPts: 0,
        infoPts: 0,
        pts: 0,
        feedback: "No shrunken sentence submitted.",
      };
    }
    const shrinkPct = shrinkPercent(originalWords, yourWords);
    const grade = grades.get(i);
    const infoLossPct = grade?.infoLossPct ?? 100;
    const shrinkPts = shrinkPointsFor(shrinkPct);
    const infoPts = infoPointsFor(infoLossPct);
    return {
      n: i + 1,
      original: s.original,
      yours,
      originalWords,
      yourWords,
      shrinkPct,
      infoLossPct,
      shrinkPts,
      infoPts,
      pts: shrinkPts + infoPts,
      feedback: grade?.feedback ?? "",
    };
  });

  const synonymRows: ShrinkItSynonymResult[] = config.synonyms.map((it, i) => {
    const picked = picks[i];
    return {
      n: i + 1,
      word: it.word,
      options: it.options,
      correct: it.correct,
      picked,
      ok: picked === it.correct,
      why: it.why,
    };
  });

  const sectionATotal = sentenceRows.reduce((sum, r) => sum + r.pts, 0);
  const sectionAMax = config.sentences.length * SECTION_A_MAX_PER_ITEM;
  const sectionBTotal = synonymRows.reduce((sum, r) => sum + (r.ok ? SECTION_B_MAX_PER_ITEM : 0), 0);
  const sectionBMax = config.synonyms.length * SECTION_B_MAX_PER_ITEM;

  const total = sectionATotal + sectionBTotal;
  const maxScore = sectionAMax + sectionBMax;
  const pct = maxScore > 0 ? (total / maxScore) * 100 : 0;
  const band = config.bands.find((b) => pct <= b.max) ?? config.bands[config.bands.length - 1];
  const bandIdx = config.bands.indexOf(band);

  return {
    sectionATotal,
    sectionAMax,
    sectionBTotal,
    sectionBMax,
    total,
    maxScore,
    pct,
    band,
    bandIdx,
    sentenceRows,
    synonymRows,
    summaryLine: `${band.code} · ${total}/${maxScore}`,
  };
}
