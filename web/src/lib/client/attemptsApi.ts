"use client";

import type { AttemptDTO } from "@/lib/attempts";

export async function patchAttempt(
  id: string,
  payload: { answers?: unknown; complete?: boolean }
): Promise<AttemptDTO> {
  const res = await fetch(`/api/attempts/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`PATCH /api/attempts/${id} → ${res.status}`);
  const data = await res.json();
  return data.attempt as AttemptDTO;
}

export async function deleteAttempt(id: string): Promise<void> {
  const res = await fetch(`/api/attempts/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    throw new Error(`DELETE /api/attempts/${id} → ${res.status}`);
  }
}

export async function startAttempt(testId: string): Promise<AttemptDTO> {
  const res = await fetch(`/api/attempts`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ testId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `POST /api/attempts → ${res.status}`);
  return data.attempt as AttemptDTO;
}
