import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { AttemptModel } from "@/lib/models/Attempt";
import { migrateSchema } from "@/lib/validation";
import { computeProgress, computeSummary } from "@/lib/tests/score";
import { GUEST_FILE_TEST_ID } from "@/lib/guestMigration";
import { recordResultIfFirst } from "@/lib/results";

/**
 * Imports guest-mode (localStorage) progress into the signed-in user's
 * account. Never trusts client-supplied progress/summary — both are always
 * recomputed server-side from the submitted answers. A test is skipped if
 * the user already has any attempt for it, so guest data can never clobber
 * real account progress.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = migrateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();
  const userId = session.user.id;

  const migrated: string[] = [];
  const skipped: { file: string; testId?: string; reason: string }[] = [];

  for (const { file, record } of parsed.data.records) {
    const testId = GUEST_FILE_TEST_ID[file];
    if (!testId) {
      skipped.push({ file, reason: "not supported" });
      continue;
    }

    const existing = await AttemptModel.findOne({ userId, testId });
    if (existing) {
      skipped.push({ file, testId, reason: "already have progress for this test" });
      continue;
    }

    const answers = record.answers ?? {};
    const isCompleted = record.status === "completed";
    const startedAt =
      typeof record.startedAt === "number" ? new Date(record.startedAt) : new Date();
    const completedAt =
      typeof record.completedAt === "number" ? new Date(record.completedAt) : new Date();
    const summary = isCompleted ? computeSummary(testId, answers) : undefined;

    const created = await AttemptModel.create({
      userId,
      testId,
      status: isCompleted ? "completed" : "in_progress",
      answers,
      progress: computeProgress(testId, answers),
      startedAt,
      ...(isCompleted ? { completedAt, summary } : {}),
    });

    if (isCompleted && summary) {
      await recordResultIfFirst({
        userId,
        testId,
        attemptId: String(created._id),
        summary,
        takenAt: completedAt,
      });
    }

    migrated.push(testId);
  }

  return NextResponse.json({ migrated, skipped });
}
