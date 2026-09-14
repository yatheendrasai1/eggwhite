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
    <div className="auth-card" style={{ marginBottom: 20 }}>
      <p className="section-label" style={{ marginBottom: 10 }}>
        Leaderboard nickname
      </p>
      <p className="foot" style={{ margin: "0 0 12px" }}>
        Shown on the leaderboard instead of your real name. Leave blank to use your name.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. GrammarGoblin"
          maxLength={32}
          className="fill"
          style={{ flex: 1, width: "auto" }}
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
      {error ? <p className="warn show">{error}</p> : null}
    </div>
  );
}
