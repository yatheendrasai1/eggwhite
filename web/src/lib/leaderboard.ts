import { connectDB } from "@/lib/db";
import { ResultModel } from "@/lib/models/Result";
import { resolveDisplayNames } from "@/lib/users";
import type { TestId } from "@/lib/models/Attempt";

const LIMIT = 50;

export type TestLeaderboardRow = {
  rank: number;
  userId: string;
  displayName: string;
  pct: number;
  level: string;
  takenAt: string;
  isYou: boolean;
};

export type OverallLeaderboardRow = {
  rank: number;
  userId: string;
  displayName: string;
  avgPct: number;
  testsCompleted: number;
  isYou: boolean;
};

export async function getTestLeaderboard(
  testId: TestId,
  viewerId?: string
): Promise<TestLeaderboardRow[]> {
  await connectDB();
  const docs = await ResultModel.find({ testId })
    .sort({ pct: -1, takenAt: 1 })
    .limit(LIMIT)
    .lean();

  const names = await resolveDisplayNames(docs.map((d) => d.userId));

  return docs.map((d, i) => ({
    rank: i + 1,
    userId: d.userId,
    displayName: names[d.userId] ?? "Anonymous",
    pct: d.pct,
    level: d.level,
    takenAt: new Date(d.takenAt).toISOString(),
    isYou: d.userId === viewerId,
  }));
}

export async function getOverallLeaderboard(
  viewerId?: string
): Promise<OverallLeaderboardRow[]> {
  await connectDB();
  const agg = await ResultModel.aggregate<{
    _id: string;
    avgPct: number;
    testsCompleted: number;
  }>([
    {
      $group: {
        _id: "$userId",
        avgPct: { $avg: "$pct" },
        testsCompleted: { $sum: 1 },
      },
    },
    { $sort: { avgPct: -1, testsCompleted: -1 } },
    { $limit: LIMIT },
  ]);

  const names = await resolveDisplayNames(agg.map((a) => a._id));

  return agg.map((a, i) => ({
    rank: i + 1,
    userId: a._id,
    displayName: names[a._id] ?? "Anonymous",
    avgPct: Math.round(a.avgPct),
    testsCompleted: a.testsCompleted,
    isYou: a._id === viewerId,
  }));
}
