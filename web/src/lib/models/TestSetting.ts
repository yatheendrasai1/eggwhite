import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";
import { TEST_IDS } from "@/lib/models/Attempt";

const TestSettingSchema = new Schema(
  {
    testId: { type: String, enum: TEST_IDS, required: true, unique: true },
    /** Absent/true means enabled; a doc only needs to exist while a test is disabled. */
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type TestSetting = InferSchemaType<typeof TestSettingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TestSettingModel =
  (models.TestSetting as mongoose.Model<TestSetting>) ||
  model<TestSetting>("TestSetting", TestSettingSchema);
