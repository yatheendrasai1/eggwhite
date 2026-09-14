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
            <h2 className="drawer-title">
              Your <em>profile</em>
            </h2>
            <dl className="profile-info">
              <div className="profile-info-row">
                <dt>Name</dt>
                <dd>{userName || "—"}</dd>
              </div>
              <div className="profile-info-row">
                <dt>Mail ID</dt>
                <dd>{userEmail || "—"}</dd>
              </div>
            </dl>
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
