import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";
import { MILESTONE_KEYS } from "@/lib/games/getSomeSpace";

/**
 * One document per user — the live, persistent state of their "Get Some
 * Space!" run. Unlike Attempt/Result (one-shot graded tests), this game is
 * an ongoing character progression: score and milestone never reset, and
 * a single document is mutated across many sessions/days.
 */
const GameStateSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },

    status: {
      type: String,
      enum: ["active", "cooldown", "completed"],
      default: "cooldown", // no session started yet — same "must start a session" gate as post-game-over
    },

    segmentIndex: { type: Number, default: 1 },
    correctInSegment: { type: Number, default: 0 },
    wrongInSegment: { type: Number, default: 0 },
    milestone: { type: String, enum: MILESTONE_KEYS, default: "start" },

    score: { type: Number, default: 0 },
    /** Perfect-clear bonus points — a separate quota, not merged into `score` yet (see spec §4). */
    bonusQuota: { type: Number, default: 0 },
    lives: { type: Number, default: 0 },

    currentQuestionId: { type: String, default: null },
    /** Question ids already served within the current segment attempt, to avoid immediate repeats. */
    askedQuestionIds: { type: [String], default: [] },

    /** UTC "YYYY-MM-DD" — the day `sessionsUsedToday` is counted against. */
    dayKey: { type: String, default: "" },
    sessionsUsedToday: { type: Number, default: 0 },
    lastSessionEndAt: { type: Date, default: null },
    /** Set on game-over (life pool exhausted); also used to gate the next session start. */
    cooldownUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

export type GameState = InferSchemaType<typeof GameStateSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GameStateModel =
  (models.GameState as mongoose.Model<GameState>) ||
  model<GameState>("GameState", GameStateSchema);
