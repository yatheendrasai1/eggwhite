"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MAILS,
  VOCAB,
  VOCAB_TOTAL,
  type BEAnswers,
} from "@/lib/tests/businessEnglish";
import { BusinessEnglishResults } from "@/components/BusinessEnglishResults";
import { patchAttempt, deleteAttempt } from "@/lib/client/attemptsApi";

const LETTERS = ["A", "B", "C", "D"];

function seed(initial: unknown): BEAnswers {
  const src = (initial ?? {}) as Partial<BEAnswers>;
  return {
    flagged: { ...(src.flagged ?? {}) },
    picks: { ...(src.picks ?? {}) },
  };
}

function withBreaks(text: string) {
  const parts = text.split("\n");
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

export function BusinessEnglishRunner({
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
  const [answers, setAnswers] = useState<BEAnswers>(() => seed(initialAnswers));
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [warn, setWarn] = useState("");
  const [flagId, setFlagId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const picksCount = Object.keys(answers.picks).length;
  const flaggedCount = Object.keys(answers.flagged).length;

  useEffect(() => {
    if (flagId == null) return;
    document
      .getElementById("q" + flagId)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [flagId]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function commit(next: BEAnswers) {
    setAnswers(next);
    if (completed) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      patchAttempt(attemptId, { answers: next }).catch(() => {});
    }, 800);
  }

  function toggleSeg(id: string) {
    const flagged = { ...answers.flagged };
    if (id in flagged) delete flagged[id];
    else flagged[id] = "";
    commit({ ...answers, flagged });
  }

  function setCorrection(id: string, value: string) {
    commit({ ...answers, flagged: { ...answers.flagged, [id]: value } });
  }

  function pickOption(vi: number, j: number) {
    commit({ ...answers, picks: { ...answers.picks, [vi]: j } });
    setFlagId((f) => (f === String(vi) ? null : f));
  }

  async function submit() {
    const missing: number[] = [];
    for (let i = 0; i < VOCAB_TOTAL; i++) if (!(i in answers.picks)) missing.push(i);
    if (missing.length) {
      setWarn(
        `${missing.length} vocabulary question${
          missing.length > 1 ? "s" : ""
        } still unanswered.`
      );
      setFlagId(String(missing[0]));
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
    router.push("/tests/business-english");
    router.refresh();
  }

  if (completed) {
    return (
      <div className="wrap">
        <BusinessEnglishResults answers={answers} />
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
          <p className="eyebrow">Round 2 · Editing &amp; corporate vocabulary</p>
          <h1>
            How sharp is your <em>working English</em>?
          </h1>
          <p className="lede">
            Two parts: catch and fix the wrong phrases hiding in three workplace emails,
            then twenty corporate vocabulary questions. Harder than the level test — a low
            score here is expected.
          </p>
          <div className="howto">
            <h2>How it works</h2>
            <p>
              <b>Part I — Editing.</b> Tap any phrase you think is wrong. A box appears
              below the email — type what it should say instead.
            </p>
            <p>
              <b>Scoring:</b> spotting an error earns 1 point, a partly right fix earns
              1½, a correct fix earns 2. <b>Tapping something already correct costs you 1
              point</b>, so don&rsquo;t tap everything.
            </p>
            <p>
              <b>Part II — Vocabulary.</b> Twenty words from everyday corporate use. Ten
              medium, ten advanced.
            </p>
          </div>
          {userName ? <p className="taking">Taking this as {userName}.</p> : null}
        </header>
      </div>

      <div className="progress">
        <div className="progress-in">
          <span className="progress-count">
            <span>{picksCount}</span>/20 words · <span>{flaggedCount}</span> flagged
          </span>
          <span className="progress-track">
            <span
              className="progress-fill"
              style={{ width: `${(picksCount / 20) * 100}%` }}
            />
          </span>
        </div>
      </div>

      <div className="wrap">
        <main>
          <section className="part">
            <div className="part-head">
              <span className="part-num">PART I</span>
              <h2>Spot the errors</h2>
            </div>
            <p className="part-note">
              Tap the phrases that don&rsquo;t belong in professional English.
            </p>
            {MAILS.map((m, mi) => {
              const fixIds = Object.keys(answers.flagged)
                .filter((k) => Number(k.split("-")[0]) === mi)
                .sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));
              return (
                <article className="mail" key={mi}>
                  <div className="mail-hd">
                    <div className="row">
                      <span className="lab">From</span>
                      <span className="val">
                        <b>{m.from}</b>
                      </span>
                    </div>
                    <div className="row">
                      <span className="lab">To</span>
                      <span className="val">{m.to}</span>
                    </div>
                    <div className="row">
                      <span className="lab">Subject</span>
                      <span className="val">
                        <b>{m.subj}</b>
                      </span>
                    </div>
                  </div>
                  <div className="mail-bd">
                    {m.body.map((s, si) => {
                      const id = mi + "-" + si;
                      const text = typeof s === "string" ? s : s.t;
                      return (
                        <span
                          key={si}
                          className={`seg${id in answers.flagged ? " on" : ""}`}
                          onClick={() => toggleSeg(id)}
                        >
                          {withBreaks(text)}
                        </span>
                      );
                    })}
                  </div>
                  <div className="mail-ft">
                    <h4>Your corrections</h4>
                    {fixIds.length === 0 ? (
                      <p className="empty">Nothing flagged in this email yet.</p>
                    ) : (
                      fixIds.map((id) => {
                        const si = Number(id.split("-")[1]);
                        const s = MAILS[mi].body[si];
                        const text = (typeof s === "string" ? s : s.t).trim();
                        return (
                          <div className="fixrow" key={id}>
                            <span className="was">
                              Replace <b>{text}</b> with
                            </span>
                            <input
                              type="text"
                              value={answers.flagged[id] ?? ""}
                              placeholder="type the correction"
                              autoComplete="off"
                              autoCapitalize="off"
                              spellCheck={false}
                              onChange={(e) => setCorrection(id, e.target.value)}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="part">
            <div className="part-head">
              <span className="part-num">PART II</span>
              <h2>Corporate Vocabulary</h2>
            </div>
            <p className="part-note">
              Choose the meaning closest to the word as it&rsquo;s used.
            </p>
            {VOCAB.map((v, i) => (
              <Fragment key={i}>
                {i === 0 ? <p className="tier">Medium</p> : null}
                {i === 10 ? <p className="tier">Advanced</p> : null}
                <article className={`q${flagId === String(i) ? " flag" : ""}`} id={"q" + i}>
                  <div className="q-head">
                    <span className="q-num">{String(i + 1).padStart(2, "0")}</span>
                    <p className="q-word">{v[0]}</p>
                  </div>
                  <p className="q-ctx">&ldquo;{v[1]}&rdquo;</p>
                  <div className="opts">
                    {v[2].map((o, j) => (
                      <button
                        type="button"
                        key={j}
                        className={`opt${answers.picks[i] === j ? " on" : ""}`}
                        onClick={() => pickOption(i, j)}
                      >
                        <span className="opt-l">{LETTERS[j]}</span>
                        <span>{o}</span>
                      </button>
                    ))}
                  </div>
                </article>
              </Fragment>
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
    </>
  );
}
