import { NextResponse } from "next/server";
import { requireTivSession } from "@/lib/pro";
import { setTestEnabled } from "@/lib/tests/testSettings";
import { updateTestSettingSchema } from "@/lib/validation";
import { ACTIVE_TESTS } from "@/lib/tests/registry";
import type { TestId } from "@/lib/models/Attempt";

/** Only active (non-archived) tests can be toggled — archived tests always stay visible. */
function isManageableTestId(id: string): id is TestId {
  return ACTIVE_TESTS.some((t) => t.id === id);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireTivSession();
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { id } = await params;
  if (!isManageableTestId(id)) return NextResponse.json({ error: "not found" }, { status: 404 });

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

  await setTestEnabled(id, parsed.data.enabled);
  return NextResponse.json({ ok: true, testId: id, enabled: parsed.data.enabled });
}
