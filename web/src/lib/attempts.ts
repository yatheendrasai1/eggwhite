import { connectDB } from "@/lib/db";
import { AttemptModel, type TestId } from "@/lib/models/Attempt";
import type { AttemptSummary } from "@/lib/tests/score";

export type AttemptDTO = {
  id: string;
  testId: TestId;
  status: "in_progress" | "completed";
  answers: unknown;
  progress: { done: number; total: number };
  summary: AttemptSummary | null;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeAttempt(doc: any): AttemptDTO {
  return {
    id: String(doc._id),
    testId: doc.testId,
    status: doc.status,
    answers: doc.answers ?? {},
    progress: {
      done: doc.progress?.done ?? 0,
      total: doc.progress?.total ?? 0,
    },
    summary: doc.summary ?? null,
    startedAt: new Date(doc.startedAt ?? doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
    completedAt: doc.completedAt ? new Date(doc.completedAt).toISOString() : null,
  };
}

export async function getActiveAttempt(userId: string): Promise<AttemptDTO | null> {
  await connectDB();
  const doc = await AttemptModel.findOne({ userId, status: "in_progress" })
    .sort({ updatedAt: -1 })
    .lean();
  return doc ? serializeAttempt(doc) : null;
}

export async function getAttemptById(
  userId: string,
  id: string
): Promise<AttemptDTO | null> {
  await connectDB();
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const doc = await AttemptModel.findOne({ _id: id, userId }).lean();
  return doc ? serializeAttempt(doc) : null;
}

export async function listAttempts(userId: string): Promise<AttemptDTO[]> {
  await connectDB();
  const docs = await AttemptModel.find({ userId }).sort({ updatedAt: -1 }).lean();
  return docs.map(serializeAttempt);
}
