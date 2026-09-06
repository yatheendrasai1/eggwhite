import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { AttemptModel } from "@/lib/models/Attempt";
import { serializeAttempt, listAttempts } from "@/lib/attempts";
import { startAttemptSchema } from "@/lib/validation";
import { computeProgress } from "@/lib/tests/score";
import { emptyAnswers } from "@/lib/tests/registry";

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

  // Multiple tests may be open at once — reuse this test's open attempt if any.
  const open = await AttemptModel.findOne({ userId, testId, status: "in_progress" });
  if (open) {
    return NextResponse.json({ attempt: serializeAttempt(open) }, { status: 200 });
  }

  const answers = emptyAnswers(testId);
  const created = await AttemptModel.create({
    userId,
    testId,
    status: "in_progress",
    answers,
    progress: computeProgress(testId, answers),
    startedAt: new Date(),
  });

  return NextResponse.json({ attempt: serializeAttempt(created) }, { status: 201 });
}
