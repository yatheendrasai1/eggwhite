"use client";

import { useState } from "react";
import type { AttemptDTO } from "@/lib/attempts";
import { flagAttemptItem, unflagAttemptItem } from "@/lib/client/attemptsApi";

const MAX_COMMENT_LEN = 100;

export function FlagItemButton({
  attemptId,
  itemKey,
  flag,
  onUpdate,
}: {
  attemptId: string;
  itemKey: string;
  flag: AttemptDTO["flags"][number] | undefined;
  onUpdate: (attempt: AttemptDTO) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState(flag?.comment ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const attempt = await flagAttemptItem(attemptId, itemKey, comment.trim());
      onUpdate(attempt);
      setEditing(false);
    } catch {
      setError("Couldn't save the flag — try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const attempt = await unflagAttemptItem(attemptId, itemKey);
      onUpdate(attempt);
      setEditing(false);
      setComment("");
    } catch {
      setError("Couldn't remove the flag — try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!editing && !flag) {
    return (
      <button type="button" className="flag-toggle" onClick={() => setEditing(true)}>
        Flag this score
      </button>
    );
  }

  if (!editing && flag) {
    return (
      <div className="flag-badge">
        <span>Flagged{flag.comment ? `: "${flag.comment}"` : ""}</span>
        <button type="button" className="flag-toggle" onClick={() => setEditing(true)} disabled={busy}>
          Edit
        </button>
        <button type="button" className="flag-toggle" onClick={remove} disabled={busy}>
          Unflag
        </button>
      </div>
    );
  }

  return (
    <div className="flag-form">
      <textarea
        className="flag-comment"
        placeholder="What looks wrong? (optional, max 100 characters)"
        value={comment}
        maxLength={MAX_COMMENT_LEN}
        onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LEN))}
      />
      <div className="flag-form-row">
        <span className="flag-count">
          {comment.length}/{MAX_COMMENT_LEN}
        </span>
        <button
          type="button"
          className="flag-toggle"
          onClick={() => {
            setEditing(false);
            setComment(flag?.comment ?? "");
          }}
          disabled={busy}
        >
          Cancel
        </button>
        <button type="button" className="flag-toggle flag-toggle-primary" onClick={submit} disabled={busy}>
          {flag ? "Save" : "Flag this score"}
        </button>
      </div>
      {error && <p className="flag-error">{error}</p>}
    </div>
  );
}
