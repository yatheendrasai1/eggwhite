import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { AttemptModel } from "@/lib/models/Attempt";
import { serializeAttempt } from "@/lib/attempts";
import { isTranslationTest, TRANSLATION_CONFIGS } from "@/lib/tests/translationConfigs";
import type { TranslationAnswers } from "@/lib/tests/translation";
import { evaluateTranslation } from "@/lib/tests/translationEval";
import { isJiraCommentTest, JIRA_COMMENT_CONFIGS } from "@/lib/tests/jiraCommentConfigs";
import type { JiraCommentAnswers } from "@/lib/tests/jiraComment";
import { evaluateJiraComment } from "@/lib/tests/jiraCommentEval";

const OID = /^[a-f0-9]{24}$/i;

/** Test takers get at most 3 revalidations per test, however many items they flag. */
export const MAX_VERIFIES_PER_TEST = 3;

/**
 * Re-runs grading for a completed, flagged attempt, at most MAX_VERIFIES_PER_TEST
 * times. Consumes one "verify" up front (atomic $inc with rollback on failure)
 * so concurrent requests can't slip past the limit.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!OID.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });

  await connectDB();
  const existing = await AttemptModel.findOne({ _id: id, userId: session.user.id });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (existing.status !== "completed") {
    return NextResponse.json({ error: "attempt not completed" }, { status: 400 });
  }
  if (!existing.flags || existing.flags.length === 0) {
    return NextResponse.json({ error: "no flagged items to verify" }, { status: 400 });
  }

  const doc = await AttemptModel.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $inc: { verifyCount: 1 } },
    { new: true }
  );
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (doc.verifyCount > MAX_VERIFIES_PER_TEST) {
    await AttemptModel.updateOne({ _id: id }, { $inc: { verifyCount: -1 } });
    return NextResponse.json(
      { error: "verify limit reached", limit: MAX_VERIFIES_PER_TEST },
      { status: 429 }
    );
  }

  try {
    if (isTranslationTest(doc.testId)) {
      const result = await evaluateTranslation(
        TRANSLATION_CONFIGS[doc.testId],
        (doc.answers ?? { fills: {} }) as TranslationAnswers
      );
      doc.summary = {
        line: result.summaryLine,
        pct: Math.round(result.pct),
        level: result.band.code,
        parts: { total: result.total, maxScore: result.maxScore },
      };
      doc.detail = result;
      doc.markModified("detail");
    } else if (isJiraCommentTest(doc.testId)) {
      const result = await evaluateJiraComment(
        JIRA_COMMENT_CONFIGS[doc.testId],
        (doc.answers ?? { response: "" }) as JiraCommentAnswers
      );
      doc.summary = {
        line: result.summaryLine,
        pct: Math.round((result.total / result.maxScore) * 100),
        level: result.band.code,
        parts: { total: result.total, maxScore: result.maxScore },
      };
      doc.detail = result;
      doc.markModified("detail");
    }
    // Rule-based tests are deterministic — nothing to re-grade, but the
    // verify still counts against the per-test limit and clears the flags.
  } catch (err) {
    console.error("re-grading on verify failed", err);
    await AttemptModel.updateOne({ _id: id }, { $inc: { verifyCount: -1 } });
    return NextResponse.json(
      { error: "revalidation failed, please try again" },
      { status: 502 }
    );
  }

  doc.flags.splice(0, doc.flags.length);
  doc.markModified("flags");
  await doc.save();

  return NextResponse.json({
    attempt: serializeAttempt(doc),
    verifiesRemaining: MAX_VERIFIES_PER_TEST - doc.verifyCount,
  });
}
