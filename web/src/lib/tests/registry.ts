import type { TestId } from "@/lib/models/Attempt";

export type TestMeta = {
  id: TestId;
  slug: string;
  href: string;
  title: string;
  desc: string;
  meta: string;
  tag: string;
  kind: "v" | "o";
  total: number;
};

export const TESTS: TestMeta[] = [
  {
    id: "english-level",
    slug: "english-level",
    href: "/tests/english-level",
    title: "English Level Test",
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
    title: "Business English Test",
    desc: "Two parts: catch and fix the wrong phrases in three workplace emails, then 20 corporate vocabulary questions. Harder than the level test.",
    meta: "Editing + 20 words · Round 2",
    tag: "Corporate English",
    kind: "o",
    total: 20,
  },
];

export const byId = (id: string) => TESTS.find((t) => t.id === id);
export const bySlug = (slug: string) => TESTS.find((t) => t.slug === slug);
