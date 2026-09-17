"use client";

import { useState } from "react";
import type { StoredFlag } from "@/lib/client/flagStorage";

const MAX_COMMENT_LEN = 100;

/**
 * Purely local — flagging/unflagging/editing a comment never hits the
 * network. The parent keeps the pending flags (mirrored to localStorage);
 * they only reach the server when "Verify" is clicked.
 */
export function FlagItemButton({
  itemKey,
  flag,
  onFlag,
  onUnflag,
}: {
  itemKey: string;
  flag: StoredFlag | undefined;
  onFlag: (itemKey: string, comment: string) => void;
  onUnflag: (itemKey: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState(flag?.comment ?? "");

  function submit() {
    onFlag(itemKey, comment.trim());
    setEditing(false);
  }

  function remove() {
    onUnflag(itemKey);
    setEditing(false);
    setComment("");
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
        <button type="button" className="flag-toggle" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button type="button" className="flag-toggle" onClick={remove}>
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
        >
          Cancel
        </button>
        <button type="button" className="flag-toggle flag-toggle-primary" onClick={submit}>
          {flag ? "Save" : "Flag this score"}
        </button>
      </div>
    </div>
  );
}
