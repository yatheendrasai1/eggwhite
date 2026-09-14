import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { redeemPasscodeSchema } from "@/lib/validation";
import { redeemPasscode } from "@/lib/pro";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = redeemPasscodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await redeemPasscode(session.user.id, parsed.data.code);
  if (!result.ok) {
    return NextResponse.json({ error: "invalid or already-used code" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, proExpiresAt: result.proExpiresAt });
}
