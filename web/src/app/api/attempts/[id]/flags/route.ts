import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { AttemptModel } from "@/lib/models/Attempt";
import { serializeAttempt } from "@/lib/attempts";
import { flagItemSchema, unflagItemSchema } from "@/lib/validation";

const OID = /^[a-f0-9]{24}$/i;

/** Flags an item's score for revalidation, or updates the comment if it's already flagged. */
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
  const parsed = flagItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();
  const doc = await AttemptModel.findOne({ _id: id, userId: session.user.id });
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (doc.status !== "completed") {
    return NextResponse.json({ error: "attempt not completed" }, { status: 400 });
  }

  const { itemKey, comment } = parsed.data;
  const existing = doc.flags.find((f) => f.itemKey === itemKey);
  if (existing) {
    existing.comment = comment;
  } else {
    doc.flags.push({ itemKey, comment, createdAt: new Date() });
  }
  doc.markModified("flags");
  await doc.save();

  return NextResponse.json({ attempt: serializeAttempt(doc) });
}

/** Removes a flag from an item. */
export async function DELETE(
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
  const parsed = unflagItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();
  const doc = await AttemptModel.findOne({ _id: id, userId: session.user.id });
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });

  const idx = doc.flags.findIndex((f) => f.itemKey === parsed.data.itemKey);
  if (idx >= 0) doc.flags.splice(idx, 1);
  doc.markModified("flags");
  await doc.save();

  return NextResponse.json({ attempt: serializeAttempt(doc) });
}
