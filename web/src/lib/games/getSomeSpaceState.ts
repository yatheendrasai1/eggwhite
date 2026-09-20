import type { HydratedDocument } from "mongoose";
import { connectDB } from "@/lib/db";
import { GameStateModel, type GameState } from "@/lib/models/GameState";
import { ensureDayRollover, type GssStateLike } from "@/lib/games/getSomeSpace";
import { findQuestion, toPublicQuestion, type GssPublicQuestion } from "@/lib/games/getSomeSpaceContent";

type GameStateDoc = HydratedDocument<GameState>;

export type GssStateDTO = {
  status: "active" | "cooldown" | "completed";
  segmentIndex: number;
  correctInSegment: number;
  wrongInSegment: number;
  milestone: string;
  score: number;
  bonusQuota: number;
  lives: number;
  sessionsUsedToday: number;
  cooldownUntil: string | null;
  currentQuestion: GssPublicQuestion | null;
};

/** Adapts a Mongoose GameState doc to the plain shape the pure game-logic functions operate on. */
export function asGssStateLike(doc: GameStateDoc): GssStateLike {
  return {
    status: doc.status as GssStateLike["status"],
    segmentIndex: doc.segmentIndex,
    correctInSegment: doc.correctInSegment,
    wrongInSegment: doc.wrongInSegment,
    milestone: doc.milestone as GssStateLike["milestone"],
    score: doc.score,
    bonusQuota: doc.bonusQuota,
    lives: doc.lives,
    currentQuestionId: doc.currentQuestionId ?? null,
    askedQuestionIds: [...doc.askedQuestionIds],
    dayKey: doc.dayKey,
    sessionsUsedToday: doc.sessionsUsedToday,
    lastSessionEndAt: doc.lastSessionEndAt ?? null,
    cooldownUntil: doc.cooldownUntil ?? null,
  };
}

/** Writes a mutated GssStateLike back onto the Mongoose doc, ready for .save(). */
export function applyGssStateLike(doc: GameStateDoc, s: GssStateLike): void {
  doc.status = s.status;
  doc.segmentIndex = s.segmentIndex;
  doc.correctInSegment = s.correctInSegment;
  doc.wrongInSegment = s.wrongInSegment;
  doc.milestone = s.milestone;
  doc.score = s.score;
  doc.bonusQuota = s.bonusQuota;
  doc.lives = s.lives;
  doc.currentQuestionId = s.currentQuestionId;
  doc.askedQuestionIds = s.askedQuestionIds;
  doc.dayKey = s.dayKey;
  doc.sessionsUsedToday = s.sessionsUsedToday;
  doc.lastSessionEndAt = s.lastSessionEndAt;
  doc.cooldownUntil = s.cooldownUntil;
  doc.markModified("askedQuestionIds");
}

/** Finds or creates the player's GameState doc, rolling the daily counters over if a new day has started. */
export async function loadGameState(userId: string): Promise<GameStateDoc> {
  await connectDB();
  let doc = await GameStateModel.findOne({ userId });
  if (!doc) {
    doc = await GameStateModel.create({ userId, dayKey: "" });
  }
  const now = new Date();
  const s = asGssStateLike(doc);
  const before = JSON.stringify({ dayKey: s.dayKey, sessionsUsedToday: s.sessionsUsedToday });
  ensureDayRollover(s, now);
  const after = JSON.stringify({ dayKey: s.dayKey, sessionsUsedToday: s.sessionsUsedToday });
  if (before !== after) {
    applyGssStateLike(doc, s);
    await doc.save();
  }
  return doc;
}

export function toStateDTO(doc: GameStateDoc): GssStateDTO {
  const question = doc.currentQuestionId ? findQuestion(doc.currentQuestionId) : undefined;
  return {
    status: doc.status as GssStateDTO["status"],
    segmentIndex: doc.segmentIndex,
    correctInSegment: doc.correctInSegment,
    wrongInSegment: doc.wrongInSegment,
    milestone: doc.milestone,
    score: doc.score,
    bonusQuota: doc.bonusQuota,
    lives: doc.lives,
    sessionsUsedToday: doc.sessionsUsedToday,
    cooldownUntil: doc.cooldownUntil ? doc.cooldownUntil.toISOString() : null,
    currentQuestion:
      doc.status === "active" && question ? toPublicQuestion(question) : null,
  };
}
