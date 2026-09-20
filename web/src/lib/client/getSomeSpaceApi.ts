"use client";

import type { GssStateDTO } from "@/lib/games/getSomeSpaceState";
import type { AnswerOutcome } from "@/lib/games/getSomeSpace";

export type GssStateResponse = {
  state: GssStateDTO;
  canStartSession: boolean;
  sessionBlockedReason: "daily_limit" | "cooldown" | null;
  sessionAvailableAt: string | null;
};

export async function fetchGssState(): Promise<GssStateResponse> {
  const res = await fetch("/api/games/get-some-space/state");
  if (!res.ok) throw new Error(`GET state → ${res.status}`);
  return res.json();
}

export async function startGssSession(): Promise<{ state: GssStateDTO } | { error: string; availableAt: string }> {
  const res = await fetch("/api/games/get-some-space/session/start", { method: "POST" });
  const data = await res.json();
  if (!res.ok) return { error: data?.error ?? "unknown error", availableAt: data?.availableAt ?? "" };
  return data as { state: GssStateDTO };
}

export async function submitGssAnswer(
  questionId: string,
  choiceIndex: number
): Promise<{ outcome: AnswerOutcome; state: GssStateDTO }> {
  const res = await fetch("/api/games/get-some-space/answer", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionId, choiceIndex }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `POST answer → ${res.status}`);
  return data as { outcome: AnswerOutcome; state: GssStateDTO };
}
