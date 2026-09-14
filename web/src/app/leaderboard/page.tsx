import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ACTIVE_TESTS } from "@/lib/tests/registry";
import { getTestLeaderboard, getOverallLeaderboard } from "@/lib/leaderboard";
import { LeaderboardTestPicker } from "@/components/LeaderboardTestPicker";
import { BackHome } from "@/components/BackHome";
import type { TestId } from "@/lib/models/Attempt";

export const dynamic = "force-dynamic";

function fmtWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ test?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/leaderboard");

  const { test } = await searchParams;
  const activeTest = ACTIVE_TESTS.find((t) => t.id === test);
  const active = activeTest ? activeTest.id : "overall";
  const viewerId = session.user.id;

  return (
    <main className="page">
      <div className="wrap">
        <BackHome />
        <header className="masthead lb-header">
          <h1>Leaderboard</h1>
          <LeaderboardTestPicker options={ACTIVE_TESTS} value={active} />
        </header>

        {activeTest ? (
          <TestBoard testId={activeTest.id} viewerId={viewerId} />
        ) : (
          <OverallBoard viewerId={viewerId} />
        )}
      </div>
    </main>
  );
}

async function OverallBoard({ viewerId }: { viewerId: string }) {
  const rows = await getOverallLeaderboard(viewerId);
  if (rows.length === 0) {
    return <p className="filler">No completed tests yet — be the first on the board.</p>;
  }
  return (
    <ul className="lb-list">
      {rows.map((r) => (
        <li className={`lb-row${r.isYou ? " you" : ""}`} key={r.userId}>
          <span className="lb-rank">{r.rank}</span>
          <span className="lb-name">
            {r.displayName}
            <br />
            <span className="lb-meta">
              {r.testsCompleted}/{ACTIVE_TESTS.length} tests
            </span>
          </span>
          <span className="lb-score">
            {r.avgPct}
            <span> avg%</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

async function TestBoard({ testId, viewerId }: { testId: TestId; viewerId: string }) {
  const rows = await getTestLeaderboard(testId, viewerId);
  if (rows.length === 0) {
    return <p className="filler">No one has completed this test yet — be the first on the board.</p>;
  }
  return (
    <ul className="lb-list">
      {rows.map((r) => (
        <li className={`lb-row${r.isYou ? " you" : ""}`} key={r.userId}>
          <span className="lb-rank">{r.rank}</span>
          <span className="lb-name">
            {r.displayName}
            <br />
            <span className="lb-meta">
              {r.level} · {fmtWhen(r.takenAt)}
            </span>
          </span>
          <span className="lb-score">
            {r.pct}
            <span>%</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
