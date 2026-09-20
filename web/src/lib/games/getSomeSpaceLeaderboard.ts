import { connectDB } from "@/lib/db";
import { ResultModel } from "@/lib/models/Result";
import { UserProfileModel } from "@/lib/models/UserProfile";
import { resolveDisplayNames } from "@/lib/users";
import { MILESTONES, SEGMENTS, type MilestoneKey } from "@/lib/games/getSomeSpace";

/** Reuses the existing Result collection/leaderboard infra, under its own testId. */
export const GSS_TEST_ID = "get-some-space";
export const GSS_TEST_NAME = "Get Some Space!";

const MAX_SCORE = (Object.keys(SEGMENTS) as unknown as (1 | 2 | 3)[]).reduce(
  (sum, seg) => sum + SEGMENTS[seg].requiredCorrect * SEGMENTS[seg].pointsPerCorrect,
  0
);

function milestoneLabel(key: string): string {
  return MILESTONES.find((m) => m.key === key)?.label ?? key;
}

/**
 * Unlike `recordResultIfFirst` (write-once, for one-shot graded tests),
 * this game's score keeps climbing across sessions/days, so the leaderboard
 * row is upserted whenever the player's best score improves.
 */
export async function recordGssResultIfBetter(params: {
  userId: string;
  score: number;
  milestone: MilestoneKey;
}): Promise<void> {
  await connectDB();
  const pct = Math.min(100, Math.round((params.score / MAX_SCORE) * 100));
  const existing = await ResultModel.findOne({ userId: params.userId, testId: GSS_TEST_ID }).lean();
  if (existing && existing.pct >= pct) return;

  await ResultModel.findOneAndUpdate(
    { userId: params.userId, testId: GSS_TEST_ID },
    {
      $set: {
        testName: GSS_TEST_NAME,
        attemptId: params.userId, // no per-attempt id for an ongoing game; the row is keyed by (userId, testId) anyway
        pct,
        level: milestoneLabel(params.milestone),
        parts: { score: params.score },
        takenAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export type GssLeaderboardRow = {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  level: string;
  isYou: boolean;
};

export async function getGssLeaderboard(viewerId?: string): Promise<GssLeaderboardRow[]> {
  await connectDB();
  const hidden = await UserProfileModel.find({ hideFromLeaderboard: true }).select("userId").lean();
  const hiddenIds = hidden.map((d) => d.userId);
  const docs = await ResultModel.find({ testId: GSS_TEST_ID, userId: { $nin: hiddenIds } })
    .sort({ pct: -1, takenAt: 1 })
    .limit(50)
    .lean();
  const names = await resolveDisplayNames(docs.map((d) => d.userId));
  return docs.map((d, i) => ({
    rank: i + 1,
    userId: d.userId,
    displayName: names[d.userId] ?? "Anonymous",
    score: (d.parts as { score?: number } | undefined)?.score ?? 0,
    level: d.level,
    isYou: d.userId === viewerId,
  }));
}
