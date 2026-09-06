import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { AttemptModel } from "@/lib/models/Attempt";
import { serializeAttempt, listAttempts } from "@/lib/attempts";
import { startAttemptSchema } from "@/lib/validation";
import { computeProgress } from "@/lib/tests/score";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const attempts = await listAttempts(session.user.id);
  return NextResponse.json({ attempts });
}

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

  const parsed = startAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();
  const userId = session.user.id;
  const { testId } = parsed.data;

  // Single-open-test rule: only one in-progress attempt at a time.
  const open = await AttemptModel.findOne({ userId, status: "in_progress" });
  if (open) {
    if (open.testId === testId) {
      return NextResponse.json({ attempt: serializeAttempt(open) }, { status: 200 });
    }
    return NextResponse.json(
      { error: "another test is open", attempt: serializeAttempt(open) },
      { status: 409 }
    );
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

  return NextResponse.json({ attempt: serializeAttempt(created) }, { status: 201 });
}
