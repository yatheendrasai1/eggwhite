import { NextResponse } from "next/server";
import { PasscodeModel } from "@/lib/models/Passcode";
import { requireTivSession, generatePasscode, hashPasscode } from "@/lib/pro";
import { createPasscodeSchema } from "@/lib/validation";

export async function GET() {
  const session = await requireTivSession();
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  const docs = await PasscodeModel.find()
    .sort({ createdAt: -1 })
    .select("code label used redeemedBy redeemedAt createdAt")
    .lean();

  return NextResponse.json({
    passcodes: docs.map((d) => ({
      id: String(d._id),
      code: d.code,
      label: d.label || null,
      used: d.used,
      redeemedBy: d.redeemedBy,
      redeemedAt: d.redeemedAt,
      createdAt: d.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  const session = await requireTivSession();
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    // no body is fine; label is optional
  }
  const parsed = createPasscodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const code = generatePasscode();
  await PasscodeModel.create({
    code,
    codeHash: hashPasscode(code),
    label: parsed.data.label ?? "",
  });

  return NextResponse.json({ code });
}
