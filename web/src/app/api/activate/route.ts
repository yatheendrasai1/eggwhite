import { NextResponse } from "next/server";
import { z } from "zod";
import { activate, sessionCookieHeader } from "@/lib/localAuth";

const schema = z.object({
  username: z.string().trim(),
  entryCode: z.string().trim(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const result = await activate(parsed.data.username, parsed.data.entryCode);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Invalid username or entry code." },
      { status: 400 }
    );
  }

  const secure = new URL(req.url).protocol === "https:";
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", sessionCookieHeader(result.cookie, secure));
  return res;
}
