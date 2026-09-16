import { connectDB } from "@/lib/db";
import { ResultModel } from "@/lib/models/Result";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { resolveDisplayNames } from "@/lib/users";
import { ACTIVE_TESTS } from "@/lib/tests/registry";
import type { TestId } from "@/lib/models/Attempt";

const LIMIT = 50;
/** Archived tests are excluded from the leaderboard entirely. */
const ACTIVE_TEST_IDS = ACTIVE_TESTS.map((t) => t.id);

async function getHiddenUserIds(): Promise<string[]> {
  const docs = await UserProfileModel.find({ hideFromLeaderboard: true })
    .select("userId")
    .lean();
  return docs.map((d) => d.userId);
}

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
  if (!ACTIVE_TEST_IDS.includes(testId)) return [];
  await connectDB();
  const hiddenUserIds = await getHiddenUserIds();
  const docs = await ResultModel.find({ testId, userId: { $nin: hiddenUserIds } })
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
  const hiddenUserIds = await getHiddenUserIds();
  const agg = await ResultModel.aggregate<{
    _id: string;
    avgPct: number;
    testsCompleted: number;
  }>([
    { $match: { testId: { $in: ACTIVE_TEST_IDS }, userId: { $nin: hiddenUserIds } } },
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
