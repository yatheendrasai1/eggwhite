"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function SideMenu({
  showDashboard = false,
  showLeaderboard = false,
  showGetSomeSpace = false,
}: {
  showDashboard?: boolean;
  showLeaderboard?: boolean;
  showGetSomeSpace?: boolean;
}) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
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
        className="hamburger-btn"
        aria-label="Menu"
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className="drawer-overlay drawer-overlay-left" onClick={close}>
          <div
            className="drawer-panel drawer-panel-left"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <button type="button" className="modal-close" aria-label="Close" onClick={close}>
              ×
            </button>
            <h2 className="drawer-title">
              <em>Menu</em>
            </h2>
            <ul className="side-menu-list">
              {showLeaderboard && (
                <li className="side-menu-item-mobile">
                  <Link href="/leaderboard" className="side-menu-item" onClick={close}>
                    Leaderboard
                    <span className="side-menu-chevron">→</span>
                  </Link>
                </li>
              )}
              {showDashboard && (
                <li className="side-menu-item-mobile">
                  <Link href="/dashboard" className="side-menu-item" onClick={close}>
                    Dashboard
                    <span className="side-menu-chevron">→</span>
                  </Link>
                </li>
              )}
              {showGetSomeSpace && (
                <li>
                  <Link href="/games/get-some-space" className="side-menu-item" onClick={close}>
                    Get Some Space!
                    <span className="side-menu-chevron">→</span>
                  </Link>
                </li>
              )}
              <li>
                <Link href="/archive" className="side-menu-item" onClick={close}>
                  Archived tests
                  <span className="side-menu-chevron">→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
