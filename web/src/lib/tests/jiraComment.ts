/* =========================================================================
   Generic "write a Jira comment for a workplace scenario" test — a single
   free-text response graded by an LLM against a five-category rubric
   (tense, framing, prepositions, clarity, task coverage) instead of
   exact-match scoring. Pro-gated: see isProTest() in lib/tests/proTests.ts.

   Client-safe types + pure helpers only — no server-only imports (Gemini,
   Mongo/mongoose). Client components (JiraCommentRunner/JiraCommentResults)
   import from here; the Gemini-calling evaluator lives in
   jiraCommentEval.ts so importing it doesn't drag mongoose into the
   browser bundle.
   ========================================================================= */

export type JiraCommentCategoryKey =
  | "tense"
  | "framing"
  | "prepositions"
  | "clarity"
  | "coverage";

export type JiraCommentCategoryDef = {
  key: JiraCommentCategoryKey;
  label: string;
  max: number;
};

export type JiraCommentBand = {
  max: number;
  code: string;
  name: string;
  desc: string;
};

export type JiraCommentScenario = {
  role: string;
  ticket: string;
  recipient: string;
  /** Paragraphs of background the test taker reads before writing. */
  story: string[];
  /** The required content points, shown as a checklist. */
  task: string[];
  wordRange: [number, number];
};

export type JiraCommentConfig = {
  id: string;
  slug: string;
  href: string;
  eyebrow: string;
  titleLead: string;
  titleEm: string;
  titleTail: string;
  lede: string;
  howto: string[]; // each entry may contain <b>…</b>
  scenario: JiraCommentScenario;
  categories: JiraCommentCategoryDef[];
  /** Key into the `prompts` collection for the grading-instructions template. */
  promptKey: string;
  bands: JiraCommentBand[];
};

export type JiraCommentAnswers = {
  response: string;
};

export function countWords(text: string): number {
  const trimmed = (text || "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countDoneJiraComment(answers: JiraCommentAnswers): number {
  return (answers.response || "").trim() ? 1 : 0;
}

export type JiraCommentCategoryResult = JiraCommentCategoryDef & {
  score: number;
  justification: string;
};

export type JiraCommentSuggestion = {
  quote: string;
  fix: string;
};

export type JiraCommentResult = {
  response: string;
  /** The exact rubric text sent to the grading LLM for this attempt. */
  rubric: string;
  categories: JiraCommentCategoryResult[];
  total: number;
  maxScore: number;
  band: JiraCommentBand;
  bandIdx: number;
  suggestions: JiraCommentSuggestion[];
  summaryLine: string;
};

/**
 * Combines the rubric, backstory/task, and the candidate's own response into
 * one plain-text block — meant to be copied out (e.g. into another AI chat
 * or a review doc), not rendered as-is.
 */
export function buildExportText(config: JiraCommentConfig, result: JiraCommentResult): string {
  const { scenario } = config;
  const story = scenario.story.join("\n\n");
  const task = scenario.task.map((t) => `- ${t}`).join("\n");

  return [
    "EVALUATION RUBRIC",
    "==================",
    result.rubric,
    "",
    "",
    "BACKSTORY",
    "==================",
    `Role: ${scenario.role}`,
    `Ticket: ${scenario.ticket}`,
    `Writing to: ${scenario.recipient}`,
    "",
    story,
    "",
    "Required in the response:",
    task,
    "",
    "",
    "CANDIDATE'S RESPONSE",
    "==================",
    result.response || "(blank)",
  ].join("\n");
}
