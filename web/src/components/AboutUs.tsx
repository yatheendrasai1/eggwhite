"use client";

import { useState } from "react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { Portal } from "@/components/Portal";

export function AboutUs() {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open);

  return (
    <>
      <button type="button" className="nav-btn" onClick={() => setOpen(true)}>
        About us
      </button>
      {open && (
        <Portal>
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
                It all began, as the best ideas often do, over a coffee break. A close-knit
                circle of friends started lobbing quick grammar and vocabulary quizzes at one
                another, half in jest, half in earnest — just to see who would stumble. What
                was meant to be a five-minute distraction quickly proved too entertaining to
                stay confined to a napkin or a notes app. The tests deserved room to grow, to
                wander, to be tinkered with properly. So we gave them one: this website.
              </p>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
