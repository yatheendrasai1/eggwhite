import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongoClient";
import { requireTivSession } from "@/lib/pro";

export async function GET() {
  const session = await requireTivSession();
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  const client = await getMongoClient();
  const docs = await client
    .db("eggwhite")
    .collection("users")
    .find({ status: "pending" })
    .sort({ createdAt: -1 })
    .project({ username: 1, entryCode: 1, createdAt: 1 })
    .toArray();

  return NextResponse.json({
    pending: docs.map((d) => ({
      id: String(d._id),
      username: d.username,
      entryCode: d.entryCode,
      createdAt: d.createdAt ?? null,
    })),
  });
}
