"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

export type PendingSignupRow = {
  id: string;
  username: string;
  entryCode: string;
  createdAt: string | null;
};

function fmt(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PendingSignupsTable({ pending }: { pending: PendingSignupRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleReject(id: string) {
    if (!confirm("Reject this signup? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/pending-signups/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("reject failed");
      router.refresh();
    } catch {
      alert("Failed to reject signup.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopy(id: string, code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    } catch {
      alert("Couldn't copy — your browser may be blocking clipboard access.");
    }
  }

  if (pending.length === 0) {
    return <p className="filler">No pending signups.</p>;
  }

  return (
    <ul className="dash-list">
      {pending.map((p) => (
        <li className="dash-row" key={p.id}>
          <div className="dash-row-top">
            <span className="dash-row-label">{p.username}</span>
            <span className="dash-status unused">Pending</span>
          </div>
          <div className="dash-row-meta">
            <span className="dash-code-wrap">
              <span className="dash-code">{p.entryCode}</span>
              <button
                type="button"
                className="dash-copy-btn"
                onClick={() => handleCopy(p.id, p.entryCode)}
                aria-label="Copy entry code"
                title="Copy entry code"
              >
                {copiedId === p.id ? (
                  "Copied"
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </span>
          </div>
          <div className="dash-row-meta">
            <span>
              Signed up: <b>{fmt(p.createdAt)}</b>
            </span>
          </div>
          <div className="dash-row-foot">
            <button
              className="dash-delete-btn"
              onClick={() => handleReject(p.id)}
              disabled={deletingId === p.id}
            >
              {deletingId === p.id ? (
                <>
                  <Spinner /> Rejecting…
                </>
              ) : (
                "Reject"
              )}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
