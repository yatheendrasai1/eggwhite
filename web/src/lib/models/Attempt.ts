import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

export const TEST_IDS = [
  "english-level",
  "business-english",
  "preposition-party",
  "tension",
  "tension-2",
  "articles",
  "corporate-confusion",
  "incorrectly-correct",
  "translation-drama-v1",
  "framing-the-situation",
] as const;
export type TestId = (typeof TEST_IDS)[number];

const AttemptSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    testId: { type: String, enum: TEST_IDS, required: true },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
      index: true,
    },
    /** Shape depends on testId. Validated with zod at the API boundary. */
    answers: { type: Schema.Types.Mixed, default: {} },
    progress: {
      done: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    /** Authoritative score, computed server-side on completion. */
    summary: {
      type: new Schema(
        {
          line: String,
          pct: Number,
          level: String,
          parts: { type: Schema.Types.Mixed },
        },
        { _id: false }
      ),
      default: undefined,
    },
    /**
     * Per-item review detail for tests whose scoring can't be cheaply
     * recomputed client-side (e.g. LLM-graded translation tests). Absent for
     * every other test, which recomputes its review from `answers` instead.
     */
    detail: { type: Schema.Types.Mixed, default: undefined },
    /**
     * Test-taker-raised doubts about an item's score, e.g. "same answer as
     * my friend but I got partial credit." One entry per flagged item key
     * (`item:<n>` for translation rows, `response` for the single-response
     * jira-comment test); re-flagging the same key overwrites its comment.
     */
    flags: {
      type: [
        new Schema(
          {
            itemKey: { type: String, required: true },
            comment: { type: String, default: "", maxlength: 100 },
            createdAt: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    /** How many times this attempt's flagged items have been revalidated. Capped at 3 — see MAX_VERIFIES in the verify route. */
    verifyCount: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

AttemptSchema.index({ userId: 1, status: 1 });
AttemptSchema.index({ userId: 1, updatedAt: -1 });

export type Attempt = InferSchemaType<typeof AttemptSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AttemptModel =
  (models.Attempt as mongoose.Model<Attempt>) ||
  model<Attempt>("Attempt", AttemptSchema);
