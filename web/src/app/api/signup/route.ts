import { NextResponse } from "next/server";
import { z } from "zod";
import { signup } from "@/lib/localAuth";

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

  const result = await signup(parsed.data.username, parsed.data.password);
  if (!result.ok) {
    const messages: Record<typeof result.reason, string> = {
      "invalid-username": "Username must be 3-24 characters (letters, numbers, underscore).",
      "invalid-password": "Password must be at least 8 characters.",
      "username-taken": "That username is already taken.",
    };
    return NextResponse.json({ error: messages[result.reason] }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Account created. Ask the admin for your entry code, then activate it.",
  });
}
