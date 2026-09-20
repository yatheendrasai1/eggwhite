import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canStartSession } from "@/lib/games/getSomeSpace";
import { asGssStateLike, loadGameState, toStateDTO } from "@/lib/games/getSomeSpaceState";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const doc = await loadGameState(session.user.id);
  const check = canStartSession(asGssStateLike(doc), new Date());

  return NextResponse.json({
    state: toStateDTO(doc),
    canStartSession: check.ok,
    sessionBlockedReason: check.ok ? null : check.reason,
    sessionAvailableAt: check.ok ? null : check.availableAt.toISOString(),
  });
}
