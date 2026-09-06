import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

export const TEST_IDS = ["english-level", "business-english"] as const;
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
