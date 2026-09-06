import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { AttemptModel } from "@/lib/models/Attempt";
import { serializeAttempt } from "@/lib/attempts";
import { patchAttemptSchema } from "@/lib/validation";
import { computeProgress, computeSummary } from "@/lib/tests/score";

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
    doc.status = "completed";
    doc.completedAt = new Date();
    doc.summary = computeSummary(doc.testId, answers);
  }

  doc.markModified("answers");
  await doc.save();
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
