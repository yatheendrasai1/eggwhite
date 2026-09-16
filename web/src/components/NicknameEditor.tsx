"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";
import { useLoading } from "@/components/LoadingOverlay";

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.5 2.5l2 2-8 8-2.6.6.6-2.6 8-8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 3l10 10M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Inline-editable nickname row, embedded alongside name/email in the profile info card. */
export function NicknameEditor({ initialNickname }: { initialNickname: string | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialNickname ?? "");
  const [saved, setSaved] = useState(initialNickname ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { withLoading } = useLoading();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEdit() {
    setValue(saved);
    setError("");
    setEditing(true);
  }

  function cancel() {
    setValue(saved);
    setError("");
    setEditing(false);
  }

  async function save() {
    const trimmed = value.trim();
    if (trimmed === saved) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await withLoading(async () => {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ nickname: trimmed }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setSaved(data.nickname ?? "");
        setValue(data.nickname ?? "");
      });
      setEditing(false);
    } catch {
      setError("Couldn't save — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-info-row profile-info-edit">
      <span className="profile-info-label">Nickname</span>
      {editing ? (
        <div className="profile-nickname-edit">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            placeholder="e.g. GrammarGoblin"
            maxLength={32}
            className="fill"
            disabled={saving}
          />
          <button
            type="button"
            className="profile-icon-btn profile-icon-btn-save"
            onClick={save}
            disabled={saving}
            aria-label="Save nickname"
          >
            {saving ? <Spinner size={12} /> : <CheckIcon />}
          </button>
          <button
            type="button"
            className="profile-icon-btn profile-icon-btn-cancel"
            onClick={cancel}
            disabled={saving}
            aria-label="Cancel"
          >
            <XIcon />
          </button>
        </div>
      ) : (
        <div className="profile-nickname-display">
          <span className={`profile-nickname-text${saved ? "" : " empty"}`}>{saved}</span>
          <button
            type="button"
            className="profile-icon-btn profile-edit-icon-btn"
            onClick={startEdit}
            aria-label="Edit nickname"
          >
            <PencilIcon />
          </button>
        </div>
      )}
      {error ? <p className="warn show">{error}</p> : null}
    </div>
  );
}
