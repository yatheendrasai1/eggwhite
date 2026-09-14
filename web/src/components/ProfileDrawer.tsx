"use client";

import { useEffect, useState } from "react";
import { NicknameEditor } from "@/components/NicknameEditor";
import { SignOutButton } from "@/components/AuthButtons";

export function ProfileDrawer({
  userName,
  userEmail,
  initialNickname,
}: {
  userName: string;
  userEmail: string;
  initialNickname: string | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="nav-icon-btn"
        aria-label="Your profile"
        onClick={() => setOpen(true)}
      >
        {(userName || userEmail || "?").charAt(0).toUpperCase()}
      </button>
      {open && (
        <div className="drawer-overlay" onClick={() => setOpen(false)}>
          <div
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Your profile"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <p className="eyebrow">{userEmail}</p>
            <h2 className="drawer-title">
              Your <em>profile</em>
            </h2>
            <p className="lede" style={{ marginBottom: 20 }}>
              Manage how you show up on the leaderboard.
            </p>
            <div className="auth-card" style={{ marginBottom: 20 }}>
              <p className="section-label" style={{ marginBottom: 10 }}>
                Name
              </p>
              <input
                type="text"
                value={userName || "—"}
                disabled
                className="fill"
                style={{ width: "100%" }}
              />
              <p className="foot" style={{ margin: "8px 0 0" }}>
                From your Google account — can&rsquo;t be changed here.
              </p>
            </div>
            <NicknameEditor initialNickname={initialNickname} />
            <div
              style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--line)" }}
            >
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
