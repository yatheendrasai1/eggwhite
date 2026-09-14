import { connectDB } from "@/lib/db";
import { ResultModel } from "@/lib/models/Result";
import type { TestId } from "@/lib/models/Attempt";
import type { AttemptSummary } from "@/lib/tests/score";
import { byId } from "@/lib/tests/registry";

type MongoDupeKeyError = Error & { code?: number };

function isDupeKeyError(err: unknown): boolean {
  return err instanceof Error && (err as MongoDupeKeyError).code === 11000;
}

/**
 * Records a user's score for the leaderboard — but only the first time they
 * ever complete this test. Later retakes call this too (same code path as
 * any other completion), but the unique (userId, testId) index rejects the
 * insert, which we swallow. This is the ONLY write path for `results`, used
 * by both the attempt-completion API and the guest migration API.
 */
export async function recordResultIfFirst(params: {
  userId: string;
  testId: TestId;
  attemptId: string;
  summary: AttemptSummary;
  takenAt: Date;
}): Promise<void> {
  await connectDB();
  const testName = byId(params.testId)?.title ?? params.testId;
  try {
    await ResultModel.create({
      userId: params.userId,
      testId: params.testId,
      testName,
      attemptId: params.attemptId,
      pct: params.summary.pct,
      level: params.summary.level,
      parts: params.summary.parts,
      takenAt: params.takenAt,
    });
  } catch (err) {
    if (!isDupeKeyError(err)) throw err;
  }
}
