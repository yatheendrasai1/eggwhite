"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

export type ManageTestRow = {
  id: string;
  title: string;
  tag: string;
  enabled: boolean;
};

export function ManageTestsTable({
  tests,
  endpointBase = "/api/admin/tests",
}: {
  tests: ManageTestRow[];
  /** Base path each row PATCHes as `${endpointBase}/${id}` — lets this table manage things other than the test registry (e.g. a standalone game's on/off flag). */
  endpointBase?: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggle(id: string, enabled: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`${endpointBase}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("update failed");
      router.refresh();
    } catch {
      alert("Failed to update.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ul className="dash-list">
      {tests.map((t) => (
        <li className="dash-row" key={t.id}>
          <div className="dash-row-top">
            <span className="dash-row-label">{t.title}</span>
            <span className={`dash-status ${t.enabled ? "used" : "unused"}`}>
              {t.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <div className="dash-row-meta">
            <span>{t.tag}</span>
          </div>
          <div className="dash-row-foot">
            <button
              className={t.enabled ? "dash-delete-btn" : "dash-toggle-btn"}
              onClick={() => toggle(t.id, !t.enabled)}
              disabled={busyId === t.id}
            >
              {busyId === t.id ? (
                <>
                  <Spinner /> Saving…
                </>
              ) : t.enabled ? (
                "Disable"
              ) : (
                "Enable"
              )}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
