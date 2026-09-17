import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ShrinkItConfig, ShrinkItAnswers } from "@/lib/tests/shrinkIt";

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
import { countDoneShrinkIt, shrinkPercent, shrinkPointsFor, infoPointsFor } from "@/lib/tests/shrinkIt";
import { evaluateShrinkIt } from "@/lib/tests/shrinkItEval";

const mockCallGemini = vi.mocked(callGemini);
const mockGetPromptTemplate = vi.mocked(getPromptTemplate);

const BANDS = [
  { max: 40, code: "D", name: "Still Bloated", desc: "" },
  { max: 65, code: "C", name: "Trimming Down", desc: "" },
  { max: 85, code: "B", name: "Lean and Clear", desc: "" },
  { max: 100, code: "A", name: "Master Editor", desc: "" },
];

const TEN_WORD_SENTENCE = "one two three four five six seven eight nine ten";

function makeConfig(opts?: { sentenceCount?: number; synonymCount?: number }): ShrinkItConfig {
  const sentenceCount = opts?.sentenceCount ?? 1;
  const synonymCount = opts?.synonymCount ?? 1;
  return {
    id: "shrink-it",
    slug: "shrink-it",
    href: "/tests/shrink-it",
    eyebrow: "Pro",
    titleLead: "Shrink ",
    titleEm: "It",
    titleTail: "!",
    lede: "",
    howto: [],
    sentences: Array.from({ length: sentenceCount }, () => ({ original: TEN_WORD_SENTENCE })),
    synonyms: Array.from({ length: synonymCount }, (_, i) => ({
      word: `Word${i + 1}`,
      options: ["Right", "Wrong1", "Wrong2", "Wrong3"],
      correct: 0,
      why: "because",
    })),
    promptKey: "shrink-it-eval",
    bands: BANDS,
  };
}

beforeEach(() => {
  mockCallGemini.mockReset();
  mockGetPromptTemplate.mockReset();
  mockGetPromptTemplate.mockResolvedValue("Grade the information loss.");
});

describe("shrinkPercent", () => {
  it("computes a plain reduction percentage", () => {
    expect(shrinkPercent(10, 5)).toBe(50);
    expect(shrinkPercent(10, 10)).toBe(0);
  });

  it("clamps at 0 instead of going negative when the rewrite is longer", () => {
    expect(shrinkPercent(10, 15)).toBe(0);
  });

  it("returns 0 for a zero-length original", () => {
    expect(shrinkPercent(0, 5)).toBe(0);
  });
});

describe("shrinkPointsFor / infoPointsFor banding", () => {
  it("bands shrinkage into 0-5", () => {
    expect(shrinkPointsFor(0)).toBe(0);
    expect(shrinkPointsFor(10)).toBe(1);
    expect(shrinkPointsFor(20)).toBe(2);
    expect(shrinkPointsFor(35)).toBe(3);
    expect(shrinkPointsFor(50)).toBe(4);
    expect(shrinkPointsFor(80)).toBe(5);
  });

  it("bands information loss into 0-5, lower loss scoring higher", () => {
    expect(infoPointsFor(0)).toBe(5);
    expect(infoPointsFor(10)).toBe(4);
    expect(infoPointsFor(25)).toBe(3);
    expect(infoPointsFor(45)).toBe(2);
    expect(infoPointsFor(70)).toBe(1);
    expect(infoPointsFor(100)).toBe(0);
  });
});

describe("evaluateShrinkIt", () => {
  it("combines shrinkage and Gemini-graded information loss into a per-item score", async () => {
    const config = makeConfig();
    mockCallGemini.mockResolvedValue(
      JSON.stringify({ results: [{ n: 1, infoLossPct: 10, feedback: "Lost a minor detail." }] })
    );
    const answers: ShrinkItAnswers = {
      shrinks: { 0: "one two three four five" }, // 5 of 10 words = 50% shrink
      picks: { 0: 0 },
    };

    const result = await evaluateShrinkIt(config, answers);

    expect(mockGetPromptTemplate).toHaveBeenCalledWith("shrink-it-eval");
    expect(mockCallGemini).toHaveBeenCalledTimes(1);
    const promptSent = mockCallGemini.mock.calls[0][0];
    expect(promptSent).toContain(TEN_WORD_SENTENCE);
    expect(promptSent).toContain("one two three four five");

    const row = result.sentenceRows[0];
    expect(row.shrinkPct).toBe(50);
    expect(row.shrinkPts).toBe(4); // 45-59% band
    expect(row.infoLossPct).toBe(10);
    expect(row.infoPts).toBe(4); // 6-15% band
    expect(row.pts).toBe(8);
    expect(result.sectionATotal).toBe(8);
    expect(result.sectionAMax).toBe(10);
  });

  it("scores an unanswered sentence as 0 without calling Gemini for it", async () => {
    const config = makeConfig();
    const answers: ShrinkItAnswers = { shrinks: {}, picks: { 0: 0 } };

    const result = await evaluateShrinkIt(config, answers);

    expect(mockCallGemini).not.toHaveBeenCalled();
    expect(result.sentenceRows[0]).toMatchObject({ pts: 0, infoLossPct: 100, shrinkPts: 0, infoPts: 0 });
  });

  it("only sends attempted sentences to Gemini, skipping blank ones", async () => {
    const config = makeConfig({ sentenceCount: 2 });
    mockCallGemini.mockResolvedValue(
      JSON.stringify({ results: [{ n: 1, infoLossPct: 0, feedback: "Nothing lost." }] })
    );
    const answers: ShrinkItAnswers = {
      shrinks: { 0: "one two three" }, // item 2 left blank
      picks: { 0: 0, 1: 0 },
    };

    const result = await evaluateShrinkIt(config, answers);

    expect(mockCallGemini).toHaveBeenCalledTimes(1);
    expect(result.sentenceRows[0].infoLossPct).toBe(0);
    expect(result.sentenceRows[1]).toMatchObject({ pts: 0, infoLossPct: 100 });
  });

  it("scores Section B as flat +1 per correct pick, 0 for wrong or unanswered, with no Gemini involvement", async () => {
    const config = makeConfig({ sentenceCount: 1, synonymCount: 3 });
    mockCallGemini.mockResolvedValue(
      JSON.stringify({ results: [{ n: 1, infoLossPct: 0, feedback: "fine" }] })
    );
    const answers: ShrinkItAnswers = {
      shrinks: { 0: "one two" },
      picks: { 0: 0, 1: 1 }, // item 0 correct, item 1 wrong, item 2 unanswered
    };

    const result = await evaluateShrinkIt(config, answers);

    expect(result.synonymRows[0].ok).toBe(true);
    expect(result.synonymRows[1].ok).toBe(false);
    expect(result.synonymRows[2]).toMatchObject({ ok: false, picked: undefined });
    expect(result.sectionBTotal).toBe(1);
    expect(result.sectionBMax).toBe(3);
  });

  it("computes overall total/maxScore/pct across both sections and bands the result", async () => {
    const config = makeConfig({ sentenceCount: 1, synonymCount: 2 });
    mockCallGemini.mockResolvedValue(
      JSON.stringify({ results: [{ n: 1, infoLossPct: 0, feedback: "fine" }] })
    );
    const answers: ShrinkItAnswers = {
      shrinks: { 0: "one two three four five" }, // 50% shrink, 0% loss -> 4+5=9
      picks: { 0: 0, 1: 0 }, // both correct -> +2
    };

    const result = await evaluateShrinkIt(config, answers);

    expect(result.total).toBe(11); // 9 + 2
    expect(result.maxScore).toBe(12); // 10 + 2
    expect(Math.round(result.pct)).toBe(92);
    expect(result.band.code).toBe("A");
  });

  it("clamps out-of-range Gemini infoLossPct into 0-100", async () => {
    const config = makeConfig();
    mockCallGemini.mockResolvedValue(JSON.stringify({ results: [{ n: 1, infoLossPct: 250, feedback: "x" }] }));
    const result = await evaluateShrinkIt(config, { shrinks: { 0: "one" }, picks: {} });
    expect(result.sentenceRows[0].infoLossPct).toBe(100);
  });

  it("throws when Gemini returns invalid JSON", async () => {
    const config = makeConfig();
    mockCallGemini.mockResolvedValue("not json");
    await expect(
      evaluateShrinkIt(config, { shrinks: { 0: "one" }, picks: {} })
    ).rejects.toThrow(/invalid JSON/i);
  });

  it("throws when the graded result count doesn't match the attempted-item count", async () => {
    const config = makeConfig({ sentenceCount: 2 });
    mockCallGemini.mockResolvedValue(JSON.stringify({ results: [{ n: 1, infoLossPct: 0, feedback: "x" }] }));
    await expect(
      evaluateShrinkIt(config, { shrinks: { 0: "one", 1: "two" }, picks: {} })
    ).rejects.toThrow(/wrong shape or item count/i);
  });
});

describe("countDoneShrinkIt", () => {
  it("counts non-blank shrinks plus answered picks", () => {
    expect(
      countDoneShrinkIt({
        shrinks: { 0: "hi", 1: "  " },
        picks: { 0: 1 },
      })
    ).toBe(2); // 1 non-blank shrink + 1 pick
  });

  it("handles empty answers", () => {
    expect(countDoneShrinkIt({ shrinks: {}, picks: {} })).toBe(0);
  });
});
