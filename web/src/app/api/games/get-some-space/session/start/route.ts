import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canStartSession, startSession } from "@/lib/games/getSomeSpace";
import { applyGssStateLike, asGssStateLike, loadGameState, toStateDTO } from "@/lib/games/getSomeSpaceState";
import { isGssEnabled } from "@/lib/games/getSomeSpaceSettings";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!(await isGssEnabled())) {
    return NextResponse.json({ error: "disabled" }, { status: 403 });
  }

  const doc = await loadGameState(session.user.id);
  const now = new Date();
  const s = asGssStateLike(doc);

  const check = canStartSession(s, now);
  if (!check.ok) {
    return NextResponse.json(
      { error: check.reason, availableAt: check.availableAt.toISOString() },
      { status: 429 }
    );
  }

  startSession(s, now);
  applyGssStateLike(doc, s);
  await doc.save();

  return NextResponse.json({ state: toStateDTO(doc) });
}
