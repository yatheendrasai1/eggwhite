"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

export type LeaderboardAccountRow = {
  userId: string;
  name: string;
  email: string;
  hidden: boolean;
};

export function ManageLeaderboardAccountsTable({
  accounts,
}: {
  accounts: LeaderboardAccountRow[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggle(userId: string, hideFromLeaderboard: boolean) {
    setBusyId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hideFromLeaderboard }),
      });
      if (!res.ok) throw new Error("update failed");
      router.refresh();
    } catch {
      alert("Failed to update account.");
    } finally {
      setBusyId(null);
    }
  }

  if (accounts.length === 0) {
    return <p className="filler">No accounts yet.</p>;
  }

  return (
    <ul className="dash-list">
      {accounts.map((a) => (
        <li className="dash-row" key={a.userId}>
          <div className="dash-row-top">
            <span className={`dash-row-label${a.name ? "" : " mute"}`}>
              {a.name || "Unnamed"}
            </span>
            <span className={`dash-status ${a.hidden ? "unused" : "used"}`}>
              {a.hidden ? "Hidden" : "On leaderboard"}
            </span>
          </div>
          <div className="dash-row-meta">
            <span>{a.email}</span>
          </div>
          <div className="dash-row-foot">
            <button
              className={a.hidden ? "dash-toggle-btn" : "dash-delete-btn"}
              onClick={() => toggle(a.userId, !a.hidden)}
              disabled={busyId === a.userId}
            >
              {busyId === a.userId ? (
                <>
                  <Spinner /> Saving…
                </>
              ) : a.hidden ? (
                "Show on leaderboard"
              ) : (
                "Hide from leaderboard"
              )}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
