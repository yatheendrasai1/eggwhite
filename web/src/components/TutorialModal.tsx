"use client";

import { useState } from "react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

const STEPS: { emoji: string; color: string; title: string; body: string }[] = [
  {
    emoji: "🆓",
    color: "var(--steel)",
    title: "Free vs. Pro",
    body: "Free tests are exact-match — same answer, same score, always. Pro tests (Translation Drama, Framing the Situation) make you write real English, and an AI grades it like a strict-but-fair teacher.",
  },
  {
    emoji: "🔑",
    color: "var(--violet)",
    title: "Unlocking Pro",
    body: "Sweet-talk an admin into a pro code, drop it into your profile, and you're Pro for 30 days. No card, just charm.",
  },
  {
    emoji: "🚩",
    color: "var(--bad)",
    title: "Score feels off?",
    body: "Flag it, add a quick reason (100 characters or less), then hit Verify. Nothing's saved until then — leave without verifying and the flag just... vanishes.",
  },
  {
    emoji: "⏳",
    color: "var(--ochre)",
    title: "The fine print",
    body: "4 pro attempts a day. 3 verifies per test — flag one item or twenty, still 3.",
  },
];

export function TutorialModal() {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open);

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
            style={{ maxHeight: "80vh", overflowY: "auto", maxWidth: 460 }}
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
              The 60-second <em>tour</em>
            </h2>
            <p style={{ margin: "0 0 18px", fontSize: 13.5, color: "var(--ink-soft)" }}>
              No fine print. Just the four things worth knowing.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {STEPS.map((s) => (
                <div key={s.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span
                    style={{
                      fontSize: 20,
                      lineHeight: 1,
                      flex: "none",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                      background: "var(--surface2)",
                    }}
                  >
                    {s.emoji}
                  </span>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--display)",
                        fontWeight: 700,
                        fontSize: 15.5,
                        color: s.color,
                      }}
                    >
                      {s.title}
                    </p>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: 13.5,
                        lineHeight: 1.5,
                        color: "var(--ink-soft)",
                      }}
                    >
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
