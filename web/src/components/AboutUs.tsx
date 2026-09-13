"use client";

import { useState } from "react";

export function AboutUs() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="nav-btn" onClick={() => setOpen(true)}>
        About us
      </button>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <p className="section-label" style={{ marginBottom: 12 }}>
              About us
            </p>
            <p className="lede">English Grammar and Vocabulary Improvement Tests</p>
            <p className="lede" style={{ marginTop: 10 }}>
              In short E.G.V.I.T, which is loosely pronounced as egvit which is similar to
              Eggwhite
            </p>
          </div>
        </div>
      )}
    </>
  );
}
