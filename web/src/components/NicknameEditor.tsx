"use client";

import { useState } from "react";
import { Spinner } from "@/components/Spinner";
import { useLoading } from "@/components/LoadingOverlay";

export function NicknameEditor({ initialNickname }: { initialNickname: string | null }) {
  const [value, setValue] = useState(initialNickname ?? "");
  const [saved, setSaved] = useState(initialNickname ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { withLoading } = useLoading();

  const dirty = value.trim() !== (saved ?? "");

  async function save() {
    setSaving(true);
    setError("");
    try {
      await withLoading(async () => {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ nickname: value.trim() }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setSaved(data.nickname ?? "");
        setValue(data.nickname ?? "");
      });
    } catch {
      setError("Couldn't save — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-info" style={{ marginBottom: 20 }}>
      <div className="profile-info-row profile-info-edit">
        <span className="profile-info-label">Nickname</span>
        <div className="profile-nickname-input">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. GrammarGoblin"
            maxLength={32}
            className="fill"
          />
          <button className="btn" disabled={!dirty || saving} onClick={save}>
            {saving ? (
              <>
                <Spinner /> Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
      <p className="profile-info-caption">
        Takes precedence over your name on the leaderboard when set — leave blank to use your
        name instead.
      </p>
      {error ? <p className="warn show">{error}</p> : null}
    </div>
  );
}
