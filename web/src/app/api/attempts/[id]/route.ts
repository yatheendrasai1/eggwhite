import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { AttemptModel } from "@/lib/models/Attempt";
import { serializeAttempt } from "@/lib/attempts";
import { patchAttemptSchema } from "@/lib/validation";
import { computeProgress, computeSummary } from "@/lib/tests/score";
import { recordResultIfFirst } from "@/lib/results";
import { isProTest } from "@/lib/tests/proTests";
import { isProAtTime, tryConsumeProSubmission } from "@/lib/pro";
import { UserProfileModel } from "@/lib/models/UserProfile";
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

export async function GET(
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
  const doc = await AttemptModel.findOne({ _id: id, userId: session.user.id });
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ attempt: serializeAttempt(doc) });
}

export async function PATCH(
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
  const parsed = patchAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();
  const doc = await AttemptModel.findOne({ _id: id, userId: session.user.id });
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (doc.status === "completed") {
    return NextResponse.json({ attempt: serializeAttempt(doc) });
  }

  const answers = parsed.data.answers ?? doc.answers;
  doc.answers = answers;
  doc.progress = computeProgress(doc.testId, answers);

  if (parsed.data.complete) {
    if (isProTest(doc.testId)) {
      const profile = await UserProfileModel.findOne({ userId: session.user.id }).lean();
      if (!isProAtTime(profile, doc.startedAt)) {
        return NextResponse.json({ error: "pro access required" }, { status: 403 });
      }
    }

    if (isTranslationTest(doc.testId) || isJiraCommentTest(doc.testId) || isRightOrWrongTest(doc.testId)) {
      // Persist the submitted answers before calling the grading LLM, so a
      // Gemini failure never loses the candidate's work — the attempt stays
      // in_progress with the answers saved, and resubmitting just retries
      // grading on the same saved answer instead of redoing anything.
      doc.markModified("answers");
      await doc.save();
    }

    // Run any LLM grading before touching the daily quota or marking the
    // attempt completed, so a Gemini failure doesn't burn the user's quota
    // or leave the attempt stuck as "completed" with no real score.
    let translationResult: Awaited<ReturnType<typeof evaluateTranslation>> | null = null;
    if (isTranslationTest(doc.testId)) {
      try {
        translationResult = await evaluateTranslation(
          TRANSLATION_CONFIGS[doc.testId],
          (answers ?? { fills: {} }) as TranslationAnswers
        );
      } catch (err) {
        console.error("translation grading failed", err);
        return NextResponse.json({ error: "grading failed, please try again" }, { status: 502 });
      }
    }

    let jiraResult: Awaited<ReturnType<typeof evaluateJiraComment>> | null = null;
    if (isJiraCommentTest(doc.testId)) {
      try {
        jiraResult = await evaluateJiraComment(
          JIRA_COMMENT_CONFIGS[doc.testId],
          (answers ?? { response: "" }) as JiraCommentAnswers
        );
      } catch (err) {
        console.error("jira comment grading failed", err);
        return NextResponse.json({ error: "grading failed, please try again" }, { status: 502 });
      }
    }

    let rightOrWrongResult: Awaited<ReturnType<typeof evaluateRightOrWrong>> | null = null;
    if (isRightOrWrongTest(doc.testId)) {
      try {
        rightOrWrongResult = await evaluateRightOrWrong(
          RIGHT_OR_WRONG_CONFIGS[doc.testId],
          (answers ?? { verdicts: {}, issues: {}, fixes: {} }) as RightOrWrongAnswers
        );
      } catch (err) {
        console.error("right or wrong grading failed", err);
        return NextResponse.json({ error: "grading failed, please try again" }, { status: 502 });
      }
    }

    if (isProTest(doc.testId)) {
      const usage = await tryConsumeProSubmission(session.user.id);
      if (!usage.allowed) {
        return NextResponse.json({ error: "daily pro limit reached" }, { status: 429 });
      }
    }

    doc.status = "completed";
    doc.completedAt = new Date();
    if (translationResult) {
      doc.summary = {
        line: translationResult.summaryLine,
        pct: Math.round(translationResult.pct),
        level: translationResult.band.code,
        parts: { total: translationResult.total, maxScore: translationResult.maxScore },
      };
      doc.detail = translationResult;
      doc.markModified("detail");
    } else if (jiraResult) {
      doc.summary = {
        line: jiraResult.summaryLine,
        pct: Math.round((jiraResult.total / jiraResult.maxScore) * 100),
        level: jiraResult.band.code,
        parts: { total: jiraResult.total, maxScore: jiraResult.maxScore },
      };
      doc.detail = jiraResult;
      doc.markModified("detail");
    } else if (rightOrWrongResult) {
      doc.summary = {
        line: rightOrWrongResult.summaryLine,
        pct: Math.round(rightOrWrongResult.pct),
        level: rightOrWrongResult.band.code,
        parts: { total: rightOrWrongResult.total, maxScore: rightOrWrongResult.maxScore },
      };
      doc.detail = rightOrWrongResult;
      doc.markModified("detail");
    } else {
      doc.summary = computeSummary(doc.testId, answers);
    }
  }

  doc.markModified("answers");
  await doc.save();

  if (parsed.data.complete && doc.summary) {
    await recordResultIfFirst({
      userId: session.user.id,
      testId: doc.testId,
      attemptId: String(doc._id),
      summary: {
        line: doc.summary.line ?? "",
        pct: doc.summary.pct ?? 0,
        level: doc.summary.level ?? "",
        parts: doc.summary.parts ?? {},
      },
      takenAt: doc.completedAt ?? new Date(),
    });
  }

  return NextResponse.json({ attempt: serializeAttempt(doc) });
}

export async function DELETE(
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
  const res = await AttemptModel.deleteOne({ _id: id, userId: session.user.id });
  if (res.deletedCount === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
