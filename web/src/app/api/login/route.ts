import { NextResponse } from "next/server";
import { z } from "zod";
import { login, sessionCookieHeader } from "@/lib/localAuth";

const schema = z.object({
  username: z.string().trim(),
  password: z.string(),
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

  const result = await login(parsed.data.username, parsed.data.password);
  if (!result.ok) {
    const message =
      result.reason === "pending"
        ? "Your account is still pending — ask the admin for your entry code."
        : "Invalid username or password.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const secure = new URL(req.url).protocol === "https:";
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", sessionCookieHeader(result.cookie, secure));
  return res;
}
