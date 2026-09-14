import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * App-owned per-user preferences, kept separate from the Auth.js-managed
 * `users` collection so we never write to a collection the adapter owns.
 */
const UserProfileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    nickname: { type: String, trim: true, maxlength: 32 },
  },
  { timestamps: true }
);

export type UserProfile = InferSchemaType<typeof UserProfileSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserProfileModel =
  (models.UserProfile as mongoose.Model<UserProfile>) ||
  model<UserProfile>("UserProfile", UserProfileSchema);
