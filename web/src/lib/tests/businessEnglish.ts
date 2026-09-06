/* =========================================================================
   Business English Test — data + scoring (shared by client runner and API)
   ========================================================================= */

export type ErrSeg = { t: string; fix: string[]; near?: string[]; why: string };
export type MailSeg = string | ErrSeg;
export type Mail = { from: string; to: string; subj: string; body: MailSeg[] };

const E = (t: string, fix: string[], near: string[], why: string): ErrSeg => ({ t, fix, near, why });

export const MAILS: Mail[] = [
  {
    from: "Arun Nagarajan",
    to: "Priya (Engineering Manager)",
    subj: "Payment module — status",
    body: [
      "Hi Priya,\n\n",
      "I ",
      E(
        "am working",
        ["have been working", "have been", "i have been working", "have worked", "have been working on it"],
        ["worked", "was working", "am having worked", "have working"],
        "“Three weeks” measures a stretch of time reaching up to now, so this needs the present perfect continuous."
      ),
      " on the payment module ",
      E(
        "since three weeks",
        ["for three weeks", "for the last three weeks", "for the past three weeks", "over the last three weeks", "for 3 weeks", "for three weeks now", "these three weeks"],
        ["since three weeks ago", "since the last three weeks", "from three weeks"],
        "“Since” takes a starting point — since 3 March. A length of time takes “for”."
      ),
      ", and ",
      E(
        "I have completed",
        ["i completed", "i finished", "completed", "finished", "i wrapped up", "i closed out"],
        ["i had completed", "i have finished", "i complete", "i was completing"],
        "“Yesterday” is finished past time, so it takes the simple past. The present perfect cannot sit with a specific past time."
      ),
      " the integration part ",
      "yesterday.\n\n",
      E(
        "Myself and Karthik",
        ["karthik and i", "karthik and i have", "i and karthik"],
        ["karthik and me", "me and karthik", "karthik and myself", "myself and karthik have"],
        "“Myself” cannot be a subject. Use “I” — and convention puts the other person first."
      ),
      " ",
      E(
        "has tested",
        ["have tested", "tested", "have both tested", "have already tested"],
        ["have been testing", "are testing", "had tested", "have test"],
        "Two people are the subject, so the verb is plural."
      ),
      " it on staging ",
      "and the results look fine.\n\n",
      "There is ",
      E(
        "one doubt",
        ["one question", "a question", "question", "one query", "a query", "query", "one clarification", "a clarification", "one thing"],
        ["some doubt", "a small doubt", "one confusion"],
        "In English a doubt is disbelief in something. A thing you want explained is a question."
      ),
      " regarding the refund flow — ",
      E(
        "kindly clarify the same",
        ["please clarify", "could you clarify", "please clarify this", "can you clarify", "could you please clarify", "please could you clarify", "please clarify it", "would you clarify", "please explain", "could you explain", "please advise", "can you explain"],
        ["kindly clarify", "please clarify the same", "clarify", "please clarify same"],
        "“Kindly … the same” is dated officialese. Plain “could you clarify” is what a colleague would write."
      ),
      ".\n\n",
      "Also, ",
      E(
        "I will revert back to you",
        ["i will get back to you", "i'll get back to you", "i will get back", "i'll get back", "i will follow up", "i'll follow up", "i will come back to you", "i will reply", "i will send it", "i will share it", "i'll come back to you"],
        ["i will revert to you", "i will revert", "i'll revert", "i will revert back", "i will get back to you soon"],
        "“Revert” means return to an earlier state, and “revert back” doubles it. Say “get back to you”."
      ),
      " with the final estimate ",
      "by tomorrow EOD.\n\n",
      "Regards,\nArun",
    ],
  },
  {
    from: "Meera Iyer",
    to: "David Chen (Client)",
    subj: "Revised proposal",
    body: [
      "Dear Mr Chen,\n\n",
      "Thank you for your email. ",
      E(
        "Please find attached herewith",
        ["please find attached", "i have attached", "i've attached", "attached is", "i am attaching", "i'm attaching", "please find the attached", "please see attached", "see attached", "i attach", "attached please find", "here is"],
        ["find attached", "please find enclosed", "attached herewith", "please find attached the"],
        "“Herewith” repeats what “attached” already says. One or the other — and “I've attached” is warmer than both."
      ),
      " the revised proposal ",
      E(
        "for your kind perusal",
        ["for your review", "for review", "to review", "for your reference", "for your consideration", "for your comments", "for your feedback", "for you to review", "for your input"],
        ["for your kind review", "for perusal", "for your perusal", "for your kind reference"],
        "Ornamental officialese. “For your review” is the modern equivalent."
      ),
      ".\n\n",
      "As discussed, we can ",
      E(
        "prepone",
        ["move up", "bring forward", "move forward", "advance", "bring it forward", "move it up", "move earlier", "pull forward", "reschedule earlier", "bring it earlier", "move it forward"],
        ["shift", "move", "bring", "preone", "reschedule"],
        "“Prepone” is Indian English and will not be understood outside South Asia. Use “move up” or “bring forward”."
      ),
      " the kickoff to next Tuesday ",
      E(
        "if the same is convenient",
        ["if that works", "if that is convenient", "if that suits you", "if this works", "if that works for you", "if this is convenient", "if that suits", "if it is convenient", "if that is suitable", "if you are available", "if that is okay"],
        ["if the same works", "if convenient", "if same is convenient", "if it suits"],
        "“The same” standing in for a noun is legal drafting, not correspondence. Just say “that”."
      ),
      " for you.\n\n",
      "Our team has already started ",
      "the discovery work, ",
      "and we are confident of delivering ",
      E(
        "more better",
        ["better", "much better", "far better", "significantly better", "considerably better"],
        ["more good", "most better", "best", "more improved"],
        "“Better” is already the comparative form. Adding “more” doubles it."
      ),
      " results than the previous vendor.\n\n",
      E(
        "Kindly do the needful",
        ["please confirm", "please go ahead", "please arrange this", "please proceed", "please let us know", "please take this forward", "could you confirm", "please action this", "please review and confirm", "please advise"],
        ["kindly confirm", "do the needful", "please do this", "please do the needful", "kindly proceed"],
        "Opaque outside India, and it never states what you actually want done. Say the action."
      ),
      " and confirm.\n\n",
      "Best regards,\nMeera",
    ],
  },
  {
    from: "Rohit Desai",
    to: "#platform-team",
    subj: "Production build failure",
    body: [
      "Team,\n\n",
      E(
        "Yesterday night",
        ["last night", "late last night", "overnight"],
        ["yesterday evening", "last evening", "yesterday at night", "the last night"],
        "English has “last night”, not “yesterday night”."
      ),
      " the build failed on production. ",
      E(
        "I have informed",
        ["i informed", "i told", "i notified", "i alerted", "i flagged it to", "i raised it with", "informed", "i pinged"],
        ["i had informed", "i have told", "i have notified", "i was informing"],
        "A specific finished time — 11 PM — takes the simple past."
      ),
      " ",
      E(
        "the same to DevOps",
        ["devops", "the devops team", "them", "this to devops", "it to devops", "devops team", "the issue to devops"],
        ["the devops", "same to devops", "this to the devops"],
        "“The same” as a pronoun is officialese. Name the thing, or drop it."
      ),
      " at 11 PM, ",
      "but nobody responded.\n\n",
      E(
        "Each of the leads have",
        ["each of the leads has", "each lead has", "every lead has", "all the leads have", "all leads have", "each of the leads needs"],
        ["each of the lead has", "each leads has", "the leads have", "each of leads has"],
        "“Each” is singular however plural the noun after it looks."
      ),
      " to review the rollback plan ",
      "before we deploy again.\n\n",
      "There are ",
      E(
        "less number of bugs",
        ["fewer bugs", "fewer defects", "fewer issues", "a smaller number of bugs", "fewer bugs now"],
        ["less bugs", "lesser bugs", "fewer number of bugs", "a lower number of bugs", "less no of bugs"],
        "Countable things take “fewer”, and “number of” is redundant on top of it."
      ),
      " now compared to last sprint, ",
      "but we still need to ",
      E(
        "discuss about",
        ["discuss", "to discuss", "talk about", "agree on", "go over", "settle", "review", "align on"],
        ["discuss on", "discuss regarding", "discuss over", "have a discussion about"],
        "“Discuss” already contains the sense of “about”."
      ),
      " the release criteria.\n\n",
      "Also, please ",
      E(
        "intimate me",
        ["let me know", "tell me", "inform me", "update me", "notify me", "let us know", "flag it to me", "give me a heads up"],
        ["intimate", "inform", "notify", "let me known", "information me"],
        "“Intimate” meaning “inform” is Indian-English officialese. Elsewhere it means to hint at something."
      ),
      " if anyone is ",
      E(
        "out of station",
        ["out of town", "away", "travelling", "traveling", "on leave", "out of office", "unavailable", "not around", "off", "away from town", "not in town"],
        ["out of city", "out of the station", "outstation", "out of the office", "out"],
        "“Out of station” is Indian English. Say “out of town” or “away”."
      ),
      " next week.",
    ],
  },
];

/** [word, context sentence, options, correctIndex] */
export const VOCAB: [string, string, string[], number][] = [
  ["Leverage", "We should leverage our existing client relationships.", ["Make full use of", "Carefully protect", "Slowly build up", "Openly question"], 0],
  ["Mitigate", "The team added tests to mitigate the deployment risk.", ["Clearly document", "Formally approve", "Reduce the effect", "Delay for later"], 2],
  ["Streamline", "We need to streamline the onboarding process.", ["Record in fine detail", "Make more efficient", "Split across teams", "Pause for full review"], 1],
  ["Escalate", "If the client doesn't respond, escalate it.", ["Note it down in writing", "Quietly set it to one side", "Repeat it once again later", "Take to a senior person"], 3],
  ["Contingency", "Keep a contingency in case the vendor delays.", ["A backup arrangement", "A written complaint", "A final agreement", "A running summary"], 0],
  ["Consensus", "We reached a consensus after two hours of debate.", ["A fixed final deadline", "A general agreement", "A formal written warning", "A rough cost estimate"], 1],
  ["Delegate", "As a lead you must learn to delegate routine work.", ["Finish ahead of time", "Record for later use", "Set aside for review", "Hand to someone else"], 3],
  ["Feasible", "The timeline is tight, but feasible.", ["Open to change", "Fixed in advance", "Able to be done", "Agreed by all"], 2],
  ["Redundant", "After the merger, several roles became redundant.", ["Highly demanding", "No longer needed", "Newly created", "Formally listed"], 1],
  ["Discrepancy", "There's a discrepancy between the invoice and the PO.", ["A mismatch in detail", "A shared purpose", "A signed approval", "A delay in payment"], 0],
  ["Attrition", "Attrition in the support team has risen this quarter.", ["Sudden rise in cost", "Steady gain in speed", "Long delay in hiring", "Gradual loss of staff"], 3],
  ["Caveat", "I'll approve it, with one caveat about the timeline.", ["A minor correction", "A private opinion", "A stated condition", "A formal request"], 2],
  ["Granular", "Can you give me a more granular breakdown of costs?", ["Finely detailed", "Broadly grouped", "Roughly ordered", "Newly updated"], 0],
  ["Contingent", "The bonus is contingent on hitting the Q3 target.", ["Unrelated to it", "Conditional on it", "Much larger than", "Delayed by it"], 1],
  ["Precedent", "Approving this would set a precedent for other teams.", ["A strict deadline", "A common budget", "An earlier example", "A formal warning"], 2],
  ["Discretionary", "The travel budget is discretionary, not guaranteed.", ["Fixed by policy", "Shared by teams", "Paid in advance", "Left to judgment"], 3],
  ["Onerous", "The compliance checks are onerous but unavoidable.", ["Quick and simple", "Heavy and tiring", "Rare and unusual", "Cheap and quick"], 1],
  ["Purview", "That decision falls outside my purview.", ["Range of authority", "Length of service", "Field of interest", "Level of funding"], 0],
  ["Tacit", "There was tacit approval from the leadership.", ["Loudly announced", "Formally recorded", "Briefly delayed", "Silently understood"], 3],
  ["Ostensible", "The ostensible reason was cost, but morale was the issue.", ["Proven and certain", "Hidden from view", "Apparent, not real", "Agreed by everyone"], 2],
];

export const VOCAB_TOTAL = VOCAB.length; // 20

export type BEAnswers = {
  flagged: Record<string, string>;
  picks: Record<string, number>;
};

export const BANDS = [
  { max: 17, code: "A2", name: "Elementary or below", seg: 1, desc: "The foundation is still being built. Focus on high-frequency words and basic tense forms before register." },
  { max: 34, code: "B1", name: "Intermediate", seg: 2, desc: "You handle everyday work English, but formal register and embedded errors slip past unnoticed." },
  { max: 54, code: "B2", name: "Upper Intermediate", seg: 3, desc: "You read and write professionally without much strain. Where you lose ground is the officialese that sounds correct because everyone around you writes it." },
  { max: 69, code: "B2+", name: "Upper Intermediate, approaching C1", seg: 3, desc: "Strong, dependable English with real reach into advanced usage. Precision in formal register is the remaining gap." },
  { max: 84, code: "C1", name: "Advanced", seg: 4, desc: "You catch register as well as grammar, and you can tell the difference between what is wrong and what is merely dated." },
  { max: 100, code: "C2", name: "Mastery", seg: 5, desc: "Near-native control of idiom, register and nuance — including the errors that have become invisible through local habit." },
] as const;

export const LADDER: [string, string, string][] = [
  ["A1", "Beginner", "Basic phrases and immediate needs. Around 500–1,000 words."],
  ["A2", "Elementary", "Simple routine exchanges on familiar topics. Around 1,500–2,500 words."],
  ["B1", "Intermediate", "Handles daily work situations and describes experiences. Around 2,500–3,500 words."],
  ["B2", "Upper Intermediate", "Reads and writes professionally, argues a viewpoint. Around 4,000–6,000 words."],
  ["C1", "Advanced", "Handles literature, academic writing and register shifts with ease. Around 8,000–10,000 words."],
  ["C2", "Mastery", "Near-native precision in idiom, connotation and nuance. 12,000+ words."],
];

/* ---------- answer normalisation & fuzzy matching ---------- */
const CONTR: [RegExp, string][] = [
  [/\bi'?ll\b/g, "i will"], [/\bi'?ve\b/g, "i have"], [/\bi'?m\b/g, "i am"],
  [/\bdon'?t\b/g, "do not"], [/\bdoesn'?t\b/g, "does not"], [/\bdidn'?t\b/g, "did not"],
  [/\bwon'?t\b/g, "will not"], [/\bcan'?t\b/g, "cannot"], [/\bit'?s\b/g, "it is"],
  [/\bthat'?s\b/g, "that is"], [/\bwe'?re\b/g, "we are"], [/\byou'?re\b/g, "you are"],
  [/\bwe'?ll\b/g, "we will"], [/\bhe'?s\b/g, "he is"], [/\bshe'?s\b/g, "she is"],
];

export function norm(s: string): string {
  let x = (s || "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
  CONTR.forEach((c) => {
    x = x.replace(c[0], c[1]);
  });
  x = x
    .replace(/[.,;:!?"()—–-]/g, " ")
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();
  x = x
    .split(" ")
    .filter((w) => w && w !== "a" && w !== "an" && w !== "the")
    .join(" ");
  return x.replace(/^to\s+/, "").trim();
}

function lev(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let cur = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}

function tol(s: string): number {
  return s.length > 10 ? 2 : s.length > 4 ? 1 : 0;
}

/** 1 = spotted only, 1.5 = partial fix, 2 = correct fix */
export function grade(ans: string, s: ErrSeg): number {
  const u = norm(ans);
  if (!u) return 1;
  if (u === norm(s.t)) return 1;
  for (const f of s.fix) {
    const n = norm(f);
    if (u === n) return 2;
    if (lev(u, n) <= tol(n)) return 2;
  }
  for (const f of s.near ?? []) {
    const n = norm(f);
    if (u === n || lev(u, n) <= tol(n)) return 1.5;
  }
  const ut = u.split(" ");
  for (const f of s.fix) {
    const ft = norm(f).split(" ").filter(Boolean);
    if (!ft.length) continue;
    const overlap = ft.filter((t) => ut.includes(t)).length / ft.length;
    if (overlap >= 0.5) return 1.5;
  }
  return 1;
}

export function countDone(answers: BEAnswers): number {
  return Object.keys(answers.picks ?? {}).length;
}

export type BEEditRow = {
  from: string;
  to: string;
  why: string;
  pts: number;
  yours?: string;
  falseFlag?: boolean;
};
export type BEVocabRow = { word: string; correct: string; ok: boolean; yours?: string };

export type BEResult = {
  overall: number;
  band: (typeof BANDS)[number];
  found: number;
  total: number;
  fixedOK: number;
  partial: number;
  falseFlags: number;
  mailRaw: number;
  mailMax: number;
  mailPct: number;
  vScore: number;
  vPct: number;
  editReview: BEEditRow[];
  vocabReview: BEVocabRow[];
  summaryLine: string;
};

export function scoreBusinessEnglish(answers: BEAnswers): BEResult {
  const flagged = answers.flagged ?? {};
  const picks = answers.picks ?? {};

  let found = 0;
  let fixedOK = 0;
  let partial = 0;
  let falseFlags = 0;
  let total = 0;
  let ptsSum = 0;
  const editReview: BEEditRow[] = [];

  MAILS.forEach((m, mi) => {
    m.body.forEach((s, si) => {
      const id = mi + "-" + si;
      const isErr = typeof s !== "string";
      const hit = id in flagged;
      if (isErr) {
        total++;
        let pts = 0;
        if (hit) {
          found++;
          pts = grade(flagged[id], s as ErrSeg);
          if (pts === 2) fixedOK++;
          else if (pts === 1.5) partial++;
        }
        ptsSum += pts;
        editReview.push({
          from: (s as ErrSeg).t.trim(),
          to: (s as ErrSeg).fix[0],
          why: (s as ErrSeg).why,
          pts,
          yours: hit && pts < 2 ? flagged[id] || "—" : undefined,
        });
      } else if (hit) {
        falseFlags++;
        editReview.push({
          from: (s as string).trim(),
          to: "",
          why: "False flag — nothing wrong with this phrase.",
          pts: -1,
          falseFlag: true,
        });
      }
    });
  });

  const mailMax = total * 2;
  const mailRaw = Math.max(0, ptsSum - falseFlags);
  const mailPct = mailMax ? (mailRaw / mailMax) * 100 : 0;

  let vScore = 0;
  const vocabReview: BEVocabRow[] = [];
  VOCAB.forEach((v, i) => {
    const chosen = picks[i];
    const ok = chosen === v[3];
    if (ok) vScore++;
    vocabReview.push({
      word: v[0],
      correct: v[2][v[3]],
      ok,
      yours: ok || chosen == null ? undefined : v[2][chosen],
    });
  });
  const vPct = (vScore / VOCAB_TOTAL) * 100;
  const overall = (mailPct + vPct) / 2;
  const band = BANDS.find((b) => overall <= b.max) ?? BANDS[BANDS.length - 1];

  return {
    overall,
    band,
    found,
    total,
    fixedOK,
    partial,
    falseFlags,
    mailRaw,
    mailMax,
    mailPct,
    vScore,
    vPct,
    editReview,
    vocabReview,
    summaryLine: `${band.code} · ${overall.toFixed(0)}%`,
  };
}
