"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

export type GeminiModelOption = { id: string; label: string; note: string };

export function GeminiModelPicker({
  options,
  current,
}: {
  options: GeminiModelOption[];
  current: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function select(model: string) {
    if (model === current || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/gemini-model", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });
      if (!res.ok) throw new Error("update failed");
      router.refresh();
    } catch {
      setError("Failed to switch models — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ul className="dash-list">
        {options.map((o) => (
          <li className="dash-row" key={o.id}>
            <div className="dash-row-top">
              <span className="dash-row-label">{o.label}</span>
              {o.id === current && <span className="dash-status used">Active</span>}
            </div>
            <div className="dash-row-meta">
              <span>{o.note}</span>
            </div>
            <div className="dash-row-foot">
              <button
                className="dash-toggle-btn"
                onClick={() => select(o.id)}
                disabled={busy || o.id === current}
              >
                {busy ? (
                  <>
                    <Spinner /> Switching…
                  </>
                ) : o.id === current ? (
                  "In use"
                ) : (
                  "Switch to this"
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error && <p className="warn show">{error}</p>}
    </div>
  );
}
