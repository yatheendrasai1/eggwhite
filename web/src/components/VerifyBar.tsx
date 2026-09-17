"use client";

import { useState } from "react";
import type { AttemptDTO } from "@/lib/attempts";
import { verifyAttempt } from "@/lib/client/attemptsApi";

const MAX_VERIFIES = 3;

export function VerifyBar({
  attemptId,
  flagCount,
  verifyCount,
  onVerified,
}: {
  attemptId: string;
  flagCount: number;
  verifyCount: number;
  onVerified: (attempt: AttemptDTO) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (flagCount === 0) return null;

  const remaining = Math.max(0, MAX_VERIFIES - verifyCount);

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      const { attempt } = await verifyAttempt(attemptId);
      onVerified(attempt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel verify-bar">
      <p className="verify-bar-text">
        {flagCount} item{flagCount > 1 ? "s" : ""} flagged for review.{" "}
        {remaining > 0
          ? `You can request revalidation ${remaining} more time${remaining > 1 ? "s" : ""} on this test.`
          : "You've used all your revalidations for this test."}
      </p>
      <button
        type="button"
        className="btn"
        style={{ width: "auto" }}
        onClick={verify}
        disabled={busy || remaining === 0}
      >
        {busy ? "Verifying…" : "Verify flagged results"}
      </button>
      {error && <p className="flag-error">{error}</p>}
    </div>
  );
}
