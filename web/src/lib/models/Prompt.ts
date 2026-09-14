import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * LLM prompt templates, keyed by a stable string so evaluation code can
 * fetch the current wording without redeploying. `{{...}}` placeholders are
 * filled in by the caller before sending to Gemini.
 */
const PromptSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    template: { type: String, required: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export type Prompt = InferSchemaType<typeof PromptSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PromptModel =
  (models.Prompt as mongoose.Model<Prompt>) || model<Prompt>("Prompt", PromptSchema);
