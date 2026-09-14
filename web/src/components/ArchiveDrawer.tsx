"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ARCHIVED_TESTS } from "@/lib/tests/registry";

export function ArchiveDrawer() {
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
        className="nav-btn"
        aria-label="Archived tests"
        onClick={() => setOpen(true)}
      >
        Archive
      </button>
      {open && (
        <div className="drawer-overlay drawer-overlay-left" onClick={() => setOpen(false)}>
          <div
            className="drawer-panel drawer-panel-left"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Archived tests"
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
              <em>Archive</em>
            </h2>
            <p className="lede" style={{ marginBottom: 20 }}>
              Older tests, kept for practice. Scores here don&rsquo;t count toward the
              leaderboard.
            </p>
            <ul className="archive-list">
              {ARCHIVED_TESTS.map((t) => (
                <li key={t.id}>
                  <Link href={t.href} className="archive-item" onClick={() => setOpen(false)}>
                    <p className="h-t">{t.title}</p>
                    <span className="h-m">{t.tag} · {t.meta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
