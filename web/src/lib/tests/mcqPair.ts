/* =========================================================================
   Generic "MCQ pair" test — two multiple-choice parts (Part I / Part II).
   Shared by The Article of the Matter, The Corporate Confusion, and
   The Incorrectly Correct Things. Unlike the "drill" engine, neither part
   collects free text — both are 4-option picks.
   ========================================================================= */

import type { DrillBand, DrillTile } from "@/lib/tests/drill";

export type McqItem = {
  /** May contain "___" for an inline blank; if empty, options are full standalone sentences. */
  sentence?: string;
  /** Optional short hint shown under the question, e.g. "Verb: know". */
  hint?: string;
  options: string[];
  correct: number;
  why: string;
};

export type McqPairConfig = {
  id: string;
  slug: string;
  href: string;
  accent: "steel" | "rose";
  eyebrow: string;
  titleLead: string;
  titleEm: string;
  titleTail: string;
  lede: string;
  howto: string[]; // each entry may contain <b>…</b>
  part1: { title: string; note: string; items: McqItem[] };
  part2: { title: string; note: string; items: McqItem[] };
  bands: DrillBand[];
  ladder: [string, string][];
  ladderEnds: [string, string];
  tiles: { labels: [string, string] };
  footNote: string;
};

export type McqPairAnswers = {
  picks1: Record<string, number>;
  picks2: Record<string, number>;
};

export function countDoneMcqPair(answers: McqPairAnswers): number {
  const p1 = answers.picks1 ?? {};
  const p2 = answers.picks2 ?? {};
  return Object.keys(p1).length + Object.keys(p2).length;
}

export function totalMcqPair(config: McqPairConfig): number {
  return config.part1.items.length + config.part2.items.length;
}

export type McqPairRow = {
  n: number;
  sentence?: string;
  hint?: string;
  correctText: string;
  yoursText: string | null;
  ok: boolean;
  why: string;
};

export type McqPairResult = {
  total: number;
  pct: number;
  band: DrillBand;
  bandIdx: number;
  s1: number;
  s2: number;
  rows1: McqPairRow[];
  rows2: McqPairRow[];
  tiles: [DrillTile, DrillTile];
  summaryLine: string;
};

function scorePart(items: McqItem[], picks: Record<string, number>): McqPairRow[] {
  return items.map((it, i) => {
    const chosen = picks[i];
    const ok = chosen === it.correct;
    return {
      n: i + 1,
      sentence: it.sentence,
      hint: it.hint,
      correctText: it.options[it.correct],
      yoursText: chosen == null ? null : it.options[chosen],
      ok,
      why: it.why,
    };
  });
}

export function scoreMcqPair(config: McqPairConfig, answers: McqPairAnswers): McqPairResult {
  const picks1 = answers.picks1 ?? {};
  const picks2 = answers.picks2 ?? {};

  const rows1 = scorePart(config.part1.items, picks1);
  const rows2 = scorePart(config.part2.items, picks2);

  const s1 = rows1.filter((r) => r.ok).length;
  const s2 = rows2.filter((r) => r.ok).length;
  const total = s1 + s2;
  const grandTotal = totalMcqPair(config);
  const pct = (total / grandTotal) * 100;
  const band = config.bands.find((b) => pct <= b.max) ?? config.bands[config.bands.length - 1];
  const bandIdx = config.bands.indexOf(band);

  const tiles: [DrillTile, DrillTile] = [
    { label: config.tiles.labels[0], score: s1, total: rows1.length },
    { label: config.tiles.labels[1], score: s2, total: rows2.length },
  ];

  return {
    total,
    pct,
    band,
    bandIdx,
    s1,
    s2,
    rows1,
    rows2,
    tiles,
    summaryLine: `${band.code} · ${total}/${grandTotal}`,
  };
}
