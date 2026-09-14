import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TESTS } from "@/lib/tests/registry";
import { getTestLeaderboard, getOverallLeaderboard } from "@/lib/leaderboard";
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
  const activeTest = TESTS.find((t) => t.id === test);
  const active = activeTest ? activeTest.id : "overall";
  const viewerId = session.user.id;

  return (
    <main className="page">
      <div className="wrap">
        <header className="masthead">
          <p className="eyebrow">Leaderboard</p>
          <h1>
            Top <em>scores</em>
          </h1>
          <p className="lede">
            Ranked by first-attempt score — retaking a test updates your own review, not your
            leaderboard spot.
          </p>
        </header>

        <nav className="lb-tabs">
          <Link href="/leaderboard?test=overall" className={`lb-tab${active === "overall" ? " on" : ""}`}>
            Overall
          </Link>
          {TESTS.map((t) => (
            <Link
              key={t.id}
              href={`/leaderboard?test=${t.id}`}
              className={`lb-tab${active === t.id ? " on" : ""}`}
            >
              {t.title}
            </Link>
          ))}
        </nav>

        {activeTest ? (
          <TestBoard testId={activeTest.id} viewerId={viewerId} />
        ) : (
          <OverallBoard viewerId={viewerId} />
        )}

        <p className="foot" style={{ marginTop: 24 }}>
          <Link href="/" style={{ color: "var(--violet)" }}>
            ← Back to all tests
          </Link>
        </p>
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
              {r.testsCompleted}/{TESTS.length} tests
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
