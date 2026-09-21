import { connectDB } from "@/lib/db";
import { AppSettingModel } from "@/lib/models/AppSetting";

const GSS_ENABLED_SETTING_KEY = "getSomeSpace.enabled";

/** Whether the game is visible/playable — admin-configurable from the dashboard, defaults to enabled. */
export async function isGssEnabled(): Promise<boolean> {
  await connectDB();
  const doc = await AppSettingModel.findOne({ key: GSS_ENABLED_SETTING_KEY }).lean();
  return doc?.value !== false;
}

export async function setGssEnabled(enabled: boolean): Promise<void> {
  await connectDB();
  await AppSettingModel.findOneAndUpdate(
    { key: GSS_ENABLED_SETTING_KEY },
    { $set: { value: enabled } },
    { upsert: true }
  );
}
