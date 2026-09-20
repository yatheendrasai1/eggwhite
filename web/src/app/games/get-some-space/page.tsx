import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BackHome } from "@/components/BackHome";
import { GetSomeSpaceRunner } from "@/components/GetSomeSpaceRunner";
import { canStartSession } from "@/lib/games/getSomeSpace";
import { asGssStateLike, loadGameState, toStateDTO } from "@/lib/games/getSomeSpaceState";
import { getGssLeaderboard } from "@/lib/games/getSomeSpaceLeaderboard";

export const dynamic = "force-dynamic";

export default async function GetSomeSpacePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/games/get-some-space");

  const doc = await loadGameState(session.user.id);
  const check = canStartSession(asGssStateLike(doc), new Date());
  const leaderboard = await getGssLeaderboard(session.user.id);

  return (
    <main className="page">
      <div className="wrap">
        <header className="masthead">
          <BackHome />
          <p className="eyebrow">Trivia · Ascent</p>
          <h1>
            Get Some <em>Space!</em>
          </h1>
        </header>

        <GetSomeSpaceRunner
          initialState={toStateDTO(doc)}
          initialCanStart={check.ok}
          initialBlockedReason={check.ok ? null : check.reason}
          initialAvailableAt={check.ok ? null : check.availableAt.toISOString()}
          leaderboard={leaderboard}
        />
      </div>
    </main>
  );
}
