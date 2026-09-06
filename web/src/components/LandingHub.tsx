"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AttemptDTO } from "@/lib/attempts";
import { TESTS, byId } from "@/lib/tests/registry";
import { deleteAttempt } from "@/lib/client/attemptsApi";

function fmtWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const t = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return "today " + t;
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + t;
}

export function LandingHub({
  active,
  attempts,
  userName,
}: {
  active: AttemptDTO | null;
  attempts: AttemptDTO[];
  userName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const activeMeta = active ? byId(active.testId) : null;
  const locked = !!active;
  const history = attempts.filter((a) => a.status === "completed");

  async function discontinue() {
    if (!active) return;
    if (!confirm("Discontinue this test? The saved answers and result for it will be erased.")) return;
    setBusy(true);
    try {
      await deleteAttempt(active.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="section-label">Active test</p>
      {active && activeMeta ? (
        <div>
          <Link className="test test-active" href={activeMeta.href}>
            <div className="test-top">
              <span className="badge badge-open">Open</span>
              <h3 className="test-title">{activeMeta.title}</h3>
            </div>
            <p className="test-desc">
              In progress · {active.progress.done}/{active.progress.total} answered · started{" "}
              {fmtWhen(active.startedAt)}
            </p>
            <div className="test-foot">
              {userName ? <span className="tag tag-v">{userName}</span> : null}
              <span className="go">Resume &rarr;</span>
            </div>
          </Link>
          <button
            type="button"
            className="discont"
            onClick={discontinue}
            disabled={busy}
          >
            {busy ? "Discontinuing…" : "Discontinue test"}
          </button>
        </div>
      ) : (
        <p className="filler">No test open. Start any available test below.</p>
      )}

      <p className="section-label second">Available tests</p>
      <ul className="tests">
        {TESTS.filter((t) => !active || t.id !== active.testId).map((t, i) => {
          const n = String(i + 1).padStart(2, "0");
          const inner = (
            <>
              <div className="test-top">
                <span className="test-idx">{n}</span>
                <h3 className="test-title">{t.title}</h3>
              </div>
              <p className="test-desc">{t.desc}</p>
              <div className="test-foot">
                <span className={`tag tag-${t.kind}`}>{t.tag}</span>
                <span className="test-idx">{t.meta}</span>
                <span className={`go${locked ? " go-mute" : ""}`}>
                  {locked ? "Locked" : "Start →"}
                </span>
              </div>
            </>
          );
          return (
            <li key={t.id}>
              {locked ? (
                <div className="test test-locked">{inner}</div>
              ) : (
                <Link className="test" href={t.href}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {locked ? (
        <p className="avail-note">
          Finish or discontinue your current test to start another — only one test can be
          open at a time.
        </p>
      ) : null}

      {history.length > 0 && (
        <>
          <p className="section-label second">Your history</p>
          <ul className="hist">
            {history.map((a) => {
              const meta = byId(a.testId);
              return (
                <li key={a.id}>
                  <Link href={`/results/${a.id}`}>
                    <p className="h-t">{meta?.title ?? a.testId}</p>
                    <span className="h-m">
                      {a.summary?.line ?? "Completed"} ·{" "}
                      {fmtWhen(a.completedAt ?? a.updatedAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
