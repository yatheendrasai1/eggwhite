/**
 * The learner's Malayalam knowledge map, transcribed from the revision
 * handbook (state as of the Oct 13 diagnostic). Update this file as rows
 * are re-tested — percentages are re-evaluated whenever later tests give
 * new evidence, never frozen at first-test values.
 */

export type RowStatus = "graduated" | "complete" | "in-progress" | "decayed" | "ahead";

export type CurriculumRow = {
  /** "1", "4.5", … */
  num: string;
  name: string;
  status: RowStatus;
  /** Measured mastery, 0–100. Absent for rows not yet tested. */
  pct?: number;
  /** Where the number comes from. */
  measured?: string;
  note?: string;
  /** Which revision-sentence block (see sentences.ts) covers this row. */
  sentenceRow?: string;
};

export const CURRICULUM: CurriculumRow[] = [
  { num: "1", name: "Being & Having", status: "complete", pct: 95, measured: "Aug 10 (backfill)", sentenceRow: "1" },
  { num: "2", name: "Asking & Owning", status: "complete", pct: 88, measured: "Aug 10 (backfill)", sentenceRow: "2" },
  { num: "3", name: "The Past", status: "complete", pct: 92, measured: "Aug 10 (backfill)", sentenceRow: "3" },
  { num: "4", name: "The Future & Wants", status: "complete", pct: 92, measured: "Aug 10 (backfill)", sentenceRow: "4" },
  { num: "4.5", name: "The Sealant", status: "complete", pct: 88, measured: "Aug 10 (backfill)", sentenceRow: "4.5" },
  { num: "5", name: "Other People", status: "complete", pct: 93, measured: "inferred, 4 consecutive tests", sentenceRow: "5" },
  { num: "6", name: "Commands & Requests", status: "complete", pct: 90, measured: "inferred, Row 7 tests", sentenceRow: "6" },
  { num: "7", name: "Describing", status: "graduated", pct: 94, measured: "Aug 10 — graduated", sentenceRow: "7" },
  {
    num: "8",
    name: "Talking to People",
    status: "in-progress",
    pct: 78,
    measured: "Aug 21 (test) · Oct 13 (diagnostic 8.5/10)",
    note: "Three sittings (22.5 → 21 → 19.5) — regressing, not graduated. Core held over the 51-day gap.",
    sentenceRow: "8",
  },
  {
    num: "9",
    name: "Ability & Obligation",
    status: "decayed",
    note: "kazhiyum, paṭṭilla, vēṇḍi — partially taught; kazhiyum/kazhiyilla decayed over the 51-day gap, needs a rebuild.",
  },
  { num: "10", name: "The Rest of the Cases", status: "ahead", note: "-il ninnu, -ōṭu, kūṭe" },
  { num: "11", name: "Joining Sentences", status: "ahead", note: "athukoṇṭu, -iṭṭu, relative clauses" },
  { num: "12", name: "Aspect", status: "ahead", note: "perfect & continuous past" },
  { num: "13", name: "Reported Speech", status: "ahead", note: "ennu, thōnnunnu" },
  { num: "14", name: "Conditionals", status: "ahead", note: "vannāl, -ppōḷ" },
  { num: "15", name: "Compression & Dialect", status: "ahead" },
  { num: "16", name: "The Script", status: "ahead", note: "Deliberately last — speaking comes first." },
];

export type SkillMeter = { label: string; pct: number; note: string };

export const NON_GRAMMAR: SkillMeter[] = [
  { label: "Vocabulary", pct: 20, note: "~130 words — survival needs ~300" },
  { label: "Listening", pct: 5, note: "Biggest risk — 10 min/day, hunting known words" },
  { label: "Speaking with humans", pct: 0, note: "Find a native speaker" },
];

export type TestSitting = {
  label: string;
  date: string;
  comparison: number;
  regular: number;
  boss: number;
  total: number;
  passed?: boolean;
};

/** Test structure: Comparison /5 · Regular /11 · Boss /9 (3 × 3) = 25. Pass ≥ 22. */
export const PASS_MARK = 22;

export const ROW_TESTS: { row: string; sittings: TestSitting[] }[] = [
  {
    row: "7",
    sittings: [
      { label: "Main test", date: "Aug 4", comparison: 4.5, regular: 8.5, boss: 5.5, total: 18.5 },
      { label: "Re-test I", date: "Aug 6", comparison: 4.0, regular: 7.5, boss: 6.5, total: 18.0 },
      { label: "Re-test II", date: "Aug 7", comparison: 4.5, regular: 8.0, boss: 7.5, total: 20.0 },
      { label: "Re-test III", date: "Aug 9", comparison: 5.0, regular: 9.0, boss: 7.5, total: 21.5 },
      { label: "Re-test IV", date: "Aug 10", comparison: 5.0, regular: 10.0, boss: 8.5, total: 23.5, passed: true },
    ],
  },
  {
    row: "8",
    sittings: [
      { label: "Main test", date: "Aug 13", comparison: 5.0, regular: 10.0, boss: 7.5, total: 22.5, passed: true },
      { label: "Re-test I", date: "Aug 20", comparison: 5.0, regular: 9.0, boss: 7.0, total: 21.0 },
      { label: "Re-test II", date: "Aug 21", comparison: 4.5, regular: 9.5, boss: 5.5, total: 19.5 },
    ],
  },
];

/** The Oct 13, 51-day diagnostic: what held, what's gone, what's shaky. */
export const LAST_DIAGNOSTIC = {
  date: "Oct 13",
  score: "8.5/10",
  held: [
    "the pronoun triangle",
    "past/future verb endings",
    "give-split (tarika vs kodukkuka)",
    "-ekkāḷ comparison",
    "address terms",
    "price -kku",
  ],
  gone: ["the uṇṭu half of uṇṭu/illa", "kaḍa (shop)", "kazhiyum / kazhiyilla"],
  shaky: ["the veeṭṭ- stem (veedu → veeṭṭ-)", "long ū in tarū"],
  discovery:
    "vāng- and -aṇam were stored as one merged chunk (vāngaṇam) — probably why -aṇam kept eroding on earlier tests.",
};

export const NEXT_ACTIONS: { title: string; detail: string }[] = [
  {
    title: "Three-gap rebuild",
    detail:
      "Short, HIT mode: (a) uṇṭu and illa as a pair, (b) kaḍa and the shop vocabulary, (c) kazhiyum/kazhiyilla from the verb up. Then a fresh Row 8 test — no thought-process notes.",
  },
  {
    title: "Drill Row 8 under sentence length",
    detail:
      "Take each already-correct isolated fix (price -kku, -um…-um, comparison markers) and hold it inside 3–4 clause sentences. Re-test on a different day, not late at night — 22/25 to graduate.",
  },
  {
    title: "Continue Row 9",
    detail: "paṭṭilla, vēṇṭi, and -aṇam's obligation sense, then test.",
  },
  { title: "Pronunciation track", detail: "ḻ (zha) is the one genuinely new sound — see the reference." },
  { title: "Listening track", detail: "10 min/day, hunting for known words." },
  { title: "Find a native speaker", detail: "Eight open questions are waiting." },
];

export type ErrorPattern = { title: string; detail: string; example?: string };

/** Ranked by persistence. Check these before answering. */
export const ERROR_PATTERNS: ErrorPattern[] = [
  {
    title: "avane / avanu / avante",
    detail:
      "All three slots get confused in both directions. Telugu check — -ni → -e, -ki → -kku, vāḍi → -nte. Clean across the last three tests, but historically the most persistent.",
    example: "Avanu paṇam uṇṭu (he has) · Avante paṇam (his) · Njān avane kaṇḍu (saw him)",
  },
  {
    title: "Prices take -kku",
    detail: "Five occurrences across four rows — the single most repeated error in the course.",
    example: "Kāppikku ethra? — not kāppi ethra?",
  },
  {
    title: "prāyamāya before a noun",
    detail: "prāyamāṇu is the predicate form; before a noun it's prāyamāya. A stray kūṭuthal keeps appearing.",
    example: "prāyamāya āḷukaḷ",
  },
  { title: "ettavum vanishing", detail: "The superlative drops out under sentence length — \"is the best\" becomes \"is good\"." },
  { title: "The -uka leak", detail: "Dictionary forms entering live sentences (tarika, vāngukayirunnu). -uka is for naming a verb only." },
  { title: "Suffix erosion under load", detail: "āyirunnu → \"āyirum\", -aṇam losing its -m, -ū collapsing." },
  { title: "Order vs feeling vs fact", detail: "kodukkaruthu / kodukkaṇṭa / kodukkilla / koduthilla." },
  { title: "The dropped -thu", detail: "On predicate adjectives.", example: "pazhayathāṇu — not pazhayāṇu" },
  { title: "tarumō / tarāmō", detail: "Level 3 politeness still soft. tarāmō (could you?) is the polite default." },
  { title: "Double question-marking", detail: "Adding -ō when a question word is already present." },
  {
    title: "Adjective collisions",
    detail: "Chant with Telugu twins.",
    example: "nalla–manchi, valiya–pedda, cheriya–chinna, puthiya–kotta, pazhaya–pata",
  },
  { title: "Kochiyil vs Keralathil", detail: "-i takes y, -am takes -th-." },
  { title: "kūṭuthal vs orupāṭu", detail: "\"more\" vs \"a lot of\". Telugu's single chāla splits in two." },
  { title: "Comparison word order", detail: "The -ekkāḷ phrase goes before the adjective, not after." },
  { title: "First answer in a batch", detail: "The least careful one. Slow down on Q1." },
  {
    title: "uṇṭu / illa as a pair",
    detail: "Found Oct 13 — illa survives, the uṇṭu half goes missing. Always say them as a pair (≈ undi / ledu).",
  },
  {
    title: "vāng- / -aṇam chunk-merging",
    detail: "Found Oct 13 — vāngaṇam stored as one lump, so -aṇam gets dropped under load. Always break it as vāng- + -aṇam.",
  },
  { title: "Long ū in tarū", detail: "Shaky on Oct 13. Keep tarū (please give) distinct from short-u forms." },
];

export const FIXED_PATTERNS: string[] = [
  "The missing āṇu — a sentence ending on a noun needs āṇu",
  "Colour modifiers — kaṟutha / veḷḷa / chuvanna now reliable",
  "The -ekkāḷ glue — y-glue vs -in- correct since Aug 7",
];

export const OPEN_QUESTIONS: string[] = [
  "vēndāyirunnu vs vēndiyirunnu — \"didn't want\" vs \"didn't need\"? Workaround: -aṇṭāyirunnu.",
  "The avaḷ / ayāḷ register line for women — how rude is avaḷ, and when?",
  "Pronunciation of ḻ (zha), gemination, dental vs retroflex.",
  "kaṟuppu kār vs kaṟutha kār — are both natural?",
  "veḷḷa vs veḷutha for white — different flavours?",
  "veedu → veeṭṭ- stem — which sandhi class, and do other -ḍu/-ṭu nouns double the same way?",
  "English loanwords + case endings (friendinte, etc.) — natural?",
  "paṭṭilla vs kazhiyilla — circumstantial flavour, or a casual synonym?",
];

export const ANCHOR_SENTENCES: { ml: string; focus: string }[] = [
  { ml: "Njān avane kaṇḍu. Avanu tannu. Avante veedu.", focus: "costumes" },
  { ml: "Avan enikku tannu, avaḷkku koduthu.", focus: "give-direction" },
  { ml: "Njān nāḷe pōkum, pakshe innu njān varām.", focus: "-um vs -ām" },
  { ml: "Onnu vellam tarāmō?", focus: "polite request" },
  { ml: "Ivide niṟtthū, chāya tarū.", focus: "commands" },
  { ml: "Ninakku samayam uṇḍō? Enikku samayam uṇṭu.", focus: "the -kku rule" },
  { ml: "Nee innale vannō? Njān nāḷe varum.", focus: "tense + question" },
  { ml: "Ā valiya veedu pazhayathāṇu.", focus: "describing" },
  { ml: "Ente veedu ninte veeṭṭinekkāḷ valuthāṇu.", focus: "comparison" },
  { ml: "Avanu paṇam uṇṭu. Avante paṇam. Njān avane kaṇḍu.", focus: "the three costumes" },
  { ml: "Ithu ettavum nalla kaḍayāṇu.", focus: "āṇu closes a noun-final sentence" },
  { ml: "Chēṭṭā, onnu vellam tarāmō?", focus: "address term + polite request" },
];

export const ACTIVITY_LOG: { date: string; activity: string; result: string }[] = [
  { date: "—", activity: "Rows 1–6 taught, drilled and tested", result: "see status" },
  { date: "Aug 4", activity: "Row 7 Parts 1 & 2 taught · Row 7 main test", result: "18.5/25" },
  { date: "Aug 6", activity: "Row 7 re-test I", result: "18/25" },
  { date: "Aug 7", activity: "Row 7 re-test II · veḷḷa correction (regrade +2)", result: "20/25" },
  { date: "Aug 8", activity: "Blocker drill · Row 8 taught — address terms, allē?, greetings", result: "drill 6/8" },
  { date: "Aug 9", activity: "Row 7 re-test III", result: "21.5/25" },
  { date: "Aug 10", activity: "Row 7 re-test IV — graduated · backfill test, Rows 1–4.5", result: "23.5/25 · 21/25" },
  { date: "Aug 13", activity: "Row 8 drills 2–4 · Row 8 main test — first sitting passed", result: "22.5/25" },
  { date: "Aug 20", activity: "Row 9 introduced (kazhiyum via HIT) · Row 8 re-test — below bar", result: "21/25" },
  { date: "Aug 21", activity: "Row 9 continued lightly · Row 8 re-test II — regression", result: "19.5/25" },
  { date: "Aug 23", activity: "Row 8 test attempted — abandoned at Q14 (unscored)", result: "—" },
  { date: "Oct 13", activity: "51-day diagnostic, with thought-process notes", result: "8.5/10" },
];
