/* =========================================================================
   Server-only Gemini grading for Right or Wrong's bonus round. Kept separate
   from rightOrWrong.ts (client-safe types) so client components never pull
   in the Gemini client or the Mongo-backed prompt lookup.

   The base +1/-0.5 verdict score is plain rule-based comparison against the
   item's ground truth — no LLM needed for that part. Leaving an item
   unanswered scores 0, not -0.5 — skipping is always safer than guessing.
   Only the free-text "where's the issue / what's the fix" bonus needs
   grading, and only for items where the candidate actually attempted it.
   ========================================================================= */

import { callGemini } from "@/lib/gemini";
import { getPromptTemplate } from "@/lib/prompts";
import type {
  RightOrWrongConfig,
  RightOrWrongAnswers,
  RightOrWrongItemResult,
  RightOrWrongResult,
  RightOrWrongVerdict,
} from "@/lib/tests/rightOrWrong";

type BonusCandidate = {
  n: number;
  phrase: string;
  canonicalIssue: string;
  canonicalFix: string;
  yourIssue: string;
  yourFix: string;
};

/** Raw shape we instruct Gemini to return — validated before use. */
type GeminiBonusGrade = { n: number; correct: boolean; feedback: string };

function isGeminiBonusGrade(v: unknown): v is GeminiBonusGrade {
  if (!v || typeof v !== "object") return false;
  const g = v as Record<string, unknown>;
  return typeof g.n === "number" && typeof g.correct === "boolean" && typeof g.feedback === "string";
}

function buildPrompt(template: string, candidates: BonusCandidate[]): string {
  const block = candidates
    .map(
      (c) =>
        `${c.n}. Phrase: "${c.phrase}"\n   Canonical issue: ${c.canonicalIssue}\n   Canonical fix: "${c.canonicalFix}"\n   Candidate's stated issue: "${c.yourIssue}"\n   Candidate's stated fix: "${c.yourFix}"`
    )
    .join("\n");

  return `${template}\n\nItems to grade:\n${block}\n\nRespond with JSON only, matching this exact shape:\n{"results": [{"n": 1, "correct": true, "feedback": "one short sentence"}, ...]}\nInclude exactly one entry per item, in order, with "n" matching the item number.`;
}

/**
 * Grades every item, running one Gemini call for the bonus round only if
 * at least one item has a bonus attempt. Throws if that call's response
 * can't be parsed/validated — callers should let that fail the
 * attempt-completion request rather than silently skip the bonus.
 */
export async function evaluateRightOrWrong(
  config: RightOrWrongConfig,
  answers: RightOrWrongAnswers
): Promise<RightOrWrongResult> {
  const verdicts = answers.verdicts ?? {};
  const issues = answers.issues ?? {};
  const fixes = answers.fixes ?? {};

  const bonusCandidates: BonusCandidate[] = config.items
    .map((it, i) => ({ i, it }))
    .filter(
      ({ i, it }) =>
        !it.correct &&
        verdicts[i] === "incorrect" &&
        (issues[i] ?? "").trim() &&
        (fixes[i] ?? "").trim()
    )
    .map(({ i, it }) => ({
      n: i + 1,
      phrase: it.phrase,
      canonicalIssue: it.issue,
      canonicalFix: it.fix,
      yourIssue: (issues[i] ?? "").trim(),
      yourFix: (fixes[i] ?? "").trim(),
    }));

  const bonusGrades = new Map<number, { correct: boolean; feedback: string }>();
  if (bonusCandidates.length > 0) {
    const template = await getPromptTemplate(config.promptKey);
    const prompt = buildPrompt(template, bonusCandidates);
    const raw = await callGemini(prompt);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Gemini returned invalid JSON for right or wrong bonus grading");
    }

    const results = (parsed as { results?: unknown[] })?.results;
    if (!Array.isArray(results) || results.length !== bonusCandidates.length) {
      throw new Error("Gemini grading response has the wrong shape or item count");
    }
    for (const r of results) {
      if (!isGeminiBonusGrade(r)) {
        throw new Error("Gemini grading response item is malformed");
      }
      bonusGrades.set(r.n - 1, { correct: r.correct, feedback: r.feedback });
    }
  }

  const rows: RightOrWrongItemResult[] = config.items.map((it, i) => {
    const verdict = verdicts[i];
    const wantVerdict: RightOrWrongVerdict = it.correct ? "correct" : "incorrect";
    // Skipped items (no verdict given) score 0 — only an actual wrong call
    // costs points, so there's no reason to force a guess under penalty.
    const basePts = verdict === undefined ? 0 : verdict === wantVerdict ? 1 : -0.5;
    const attemptedBonus =
      !it.correct &&
      verdict === "incorrect" &&
      !!(issues[i] ?? "").trim() &&
      !!(fixes[i] ?? "").trim();
    const grade = bonusGrades.get(i);
    const bonusEarned = attemptedBonus && !!grade?.correct;
    return {
      n: i + 1,
      phrase: it.phrase,
      actual: it.correct,
      verdict,
      basePts,
      attemptedBonus,
      bonusEarned,
      bonusFeedback: grade?.feedback ?? "",
      yourIssue: issues[i] ?? "",
      yourFix: fixes[i] ?? "",
      correctFix: it.correct ? "" : it.fix,
    };
  });

  const total = rows.reduce((sum, r) => sum + r.basePts + (r.bonusEarned ? 1 : 0), 0);
  const bonusSlots = config.items.filter((it) => !it.correct).length;
  const maxScore = config.items.length + bonusSlots;
  const pct = Math.max(0, (total / maxScore) * 100);
  const band = config.bands.find((b) => pct <= b.max) ?? config.bands[config.bands.length - 1];
  const bandIdx = config.bands.indexOf(band);

  return {
    total,
    maxScore,
    pct,
    band,
    bandIdx,
    rows,
    summaryLine: `${band.code} · ${total}/${maxScore}`,
  };
}
