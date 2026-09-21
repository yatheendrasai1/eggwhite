import { NextResponse } from "next/server";
import { requireTivSession } from "@/lib/pro";
import { setGssEnabled } from "@/lib/games/getSomeSpaceSettings";
import { updateTestSettingSchema } from "@/lib/validation";

export async function PATCH(req: Request) {
  const session = await requireTivSession();
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const parsed = updateTestSettingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await setGssEnabled(parsed.data.enabled);
  return NextResponse.json({ ok: true, enabled: parsed.data.enabled });
}
