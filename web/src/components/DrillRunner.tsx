"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DRILL_TOTAL,
  countDoneDrill,
  type DrillConfig,
  type DrillAnswers,
} from "@/lib/tests/drill";
import { DrillResults } from "@/components/DrillResults";
import { patchAttempt, deleteAttempt } from "@/lib/client/attemptsApi";

const LETTERS = ["A", "B", "C", "D"];

function seed(initial: unknown): DrillAnswers {
  const src = (initial ?? {}) as Partial<DrillAnswers>;
  return { fills: { ...(src.fills ?? {}) }, picks: { ...(src.picks ?? {}) } };
}

export function DrillRunner({
  config,
  attemptId,
  initialAnswers,
  initiallyCompleted,
  userName,
}: {
  config: DrillConfig;
  attemptId: string;
  initialAnswers: unknown;
  initiallyCompleted: boolean;
  userName: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<DrillAnswers>(() => seed(initialAnswers));
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [warn, setWarn] = useState("");
  const [flagKey, setFlagKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const done = countDoneDrill(answers);

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

  function commit(next: DrillAnswers) {
    setAnswers(next);
    if (completed) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      patchAttempt(attemptId, { answers: next }).catch(() => {});
    }, 800);
  }

  function setFill(i: number, value: string) {
    commit({ ...answers, fills: { ...answers.fills, [i]: value } });
    setFlagKey((k) => (k === "fq" + i ? null : k));
  }

  function setPick(i: number, j: number) {
    commit({ ...answers, picks: { ...answers.picks, [i]: j } });
    setFlagKey((k) => (k === "mq" + i ? null : k));
  }

  async function submit() {
    const missF: number[] = [];
    config.part1.fills.forEach((_, i) => {
      if (!(answers.fills[i] || "").trim()) missF.push(i);
    });
    const missM: number[] = [];
    config.part2.mcq.forEach((_, i) => {
      if (!(i in answers.picks)) missM.push(i);
    });
    const missCount = missF.length + missM.length;
    if (missCount) {
      setWarn(
        `${missCount} item${missCount > 1 ? "s" : ""} still need${
          missCount > 1 ? "" : "s"
        } an answer.`
      );
      setFlagKey(missF.length ? "fq" + missF[0] : "mq" + missM[0]);
      return;
    }
    setWarn("");
    setSubmitting(true);
    try {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      await patchAttempt(attemptId, { answers, complete: true });
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
    await deleteAttempt(attemptId);
    router.push("/");
  }

  async function retake() {
    if (!confirm("Clear this attempt and start the test over?")) return;
    await deleteAttempt(attemptId);
    router.push(config.href);
    router.refresh();
  }

  if (completed) {
    return (
      <div className="wrap">
        <DrillResults config={config} answers={answers} />
        <div style={{ marginBottom: 40 }}>
          <button className="btn btn-ghost" onClick={retake}>
            Retake this test
          </button>
          <button className="btn btn-exit" onClick={discontinue}>
            Back to all tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`drill accent-${config.accent}`}>
      <div className="wrap">
        <header className="masthead">
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
            <span>{done}</span>/{DRILL_TOTAL} answered
          </span>
          <span className="progress-track">
            <span
              className="progress-fill"
              style={{ width: `${(done / DRILL_TOTAL) * 100}%` }}
            />
          </span>
        </div>
      </div>

      <div className="wrap">
        <main>
          <section className="part">
            <div className="part-head">
              <span className="part-num">PART I</span>
              <h2>{config.part1.title}</h2>
            </div>
            <p className="part-note">{config.part1.note}</p>
            {config.part1.fills.map((f, i) => (
              <article
                className={`q${flagKey === "fq" + i ? " flag" : ""}`}
                id={"fq" + i}
                key={i}
              >
                <div className="q-head">
                  <span className="q-num">{String(i + 1).padStart(2, "0")}</span>
                  <p className="q-text">
                    {f.before}
                    <input
                      type="text"
                      className="fill"
                      value={answers.fills[i] ?? ""}
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      placeholder="type here"
                      onChange={(e) => setFill(i, e.target.value)}
                    />
                    {f.after}
                  </p>
                </div>
                <p className="q-hint">
                  Verb: <b>{f.verb}</b>
                  {f.hintExtra ? ` · ${f.hintExtra}` : ""}
                </p>
              </article>
            ))}
          </section>

          <section className="part">
            <div className="part-head">
              <span className="part-num">PART II</span>
              <h2>{config.part2.title}</h2>
            </div>
            <p className="part-note">{config.part2.note}</p>
            {config.part2.mcq.map((m, i) => (
              <article
                className={`q${flagKey === "mq" + i ? " flag" : ""}`}
                id={"mq" + i}
                key={i}
              >
                <div className="q-head">
                  <span className="q-num">{String(i + 1).padStart(2, "0")}</span>
                  <p className="q-text">{m.sentence}</p>
                </div>
                <div className="opts">
                  {m.options.map((o, j) => (
                    <button
                      type="button"
                      key={j}
                      className={`opt${answers.picks[i] === j ? " on" : ""}`}
                      onClick={() => setPick(i, j)}
                    >
                      <span className="opt-l">{LETTERS[j]}</span>
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
            {submitting ? "Scoring…" : "Score my answers"}
          </button>
          <button type="button" className="btn btn-exit" onClick={discontinue}>
            Discontinue test
          </button>
        </div>
      </div>
    </div>
  );
}
