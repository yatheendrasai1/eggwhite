import { connectDB } from "@/lib/db";
import { TestSettingModel } from "@/lib/models/TestSetting";
import type { TestId } from "@/lib/models/Attempt";

/** Ids of tests an admin has turned off. Tests with no record are enabled. */
export async function getDisabledTestIds(): Promise<Set<TestId>> {
  await connectDB();
  const docs = await TestSettingModel.find({ enabled: false }).select("testId").lean();
  return new Set(docs.map((d) => d.testId as TestId));
}

export async function isTestEnabled(testId: TestId): Promise<boolean> {
  await connectDB();
  const doc = await TestSettingModel.findOne({ testId }).select("enabled").lean();
  return doc?.enabled !== false;
}

export async function setTestEnabled(testId: TestId, enabled: boolean): Promise<void> {
  await connectDB();
  await TestSettingModel.findOneAndUpdate(
    { testId },
    { $set: { enabled } },
    { upsert: true }
  );
}
