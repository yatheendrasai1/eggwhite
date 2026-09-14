"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ARCHIVED_TESTS } from "@/lib/tests/registry";

type View = "menu" | "archive";

export function SideMenu() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");

  function close() {
    setOpen(false);
    setView("menu");
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

            {view === "menu" ? (
              <>
                <h2 className="drawer-title">
                  <em>Menu</em>
                </h2>
                <ul className="side-menu-list">
                  <li>
                    <button
                      type="button"
                      className="side-menu-item"
                      onClick={() => setView("archive")}
                    >
                      Archived tests
                      <span className="side-menu-chevron">→</span>
                    </button>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="side-menu-back"
                  onClick={() => setView("menu")}
                >
                  ← Menu
                </button>
                <h2 className="drawer-title">
                  <em>Archived tests</em>
                </h2>
                <p className="lede" style={{ marginBottom: 20 }}>
                  Older tests, kept for practice. Scores here don&rsquo;t count toward the
                  leaderboard.
                </p>
                <ul className="archive-list">
                  {ARCHIVED_TESTS.map((t) => (
                    <li key={t.id}>
                      <Link href={t.href} className="archive-item" onClick={close}>
                        <p className="h-t">{t.title}</p>
                        <span className="h-m">
                          {t.tag} · {t.meta}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
