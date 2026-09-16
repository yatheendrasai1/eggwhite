"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AttemptDTO } from "@/lib/attempts";
import { ACTIVE_TESTS, byId } from "@/lib/tests/registry";
import { isProTest } from "@/lib/tests/proTests";
import { deleteAttempt } from "@/lib/client/attemptsApi";
import { Spinner } from "@/components/Spinner";
import { useLoading } from "@/components/LoadingOverlay";
import { useToast } from "@/components/Toast";

function fmtWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const t = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  if (d.toDateString() === now.toDateString()) return "today " + t;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + t;
}

export function LandingHub({
  active,
  attempts,
  userName,
  isPro,
  disabledTestIds,
}: {
  active: AttemptDTO[];
  attempts: AttemptDTO[];
  userName: string;
  isPro: boolean;
  disabledTestIds: string[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const { withLoading } = useLoading();
  const { showToast } = useToast();

  const disabled = new Set(disabledTestIds);
  const activeIds = new Set(active.map((a) => a.testId));
  const history = attempts.filter((a) => a.status === "completed");
  const available = ACTIVE_TESTS.filter((t) => !activeIds.has(t.id) && !disabled.has(t.id));

  async function discontinue(id: string) {
    if (!confirm("Discontinue this test? The saved answers and result for it will be erased."))
      return;
    setBusyId(id);
    try {
      await withLoading(() => deleteAttempt(id));
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {active.length > 0 && (
        <>
          <p className="section-label">In progress</p>
          <ul className="tests">
            {active.map((a) => {
              const meta = byId(a.testId);
              if (!meta) return null;
              return (
                <li key={a.id}>
                  <Link className="test test-active" href={meta.href}>
                    <div className="test-top">
                      <span className="badge badge-open">Open</span>
                      <h3 className="test-title">{meta.title}</h3>
                    </div>
                    <p className="test-desc">
                      {a.progress.done}/{a.progress.total} answered · started{" "}
                      {fmtWhen(a.startedAt)}
                    </p>
                    <div className="test-foot">
                      {userName ? <span className="tag tag-v">{userName}</span> : null}
                      <span className="go">Resume &rarr;</span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    className="discont"
                    onClick={() => discontinue(a.id)}
                    disabled={busyId === a.id}
                  >
                    {busyId === a.id ? (
                      <>
                        <Spinner /> Discontinuing…
                      </>
                    ) : (
                      "Discontinue test"
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {available.length > 0 ? (
        <>
          <p className={`section-label${active.length > 0 ? " second" : ""}`}>
            Available tests
          </p>
          <ul className="tests">
            {available.map((t, i) => {
              const n = String(i + 1).padStart(2, "0");
              const locked = isProTest(t.id) && !isPro;
              return (
                <li key={t.id}>
                  <Link
                    className={`test${locked ? " test-locked" : ""}`}
                    href={t.href}
                    onClick={(e) => {
                      if (!locked) return;
                      e.preventDefault();
                      showToast("You need a pro account to participate in this test.");
                    }}
                  >
                    <div className="test-top">
                      <span className="test-idx">{n}</span>
                      <h3 className="test-title">{t.title}</h3>
                    </div>
                    <p className="test-desc">{t.desc}</p>
                    <div className="test-foot">
                      <span className={`tag tag-${t.kind}`}>{t.tag}</span>
                      <span className="test-idx">{t.meta}</span>
                      <span className="go">Start &rarr;</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className={`filler${active.length > 0 ? " second" : ""}`}>
          No new tests right now — browse older ones from the Archive in the menu.
        </p>
      )}

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
