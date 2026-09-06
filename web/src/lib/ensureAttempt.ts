import { connectDB } from "@/lib/db";
import { AttemptModel, type TestId } from "@/lib/models/Attempt";
import { serializeAttempt, type AttemptDTO } from "@/lib/attempts";
import { computeProgress } from "@/lib/tests/score";

type EnsureResult =
  | { ok: true; attempt: AttemptDTO }
  | { ok: false; reason: "other-open"; openTestId: TestId };

/**
 * Returns the user's in-progress attempt for `testId`, creating one if there is
 * no open attempt. If a *different* test is open, refuses (single-open rule).
 * A completed attempt for this test does not block a fresh start.
 */
export async function ensureAttempt(
  userId: string,
  testId: TestId
): Promise<EnsureResult> {
  await connectDB();

  const open = await AttemptModel.findOne({ userId, status: "in_progress" }).sort({
    updatedAt: -1,
  });
  if (open) {
    if (open.testId === testId) return { ok: true, attempt: serializeAttempt(open) };
    return { ok: false, reason: "other-open", openTestId: open.testId as TestId };
  }

  const emptyAnswers = testId === "english-level" ? {} : { flagged: {}, picks: {} };
  const created = await AttemptModel.create({
    userId,
    testId,
    status: "in_progress",
    answers: emptyAnswers,
    progress: computeProgress(testId, emptyAnswers),
    startedAt: new Date(),
  });
  return { ok: true, attempt: serializeAttempt(created) };
}
