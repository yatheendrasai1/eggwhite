import type { TestId } from "@/lib/models/Attempt";
import { isMcqPair } from "@/lib/tests/mcqPairConfigs";
import { isTranslationTest } from "@/lib/tests/translationConfigs";
import { isJiraCommentTest } from "@/lib/tests/jiraCommentConfigs";
import { isRightOrWrongTest } from "@/lib/tests/rightOrWrongConfigs";
import { isShrinkItTest } from "@/lib/tests/shrinkItConfigs";

export type TestMeta = {
  id: TestId;
  slug: string;
  href: string;
  title: string;
  desc: string;
  meta: string;
  tag: string;
  kind: "v" | "o" | "g" | "t" | "p";
  total: number;
  /** Archived tests are dropped from the main list and the leaderboard,
   *  but stay playable — reachable from the archive nav. */
  archived?: boolean;
};

export const TESTS: TestMeta[] = [
  {
    id: "english-level",
    slug: "english-level",
    href: "/tests/english-level",
    title: "Know Your English - Part 1",
    desc: "Vocabulary and grammar across 60 questions. Answer with a confidence rating and get a CEFR level (A2–C2) at the end.",
    meta: "60 questions",
    tag: "Vocabulary & Grammar",
    kind: "v",
    total: 60,
    archived: true,
  },
  {
    id: "business-english",
    slug: "business-english",
    href: "/tests/business-english",
    title: "Know Your English - Part 2",
    desc: "Two parts: catch and fix the wrong phrases in three workplace emails, then 20 corporate vocabulary questions. Harder than the level test.",
    meta: "Editing + 20 words · Round 2",
    tag: "Corporate English",
    kind: "o",
    total: 20,
    archived: true,
  },
  {
    id: "preposition-party",
    slug: "preposition-party",
    href: "/tests/preposition-party",
    title: "The Preposition Party!",
    desc: "Complete real corporate phrases from emails and meetings, then choose the right preposition in common collocations. Covers the classic “look forward to seeing” trap.",
    meta: "32 items · Round 3",
    tag: "Grammar Drill",
    kind: "g",
    total: 32,
    archived: true,
  },
  {
    id: "tension",
    slug: "tension",
    href: "/tests/tension",
    title: "‘Tense’ion in the Air",
    desc: "Present perfect or simple past? Will or going to? Fix the tense in real workplace sentences, then choose the right form in context.",
    meta: "32 items · Round 4",
    tag: "Grammar Drill",
    kind: "t",
    total: 32,
    archived: true,
  },
  {
    id: "tension-2",
    slug: "tension-2",
    href: "/tests/tension-2",
    title: "‘Tense’ion in the Air — Part 2",
    desc: "Four trickier patterns Part 1 didn't touch: duration before a past point, action in progress at a future moment, modal perfects (should have, must have, could have…), and the one rule that never takes \"will\" — time clauses.",
    meta: "32 items · Round 6",
    tag: "Grammar Drill",
    kind: "t",
    total: 32,
    archived: true,
  },
  {
    id: "articles",
    slug: "articles",
    href: "/tests/articles",
    title: "The Article of the Matter",
    desc: "Hindi and Telugu don't have articles at all — which is exactly why \"a,\" \"an,\" \"the,\" and no article are the single most common daily slip in Indian English. The rules are tight. This drill locks them in.",
    meta: "32 items · Round 7",
    tag: "Grammar Drill",
    kind: "g",
    total: 32,
    archived: true,
  },
  {
    id: "corporate-confusion",
    slug: "corporate-confusion",
    href: "/tests/corporate-confusion",
    title: "The Corporate Confusion",
    desc: "\"Revert back,\" \"discuss about,\" \"kindly do the needful\" — the padded phrases that instantly flag an email as non-native. Plus the word pairs that look alike, sound alike, and get swapped constantly: affect/effect, its/it's, loose/lose.",
    meta: "30 items · Round 8",
    tag: "Corporate English",
    kind: "g",
    total: 30,
    archived: true,
  },
  {
    id: "incorrectly-correct",
    slug: "incorrectly-correct",
    href: "/tests/incorrectly-correct",
    title: "The Incorrectly Correct Things",
    desc: "Two habits that sound fine in your head but aren't: putting stative verbs like \"know\" and \"want\" into the continuous (\"I am knowing\"), and pairing the wrong verb with a fixed noun (\"do a mistake\" instead of \"make a mistake\").",
    meta: "25 items · Round 9",
    tag: "Grammar & Vocabulary",
    kind: "t",
    total: 25,
    archived: true,
  },
  {
    id: "translation-drama-v1",
    slug: "translation-drama-v1",
    href: "/tests/translation-drama-v1",
    title: "The Translation Drama",
    desc: "15 everyday lines in Telugu, Tinglish, and Hinglish. Translate each into English — graded by AI on meaning, not exact wording.",
    meta: "15 items · AI-graded",
    tag: "Pro · Translation",
    kind: "p",
    total: 15,
  },
  {
    id: "framing-the-situation",
    slug: "framing-the-situation",
    href: "/tests/framing-the-situation",
    title: "Framing the Situation",
    desc: "Read a real workplace scenario and write the Jira comment it calls for — graded by AI on tense, structure, prepositions, and clarity.",
    meta: "1 written response · AI-graded",
    tag: "Pro · Writing",
    kind: "p",
    total: 1,
  },
  {
    id: "right-or-wrong",
    slug: "right-or-wrong",
    href: "/tests/right-or-wrong",
    title: "Right or Wrong",
    desc: "20 workplace phrases — some clean, some broken. Call it, then back up your catches with a reason and a fix for a bonus point.",
    meta: "20 items · AI-graded bonus",
    tag: "Pro · Right or Wrong",
    kind: "p",
    total: 20,
  },
  {
    id: "shrink-it",
    slug: "shrink-it",
    href: "/tests/shrink-it",
    title: "Shrink It!",
    desc: "5 sentences to compress without losing the meaning, then 10 words to swap for their plain-English twin.",
    meta: "5 free-text + 10 MCQ · AI-graded",
    tag: "Pro · Editing",
    kind: "p",
    total: 15,
  },
  {
    id: "jargons-idioms",
    slug: "jargons-idioms",
    href: "/tests/jargons-idioms",
    title: "Jargons & Idioms",
    desc: "20 corporate idioms and jargon terms — pick the right one for a workplace situation, then decode one you're hearing for the first time from context.",
    meta: "20 items",
    tag: "Pro · Idioms",
    kind: "p",
    total: 20,
  },
];

export const byId = (id: string) => TESTS.find((t) => t.id === id);
export const bySlug = (slug: string) => TESTS.find((t) => t.slug === slug);

/** Non-archived tests — shown on the main list and counted on the leaderboard. */
export const ACTIVE_TESTS = TESTS.filter((t) => !t.archived);
/** Archived tests — reachable from the archive nav, playable, but leaderboard-exempt. */
export const ARCHIVED_TESTS = TESTS.filter((t) => t.archived);

export function emptyAnswers(testId: TestId): unknown {
  if (testId === "english-level") return {};
  if (testId === "business-english") return { flagged: {}, picks: {} };
  if (isMcqPair(testId)) return { picks1: {}, picks2: {} };
  if (isTranslationTest(testId)) return { fills: {} };
  if (isJiraCommentTest(testId)) return { response: "" };
  if (isRightOrWrongTest(testId)) return { verdicts: {}, issues: {}, fixes: {} };
  if (isShrinkItTest(testId)) return { shrinks: {}, picks: {} };
  return { fills: {}, picks: {} };
}
