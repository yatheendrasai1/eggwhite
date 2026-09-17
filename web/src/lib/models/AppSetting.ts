import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

/** Generic singleton-per-key settings store for small admin-tunable values (e.g. which Gemini model to grade with). */
const AppSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export type AppSetting = InferSchemaType<typeof AppSettingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AppSettingModel =
  (models.AppSetting as mongoose.Model<AppSetting>) ||
  model<AppSetting>("AppSetting", AppSettingSchema);
