/* =========================================================================
   Generic "drill" test — Part I fill-in-the-blank + Part II multiple choice.
   Shared by The Preposition Party and 'Tense'ion in the Air.
   ========================================================================= */

export type DrillFill = {
  before: string;
  verb: string;
  after: string;
  /** first entry is shown as the model answer */
  accept: string[];
  why: string;
  hintExtra?: string;
  group?: string;
};

export type DrillMcq = {
  sentence: string; // contains "___"
  options: string[];
  correct: number;
  why: string;
  group?: string;
};

export type DrillBand = { max: number; code: string; name: string; desc: string };

export type DrillTile = { label: string; score: number; total: number };

export type DrillConfig = {
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
  part1: { title: string; note: string; fills: DrillFill[] };
  part2: { title: string; note: string; mcq: DrillMcq[] };
  bands: DrillBand[];
  ladder: [string, string][];
  ladderEnds: [string, string];
  /** how to split the score into the two result tiles */
  tiles:
    | { kind: "part"; labels: [string, string] }
    | { kind: "group"; groups: [string, string]; labels: [string, string] };
  footNote: string;
};

export type DrillAnswers = {
  fills: Record<string, string>;
  picks: Record<string, number>;
};

export function normDrill(s: string): string {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[.,;:!?]+$/, "");
}

export function countDoneDrill(answers: DrillAnswers): number {
  const fills = answers.fills ?? {};
  const picks = answers.picks ?? {};
  const filled = Object.keys(fills).filter((k) => (fills[k] || "").trim()).length;
  return filled + Object.keys(picks).length;
}

export const DRILL_TOTAL = 32;

export type DrillFillRow = {
  n: number;
  before: string;
  after: string;
  model: string;
  yours: string;
  ok: boolean;
  why: string;
  group?: string;
};
export type DrillMcqRow = {
  n: number;
  sentence: string;
  correctText: string;
  yoursText: string | null;
  ok: boolean;
  why: string;
  group?: string;
};

export type DrillResult = {
  total: number;
  pct: number;
  band: DrillBand;
  bandIdx: number;
  fScore: number;
  mScore: number;
  fillRows: DrillFillRow[];
  mcqRows: DrillMcqRow[];
  tiles: [DrillTile, DrillTile];
  summaryLine: string;
};

export function scoreDrill(config: DrillConfig, answers: DrillAnswers): DrillResult {
  const fills = answers.fills ?? {};
  const picks = answers.picks ?? {};

  const fillRows: DrillFillRow[] = config.part1.fills.map((f, i) => {
    const yours = fills[i] ?? "";
    const ok = f.accept.some((a) => normDrill(yours) === normDrill(a));
    return {
      n: i + 1,
      before: f.before,
      after: f.after,
      model: f.accept[0],
      yours,
      ok,
      why: f.why,
      group: f.group,
    };
  });

  const mcqRows: DrillMcqRow[] = config.part2.mcq.map((m, i) => {
    const chosen = picks[i];
    const ok = chosen === m.correct;
    return {
      n: i + 1,
      sentence: m.sentence,
      correctText: m.options[m.correct],
      yoursText: chosen == null ? null : m.options[chosen],
      ok,
      why: m.why,
      group: m.group,
    };
  });

  const fScore = fillRows.filter((r) => r.ok).length;
  const mScore = mcqRows.filter((r) => r.ok).length;
  const total = fScore + mScore;
  const pct = (total / DRILL_TOTAL) * 100;
  const band =
    config.bands.find((b) => pct <= b.max) ?? config.bands[config.bands.length - 1];
  const bandIdx = config.bands.indexOf(band);

  let tiles: [DrillTile, DrillTile];
  if (config.tiles.kind === "part") {
    tiles = [
      { label: config.tiles.labels[0], score: fScore, total: config.part1.fills.length },
      { label: config.tiles.labels[1], score: mScore, total: config.part2.mcq.length },
    ];
  } else {
    const all = [...fillRows, ...mcqRows];
    const [gA, gB] = config.tiles.groups;
    const rowsA = all.filter((r) => r.group === gA);
    const rowsB = all.filter((r) => r.group === gB);
    tiles = [
      {
        label: config.tiles.labels[0],
        score: rowsA.filter((r) => r.ok).length,
        total: rowsA.length,
      },
      {
        label: config.tiles.labels[1],
        score: rowsB.filter((r) => r.ok).length,
        total: rowsB.length,
      },
    ];
  }

  return {
    total,
    pct,
    band,
    bandIdx,
    fScore,
    mScore,
    fillRows,
    mcqRows,
    tiles,
    summaryLine: `${band.code} · ${total}/32`,
  };
}
