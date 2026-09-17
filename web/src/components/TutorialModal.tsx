"use client";

import { useState } from "react";

export function TutorialModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="nav-btn" onClick={() => setOpen(true)}>
        Tutorial
      </button>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <p className="section-label" style={{ marginBottom: 12 }}>
              Tutorial
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14.5, lineHeight: 1.55 }}>
              <li style={{ marginBottom: 12 }}>
                <b>Regular vs. pro tests:</b> Regular tests are free and graded by fixed rules.
                Pro tests (Translation Drama, Framing the Situation) are free-text, graded by AI.
              </li>
              <li style={{ marginBottom: 12 }}>
                <b>Pro access:</b> Ask an admin for a pro code, then redeem it from your profile
                to unlock pro tests for 30 days.
              </li>
              <li style={{ marginBottom: 12 }}>
                <b>Flagging a score:</b> On pro results, flag a score you disagree with (+ a
                short comment). It stays in your browser until you hit Verify — going back before
                that discards it.
              </li>
              <li>
                <b>Limits:</b> 4 pro test submissions a day, and 3 verifies per attempt no matter
                how many items you flag.
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
