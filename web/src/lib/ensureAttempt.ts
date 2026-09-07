import { connectDB } from "@/lib/db";
import { AttemptModel, type TestId } from "@/lib/models/Attempt";
import { serializeAttempt, type AttemptDTO } from "@/lib/attempts";
import { computeProgress } from "@/lib/tests/score";
import { emptyAnswers } from "@/lib/tests/registry";

/**
 * Returns the user's in-progress attempt for `testId`, creating one if none
 * exists. Multiple different tests may be in progress at once; a completed
 * attempt for this test does not block a fresh start (the newest one wins).
 */
export async function ensureAttempt(
  userId: string,
  testId: TestId
): Promise<{ ok: true; attempt: AttemptDTO }> {
  await connectDB();

  const open = await AttemptModel.findOne({
    userId,
    testId,
    status: "in_progress",
  }).sort({ updatedAt: -1 });
  if (open) return { ok: true, attempt: serializeAttempt(open) };

  const answers = emptyAnswers(testId);
  const created = await AttemptModel.create({
    userId,
    testId,
    status: "in_progress",
    answers,
    progress: computeProgress(testId, answers),
    startedAt: new Date(),
  });
  return { ok: true, attempt: serializeAttempt(created) };
}
