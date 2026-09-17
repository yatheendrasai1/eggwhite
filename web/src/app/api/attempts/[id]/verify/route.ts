import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { AttemptModel } from "@/lib/models/Attempt";
import { serializeAttempt } from "@/lib/attempts";
import { verifyFlagsSchema } from "@/lib/validation";
import { isTranslationTest, TRANSLATION_CONFIGS } from "@/lib/tests/translationConfigs";
import type { TranslationAnswers } from "@/lib/tests/translation";
import { evaluateTranslation } from "@/lib/tests/translationEval";
import { isJiraCommentTest, JIRA_COMMENT_CONFIGS } from "@/lib/tests/jiraCommentConfigs";
import type { JiraCommentAnswers } from "@/lib/tests/jiraComment";
import { evaluateJiraComment } from "@/lib/tests/jiraCommentEval";
import { isRightOrWrongTest, RIGHT_OR_WRONG_CONFIGS } from "@/lib/tests/rightOrWrongConfigs";
import type { RightOrWrongAnswers } from "@/lib/tests/rightOrWrong";
import { evaluateRightOrWrong } from "@/lib/tests/rightOrWrongEval";

const OID = /^[a-f0-9]{24}$/i;

/** Test takers get at most 3 revalidations per test, however many items they flag. */
export const MAX_VERIFIES_PER_TEST = 3;

/**
 * Re-runs grading for a completed attempt against the flagged items the
 * client sends up. Flags are never persisted before this — the client keeps
 * them in localStorage only — so this request is also the one place they
 * get written to the attempt, as the durable record of what was disputed.
 * Consumes one "verify" up front (atomic $inc with rollback on failure) so
 * concurrent requests can't slip past the MAX_VERIFIES_PER_TEST limit.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!OID.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = verifyFlagsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();
  const existing = await AttemptModel.findOne({ _id: id, userId: session.user.id });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (existing.status !== "completed") {
    return NextResponse.json({ error: "attempt not completed" }, { status: 400 });
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
    } else if (isRightOrWrongTest(doc.testId)) {
      const result = await evaluateRightOrWrong(
        RIGHT_OR_WRONG_CONFIGS[doc.testId],
        (doc.answers ?? { verdicts: {}, issues: {}, fixes: {} }) as RightOrWrongAnswers
      );
      doc.summary = {
        line: result.summaryLine,
        pct: Math.round(result.pct),
        level: result.band.code,
        parts: { total: result.total, maxScore: result.maxScore },
      };
      doc.detail = result;
      doc.markModified("detail");
    }
    // Rule-based tests are deterministic — nothing to re-grade, but the
    // verify still counts against the per-test limit.
  } catch (err) {
    console.error("re-grading on verify failed", err);
    await AttemptModel.updateOne({ _id: id }, { $inc: { verifyCount: -1 } });
    return NextResponse.json(
      { error: "revalidation failed, please try again" },
      { status: 502 }
    );
  }

  // Only now — a successful verify — do the disputed items/comments become
  // durable, as the record of what this verification was about.
  doc.flags.splice(0, doc.flags.length);
  for (const f of parsed.data.flags) {
    doc.flags.push({ itemKey: f.itemKey, comment: f.comment, createdAt: new Date() });
  }
  doc.markModified("flags");
  await doc.save();

  return NextResponse.json({
    attempt: serializeAttempt(doc),
    verifiesRemaining: MAX_VERIFIES_PER_TEST - doc.verifyCount,
  });
}
