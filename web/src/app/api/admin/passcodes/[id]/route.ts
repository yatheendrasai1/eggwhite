import { NextResponse } from "next/server";
import { PasscodeModel } from "@/lib/models/Passcode";
import { requireTivSession } from "@/lib/pro";

const OID = /^[a-f0-9]{24}$/i;

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireTivSession();
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { id } = await params;
  if (!OID.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const res = await PasscodeModel.deleteOne({ _id: id });
  if (res.deletedCount === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
