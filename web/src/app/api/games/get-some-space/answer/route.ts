import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { gssAnswerSchema } from "@/lib/validation";
import { submitAnswer } from "@/lib/games/getSomeSpace";
import { findQuestion } from "@/lib/games/getSomeSpaceContent";
import { applyGssStateLike, asGssStateLike, loadGameState, toStateDTO } from "@/lib/games/getSomeSpaceState";
import { recordGssResultIfBetter } from "@/lib/games/getSomeSpaceLeaderboard";

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
  const parsed = gssAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const doc = await loadGameState(session.user.id);
  const s = asGssStateLike(doc);

  if (s.status !== "active") {
    return NextResponse.json({ error: "no active session" }, { status: 409 });
  }
  if (!s.currentQuestionId || s.currentQuestionId !== parsed.data.questionId) {
    // Reload always re-shows the same pending question (spec §2.5) — a
    // mismatch means the client's view is stale.
    return NextResponse.json({ error: "stale question", state: toStateDTO(doc) }, { status: 409 });
  }

  const question = findQuestion(s.currentQuestionId);
  if (!question) {
    return NextResponse.json({ error: "unknown question" }, { status: 500 });
  }

  const outcome = submitAnswer(s, question, parsed.data.choiceIndex, new Date());
  applyGssStateLike(doc, s);
  await doc.save();

  if (outcome.pointsAwarded > 0) {
    await recordGssResultIfBetter({ userId: session.user.id, score: s.score, milestone: s.milestone });
  }

  return NextResponse.json({ outcome, state: toStateDTO(doc) });
}
