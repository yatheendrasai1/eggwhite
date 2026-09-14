import { connectDB } from "@/lib/db";
import { PromptModel } from "@/lib/models/Prompt";

/** Fetches a prompt template by key. Throws if it hasn't been seeded yet. */
export async function getPromptTemplate(key: string): Promise<string> {
  await connectDB();
  const doc = await PromptModel.findOne({ key }).lean();
  if (!doc) throw new Error(`Prompt "${key}" not found — has it been seeded?`);
  return doc.template;
}
