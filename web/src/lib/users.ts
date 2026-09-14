import { ObjectId } from "mongodb";
import { getMongoClient } from "@/lib/mongoClient";
import { connectDB } from "@/lib/db";
import { UserProfileModel } from "@/lib/models/UserProfile";

const AUTH_DB = "eggwhite";

/**
 * Resolves display names for a set of userIds: nickname (if the user set
 * one) takes precedence over their Google/GitHub profile name.
 */
export async function resolveDisplayNames(
  userIds: string[]
): Promise<Record<string, string>> {
  const uniqueIds = Array.from(new Set(userIds));
  if (uniqueIds.length === 0) return {};

  const [names, nicknames] = await Promise.all([
    getRealNames(uniqueIds),
    getNicknames(uniqueIds),
  ]);

  const result: Record<string, string> = {};
  for (const id of uniqueIds) {
    result[id] = nicknames[id] || names[id] || "Anonymous";
  }
  return result;
}

async function getRealNames(userIds: string[]): Promise<Record<string, string>> {
  const client = await getMongoClient();
  const db = client.db(AUTH_DB);
  const ids = userIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  if (ids.length === 0) return {};

  const docs = await db
    .collection("users")
    .find({ _id: { $in: ids } }, { projection: { name: 1 } })
    .toArray();

  const result: Record<string, string> = {};
  for (const d of docs) result[String(d._id)] = d.name ?? "";
  return result;
}

async function getNicknames(userIds: string[]): Promise<Record<string, string>> {
  await connectDB();
  const docs = await UserProfileModel.find({ userId: { $in: userIds } })
    .select("userId nickname")
    .lean();

  const result: Record<string, string> = {};
  for (const d of docs) if (d.nickname) result[d.userId] = d.nickname;
  return result;
}
