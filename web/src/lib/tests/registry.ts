import type { TestId } from "@/lib/models/Attempt";

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
];

export const byId = (id: string) => TESTS.find((t) => t.id === id);
export const bySlug = (slug: string) => TESTS.find((t) => t.slug === slug);

export function emptyAnswers(testId: TestId): unknown {
  if (testId === "english-level") return {};
  if (testId === "business-english") return { flagged: {}, picks: {} };
  return { fills: {}, picks: {} };
}
