import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * One row per (userId, testId) — the score from a user's FIRST completed
 * attempt at a test, written once and never updated. Retakes are for the
 * user's own review only; they never touch this collection. See
 * recordResultIfFirst() in lib/results.ts, the single write path.
 */
const ResultSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    testId: { type: String, required: true, index: true },
    /** Snapshotted at write time so a later test rename doesn't rewrite history. */
    testName: { type: String, required: true },
    attemptId: { type: String, required: true },
    pct: { type: Number, required: true },
    level: { type: String, required: true },
    parts: { type: Schema.Types.Mixed, default: {} },
    takenAt: { type: Date, required: true },
  },
  { timestamps: true }
);

ResultSchema.index({ userId: 1, testId: 1 }, { unique: true });
ResultSchema.index({ testId: 1, pct: -1, takenAt: 1 });

export type Result = InferSchemaType<typeof ResultSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ResultModel =
  (models.Result as mongoose.Model<Result>) || model<Result>("Result", ResultSchema);
