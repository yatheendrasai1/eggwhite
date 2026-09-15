import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { updateProfileSchema } from "@/lib/validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await connectDB();
  const doc = await UserProfileModel.findOne({ userId: session.user.id }).lean();
  return NextResponse.json({ nickname: doc?.nickname || null, theme: doc?.theme || "system" });
}

export async function PATCH(req: Request) {
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

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();
  const update: Record<string, unknown> = {};
  if (parsed.data.nickname !== undefined) update.nickname = parsed.data.nickname.trim();
  if (parsed.data.theme !== undefined) update.theme = parsed.data.theme;

  const doc = await UserProfileModel.findOneAndUpdate(
    { userId: session.user.id },
    { $set: update },
    { upsert: true, new: true }
  );

  return NextResponse.json({ nickname: doc.nickname || null, theme: doc.theme || "system" });
}
