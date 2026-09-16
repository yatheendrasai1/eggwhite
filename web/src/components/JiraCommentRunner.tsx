"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackHome } from "@/components/BackHome";
import {
  countWords,
  type JiraCommentConfig,
  type JiraCommentAnswers,
  type JiraCommentResult,
} from "@/lib/tests/jiraComment";
import { JiraCommentResults } from "@/components/JiraCommentResults";
import { patchAttempt, deleteAttempt } from "@/lib/client/attemptsApi";
import { Spinner } from "@/components/Spinner";
import { useLoading } from "@/components/LoadingOverlay";

function seed(initial: unknown): JiraCommentAnswers {
  const src = (initial ?? {}) as Partial<JiraCommentAnswers>;
  return { response: src.response ?? "" };
}

/** Word count badge color bands — independent of the scenario's actual
 *  target word range, just a soft progress cue. */
function wordCountBand(words: number): "grey" | "orange" | "green" | "red" {
  if (words <= 50) return "grey";
  if (words <= 100) return "orange";
  if (words <= 200) return "green";
  return "red";
}

export function JiraCommentRunner({
  config,
  attemptId,
  initialAnswers,
  initiallyCompleted,
  initialDetail,
  userName,
}: {
  config: JiraCommentConfig;
  attemptId: string;
  initialAnswers: unknown;
  initiallyCompleted: boolean;
  initialDetail: unknown;
  userName: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<JiraCommentAnswers>(() => seed(initialAnswers));
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [result, setResult] = useState<JiraCommentResult | null>(
    (initialDetail as JiraCommentResult | null) ?? null
  );
  const [warn, setWarn] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState<"discontinue" | "retake" | null>(null);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { withLoading } = useLoading();

  const words = countWords(answers.response);
  const [minWords, maxWords] = config.scenario.wordRange;

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function commit(next: JiraCommentAnswers) {
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

  function setResponse(value: string) {
    commit({ response: value });
  }

  async function submit() {
    if (!answers.response.trim()) {
      setWarn("Write your Jira comment before submitting.");
      return;
    }
    setWarn("");
    setSubmitting(true);
    try {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const attempt = await withLoading(() =>
        patchAttempt(attemptId, { answers, complete: true })
      );
      setResult((attempt.detail as JiraCommentResult) ?? null);
      setCompleted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setWarn("Grading failed — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function discontinue() {
    if (!confirm("Discontinue this test? Your saved answer and result for it will be erased."))
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

  if (completed && result) {
    return (
      <div className="wrap">
        <BackHome />
        <JiraCommentResults result={result} config={config} />
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
            {words}/{minWords}&ndash;{maxWords} words
            {saving ? (
              <span className="autosave">
                <Spinner size={10} /> Saving…
              </span>
            ) : null}
          </span>
          <span className="progress-track">
            <span
              className="progress-fill"
              style={{ width: `${Math.min(100, (words / minWords) * 100)}%` }}
            />
          </span>
        </div>
      </div>

      <div className="wrap">
        <main>
          <section className="part">
            <article className="q">
              <div className="q-head">
                <span className="tag tag-p">Scenario</span>
              </div>
              <p className="q-ctx" style={{ margin: "0 0 12px" }}>
                {config.scenario.role} · Ticket {config.scenario.ticket} · Writing to{" "}
                {config.scenario.recipient}
              </p>
              {config.scenario.story.map((p, i) => (
                <p className="q-text" key={i} style={{ marginBottom: 10 }}>
                  {p}
                </p>
              ))}
              <p className="q-tag" style={{ marginTop: 16 }}>
                Your Jira comment must
              </p>
              <ul className="task-list">
                {config.scenario.task.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </article>

            <article className="q" id="jira-response">
              <div className="q-head">
                <span className="q-num">01</span>
                <p className="q-text" style={{ margin: 0 }}>
                  Write the Jira comment
                </p>
                <span className={`word-count-badge wcb-${wordCountBand(words)}`}>
                  {words} words
                </span>
              </div>
              <textarea
                className="translate-input jira-textarea"
                value={answers.response}
                autoComplete="off"
                spellCheck={true}
                placeholder={`Aim for ${minWords}–${maxWords} words…`}
                onChange={(e) => setResponse(e.target.value)}
              />
            </article>
          </section>
        </main>
      </div>

      <div className="submit-bar">
        <div className="submit-in">
          <p className={`warn${warn ? " show" : ""}`}>{warn}</p>
          <div className="jira-submit-row">
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
    </div>
  );
}
