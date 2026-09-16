import { describe, it, expect, vi, beforeEach } from "vitest";
import type { JiraCommentConfig, JiraCommentAnswers } from "@/lib/tests/jiraComment";

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
import { countWords, countDoneJiraComment } from "@/lib/tests/jiraComment";
import { evaluateJiraComment } from "@/lib/tests/jiraCommentEval";

const mockCallGemini = vi.mocked(callGemini);
const mockGetPromptTemplate = vi.mocked(getPromptTemplate);

const BANDS = [
  { max: 44, code: "D", name: "Struggles to Communicate", desc: "" },
  { max: 64, code: "C", name: "Understandable", desc: "" },
  { max: 84, code: "B", name: "Good", desc: "" },
  { max: 100, code: "A", name: "Fluent", desc: "" },
];

function makeConfig(): JiraCommentConfig {
  return {
    id: "framing-the-situation",
    slug: "framing-the-situation",
    href: "/tests/framing-the-situation",
    eyebrow: "Pro",
    titleLead: "Framing ",
    titleEm: "the Situation",
    titleTail: "",
    lede: "",
    howto: [],
    scenario: {
      role: "Senior Software Engineer",
      ticket: "PAY-482",
      recipient: "Venkat",
      story: ["A bug was found."],
      task: ["Explain the limit", "Acknowledge Sneha", "Ask Venkat", "Suggest an alternative"],
      wordRange: [180, 220],
    },
    categories: [
      { key: "tense", label: "Tense Usage", max: 30 },
      { key: "framing", label: "Sentence Framing / Structure", max: 25 },
      { key: "prepositions", label: "Prepositions & Word Usage", max: 20 },
      { key: "clarity", label: "Clarity & Understandability", max: 15 },
      { key: "coverage", label: "Task Coverage", max: 10 },
    ],
    promptKey: "framing-the-situation-eval",
    bands: BANDS,
  };
}

function fullGrade(overrides: Partial<Record<string, number>> = {}) {
  return {
    categories: {
      tense: { score: overrides.tense ?? 28, justification: "Timeline is clear." },
      framing: { score: overrides.framing ?? 22, justification: "Logical progression." },
      prepositions: { score: overrides.prepositions ?? 18, justification: "Natural usage." },
      clarity: { score: overrides.clarity ?? 14, justification: "Clear in one read." },
      coverage: { score: overrides.coverage ?? 10, justification: "All four points covered." },
    },
    suggestions: [{ quote: "informations", fix: "information" }],
  };
}

beforeEach(() => {
  mockCallGemini.mockReset();
  mockGetPromptTemplate.mockReset();
  mockGetPromptTemplate.mockResolvedValue("Grade this Jira comment against the rubric.");
});

describe("evaluateJiraComment", () => {
  it("scores a well-formed Gemini response and bands the result", async () => {
    const config = makeConfig();
    const answers: JiraCommentAnswers = { response: "Hi Venkat, quick update on PAY-482..." };
    mockCallGemini.mockResolvedValue(JSON.stringify(fullGrade()));

    const result = await evaluateJiraComment(config, answers);

    expect(mockGetPromptTemplate).toHaveBeenCalledWith("framing-the-situation-eval");
    expect(mockCallGemini).toHaveBeenCalledTimes(1);
    const promptSent = mockCallGemini.mock.calls[0][0];
    expect(promptSent).toContain("Hi Venkat, quick update on PAY-482...");
    expect(promptSent).toContain('"tense"');

    expect(result.categories).toHaveLength(5);
    expect(result.categories.find((c) => c.key === "tense")).toMatchObject({ score: 28, max: 30 });
    expect(result.total).toBe(28 + 22 + 18 + 14 + 10); // 92
    expect(result.maxScore).toBe(100);
    expect(result.band.code).toBe("A");
    expect(result.suggestions).toEqual([{ quote: "informations", fix: "information" }]);
    expect(result.response).toBe(answers.response);
  });

  it("clamps an out-of-range category score into 0..max", async () => {
    const config = makeConfig();
    mockCallGemini.mockResolvedValue(JSON.stringify(fullGrade({ tense: 999, coverage: -5 })));

    const result = await evaluateJiraComment(config, { response: "x" });
    expect(result.categories.find((c) => c.key === "tense")?.score).toBe(30);
    expect(result.categories.find((c) => c.key === "coverage")?.score).toBe(0);
  });

  it("bands a low score correctly", async () => {
    const config = makeConfig();
    mockCallGemini.mockResolvedValue(
      JSON.stringify(fullGrade({ tense: 4, framing: 4, prepositions: 3, clarity: 2, coverage: 1 }))
    );

    const result = await evaluateJiraComment(config, { response: "x" });
    expect(result.total).toBe(14);
    expect(result.band.code).toBe("D");
  });

  it("limits suggestions to at most 3", async () => {
    const config = makeConfig();
    const grade = fullGrade();
    grade.suggestions = [
      { quote: "a", fix: "A" },
      { quote: "b", fix: "B" },
      { quote: "c", fix: "C" },
      { quote: "d", fix: "D" },
    ];
    mockCallGemini.mockResolvedValue(JSON.stringify(grade));

    const result = await evaluateJiraComment(config, { response: "x" });
    expect(result.suggestions).toHaveLength(3);
  });

  it("throws when Gemini returns invalid JSON", async () => {
    const config = makeConfig();
    mockCallGemini.mockResolvedValue("not json");
    await expect(evaluateJiraComment(config, { response: "x" })).rejects.toThrow(/invalid JSON/i);
  });

  it("throws when a category is missing from the response", async () => {
    const config = makeConfig();
    const grade = fullGrade();
    delete (grade.categories as Record<string, unknown>).coverage;
    mockCallGemini.mockResolvedValue(JSON.stringify(grade));

    await expect(evaluateJiraComment(config, { response: "x" })).rejects.toThrow(/coverage.*malformed/i);
  });

  it("throws when the top-level shape is wrong", async () => {
    const config = makeConfig();
    mockCallGemini.mockResolvedValue(JSON.stringify({ notCategories: true }));
    await expect(evaluateJiraComment(config, { response: "x" })).rejects.toThrow(/wrong shape/i);
  });
});

describe("countWords", () => {
  it("counts whitespace-separated words", () => {
    expect(countWords("Hi Venkat, quick update.")).toBe(4);
  });

  it("returns 0 for blank input", () => {
    expect(countWords("   ")).toBe(0);
    expect(countWords("")).toBe(0);
  });
});

describe("countDoneJiraComment", () => {
  it("is 1 when the response is non-blank", () => {
    expect(countDoneJiraComment({ response: "hi" })).toBe(1);
  });

  it("is 0 when the response is blank or whitespace", () => {
    expect(countDoneJiraComment({ response: "" })).toBe(0);
    expect(countDoneJiraComment({ response: "   " })).toBe(0);
  });
});
