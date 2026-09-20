"use client";

import type { GssLeaderboardRow } from "@/lib/games/getSomeSpaceLeaderboard";

export function GssLeaderboardCard({ rows }: { rows: GssLeaderboardRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="gss-leaderboard">
      <h3>Top climbers</h3>
      <ol>
        {rows.slice(0, 10).map((r) => (
          <li key={r.userId} className={r.isYou ? "gss-leaderboard-you" : undefined}>
            <span className="gss-leaderboard-rank">#{r.rank}</span>
            <span className="gss-leaderboard-name">{r.displayName}</span>
            <span className="gss-leaderboard-level">{r.level}</span>
            <span className="gss-leaderboard-score">{r.score} pts</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
