"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackHome } from "@/components/BackHome";
import { NegativeScoringNote } from "@/components/NegativeScoringNote";
import {
  countDoneShrinkIt,
  countWords,
  type ShrinkItConfig,
  type ShrinkItAnswers,
} from "@/lib/tests/shrinkIt";
import { ShrinkItResults } from "@/components/ShrinkItResults";
import { patchAttempt, deleteAttempt } from "@/lib/client/attemptsApi";
import type { AttemptDTO } from "@/lib/attempts";
import { hasActiveFlags, clearFlagsFromStorage } from "@/lib/client/flagStorage";
import { Spinner } from "@/components/Spinner";
import { useLoading } from "@/components/LoadingOverlay";
import { useConfirm } from "@/components/ConfirmDialog";

type ResultAttempt = Pick<AttemptDTO, "id" | "detail" | "verifyCount">;

function seed(initial: unknown): ShrinkItAnswers {
  const src = (initial ?? {}) as Partial<ShrinkItAnswers>;
  return {
    shrinks: { ...(src.shrinks ?? {}) },
    picks: { ...(src.picks ?? {}) },
  };
}

export function ShrinkItRunner({
  config,
  attemptId,
  initialAnswers,
  initiallyCompleted,
  initialDetail,
  initialVerifyCount,
  userName,
}: {
  config: ShrinkItConfig;
  attemptId: string;
  initialAnswers: unknown;
  initiallyCompleted: boolean;
  initialDetail: unknown;
  initialVerifyCount: number;
  userName: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<ShrinkItAnswers>(() => seed(initialAnswers));
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
  const confirm = useConfirm();

  const total = config.sentences.length + config.synonyms.length;
  const done = countDoneShrinkIt(answers);

  useEffect(() => {
    if (!flagKey) return;
    document.getElementById(flagKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [flagKey]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function commit(next: ShrinkItAnswers) {
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

  function setShrink(i: number, value: string) {
    commit({ ...answers, shrinks: { ...answers.shrinks, [i]: value } });
    setFlagKey((k) => (k === "siq-a" + i ? null : k));
  }

  function setPick(i: number, j: number) {
    commit({ ...answers, picks: { ...answers.picks, [i]: j } });
    setFlagKey((k) => (k === "siq-b" + i ? null : k));
  }

  async function submit() {
    const missA: number[] = [];
    config.sentences.forEach((_, i) => {
      if (!(answers.shrinks[i] || "").trim()) missA.push(i);
    });
    const missB: number[] = [];
    config.synonyms.forEach((_, i) => {
      if (typeof answers.picks[i] !== "number") missB.push(i);
    });

    if (missA.length || missB.length) {
      const parts: string[] = [];
      if (missA.length) parts.push(`${missA.length} sentence${missA.length > 1 ? "s" : ""} still need shrinking`);
      if (missB.length) parts.push(`${missB.length} word${missB.length > 1 ? "s" : ""} still need a pick`);
      setWarn(parts.join(" and ") + ".");
      setFlagKey(missA.length ? "siq-a" + missA[0] : "siq-b" + missB[0]);
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
    if (
      !(await confirm("Your saved answers and result for it will be erased.", {
        title: "Discontinue this test?",
        confirmLabel: "Discontinue",
        danger: true,
      }))
    )
      return;
    setBusy("discontinue");
    try {
      await withLoading(() => deleteAttempt(attemptId));
      router.push("/");
    } finally {
      setBusy(null);
    }
  }

  async function goHome() {
    if (hasActiveFlags(attemptId)) {
      if (
        !(await confirm("If you go back, the flagged comments will be discarded.", {
          title: "Discard flagged comments?",
          confirmLabel: "Go back",
        }))
      )
        return;
      clearFlagsFromStorage(attemptId);
    }
    router.push("/");
  }

  async function retake() {
    if (!(await confirm("This clears your saved answers so you can start fresh.", { title: "Retake this test?", confirmLabel: "Retake" })))
      return;
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
        <ShrinkItResults attempt={resultAttempt} />
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
          <NegativeScoringNote applicable={false} />
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
            <div className="part-head">
              <span className="part-num">SECTION A</span>
              <h2>Shrink it</h2>
            </div>
            <p className="part-note">
              Rewrite each sentence as short as you can without losing the meaning.
            </p>
            {config.sentences.map((s, i) => {
              const yours = answers.shrinks[i] ?? "";
              const yourWords = countWords(yours);
              const originalWords = countWords(s.original);
              return (
                <article
                  className={`q${flagKey === "siq-a" + i ? " flag" : ""}`}
                  id={"siq-a" + i}
                  key={i}
                >
                  <div className="q-head">
                    <span className="q-num">{String(i + 1).padStart(2, "0")}</span>
                    <p className="q-text">{s.original}</p>
                  </div>
                  <textarea
                    className="translate-input"
                    placeholder="Type your shrunk version here"
                    value={yours}
                    onChange={(e) => setShrink(i, e.target.value)}
                  />
                  <p className="q-hint" style={{ margin: "6px 0 0", marginLeft: 0 }}>
                    {originalWords} words → {yourWords} word{yourWords === 1 ? "" : "s"}
                  </p>
                </article>
              );
            })}
          </section>

          <section className="part">
            <div className="part-head">
              <span className="part-num">SECTION B</span>
              <h2>Simplify it</h2>
            </div>
            <p className="part-note">
              Pick the everyday word that means the same as the one shown.
            </p>
            {config.synonyms.map((it, i) => (
              <article
                className={`q${flagKey === "siq-b" + i ? " flag" : ""}`}
                id={"siq-b" + i}
                key={i}
              >
                <div className="q-head">
                  <span className="q-num">{String(i + 1).padStart(2, "0")}</span>
                  <p className="q-text">{it.word}</p>
                </div>
                <p className="q-hint" style={{ margin: "0 0 10px", marginLeft: 0 }}>
                  {it.example}
                </p>
                <div className="opts">
                  {it.options.map((o, j) => (
                    <button
                      type="button"
                      key={j}
                      className={`opt${answers.picks[i] === j ? " on" : ""}`}
                      onClick={() => setPick(i, j)}
                    >
                      <span>{o}</span>
                    </button>
                  ))}
                </div>
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
