import { NextResponse } from "next/server";
import { requireTivSession } from "@/lib/pro";
import { connectDB } from "@/lib/db";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { updateUserLeaderboardSchema } from "@/lib/validation";

const OID = /^[a-f0-9]{24}$/i;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireTivSession();
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { id } = await params;
  if (!OID.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const parsed = updateUserLeaderboardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();
  await UserProfileModel.findOneAndUpdate(
    { userId: id },
    { $set: { hideFromLeaderboard: parsed.data.hideFromLeaderboard } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true, userId: id, hideFromLeaderboard: parsed.data.hideFromLeaderboard });
}
