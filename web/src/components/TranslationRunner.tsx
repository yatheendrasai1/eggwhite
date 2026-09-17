"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackHome } from "@/components/BackHome";
import {
  countDoneTranslation,
  type TranslationConfig,
  type TranslationAnswers,
} from "@/lib/tests/translation";
import { TranslationResults } from "@/components/TranslationResults";
import { patchAttempt, deleteAttempt } from "@/lib/client/attemptsApi";
import type { AttemptDTO } from "@/lib/attempts";
import { hasActiveFlags, clearFlagsFromStorage } from "@/lib/client/flagStorage";
import { Spinner } from "@/components/Spinner";
import { useLoading } from "@/components/LoadingOverlay";

type ResultAttempt = Pick<AttemptDTO, "id" | "detail" | "verifyCount">;

function seed(initial: unknown): TranslationAnswers {
  const src = (initial ?? {}) as Partial<TranslationAnswers>;
  return { fills: { ...(src.fills ?? {}) } };
}

export function TranslationRunner({
  config,
  attemptId,
  initialAnswers,
  initiallyCompleted,
  initialDetail,
  initialVerifyCount,
  userName,
}: {
  config: TranslationConfig;
  attemptId: string;
  initialAnswers: unknown;
  initiallyCompleted: boolean;
  initialDetail: unknown;
  initialVerifyCount: number;
  userName: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<TranslationAnswers>(() => seed(initialAnswers));
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [resultAttempt, setResultAttempt] = useState<ResultAttempt | null>(
    initiallyCompleted
      ? { id: attemptId, detail: initialDetail, verifyCount: initialVerifyCount }
      : null
  );
  const [warn, setWarn] = useState("");
  const [flagKey, setFlagKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState<"discontinue" | "retake" | null>(null);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { withLoading } = useLoading();

  const total = config.items.length;
  const done = countDoneTranslation(answers);

  useEffect(() => {
    if (!flagKey) return;
    document.getElementById(flagKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [flagKey]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function commit(next: TranslationAnswers) {
    setAnswers(next);
    if (completed) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaving(true);
      patchAttempt(attemptId, { answers: next })
        .catch(() => {})
        .finally(() => setSaving(false));
    }, 800);
  }

  function setFill(i: number, value: string) {
    commit({ ...answers, fills: { ...answers.fills, [i]: value } });
    setFlagKey((k) => (k === "tq" + i ? null : k));
  }

  async function submit() {
    const miss: number[] = [];
    config.items.forEach((_, i) => {
      if (!(answers.fills[i] || "").trim()) miss.push(i);
    });
    if (miss.length) {
      setWarn(
        `${miss.length} item${miss.length > 1 ? "s" : ""} still need${
          miss.length > 1 ? "" : "s"
        } a translation.`
      );
      setFlagKey("tq" + miss[0]);
      return;
    }
    setWarn("");
    setSubmitting(true);
    try {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const attempt = await withLoading(() =>
        patchAttempt(attemptId, { answers, complete: true })
      );
      setResultAttempt(attempt);
      setCompleted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setWarn("Grading failed — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function discontinue() {
    if (!confirm("Discontinue this test? Your saved answers and result for it will be erased."))
      return;
    setBusy("discontinue");
    try {
      await withLoading(() => deleteAttempt(attemptId));
      router.push("/");
    } finally {
      setBusy(null);
    }
  }

  function goHome() {
    if (hasActiveFlags(attemptId)) {
      if (!confirm("If you go back, the flagged comments will be discarded.")) return;
      clearFlagsFromStorage(attemptId);
    }
    router.push("/");
  }

  async function retake() {
    if (!confirm("Clear this attempt and start the test over?")) return;
    setBusy("retake");
    try {
      await withLoading(() => deleteAttempt(attemptId));
      router.push(config.href);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (completed && resultAttempt) {
    return (
      <div className="wrap">
        <BackHome attemptId={attemptId} />
        <TranslationResults attempt={resultAttempt} />
        <div style={{ marginBottom: 40 }}>
          <button className="btn btn-ghost" onClick={retake} disabled={busy !== null}>
            {busy === "retake" ? (
              <>
                <Spinner /> Retaking…
              </>
            ) : (
              "Retake this test"
            )}
          </button>
          <button className="btn btn-exit" onClick={goHome}>
            Back to all tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="drill accent-violet">
      <div className="wrap">
        <header className="masthead">
          <BackHome />
          <p className="eyebrow">{config.eyebrow}</p>
          <h1>
            {config.titleLead}
            <em>{config.titleEm}</em>
            {config.titleTail}
          </h1>
          <p className="lede">{config.lede}</p>
          <div className="howto">
            <h2>How it works</h2>
            {config.howto.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
          {userName ? <p className="taking">Taking this as {userName}.</p> : null}
        </header>
      </div>

      <div className="progress">
        <div className="progress-in">
          <span className="progress-count">
            <span>{done}</span>/{total} answered
            {saving ? (
              <span className="autosave">
                <Spinner size={10} /> Saving…
              </span>
            ) : null}
          </span>
          <span className="progress-track">
            <span className="progress-fill" style={{ width: `${(done / total) * 100}%` }} />
          </span>
        </div>
      </div>

      <div className="wrap">
        <main>
          <section className="part">
            {config.items.map((it, i) => (
              <article
                className={`q${flagKey === "tq" + i ? " flag" : ""}`}
                id={"tq" + i}
                key={i}
              >
                <div className="q-head">
                  <span className="q-num">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="translit">
                  <div className="translit-row">
                    <span className="translit-lang">Telugu</span>
                    <span className="translit-text">{it.telugu}</span>
                  </div>
                  <div className="translit-row">
                    <span className="translit-lang">Tinglish</span>
                    <span className="translit-text">{it.tinglish}</span>
                  </div>
                  <div className="translit-row">
                    <span className="translit-lang">Hinglish</span>
                    <span className="translit-text">{it.hinglish}</span>
                  </div>
                </div>
                <textarea
                  className="translate-input"
                  value={answers.fills[i] ?? ""}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="Type the English translation here"
                  onChange={(e) => setFill(i, e.target.value)}
                />
              </article>
            ))}
          </section>
        </main>
      </div>

      <div className="submit-bar">
        <div className="submit-in">
          <p className={`warn${warn ? " show" : ""}`}>{warn}</p>
          <button className="btn" onClick={submit} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner /> Grading…
              </>
            ) : (
              "Submit for grading"
            )}
          </button>
          <button
            type="button"
            className="btn btn-exit"
            onClick={discontinue}
            disabled={busy !== null}
          >
            {busy === "discontinue" ? (
              <>
                <Spinner /> Discontinuing…
              </>
            ) : (
              "Discontinue test"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
