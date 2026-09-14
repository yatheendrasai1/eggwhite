import crypto from "node:crypto";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { PasscodeModel } from "@/lib/models/Passcode";
import { ProUsageModel } from "@/lib/models/ProUsage";
import { UserProfileModel, type UserProfile } from "@/lib/models/UserProfile";

const PRO_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const DAILY_PRO_LIMIT = 4;

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

export function isProActive(profile: Pick<UserProfile, "proExpiresAt"> | null | undefined): boolean {
  return isProAtTime(profile, new Date());
}

export function isProAtTime(
  profile: Pick<UserProfile, "proExpiresAt"> | null | undefined,
  at: Date
): boolean {
  return !!profile?.proExpiresAt && profile.proExpiresAt > at;
}

export type RedeemResult = { ok: true; proExpiresAt: Date } | { ok: false; reason: "invalid-or-used" };

export async function redeemPasscode(userId: string, plaintextCode: string): Promise<RedeemResult> {
  await connectDB();
  const codeHash = hashCode(plaintextCode);
  const now = new Date();

  const claimed = await PasscodeModel.findOneAndUpdate(
    { codeHash, used: false },
    { $set: { used: true, redeemedBy: userId, redeemedAt: now } },
    { new: true }
  );
  if (!claimed) return { ok: false, reason: "invalid-or-used" };

  const proExpiresAt = new Date(now.getTime() + PRO_DURATION_MS);
  await UserProfileModel.findOneAndUpdate(
    { userId },
    { $set: { proExpiresAt } },
    { upsert: true }
  );

  return { ok: true, proExpiresAt };
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export async function tryConsumeProSubmission(
  userId: string
): Promise<{ allowed: boolean; count: number; limit: number }> {
  await connectDB();
  const day = todayUTC();

  const doc = await ProUsageModel.findOneAndUpdate(
    { userId, day },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );

  if (doc.count > DAILY_PRO_LIMIT) {
    await ProUsageModel.updateOne({ _id: doc._id }, { $inc: { count: -1 } });
    return { allowed: false, count: DAILY_PRO_LIMIT, limit: DAILY_PRO_LIMIT };
  }
  return { allowed: true, count: doc.count, limit: DAILY_PRO_LIMIT };
}

/** True if this profile grants access to the /dashboard admin area. */
export function isTiv(profile: Pick<UserProfile, "isTiv"> | null | undefined): boolean {
  return !!profile?.isTiv;
}

/** Resolves the current session only if it belongs to a tiv (dashboard-admin) account. */
export async function requireTivSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  await connectDB();
  const profile = await UserProfileModel.findOne({ userId: session.user.id }).lean();
  if (!isTiv(profile)) return null;
  return session;
}

export function generatePasscode(): string {
  return crypto.randomBytes(15).toString("base64url");
}

export { hashCode as hashPasscode };
