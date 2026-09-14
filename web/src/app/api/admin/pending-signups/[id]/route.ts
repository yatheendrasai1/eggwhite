import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getMongoClient } from "@/lib/mongoClient";
import { requireTivSession } from "@/lib/pro";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireTivSession();
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const client = await getMongoClient();
  const res = await client
    .db("eggwhite")
    .collection("users")
    .deleteOne({ _id: new ObjectId(id), status: "pending" });

  if (res.deletedCount === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
