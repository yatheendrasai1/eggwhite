"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import { useConfirm } from "@/components/ConfirmDialog";

export type PasscodeRow = {
  id: string;
  code: string;
  label: string | null;
  used: boolean;
  redeemedBy: string | null;
  redeemedAt: string | null;
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

export function PasscodesTable({
  passcodes,
  names,
}: {
  passcodes: PasscodeRow[];
  names: Record<string, string>;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (
      !(await confirm("This can't be undone.", {
        title: "Delete this passcode?",
        confirmLabel: "Delete",
        danger: true,
      }))
    )
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/passcodes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      router.refresh();
    } catch {
      alert("Failed to delete passcode.");
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

  if (passcodes.length === 0) {
    return <p className="filler">No passcodes yet.</p>;
  }

  return (
    <ul className="dash-list">
      {passcodes.map((p) => (
        <li className="dash-row" key={p.id}>
          <div className="dash-row-top">
            <span className={`dash-row-label${p.label ? "" : " mute"}`}>
              {p.label || "Unlabeled"}
            </span>
            <span className={`dash-status ${p.used ? "used" : "unused"}`}>
              {p.used ? "Used" : "Unused"}
            </span>
          </div>
          <div className="dash-row-meta">
            <span className="dash-code-wrap">
              <span className="dash-code">{p.code}</span>
              <button
                type="button"
                className="dash-copy-btn"
                onClick={() => handleCopy(p.id, p.code)}
                aria-label="Copy passcode"
                title="Copy passcode"
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
              Created: <b>{fmt(p.createdAt)}</b>
            </span>
            {p.used && (
              <>
                <span>
                  Redeemed by: <b>{p.redeemedBy ? names[p.redeemedBy] ?? p.redeemedBy : "—"}</b>
                </span>
                <span>
                  Redeemed at: <b>{fmt(p.redeemedAt)}</b>
                </span>
              </>
            )}
          </div>
          <div className="dash-row-foot">
            <button
              className="dash-delete-btn"
              onClick={() => handleDelete(p.id)}
              disabled={deletingId === p.id}
            >
              {deletingId === p.id ? (
                <>
                  <Spinner /> Deleting…
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
