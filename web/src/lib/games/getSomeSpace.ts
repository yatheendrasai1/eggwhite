import { poolForSegment, type GssQuestion } from "@/lib/games/getSomeSpaceContent";

export const MAX_LIVES = 5;
export const SESSIONS_PER_DAY = 4;
/** Required gap before starting the next session, keyed by how many sessions have been used so far today. */
const GAP_AFTER_SESSION_MS: Record<number, number> = {
  1: 0,
  2: 60 * 60 * 1000, // session 2 -> 3 needs at least 1 hour
  3: 0,
};

export const SEGMENTS = {
  1: { requiredCorrect: 6, pointsPerCorrect: 5, name: "Troposphere Climb" },
  2: { requiredCorrect: 8, pointsPerCorrect: 10, name: "Stratosphere Push" },
  3: { requiredCorrect: 10, pointsPerCorrect: 20, name: "Edge of Space" },
} as const;
export type SegmentIndex = keyof typeof SEGMENTS;

export const MILESTONES = [
  { key: "start", segmentIndex: 1, correctBaseline: 0, label: "Ground level" },
  { key: "segment-1-complete", segmentIndex: 2, correctBaseline: 0, label: "Armstrong limit cleared" },
  { key: "segment-2-complete", segmentIndex: 3, correctBaseline: 0, label: "Mesosphere reached" },
  { key: "segment-3-half", segmentIndex: 3, correctBaseline: 5, label: "Halfway to the Kármán line" },
  { key: "segment-3-complete", segmentIndex: 4, correctBaseline: 0, label: "Kármán line — space reached!" },
] as const;
export type MilestoneKey = (typeof MILESTONES)[number]["key"];
export const MILESTONE_KEYS = MILESTONES.map((m) => m.key) as MilestoneKey[];

function milestoneByKey(key: MilestoneKey) {
  const m = MILESTONES.find((x) => x.key === key);
  if (!m) throw new Error(`unknown milestone: ${key}`);
  return m;
}

function isLevelClear(key: MilestoneKey): boolean {
  return key.endsWith("-complete");
}

/**
 * Cosmetic-only altitude readout (km) for the HUD — the game itself never
 * gates on literal kilometers (see the spec's "real-world theming" note),
 * this just maps each segment's progress onto its real-world altitude band
 * so the number climbs meaningfully as the player advances.
 */
export const ALTITUDE_BAND_KM: Record<1 | 2 | 3, readonly [number, number]> = {
  1: [0, 19], // ground -> Armstrong limit
  2: [19, 50], // Armstrong limit -> mesosphere
  3: [50, 100], // mesosphere -> Kármán line
};

export function currentAltitudeKm(s: { segmentIndex: number; correctInSegment: number }): number {
  if (s.segmentIndex > 3) return 100;
  const segment = Math.max(1, Math.min(3, s.segmentIndex)) as 1 | 2 | 3;
  const [lo, hi] = ALTITUDE_BAND_KM[segment];
  const frac = Math.max(0, Math.min(1, s.correctInSegment / SEGMENTS[segment].requiredCorrect));
  return lo + frac * (hi - lo);
}

/**
 * Which milestone was just reached, given the CURRENT segment and its
 * correct-answer tally right after a correct answer. Note this is distinct
 * from each MILESTONES entry's `segmentIndex`/`correctBaseline`, which
 * describe the *resume point* (often the next segment), not the trigger.
 */
function detectMilestone(segmentIndex: number, correctInSegment: number): MilestoneKey | null {
  if (segmentIndex === 1 && correctInSegment === SEGMENTS[1].requiredCorrect) return "segment-1-complete";
  if (segmentIndex === 2 && correctInSegment === SEGMENTS[2].requiredCorrect) return "segment-2-complete";
  if (segmentIndex === 3 && correctInSegment === 5) return "segment-3-half";
  if (segmentIndex === 3 && correctInSegment === SEGMENTS[3].requiredCorrect) return "segment-3-complete";
  return null;
}

export type GssStateLike = {
  status: "active" | "cooldown" | "completed";
  segmentIndex: number;
  correctInSegment: number;
  wrongInSegment: number;
  milestone: MilestoneKey;
  score: number;
  bonusQuota: number;
  lives: number;
  currentQuestionId: string | null;
  askedQuestionIds: string[];
  dayKey: string;
  sessionsUsedToday: number;
  lastSessionEndAt: Date | null;
  cooldownUntil: Date | null;
};

export function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function nextUtcMidnight(d: Date): Date {
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0, 0));
  return next;
}

/** Rolls `dayKey`/`sessionsUsedToday` over to today if the stored day has passed. Mutates in place. */
export function ensureDayRollover(state: GssStateLike, now: Date): void {
  const today = utcDayKey(now);
  if (state.dayKey !== today) {
    state.dayKey = today;
    state.sessionsUsedToday = 0;
    state.lastSessionEndAt = null;
    state.cooldownUntil = null;
  }
}

export type StartSessionCheck =
  | { ok: true }
  | { ok: false; reason: "daily_limit"; availableAt: Date }
  | { ok: false; reason: "cooldown"; availableAt: Date };

export function canStartSession(state: GssStateLike, now: Date): StartSessionCheck {
  if (state.sessionsUsedToday >= SESSIONS_PER_DAY) {
    return { ok: false, reason: "daily_limit", availableAt: nextUtcMidnight(now) };
  }
  if (state.lastSessionEndAt) {
    const gap = GAP_AFTER_SESSION_MS[state.sessionsUsedToday] ?? 0;
    const availableAt = new Date(state.lastSessionEndAt.getTime() + gap);
    if (now < availableAt) {
      return { ok: false, reason: "cooldown", availableAt };
    }
  }
  return { ok: true };
}

function pickNextQuestion(
  state: GssStateLike,
  rand: () => number = Math.random
): string | null {
  if (state.segmentIndex > 3) return null;
  const pool = poolForSegment(state.segmentIndex as 1 | 2 | 3);
  let candidates: readonly GssQuestion[] = pool.filter((q) => !state.askedQuestionIds.includes(q.id));
  if (candidates.length === 0) {
    // Pool exhausted (shouldn't normally happen — pools are padded beyond
    // the required-correct count) — cycle by clearing the asked list.
    state.askedQuestionIds = [];
    candidates = pool;
  }
  const pick = candidates[Math.floor(rand() * candidates.length)];
  return pick.id;
}

function resetToMilestone(
  state: GssStateLike,
  key: MilestoneKey,
  opts: { preserveWrong?: boolean } = {}
): void {
  const m = milestoneByKey(key);
  state.milestone = key;
  state.segmentIndex = m.segmentIndex;
  state.correctInSegment = m.correctBaseline;
  if (!opts.preserveWrong) state.wrongInSegment = 0;
  state.askedQuestionIds = [];
  state.currentQuestionId = null;
}

/** Starts a fresh session: refills lives and ensures a current question is queued. Caller must have checked canStartSession(). */
export function startSession(state: GssStateLike, now: Date, rand?: () => number): void {
  ensureDayRollover(state, now);
  state.status = "active";
  state.lives = MAX_LIVES;
  state.sessionsUsedToday += 1;
  state.cooldownUntil = null;
  if (!state.currentQuestionId) {
    state.currentQuestionId = pickNextQuestion(state, rand);
  }
}

function computeCooldownUntil(state: GssStateLike, now: Date): Date {
  if (state.sessionsUsedToday >= SESSIONS_PER_DAY) return nextUtcMidnight(now);
  const gap = GAP_AFTER_SESSION_MS[state.sessionsUsedToday] ?? 0;
  return new Date(now.getTime() + gap);
}

export type AnswerOutcome = {
  correct: boolean;
  /** Safe to reveal only after the answer has been submitted. */
  correctIndex: number;
  pointsAwarded: number;
  livesLost: number;
  milestoneReached: MilestoneKey | null;
  perfectBonusAwarded: number;
  lifeRewardAwarded: number;
  gameOver: boolean;
  completed: boolean;
};

/**
 * Applies one answer to `state` in place and returns what happened.
 * `question` must be the question matching `state.currentQuestionId`.
 */
export function submitAnswer(
  state: GssStateLike,
  question: GssQuestion,
  chosenIndex: number,
  now: Date,
  rand?: () => number
): AnswerOutcome {
  const outcome: AnswerOutcome = {
    correct: false,
    correctIndex: question.correctIndex,
    pointsAwarded: 0,
    livesLost: 0,
    milestoneReached: null,
    perfectBonusAwarded: 0,
    lifeRewardAwarded: 0,
    gameOver: false,
    completed: false,
  };

  const correct = chosenIndex === question.correctIndex;
  outcome.correct = correct;
  state.askedQuestionIds.push(question.id);

  if (correct) {
    const segment = SEGMENTS[state.segmentIndex as SegmentIndex];
    state.score += segment.pointsPerCorrect;
    outcome.pointsAwarded = segment.pointsPerCorrect;
    state.correctInSegment += 1;

    const reachedKey = detectMilestone(state.segmentIndex, state.correctInSegment);
    if (reachedKey) {
      if (isLevelClear(reachedKey)) {
        if (state.wrongInSegment === 0) {
          state.bonusQuota += 10;
          outcome.perfectBonusAwarded = 10;
        } else if (state.lives < MAX_LIVES) {
          state.lives += 1;
          outcome.lifeRewardAwarded = 1;
        }
      }
      // The segment-3 halfway checkpoint isn't a level clear — preserve the
      // wrong-answer tally so segment-3-complete's perfect-bonus check still
      // sees any wrong answers made before the halfway point.
      resetToMilestone(state, reachedKey, { preserveWrong: !isLevelClear(reachedKey) });
      outcome.milestoneReached = reachedKey;

      if (reachedKey === "segment-3-complete") {
        state.status = "completed";
        outcome.completed = true;
        return outcome;
      }
    }
    state.currentQuestionId = pickNextQuestion(state, rand);
  } else {
    state.wrongInSegment += 1;
    state.lives -= 1;
    outcome.livesLost = 1;

    if (state.lives <= 0) {
      state.status = "cooldown";
      state.lastSessionEndAt = now;
      state.cooldownUntil = computeCooldownUntil(state, now);
      resetToMilestone(state, state.milestone);
      outcome.gameOver = true;
    } else {
      state.currentQuestionId = pickNextQuestion(state, rand);
    }
  }

  return outcome;
}
