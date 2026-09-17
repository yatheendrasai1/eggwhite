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
  /** Per-item review for LLM-graded tests — see Attempt.detail. Null for every other test. */
  detail: unknown | null;
  /** Test-taker-raised doubts about an item's score. See Attempt.flags. */
  flags: { itemKey: string; comment: string; createdAt: string }[];
  /** How many times flagged items on this attempt have been revalidated (max 3). */
  verifyCount: number;
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
    detail: doc.detail ?? null,
    flags: (doc.flags ?? []).map((f: { itemKey: string; comment: string; createdAt: Date }) => ({
      itemKey: f.itemKey,
      comment: f.comment ?? "",
      createdAt: new Date(f.createdAt).toISOString(),
    })),
    verifyCount: doc.verifyCount ?? 0,
    startedAt: new Date(doc.startedAt ?? doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
    completedAt: doc.completedAt ? new Date(doc.completedAt).toISOString() : null,
  };
}

export async function getActiveAttempts(userId: string): Promise<AttemptDTO[]> {
  await connectDB();
  const docs = await AttemptModel.find({ userId, status: "in_progress" })
    .sort({ updatedAt: -1 })
    .lean();
  return docs.map(serializeAttempt);
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
