import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

/** One doc per user per UTC calendar day; tracks pro-test submissions for the daily rate limit. */
const ProUsageSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    day: { type: String, required: true }, // "YYYY-MM-DD" (UTC)
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProUsageSchema.index({ userId: 1, day: 1 }, { unique: true });

export type ProUsage = InferSchemaType<typeof ProUsageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProUsageModel =
  (models.ProUsage as mongoose.Model<ProUsage>) ||
  model<ProUsage>("ProUsage", ProUsageSchema);
