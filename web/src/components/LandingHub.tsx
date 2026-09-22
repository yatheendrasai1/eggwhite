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
import { useConfirm } from "@/components/ConfirmDialog";

const KIND_ICON: Record<string, string> = {
  v: "📖",
  o: "💼",
  g: "✍️",
  t: "🎯",
  p: "⭐",
};

function TestIcon({ kind }: { kind: string }) {
  return (
    <span className={`test-icon test-icon-${kind}`} aria-hidden="true">
      {KIND_ICON[kind] ?? "📝"}
    </span>
  );
}

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { withLoading } = useLoading();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const disabled = new Set(disabledTestIds);
  const activeIds = new Set(active.map((a) => a.testId));
  const history = attempts.filter((a) => a.status === "completed");
  const available = ACTIVE_TESTS.filter((t) => !activeIds.has(t.id) && !disabled.has(t.id));

  async function discontinue(id: string) {
    if (
      !(await confirm("Discontinue this test? The saved answers and result for it will be erased.", {
        title: "Discontinue test?",
        confirmLabel: "Discontinue",
        danger: true,
      }))
    )
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
                      <TestIcon kind={meta.kind} />
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
              const pro = isProTest(t.id);
              const expanded = expandedId === t.id;
              return (
                <li key={t.id}>
                  <div className={`test test-collapsible${locked ? " test-locked" : ""}${expanded ? " test-expanded" : ""}`}>
                    <div
                      className="test-toggle"
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      onClick={() => setExpandedId(expanded ? null : t.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedId(expanded ? null : t.id);
                        }
                      }}
                    >
                      <div className="test-top">
                        <TestIcon kind={t.kind} />
                        <span className="test-idx">{n}</span>
                        <h3 className="test-title">{t.title}</h3>
                        {pro && <span className="pro-badge">PRO</span>}
                      </div>
                      <div className="test-toggle-meta">
                        <span className="test-qcount">
                          {t.total} question{t.total === 1 ? "" : "s"}
                        </span>
                        <span className={`test-chevron${expanded ? " open" : ""}`} aria-hidden="true">
                          ⌄
                        </span>
                      </div>
                    </div>
                    {expanded && (
                      <div className="test-expand">
                        <p className="test-desc">{t.desc}</p>
                        <div className="test-foot">
                          <span className={`tag tag-${t.kind}`}>{t.tag}</span>
                        </div>
                        <Link
                          href={t.href}
                          className="test-start-btn"
                          onClick={(e) => {
                            if (!locked) return;
                            e.preventDefault();
                            showToast("You need a pro account to participate in this test.");
                          }}
                        >
                          Let&rsquo;s go — start now →
                        </Link>
                      </div>
                    )}
                  </div>
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
