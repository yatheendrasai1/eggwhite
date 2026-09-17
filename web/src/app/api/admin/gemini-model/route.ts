import { NextResponse } from "next/server";
import { requireTivSession } from "@/lib/pro";
import { setGeminiModel } from "@/lib/gemini";
import { updateGeminiModelSchema } from "@/lib/validation";

export async function PATCH(req: Request) {
  const session = await requireTivSession();
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const parsed = updateGeminiModelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await setGeminiModel(parsed.data.model);
  return NextResponse.json({ ok: true, model: parsed.data.model });
}
