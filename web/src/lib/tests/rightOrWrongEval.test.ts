import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RightOrWrongConfig, RightOrWrongAnswers } from "@/lib/tests/rightOrWrong";

/**
 * Mocks the Gemini network seam and the DB-backed prompt lookup so these
 * tests run offline, fast, and for free — no real Gemini tokens spent.
 */
vi.mock("@/lib/gemini", () => ({
  callGemini: vi.fn(),
}));
vi.mock("@/lib/prompts", () => ({
  getPromptTemplate: vi.fn(),
}));

import { callGemini } from "@/lib/gemini";
import { getPromptTemplate } from "@/lib/prompts";
import { countDoneRightOrWrong } from "@/lib/tests/rightOrWrong";
import { evaluateRightOrWrong } from "@/lib/tests/rightOrWrongEval";

const mockCallGemini = vi.mocked(callGemini);
const mockGetPromptTemplate = vi.mocked(getPromptTemplate);

const BANDS = [
  { max: 40, code: "D", name: "Held in Contempt", desc: "" },
  { max: 65, code: "C", name: "Case Pending", desc: "" },
  { max: 85, code: "B", name: "Sound Judgment", desc: "" },
  { max: 100, code: "A", name: "Chief Justice", desc: "" },
];

function makeConfig(
  items: { phrase: string; correct: boolean; issue?: string; fix?: string }[]
): RightOrWrongConfig {
  return {
    id: "right-or-wrong",
    slug: "right-or-wrong",
    href: "/tests/right-or-wrong",
    eyebrow: "Pro",
    titleLead: "Grammar ",
    titleEm: "Court",
    titleTail: "",
    lede: "",
    howto: [],
    items: items.map((it) => ({
      phrase: it.phrase,
      correct: it.correct,
      issue: it.issue ?? "",
      fix: it.fix ?? "",
    })),
    promptKey: "right-or-wrong-eval",
    bands: BANDS,
  };
}

beforeEach(() => {
  mockCallGemini.mockReset();
  mockGetPromptTemplate.mockReset();
  mockGetPromptTemplate.mockResolvedValue("Grade these bonus explanations.");
});

describe("evaluateRightOrWrong", () => {
  it("scores a correct verdict as +1 and a wrong verdict as -1, with no Gemini call when nothing was attempted", async () => {
    const config = makeConfig([
      { phrase: "He explained me the process.", correct: false, issue: "missing 'to'", fix: "He explained the process to me." },
      { phrase: "Please find the attached report.", correct: true },
    ]);
    const answers: RightOrWrongAnswers = {
      verdicts: { 0: "incorrect", 1: "incorrect" }, // item 0 right call, item 1 wrong call
      issues: {},
      fixes: {},
    };

    const result = await evaluateRightOrWrong(config, answers);

    expect(mockCallGemini).not.toHaveBeenCalled();
    expect(result.rows[0]).toMatchObject({ basePts: 1, attemptedBonus: false, bonusEarned: false });
    expect(result.rows[1]).toMatchObject({ basePts: -1, attemptedBonus: false });
    expect(result.total).toBe(0); // +1 - 1
    expect(result.maxScore).toBe(3); // 2 items + 1 bonus slot (one actually-wrong item)
  });

  it("awards the bonus point only when the item was actually wrong, correctly convicted, and Gemini grades the explanation correct", async () => {
    const config = makeConfig([
      { phrase: "He explained me the process.", correct: false, issue: "missing 'to'", fix: "He explained the process to me." },
    ]);
    const answers: RightOrWrongAnswers = {
      verdicts: { 0: "incorrect" },
      issues: { 0: "missing preposition before 'me'" },
      fixes: { 0: "He explained the process to me." },
    };
    mockCallGemini.mockResolvedValue(
      JSON.stringify({ results: [{ n: 1, correct: true, feedback: "Nailed it." }] })
    );

    const result = await evaluateRightOrWrong(config, answers);

    expect(mockGetPromptTemplate).toHaveBeenCalledWith("right-or-wrong-eval");
    expect(mockCallGemini).toHaveBeenCalledTimes(1);
    const promptSent = mockCallGemini.mock.calls[0][0];
    expect(promptSent).toContain("He explained me the process.");
    expect(promptSent).toContain("missing preposition before 'me'");

    expect(result.rows[0]).toMatchObject({
      basePts: 1,
      attemptedBonus: true,
      bonusEarned: true,
      bonusFeedback: "Nailed it.",
    });
    expect(result.total).toBe(2); // +1 base + 1 bonus
    expect(result.maxScore).toBe(2); // 1 item + 1 bonus slot
  });

  it("does not penalize a wrong bonus explanation beyond losing the bonus itself", async () => {
    const config = makeConfig([
      { phrase: "He explained me the process.", correct: false, issue: "missing 'to'", fix: "He explained the process to me." },
    ]);
    const answers: RightOrWrongAnswers = {
      verdicts: { 0: "incorrect" },
      issues: { 0: "totally unrelated guess" },
      fixes: { 0: "still wrong" },
    };
    mockCallGemini.mockResolvedValue(
      JSON.stringify({ results: [{ n: 1, correct: false, feedback: "Not quite." }] })
    );

    const result = await evaluateRightOrWrong(config, answers);

    expect(result.rows[0]).toMatchObject({ basePts: 1, attemptedBonus: true, bonusEarned: false });
    expect(result.total).toBe(1); // just the base point — no extra deduction for a wrong explanation
  });

  it("does not attempt the bonus (or call Gemini) when the item was actually correct, even if the candidate wrongly convicted it and filled in issue/fix", async () => {
    const config = makeConfig([{ phrase: "Please find the attached report.", correct: true }]);
    const answers: RightOrWrongAnswers = {
      verdicts: { 0: "incorrect" },
      issues: { 0: "made up issue" },
      fixes: { 0: "made up fix" },
    };

    const result = await evaluateRightOrWrong(config, answers);

    expect(mockCallGemini).not.toHaveBeenCalled();
    expect(result.rows[0]).toMatchObject({ basePts: -1, attemptedBonus: false, bonusEarned: false });
  });

  it("does not attempt the bonus when the issue or fix field is left blank", async () => {
    const config = makeConfig([
      { phrase: "He explained me the process.", correct: false, issue: "missing 'to'", fix: "He explained the process to me." },
    ]);
    const answers: RightOrWrongAnswers = {
      verdicts: { 0: "incorrect" },
      issues: { 0: "missing preposition" },
      fixes: { 0: "  " }, // blank/whitespace-only fix
    };

    const result = await evaluateRightOrWrong(config, answers);

    expect(mockCallGemini).not.toHaveBeenCalled();
    expect(result.rows[0].attemptedBonus).toBe(false);
  });

  it("can produce a negative total and clamps pct at 0 for band lookup", async () => {
    const config = makeConfig([
      { phrase: "a", correct: true },
      { phrase: "b", correct: true },
    ]);
    const answers: RightOrWrongAnswers = {
      verdicts: { 0: "incorrect", 1: "incorrect" },
      issues: {},
      fixes: {},
    };

    const result = await evaluateRightOrWrong(config, answers);

    expect(result.total).toBe(-2);
    expect(result.pct).toBe(0);
    expect(result.band.code).toBe("D");
  });

  it("throws when Gemini returns invalid JSON for the bonus round", async () => {
    const config = makeConfig([
      { phrase: "He explained me the process.", correct: false, issue: "x", fix: "y" },
    ]);
    mockCallGemini.mockResolvedValue("not json");
    await expect(
      evaluateRightOrWrong(config, {
        verdicts: { 0: "incorrect" },
        issues: { 0: "a" },
        fixes: { 0: "b" },
      })
    ).rejects.toThrow(/invalid JSON/i);
  });
});

describe("countDoneRightOrWrong", () => {
  it("counts only items with a verdict, ignoring issue/fix text", () => {
    expect(
      countDoneRightOrWrong({
        verdicts: { 0: "correct", 1: "incorrect" },
        issues: { 2: "typed but no verdict yet" },
        fixes: {},
      })
    ).toBe(2);
  });

  it("handles empty answers", () => {
    expect(countDoneRightOrWrong({ verdicts: {}, issues: {}, fixes: {} })).toBe(0);
  });
});
