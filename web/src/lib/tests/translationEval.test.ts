import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TranslationConfig, TranslationAnswers } from "@/lib/tests/translation";

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
import { countDoneTranslation } from "@/lib/tests/translation";
import { evaluateTranslation } from "@/lib/tests/translationEval";

const mockCallGemini = vi.mocked(callGemini);
const mockGetPromptTemplate = vi.mocked(getPromptTemplate);

const BANDS = [
  { max: 40, code: "D", name: "Just Starting", desc: "" },
  { max: 65, code: "C", name: "Getting There", desc: "" },
  { max: 85, code: "B", name: "Fluent Enough", desc: "" },
  { max: 100, code: "A", name: "Native-Level Ease", desc: "" },
];

function makeConfig(itemCount: number): TranslationConfig {
  return {
    id: "translation-drama-v1",
    slug: "translation-drama-v1",
    href: "/tests/translation-drama-v1",
    eyebrow: "Pro",
    titleLead: "The Translation",
    titleEm: "Drama",
    titleTail: "",
    lede: "",
    howto: [],
    items: Array.from({ length: itemCount }, (_, i) => ({
      telugu: `Telugu sentence ${i + 1}`,
      tinglish: `Tinglish sentence ${i + 1}`,
      hinglish: `Hinglish sentence ${i + 1}`,
    })),
    promptKey: "translation-drama-v1-eval",
    bands: BANDS,
  };
}

beforeEach(() => {
  mockCallGemini.mockReset();
  mockGetPromptTemplate.mockReset();
  mockGetPromptTemplate.mockResolvedValue("Grade these translations against the source meaning.");
});

describe("evaluateTranslation", () => {
  it("scores items from a well-formed Gemini response and bands the result", async () => {
    const config = makeConfig(2);
    const answers: TranslationAnswers = { fills: { 0: "I am going to the market", 1: "wrong" } };
    mockCallGemini.mockResolvedValue(
      JSON.stringify({
        results: [
          { n: 1, score: 90, verdict: "correct", feedback: "Close enough." },
          { n: 2, score: 20, verdict: "incorrect", feedback: "Missed the meaning." },
        ],
      })
    );

    const result = await evaluateTranslation(config, answers);

    expect(mockGetPromptTemplate).toHaveBeenCalledWith("translation-drama-v1-eval");
    expect(mockCallGemini).toHaveBeenCalledTimes(1);
    const promptSent = mockCallGemini.mock.calls[0][0];
    expect(promptSent).toContain("Telugu sentence 1");
    expect(promptSent).toContain("I am going to the market");

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toMatchObject({ n: 1, score: 90, verdict: "correct" });
    expect(result.rows[1]).toMatchObject({ n: 2, score: 20, verdict: "incorrect" });
    expect(result.total).toBe(55); // (90 + 20) / 2
    expect(result.band.code).toBe("C"); // 55 <= 65
  });

  it("fills in a blank translation as an empty string when ungraded item is missing", async () => {
    const config = makeConfig(1);
    const answers: TranslationAnswers = { fills: {} };
    mockCallGemini.mockResolvedValue(
      JSON.stringify({ results: [{ n: 1, score: 0, verdict: "incorrect", feedback: "Blank." }] })
    );

    const result = await evaluateTranslation(config, answers);
    expect(result.rows[0].yours).toBe("");
    expect(result.band.code).toBe("D");
  });

  it("clamps out-of-range scores into 0-100", async () => {
    const config = makeConfig(1);
    mockCallGemini.mockResolvedValue(
      JSON.stringify({ results: [{ n: 1, score: 140, verdict: "correct", feedback: "ok" }] })
    );

    const result = await evaluateTranslation(config, { fills: { 0: "x" } });
    expect(result.rows[0].score).toBe(100);
  });

  it("throws when Gemini returns invalid JSON", async () => {
    const config = makeConfig(1);
    mockCallGemini.mockResolvedValue("not json");
    await expect(evaluateTranslation(config, { fills: { 0: "x" } })).rejects.toThrow(/invalid JSON/i);
  });

  it("throws when the result count doesn't match the item count", async () => {
    const config = makeConfig(2);
    mockCallGemini.mockResolvedValue(
      JSON.stringify({ results: [{ n: 1, score: 50, verdict: "partial", feedback: "x" }] })
    );
    await expect(evaluateTranslation(config, { fills: { 0: "a", 1: "b" } })).rejects.toThrow(
      /wrong shape or item count/i
    );
  });

  it("throws when an item is missing required fields", async () => {
    const config = makeConfig(1);
    mockCallGemini.mockResolvedValue(JSON.stringify({ results: [{ n: 1, score: 50 }] }));
    await expect(evaluateTranslation(config, { fills: { 0: "a" } })).rejects.toThrow(/malformed/i);
  });
});

describe("countDoneTranslation", () => {
  it("counts only non-blank fills", () => {
    expect(countDoneTranslation({ fills: { 0: "hi", 1: "  ", 2: "there" } })).toBe(2);
  });

  it("handles an empty/undefined fills object", () => {
    expect(countDoneTranslation({ fills: {} } as TranslationAnswers)).toBe(0);
  });
});
