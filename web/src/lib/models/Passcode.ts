import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const PasscodeSchema = new Schema(
  {
    /** sha256 hex of `code`, used for fast/consistent redemption lookups. */
    codeHash: { type: String, required: true, unique: true, index: true },
    /** Plaintext code, shown repeatably on the admin dashboard. */
    code: { type: String, required: true },
    /** Owner-facing label, e.g. who this code is meant for. Not shown to the redeemer. */
    label: { type: String, trim: true, maxlength: 64, default: "" },
    used: { type: Boolean, default: false, index: true },
    redeemedBy: { type: String, default: null },
    redeemedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type Passcode = InferSchemaType<typeof PasscodeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PasscodeModel =
  (models.Passcode as mongoose.Model<Passcode>) ||
  model<Passcode>("Passcode", PasscodeSchema);
