import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GetSomeSpaceRunner } from "@/components/GetSomeSpaceRunner";
import { canStartSession } from "@/lib/games/getSomeSpace";
import { asGssStateLike, loadGameState, toStateDTO } from "@/lib/games/getSomeSpaceState";
import { getGssLeaderboard } from "@/lib/games/getSomeSpaceLeaderboard";

export const dynamic = "force-dynamic";

/**
 * Deliberately no <main className="page"> / masthead chrome here — this
 * game renders as a full-screen view (its own back button + HUD), not a
 * page in the usual site layout. See GetSomeSpaceRunner.
 */
export default async function GetSomeSpacePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/games/get-some-space");

  const doc = await loadGameState(session.user.id);
  const check = canStartSession(asGssStateLike(doc), new Date());
  const leaderboard = await getGssLeaderboard(session.user.id);

  return (
    <GetSomeSpaceRunner
      initialState={toStateDTO(doc)}
      initialCanStart={check.ok}
      initialBlockedReason={check.ok ? null : check.reason}
      initialAvailableAt={check.ok ? null : check.availableAt.toISOString()}
      leaderboard={leaderboard}
    />
  );
}
