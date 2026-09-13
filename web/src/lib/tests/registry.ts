import type { TestId } from "@/lib/models/Attempt";
import { isMcqPair } from "@/lib/tests/mcqPairConfigs";

export type TestMeta = {
  id: TestId;
  slug: string;
  href: string;
  title: string;
  desc: string;
  meta: string;
  tag: string;
  kind: "v" | "o" | "g" | "t";
  total: number;
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
  },
];

export const byId = (id: string) => TESTS.find((t) => t.id === id);
export const bySlug = (slug: string) => TESTS.find((t) => t.slug === slug);

export function emptyAnswers(testId: TestId): unknown {
  if (testId === "english-level") return {};
  if (testId === "business-english") return { flagged: {}, picks: {} };
  if (isMcqPair(testId)) return { picks1: {}, picks2: {} };
  return { fills: {}, picks: {} };
}
