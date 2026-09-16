/* =========================================================================
   Server-only Gemini grading for the "write a Jira comment" test. Kept
   separate from jiraComment.ts (client-safe types) so client components
   never pull in the Gemini client or the Mongo-backed prompt lookup.
   ========================================================================= */

import { callGemini } from "@/lib/gemini";
import { getPromptTemplate } from "@/lib/prompts";
import type {
  JiraCommentConfig,
  JiraCommentAnswers,
  JiraCommentResult,
  JiraCommentSuggestion,
} from "@/lib/tests/jiraComment";

/** Raw shape we instruct Gemini to return — validated before use. */
type GeminiCategoryGrade = { score: number; justification: string };
type GeminiJiraGrade = {
  categories: Record<string, GeminiCategoryGrade>;
  suggestions: unknown[];
};

function isCategoryGrade(v: unknown): v is GeminiCategoryGrade {
  if (!v || typeof v !== "object") return false;
  const g = v as Record<string, unknown>;
  return typeof g.score === "number" && typeof g.justification === "string";
}

function isSuggestion(v: unknown): v is JiraCommentSuggestion {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return typeof s.quote === "string" && typeof s.fix === "string";
}

function buildPrompt(
  template: string,
  config: JiraCommentConfig,
  response: string
): string {
  const categoryKeys = config.categories.map((c) => `"${c.key}"`).join(", ");
  const shape = config.categories
    .map((c) => `"${c.key}": {"score": 0, "justification": "one-line justification"}`)
    .join(", ");

  return `${template}

## Candidate's response

"""
${response.trim() || "(blank — no response submitted)"}
"""

Respond with JSON only, matching this exact shape:
{"categories": {${shape}}, "suggestions": [{"quote": "exact phrase from the response", "fix": "corrected version"}]}

Use exactly these category keys: ${categoryKeys}. Each category's "score" must be an integer between 0 and its maximum for that category (Tense Usage 0-30, Sentence Framing/Structure 0-25, Prepositions & Word Usage 0-20, Clarity & Understandability 0-15, Task Coverage 0-10). "suggestions" is an array of 0 to 3 objects, each quoting an exact phrase from the response and offering a corrected version — omit it (empty array) if the response has nothing worth flagging.`;
}

/**
 * Grades one response in a single Gemini call. Throws if Gemini's response
 * can't be parsed/validated — callers should let that fail the
 * attempt-completion request rather than silently score as zero.
 */
export async function evaluateJiraComment(
  config: JiraCommentConfig,
  answers: JiraCommentAnswers
): Promise<JiraCommentResult> {
  const response = answers.response ?? "";
  const template = await getPromptTemplate(config.promptKey);
  const prompt = buildPrompt(template, config, response);
  const raw = await callGemini(prompt);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini returned invalid JSON for Jira comment grading");
  }

  const grade = parsed as Partial<GeminiJiraGrade>;
  if (!grade || typeof grade.categories !== "object" || grade.categories === null) {
    throw new Error("Gemini grading response has the wrong shape");
  }

  const categories = config.categories.map((def) => {
    const g = (grade.categories as Record<string, unknown>)[def.key];
    if (!isCategoryGrade(g)) {
      throw new Error(`Gemini grading response for category "${def.key}" is malformed`);
    }
    const score = Math.max(0, Math.min(def.max, Math.round(g.score)));
    return { ...def, score, justification: g.justification };
  });

  const suggestionsRaw = Array.isArray(grade.suggestions) ? grade.suggestions : [];
  const suggestions = suggestionsRaw.filter(isSuggestion).slice(0, 3);

  const total = categories.reduce((sum, c) => sum + c.score, 0);
  const maxScore = config.categories.reduce((sum, c) => sum + c.max, 0);
  const band = config.bands.find((b) => total <= b.max) ?? config.bands[config.bands.length - 1];
  const bandIdx = config.bands.indexOf(band);

  return {
    response,
    rubric: template,
    categories,
    total,
    maxScore,
    band,
    bandIdx,
    suggestions,
    summaryLine: `${band.code} · ${total}/${maxScore}`,
  };
}
