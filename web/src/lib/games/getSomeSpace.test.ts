import { describe, it, expect } from "vitest";
import {
  MAX_LIVES,
  SESSIONS_PER_DAY,
  canStartSession,
  ensureDayRollover,
  startSession,
  submitAnswer,
  utcDayKey,
  type GssStateLike,
} from "@/lib/games/getSomeSpace";
import { findQuestion } from "@/lib/games/getSomeSpaceContent";

const rand0 = () => 0; // always pick the first unasked candidate — deterministic for tests

function freshState(overrides: Partial<GssStateLike> = {}): GssStateLike {
  return {
    status: "cooldown",
    segmentIndex: 1,
    correctInSegment: 0,
    wrongInSegment: 0,
    milestone: "start",
    score: 0,
    bonusQuota: 0,
    lives: 0,
    currentQuestionId: null,
    askedQuestionIds: [],
    dayKey: "",
    sessionsUsedToday: 0,
    lastSessionEndAt: null,
    cooldownUntil: null,
    ...overrides,
  };
}

function answerCorrectly(state: GssStateLike, now: Date) {
  const q = findQuestion(state.currentQuestionId!);
  if (!q) throw new Error("no current question");
  return submitAnswer(state, q, q.correctIndex, now, rand0);
}

function answerWrong(state: GssStateLike, now: Date) {
  const q = findQuestion(state.currentQuestionId!);
  if (!q) throw new Error("no current question");
  const wrongIndex = ((q.correctIndex + 1) % 4) as 0 | 1 | 2 | 3;
  return submitAnswer(state, q, wrongIndex, now, rand0);
}

describe("startSession", () => {
  it("refills lives and queues a question", () => {
    const state = freshState();
    const now = new Date("2026-01-01T00:00:00Z");
    startSession(state, now, rand0);
    expect(state.status).toBe("active");
    expect(state.lives).toBe(MAX_LIVES);
    expect(state.sessionsUsedToday).toBe(1);
    expect(state.currentQuestionId).toBeTruthy();
  });
});

describe("submitAnswer — segment clearing", () => {
  it("clears segment 1 after 6 correct answers and moves to segment 2", () => {
    const state = freshState();
    const now = new Date("2026-01-01T00:00:00Z");
    startSession(state, now, rand0);

    let lastOutcome;
    for (let i = 0; i < 6; i++) {
      lastOutcome = answerCorrectly(state, now);
    }

    expect(lastOutcome!.milestoneReached).toBe("segment-1-complete");
    expect(state.segmentIndex).toBe(2);
    expect(state.correctInSegment).toBe(0);
    expect(state.score).toBe(6 * 5);
  });

  it("awards the perfect-clear bonus when a segment is cleared with zero wrong answers", () => {
    const state = freshState();
    const now = new Date("2026-01-01T00:00:00Z");
    startSession(state, now, rand0);

    for (let i = 0; i < 6; i++) answerCorrectly(state, now);

    expect(state.bonusQuota).toBe(10);
    expect(state.lives).toBe(MAX_LIVES); // untouched — no life was lost
  });

  it("awards +1 life instead of the bonus when at least one wrong answer occurred in that segment", () => {
    const state = freshState();
    const now = new Date("2026-01-01T00:00:00Z");
    startSession(state, now, rand0);

    answerWrong(state, now); // lives: 5 -> 4
    for (let i = 0; i < 6; i++) answerCorrectly(state, now);

    expect(state.bonusQuota).toBe(0);
    expect(state.lives).toBe(MAX_LIVES); // 4 + 1 reward, capped at MAX_LIVES
  });

  it("never rewards a life above the max", () => {
    const state = freshState();
    const now = new Date("2026-01-01T00:00:00Z");
    startSession(state, now, rand0);

    // Lose a life, then immediately recover it via a segment-2 clear later —
    // simulate segment 1 clearing cleanly (no wrong) so lives stay at max,
    // then confirm a subsequent clear-with-a-wrong never exceeds MAX_LIVES.
    for (let i = 0; i < 6; i++) answerCorrectly(state, now); // segment 1 clear, perfect
    expect(state.lives).toBe(MAX_LIVES);

    answerWrong(state, now); // segment 2, lives -> 4
    for (let i = 0; i < 8; i++) answerCorrectly(state, now); // segment 2 clear, 1 wrong -> +1 life

    expect(state.lives).toBe(MAX_LIVES);
  });

  it("reaches segment-3-half at the 5th correct answer in segment 3, without ending the run", () => {
    const state = freshState();
    const now = new Date("2026-01-01T00:00:00Z");
    startSession(state, now, rand0);

    for (let i = 0; i < 6; i++) answerCorrectly(state, now); // clear segment 1
    for (let i = 0; i < 8; i++) answerCorrectly(state, now); // clear segment 2
    let lastOutcome;
    for (let i = 0; i < 5; i++) lastOutcome = answerCorrectly(state, now); // halfway through segment 3

    expect(lastOutcome!.milestoneReached).toBe("segment-3-half");
    expect(state.segmentIndex).toBe(3);
    expect(state.status).toBe("active");
  });

  it("completes the game at segment-3-complete", () => {
    const state = freshState();
    const now = new Date("2026-01-01T00:00:00Z");
    startSession(state, now, rand0);

    for (let i = 0; i < 6; i++) answerCorrectly(state, now);
    for (let i = 0; i < 8; i++) answerCorrectly(state, now);
    let lastOutcome;
    for (let i = 0; i < 10; i++) lastOutcome = answerCorrectly(state, now);

    expect(lastOutcome!.completed).toBe(true);
    expect(state.status).toBe("completed");
    expect(state.currentQuestionId).toBeNull();
  });

  it("keeps the wrong-answer tally across the segment-3 halfway checkpoint for the eventual perfect-bonus check", () => {
    const state = freshState();
    const now = new Date("2026-01-01T00:00:00Z");
    startSession(state, now, rand0);

    for (let i = 0; i < 6; i++) answerCorrectly(state, now); // segment 1: perfect, +10 bonus
    for (let i = 0; i < 8; i++) answerCorrectly(state, now); // segment 2: perfect, +10 bonus
    expect(state.bonusQuota).toBe(20);

    answerWrong(state, now); // one wrong before the halfway point of segment 3
    for (let i = 0; i < 5; i++) answerCorrectly(state, now); // reach segment-3-half
    for (let i = 0; i < 5; i++) answerCorrectly(state, now); // reach segment-3-complete

    // Segment 3's own clear is disqualified by the earlier wrong answer —
    // no further bonus on top of the 20 already earned from segments 1-2.
    expect(state.bonusQuota).toBe(20);
  });
});

describe("submitAnswer — life pool exhaustion", () => {
  it("ends the run and rolls the player back to their last milestone once lives hit 0", () => {
    const state = freshState();
    const now = new Date("2026-01-01T00:00:00Z");
    startSession(state, now, rand0);

    for (let i = 0; i < 6; i++) answerCorrectly(state, now); // clear segment 1 -> milestone recorded
    expect(state.milestone).toBe("segment-1-complete");

    for (let i = 0; i < 4; i++) answerWrong(state, now); // segment 2: 4 correct-in-progress with wrongs, drains lives
    const outcome = answerWrong(state, now); // 5th wrong -> lives hit 0

    expect(outcome.gameOver).toBe(true);
    expect(state.status).toBe("cooldown");
    expect(state.segmentIndex).toBe(2); // rolled back to the segment-1-complete milestone's resume point
    expect(state.correctInSegment).toBe(0);
    expect(state.currentQuestionId).toBeNull();
  });

  it("treats a timed-out (choiceIndex -1) answer the same as a wrong answer", () => {
    const state = freshState();
    const now = new Date("2026-01-01T00:00:00Z");
    startSession(state, now, rand0);
    const q = findQuestion(state.currentQuestionId!)!;

    const outcome = submitAnswer(state, q, -1, now, rand0);
    expect(outcome.correct).toBe(false);
    expect(outcome.livesLost).toBe(1);
    expect(state.lives).toBe(MAX_LIVES - 1);
  });
});

describe("session gating", () => {
  it("blocks starting a session once the daily limit is reached", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const state = freshState({
      dayKey: utcDayKey(now),
      sessionsUsedToday: SESSIONS_PER_DAY,
      lastSessionEndAt: now,
    });
    const check = canStartSession(state, now);
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.reason).toBe("daily_limit");
  });

  it("requires a 1-hour gap between session 2 and session 3, but not the others", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const state = freshState({ dayKey: utcDayKey(now), sessionsUsedToday: 1, lastSessionEndAt: now });
    // after session 1 -> session 2: no gap required
    expect(canStartSession(state, now)).toEqual({ ok: true });

    state.sessionsUsedToday = 2;
    state.lastSessionEndAt = now;
    // after session 2 -> session 3: 1 hour required
    const blocked = canStartSession(state, now);
    expect(blocked.ok).toBe(false);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    expect(canStartSession(state, oneHourLater)).toEqual({ ok: true });

    state.sessionsUsedToday = 3;
    state.lastSessionEndAt = now;
    // after session 3 -> session 4: no gap required
    expect(canStartSession(state, now)).toEqual({ ok: true });
  });

  it("rolls sessionsUsedToday over on a new UTC day", () => {
    const state = freshState({
      dayKey: "2026-01-01",
      sessionsUsedToday: SESSIONS_PER_DAY,
      cooldownUntil: new Date("2026-01-01T23:00:00Z"),
    });
    const nextDay = new Date("2026-01-02T00:00:01Z");
    ensureDayRollover(state, nextDay);
    expect(state.sessionsUsedToday).toBe(0);
    expect(state.dayKey).toBe("2026-01-02");
    expect(state.cooldownUntil).toBeNull();
  });
});
