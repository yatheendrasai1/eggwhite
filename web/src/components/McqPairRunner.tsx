"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackHome } from "@/components/BackHome";
import {
  countDoneMcqPair,
  totalMcqPair,
  type McqPairConfig,
  type McqPairAnswers,
} from "@/lib/tests/mcqPair";
import { McqPairResults } from "@/components/McqPairResults";
import { patchAttempt, deleteAttempt } from "@/lib/client/attemptsApi";
import { Spinner } from "@/components/Spinner";
import { useLoading } from "@/components/LoadingOverlay";

const LETTERS = ["A", "B", "C", "D"];

function McqPart({
  num,
  title,
  note,
  items,
  prefix,
  picks,
  flagKey,
  onPick,
}: {
  num: string;
  title: string;
  note: string;
  items: McqPairConfig["part1"]["items"];
  prefix: string;
  picks: Record<string, number>;
  flagKey: string | null;
  onPick: (i: number, j: number) => void;
}) {
  return (
    <section className="part">
      <div className="part-head">
        <span className="part-num">{num}</span>
        <h2>{title}</h2>
      </div>
      <p className="part-note">{note}</p>
      {items.map((it, i) => (
        <article
          className={`q${flagKey === prefix + i ? " flag" : ""}`}
          id={prefix + i}
          key={i}
        >
          <div className="q-head">
            <span className="q-num">{String(i + 1).padStart(2, "0")}</span>
            {it.sentence ? <p className="q-text">{it.sentence}</p> : null}
          </div>
          {it.hint ? <p className="q-hint">{it.hint}</p> : null}
          <div className="opts">
            {it.options.map((o, j) => (
              <button
                type="button"
                key={j}
                className={`opt${picks[i] === j ? " on" : ""}`}
                onClick={() => onPick(i, j)}
              >
                <span className="opt-l">{LETTERS[j]}</span>
                <span>{o}</span>
              </button>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function seed(initial: unknown): McqPairAnswers {
  const src = (initial ?? {}) as Partial<McqPairAnswers>;
  return { picks1: { ...(src.picks1 ?? {}) }, picks2: { ...(src.picks2 ?? {}) } };
}

export function McqPairRunner({
  config,
  attemptId,
  initialAnswers,
  initiallyCompleted,
  userName,
}: {
  config: McqPairConfig;
  attemptId: string;
  initialAnswers: unknown;
  initiallyCompleted: boolean;
  userName: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<McqPairAnswers>(() => seed(initialAnswers));
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [warn, setWarn] = useState("");
  const [flagKey, setFlagKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState<"discontinue" | "retake" | null>(null);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { withLoading } = useLoading();

  const total = totalMcqPair(config);
  const done = countDoneMcqPair(answers);

  useEffect(() => {
    if (!flagKey) return;
    document
      .getElementById(flagKey)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [flagKey]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function commit(next: McqPairAnswers) {
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

  function setPick1(i: number, j: number) {
    commit({ ...answers, picks1: { ...answers.picks1, [i]: j } });
    setFlagKey((k) => (k === "p1q" + i ? null : k));
  }

  function setPick2(i: number, j: number) {
    commit({ ...answers, picks2: { ...answers.picks2, [i]: j } });
    setFlagKey((k) => (k === "p2q" + i ? null : k));
  }

  async function submit() {
    const miss1: number[] = [];
    config.part1.items.forEach((_, i) => {
      if (!(i in answers.picks1)) miss1.push(i);
    });
    const miss2: number[] = [];
    config.part2.items.forEach((_, i) => {
      if (!(i in answers.picks2)) miss2.push(i);
    });
    const missCount = miss1.length + miss2.length;
    if (missCount) {
      setWarn(
        `${missCount} item${missCount > 1 ? "s" : ""} still need${
          missCount > 1 ? "" : "s"
        } an answer.`
      );
      setFlagKey(miss1.length ? "p1q" + miss1[0] : "p2q" + miss2[0]);
      return;
    }
    setWarn("");
    setSubmitting(true);
    try {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      await withLoading(() => patchAttempt(attemptId, { answers, complete: true }));
      setCompleted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setWarn("Could not save your results. Check your connection and try again.");
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

  if (completed) {
    return (
      <div className="wrap">
        <BackHome />
        <McqPairResults config={config} answers={answers} />
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
          <button className="btn btn-exit" onClick={discontinue} disabled={busy !== null}>
            {busy === "discontinue" ? (
              <>
                <Spinner /> Leaving…
              </>
            ) : (
              "Back to all tests"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`drill accent-${config.accent}`}>
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
          <McqPart
            num="PART I"
            title={config.part1.title}
            note={config.part1.note}
            items={config.part1.items}
            prefix="p1q"
            picks={answers.picks1}
            flagKey={flagKey}
            onPick={setPick1}
          />
          <McqPart
            num="PART II"
            title={config.part2.title}
            note={config.part2.note}
            items={config.part2.items}
            prefix="p2q"
            picks={answers.picks2}
            flagKey={flagKey}
            onPick={setPick2}
          />
        </main>
      </div>

      <div className="submit-bar">
        <div className="submit-in">
          <p className={`warn${warn ? " show" : ""}`}>{warn}</p>
          <button className="btn" onClick={submit} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner /> Scoring…
              </>
            ) : (
              "Score my answers"
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
