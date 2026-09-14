"use client";

import { useEffect, useState } from "react";
import { NicknameEditor } from "@/components/NicknameEditor";
import { RedeemCodeForm } from "@/components/RedeemCodeForm";
import { SignOutButton } from "@/components/AuthButtons";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ProfileDrawer({
  userName,
  userEmail,
  initialNickname,
  isPro,
  proExpiresAt,
}: {
  userName: string;
  userEmail: string;
  initialNickname: string | null;
  isPro: boolean;
  proExpiresAt: string | null;
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
            <div className="profile-info">
              <div className="profile-info-row">
                <span className="profile-info-label">Name</span>
                <span className="profile-info-value">{userName || "—"}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Mail ID</span>
                <span className="profile-info-value">{userEmail || "—"}</span>
              </div>
            </div>
            <NicknameEditor initialNickname={initialNickname} />
            {isPro ? (
              <div className="profile-info" style={{ marginBottom: 20 }}>
                <div className="profile-info-row">
                  <span className="profile-info-label">Pro</span>
                  <span className="profile-info-value">
                    {proExpiresAt ? `Active until ${fmtDate(proExpiresAt)}` : "Active"}
                  </span>
                </div>
              </div>
            ) : (
              <RedeemCodeForm />
            )}
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
