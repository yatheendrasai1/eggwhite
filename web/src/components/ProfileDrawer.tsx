"use client";

import { useEffect, useState } from "react";
import { NicknameEditor } from "@/components/NicknameEditor";
import { RedeemCodeForm } from "@/components/RedeemCodeForm";
import { SignOutButton } from "@/components/AuthButtons";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Theme } from "@/lib/theme";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ProfileDrawer({
  userName,
  userEmail,
  initialNickname,
  isPro,
  proExpiresAt,
  initialTheme,
}: {
  userName: string;
  userEmail: string;
  initialNickname: string | null;
  isPro: boolean;
  proExpiresAt: string | null;
  initialTheme: Theme;
}) {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
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
            className="drawer-panel profile-panel"
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
              <NicknameEditor initialNickname={initialNickname} />
            </div>
            <p className="profile-info-caption profile-info-caption-outer">
              Nickname takes precedence over your name on the leaderboard when set.
            </p>
            <ThemeToggle initialTheme={initialTheme} />
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
