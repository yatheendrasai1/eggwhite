import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * App-owned per-user preferences, kept separate from the Auth.js-managed
 * `users` collection so we never write to a collection the adapter owns.
 */
const UserProfileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    nickname: { type: String, trim: true, maxlength: 32 },
    /** Set on passcode redemption to now + 30 days; null/absent means never pro or expired. */
    proExpiresAt: { type: Date, default: null },
    /** Grants access to /dashboard. Set manually via scripts/grant-tiv.mjs. */
    isTiv: { type: Boolean, default: false },
    /** UI theme preference. "system" defers to the OS/browser setting. */
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
  },
  { timestamps: true }
);

export type UserProfile = InferSchemaType<typeof UserProfileSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserProfileModel =
  (models.UserProfile as mongoose.Model<UserProfile>) ||
  model<UserProfile>("UserProfile", UserProfileSchema);
