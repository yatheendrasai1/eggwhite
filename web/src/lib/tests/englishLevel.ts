/* =========================================================================
   English Level Test — data + scoring (shared by client runner and API)
   ========================================================================= */

export type Confidence = "K" | "V" | "N";
export type ELAnswer = { pick: number | null; conf: Confidence | null };
export type ELAnswers = Record<string, ELAnswer>;

/** [word, options, correctIndex] */
export const VOCAB: [string, string[], number][] = [
  ["Reluctant", ["Extremely tired", "Shining brightly", "Unwilling to act", "Filled to excess"], 2],
  ["Meticulous", ["Careful with detail", "Doubtful of others", "Slow and very heavy", "Willing to deceive"], 0],
  ["Candid", ["Sweet to taste", "Nervously eager", "Brightly coloured", "Open and honest"], 3],
  ["Diligent", ["Distracted and restless", "Hardworking and careful", "Clever but untrained", "Willing to compromise"], 1],
  ["Trivial", ["Of little importance", "Occurring three times", "Difficult to resolve", "Relating to a trial"], 0],
  ["Obsolete", ["Beyond all doubt", "Rarely ever seen", "No longer in use", "Filled completely"], 2],
  ["Tenacious", ["Thin and stretched", "Sour to the smell", "Easily made angry", "Holding on firmly"], 3],
  ["Coherent", ["Sticky to the touch", "Clearly connected", "Working as a group", "Forced against will"], 1],
  ["Scrutinise", ["To condemn harshly", "To write carelessly", "To examine closely", "To avoid on purpose"], 2],
  ["Inevitable", ["Unable to be avoided", "Impossible to notice", "Not worth mentioning", "Extremely valuable"], 0],
  ["Alleviate", ["To raise up higher", "To accuse falsely", "To set someone free", "To make less severe"], 3],
  ["Nuance", ["A loud disturbance", "A slight difference", "An irritating person", "A formal statement"], 1],
  ["Complacent", ["Smugly self-satisfied", "Eager to please others", "Given to complaining", "Easily bent or shaped"], 0],
  ["Arbitrary", ["Decided by a judge", "Fair to every side", "At regular intervals", "Chosen without reason"], 3],
  ["Prudent", ["Excessively proud", "Physically powerful", "Careful and sensible", "Strict about rules"], 2],
  ["Tangible", ["Twisted together", "Able to be touched", "Bitter to the taste", "Ready for purchase"], 1],
  ["Plausible", ["Deserving applause", "Able to be shaped", "Open to the public", "Seemingly reasonable"], 3],
  ["Rhetoric", ["Skill in persuasion", "A repeated failure", "A formal apology", "A rhythm in music"], 0],
  ["Superfluous", ["Flowing very fast", "Deeply impressive", "More than needed", "Floating on top"], 2],
  ["Sycophant", ["A tropical creeper", "A servile flatterer", "A mental therapist", "A wind instrument"], 1],
  ["Ubiquitous", ["Found everywhere", "Rarely ever found", "Highly poisonous", "Easily broken up"], 0],
  ["Innocuous", ["Newly invented", "Easily catching", "Extremely loud", "Causing no harm"], 3],
  ["Astute", ["Very steep and high", "Shrewd and perceptive", "Bitterly cold and raw", "Relating to the stars"], 1],
  ["Ephemeral", ["Relating to the sky", "Deeply emotional", "Lasting a short time", "Made up of layers"], 2],
  ["Salient", ["Salty and briny", "Silent and swift", "Suddenly jumping", "Most noticeable"], 3],
  ["Tacit", ["Silently understood", "Rude and tactless", "Sticky to handle", "Done in slow stages"], 0],
  ["Tenuous", ["Lasting ten years", "Held under tension", "Slight and flimsy", "Stubborn and firm"], 2],
  ["Esoteric", ["Extremely ancient", "Known to only a few", "Strangely beautiful", "Relating to nature"], 1],
  ["Perfunctory", ["Working flawlessly", "Perfectly well timed", "Full of small holes", "Done without care"], 3],
  ["Sanguine", ["Relating to blood", "Deeply resentful", "Cheerfully hopeful", "Smoothly flowing"], 2],
];

/** [stem, options, correctIndex, isErrorQuestion(0|1)] */
export const GRAM: [string, string[], number, number][] = [
  ["I ___ at this company since 2019.", ["have been working", "am working", "work", "worked"], 0, 0],
  ["He's been married ___ Sarah for ten years.", ["with", "by", "to", "for"], 2, 0],
  ["Each of the students ___ submitted the assignment.", ["have", "were", "are", "has"], 3, 0],
  ["The information you sent me ___ very helpful.", ["were", "was", "are", "have been"], 1, 0],
  ["Despite of the heavy rain, we went ahead with the picnic.", ["Despite of", "the heavy rain", "we went ahead", "No error"], 0, 1],
  ["If she ___ the email, she would have known about the meeting.", ["read", "would read", "had read", "has read"], 2, 0],
  ["By the time we arrived, the film ___ already ___.", ["has / started", "was / starting", "did / start", "had / started"], 3, 0],
  ["She suggested ___ the meeting until Monday.", ["to postpone", "postponing", "postpone", "that we postponing"], 1, 0],
  ["I am working here since three years.", ["I am working", "here", "since three years", "No error"], 2, 1],
  ["Neither the manager nor the employees ___ aware of the change.", ["was", "were", "is", "has been"], 1, 0],
  ["He has been working there ___ five years.", ["since", "from", "for", "during"], 2, 0],
  ["When I got to the station, I realised I ___ my wallet at home.", ["had left", "left", "have left", "was leaving"], 0, 0],
  ["She ___ here for six months before she was promoted.", ["had worked", "was working", "has been working", "had been working"], 3, 0],
  ["I ___ him tomorrow at three.", ["meet", "am meeting", "would meet", "will have met"], 1, 0],
  ["He told that he would be late for the meeting.", ["He told", "that he would", "be late", "No error"], 0, 1],
  ["By next June, I ___ in this role for five years.", ["will be", "would have been", "will have been", "am"], 2, 0],
  ["The report ___ by the team last week.", ["completed", "is completing", "has completed", "was completed"], 3, 0],
  ["She asked me where ___.", ["did I live", "I lived", "do I live", "have I lived"], 1, 0],
  ["___ harder, he would have passed the exam.", ["If he studied", "If he studies", "Had he studied", "He had studied"], 2, 0],
  ["He denied ___ the money.", ["taking", "to take", "take", "that he taking"], 0, 0],
  ["Can you tell me what time ___?", ["does the train leave", "is the train leaving", "the train leaves", "leaves the train"], 2, 0],
  ["I ___ to Japan three times.", ["went", "was going", "had gone", "have been"], 3, 0],
  ["She is one of those people who always arrive early.", ["one of those", "who always", "arrive early", "No error"], 3, 1],
  ["It's high time we ___ about this problem.", ["do something", "did something", "will do something", "doing something"], 1, 0],
  ["I wish I ___ more time to finish the project.", ["have", "would have", "had", "am having"], 2, 0],
  ["She ___ living in Delhi for two years when the pandemic started.", ["had been", "was", "has been", "is"], 0, 0],
  ["He avoided ___ eye contact throughout the interview.", ["to make", "make", "made", "making"], 3, 0],
  ["Hardly I had finished my lunch when the phone rang.", ["Hardly I had finished", "my lunch", "when the phone rang", "No error"], 0, 1],
  ["Supposing you ___ the lottery, what would you do?", ["win", "won", "have won", "will win"], 1, 0],
  ["I'd rather you ___ that to anyone.", ["didn't mention", "don't mention", "won't mention", "not mentioning"], 0, 0],
];

export const TOTAL_QUESTIONS = VOCAB.length + GRAM.length; // 60

export const BANDS = [
  { max: 17, code: "A2", name: "Elementary or below", seg: 1, desc: "Simple, familiar exchanges. The foundation is still being built — focus on the 1,000 most frequent words and basic tense forms." },
  { max: 34, code: "B1", name: "Intermediate", seg: 2, desc: "You handle everyday situations and describe experiences, but longer or more formal texts still slow you down." },
  { max: 54, code: "B2", name: "Upper Intermediate", seg: 3, desc: "You read news and non-fiction comfortably and can work in English without much strain. This is where most fluent non-native professionals sit." },
  { max: 69, code: "B2+", name: "Upper Intermediate, approaching C1", seg: 3, desc: "Strong, dependable English with visible reach into advanced territory. What separates you from C1 is formal Latinate vocabulary and precision in complex structures." },
  { max: 84, code: "C1", name: "Advanced", seg: 4, desc: "You read literature and academic writing with ease, catch implicit meaning, and shift register at will." },
  { max: 100, code: "C2", name: "Mastery", seg: 5, desc: "Near-native precision, including idiom, connotation and nuance in unfamiliar subject areas." },
] as const;

export const LADDER: [string, string, string][] = [
  ["A1", "Beginner", "Basic phrases, introductions, immediate needs. Around 500–1,000 words."],
  ["A2", "Elementary", "Simple routine exchanges on familiar topics. Around 1,500–2,500 words."],
  ["B1", "Intermediate", "Handles travel and daily situations, describes experiences. Around 2,500–3,500 words."],
  ["B2", "Upper Intermediate", "Reads newspapers and non-fiction, argues a viewpoint, works professionally in English. Around 4,000–6,000 words."],
  ["C1", "Advanced", "Reads literature and academic writing with ease, catches implicit meaning. Around 8,000–10,000 words."],
  ["C2", "Mastery", "Near-native precision in idiom, connotation and nuance. 12,000+ words."],
];

export type ScoreKind = "1" | "h" | "0" | "n";

function scoreOne(a: ELAnswer | undefined, ans: number): { p: number; k: ScoreKind } {
  if (!a || a.conf === "N" || a.pick === null) return { p: 0, k: "n" };
  if (a.pick !== ans) return { p: 0, k: "0" };
  return a.conf === "K" ? { p: 1, k: "1" } : { p: 0.5, k: "h" };
}

export function isAnswered(a: ELAnswer | undefined): boolean {
  if (!a) return false;
  return a.conf === "N" || (a.pick !== null && (a.conf === "K" || a.conf === "V"));
}

export function countDone(answers: ELAnswers): number {
  let n = 0;
  for (let i = 0; i < VOCAB.length; i++) if (isAnswered(answers["v" + i])) n++;
  for (let i = 0; i < GRAM.length; i++) if (isAnswered(answers["g" + i])) n++;
  return n;
}

export type ELReviewRow = { n: number; q: string; correct: string; kind: ScoreKind };

export type ELResult = {
  total: number;
  pct: number;
  vs: number;
  gs: number;
  band: (typeof BANDS)[number];
  vocabReview: ELReviewRow[];
  gramReview: ELReviewRow[];
  summaryLine: string;
};

export function fmt(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

export function scoreEnglishLevel(answers: ELAnswers): ELResult {
  let vs = 0;
  let gs = 0;
  const vocabReview: ELReviewRow[] = [];
  const gramReview: ELReviewRow[] = [];

  VOCAB.forEach((it, i) => {
    const r = scoreOne(answers["v" + i], it[2]);
    vs += r.p;
    vocabReview.push({ n: i + 1, q: it[0], correct: it[1][it[2]], kind: r.k });
  });
  GRAM.forEach((it, i) => {
    const r = scoreOne(answers["g" + i], it[2]);
    gs += r.p;
    const label = it[3] === 1 ? "Error: " + it[0] : it[0];
    gramReview.push({ n: i + 31, q: label, correct: it[1][it[2]], kind: r.k });
  });

  const total = vs + gs;
  const pct = (total / TOTAL_QUESTIONS) * 100;
  const band = BANDS.find((b) => pct <= b.max) ?? BANDS[BANDS.length - 1];

  return {
    total,
    pct,
    vs,
    gs,
    band,
    vocabReview,
    gramReview,
    summaryLine: `${band.code} · ${fmt(total)}/60`,
  };
}
