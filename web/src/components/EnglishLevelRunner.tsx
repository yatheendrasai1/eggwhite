"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  VOCAB,
  GRAM,
  TOTAL_QUESTIONS,
  countDone,
  isAnswered,
  type ELAnswers,
  type ELAnswer,
  type Confidence,
} from "@/lib/tests/englishLevel";
import { EnglishLevelResults } from "@/components/EnglishLevelResults";
import { patchAttempt, deleteAttempt } from "@/lib/client/attemptsApi";

const LETTERS = ["A", "B", "C", "D"];

function seed(initial: unknown): ELAnswers {
  const out: ELAnswers = {};
  const src = (initial ?? {}) as Record<string, Partial<ELAnswer>>;
  for (let i = 0; i < VOCAB.length; i++) {
    const s = src["v" + i];
    out["v" + i] = { pick: s?.pick ?? null, conf: (s?.conf as Confidence) ?? null };
  }
  for (let i = 0; i < GRAM.length; i++) {
    const s = src["g" + i];
    out["g" + i] = { pick: s?.pick ?? null, conf: (s?.conf as Confidence) ?? null };
  }
  return out;
}

export function EnglishLevelRunner({
  attemptId,
  initialAnswers,
  initiallyCompleted,
  userName,
}: {
  attemptId: string;
  initialAnswers: unknown;
  initiallyCompleted: boolean;
  userName: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<ELAnswers>(() => seed(initialAnswers));
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [warn, setWarn] = useState("");
  const [flagId, setFlagId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const done = countDone(answers);

  useEffect(() => {
    if (!flagId) return;
    const el = document.getElementById("q-" + flagId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [flagId]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function scheduleSave(next: ELAnswers) {
    if (completed) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      patchAttempt(attemptId, { answers: next }).catch(() => {});
    }, 800);
  }

  function update(id: string, next: ELAnswer) {
    setAnswers((prev) => {
      const merged = { ...prev, [id]: next };
      scheduleSave(merged);
      return merged;
    });
    setFlagId((f) => (f === id ? null : f));
  }

  function pickOption(id: string, j: number) {
    const s = answers[id] ?? { pick: null, conf: null };
    const conf = s.conf === "N" ? null : s.conf;
    update(id, { pick: s.pick === j ? null : j, conf });
  }

  function pickConf(id: string, c: Confidence) {
    const s = answers[id] ?? { pick: null, conf: null };
    const conf = s.conf === c ? null : c;
    update(id, { pick: conf === "N" ? null : s.pick, conf });
  }

  async function submit() {
    const ids = [
      ...VOCAB.map((_, i) => "v" + i),
      ...GRAM.map((_, i) => "g" + i),
    ];
    const missing = ids.filter((id) => !isAnswered(answers[id]));
    if (missing.length) {
      setWarn(
        `${missing.length} question${missing.length > 1 ? "s" : ""} still need${
          missing.length > 1 ? "" : "s"
        } an answer. Jump to the first one.`
      );
      setFlagId(missing[0]);
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
    router.push("/tests/english-level");
    router.refresh();
  }

  if (completed) {
    return (
      <div className="wrap">
        <EnglishLevelResults answers={answers} />
        <div style={{ marginBottom: 40 }}>
          <button className="btn btn-ghost" onClick={retake}>
            Retake this test
          </button>
          <button className="btn btn-exit" onClick={discontinue}>
            Discontinue &amp; back to all tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="wrap">
        <header className="masthead">
          <p className="eyebrow">Vocabulary &amp; Grammar · 60 questions</p>
          <h1>
            How good is <em>your</em> English, really?
          </h1>
          <p className="lede">
            A self-scoring test that measures what you actually know — not what you can
            guess. Answer honestly and you get a CEFR level at the end.
          </p>
          <div className="howto">
            <h2>How to answer</h2>
            <dl>
              <dt>
                <span className="key key-k">K</span>
              </dt>
              <dd>
                <b>I know it.</b> Correct answer earns 1 point.
              </dd>
              <dt>
                <span className="key key-v">V</span>
              </dt>
              <dd>
                <b>I vaguely know it.</b> Correct answer earns ½ point.
              </dd>
              <dt>
                <span className="key key-n">N</span>
              </dt>
              <dd>
                <b>I don&rsquo;t know it.</b> Scores 0 — but keeps your result accurate.
                Don&rsquo;t guess.
              </dd>
            </dl>
          </div>
          {userName ? <p className="taking">Taking this as {userName}.</p> : null}
        </header>
      </div>

      <div className="progress">
        <div className="progress-in">
          <span className="progress-count">
            <span>{done}</span>/{TOTAL_QUESTIONS}
          </span>
          <span className="progress-track">
            <span
              className="progress-fill"
              style={{ width: `${(done / TOTAL_QUESTIONS) * 100}%` }}
            />
          </span>
        </div>
      </div>

      <div className="wrap">
        <main>
          <Section
            title="Vocabulary"
            num="PART I"
            note="Choose the meaning closest to the word."
          >
            {VOCAB.map((item, i) => (
              <Question
                key={"v" + i}
                id={"v" + i}
                n={i + 1}
                flagged={flagId === "v" + i}
                stem={<span className="q-word">{item[0]}</span>}
                options={item[1]}
                answer={answers["v" + i]}
                onOption={(j) => pickOption("v" + i, j)}
                onConf={(c) => pickConf("v" + i, c)}
              />
            ))}
          </Section>

          <Section
            title="Grammar"
            num="PART II"
            note="Complete the sentence, or find the error where marked."
          >
            {GRAM.map((item, i) => {
              const isErr = item[3] === 1;
              return (
                <Question
                  key={"g" + i}
                  id={"g" + i}
                  n={i + 31}
                  flagged={flagId === "g" + i}
                  stem={
                    isErr ? (
                      <>
                        <span className="q-tag">Find the error</span>
                        <span className="q-sent">&ldquo;{item[0]}&rdquo;</span>
                      </>
                    ) : (
                      <>{item[0]}</>
                    )
                  }
                  options={item[1]}
                  answer={answers["g" + i]}
                  onOption={(j) => pickOption("g" + i, j)}
                  onConf={(c) => pickConf("g" + i, c)}
                />
              );
            })}
          </Section>
        </main>
      </div>

      <div className="submit-bar">
        <div className="submit-in">
          <p className={`warn${warn ? " show" : ""}`}>{warn}</p>
          <button className="btn" onClick={submit} disabled={submitting}>
            {submitting ? "Scoring…" : "Evaluate my English"}
          </button>
          <button type="button" className="btn btn-exit" onClick={discontinue}>
            Discontinue test
          </button>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  num,
  note,
  children,
}: {
  title: string;
  num: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="part">
      <div className="part-head">
        <span className="part-num">{num}</span>
        <h2>{title}</h2>
      </div>
      <p className="part-note">{note}</p>
      <div>{children}</div>
    </section>
  );
}

function Question({
  id,
  n,
  stem,
  options,
  answer,
  flagged,
  onOption,
  onConf,
}: {
  id: string;
  n: number;
  stem: React.ReactNode;
  options: string[];
  answer: ELAnswer | undefined;
  flagged: boolean;
  onOption: (j: number) => void;
  onConf: (c: Confidence) => void;
}) {
  const a = answer ?? { pick: null, conf: null };
  return (
    <article className={`q${flagged ? " flag" : ""}`} id={"q-" + id}>
      <div className="q-head">
        <span className="q-num">{String(n).padStart(2, "0")}</span>
        <p className="q-text">{stem}</p>
      </div>
      <div className="opts">
        {options.map((o, j) => (
          <button
            type="button"
            key={j}
            className={`opt${a.pick === j ? " on" : ""}${a.conf === "N" ? " mute" : ""}`}
            onClick={() => onOption(j)}
          >
            <span className="opt-l">{LETTERS[j]}</span>
            <span>{o}</span>
          </button>
        ))}
      </div>
      <div className="conf">
        {(["K", "V", "N"] as Confidence[]).map((c) => (
          <button
            type="button"
            key={c}
            className={`chip${a.conf === c ? " on" : ""}`}
            data-c={c}
            onClick={() => onConf(c)}
          >
            <b>{c}</b>
            {c === "K" ? "I know" : c === "V" ? "Vaguely" : "Don’t know"}
          </button>
        ))}
      </div>
    </article>
  );
}
