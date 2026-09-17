"use client";

import { useEffect, useState } from "react";
import type { TranslationResult, TranslationItemResult } from "@/lib/tests/translation";
import type { AttemptDTO } from "@/lib/attempts";
import { FlagItemButton } from "@/components/FlagItemButton";
import { VerifyBar } from "@/components/VerifyBar";
import { saveFlagsToStorage } from "@/lib/client/flagStorage";

const VERDICT_LABEL: Record<TranslationItemResult["verdict"], string> = {
  correct: "Correct",
  partial: "Partial",
  incorrect: "Incorrect",
};

function ReviewCard({
  r,
  attemptId,
  flag,
  onUpdate,
}: {
  r: TranslationItemResult;
  attemptId: string;
  flag: AttemptDTO["flags"][number] | undefined;
  onUpdate: (attempt: AttemptDTO) => void;
}) {
  return (
    <li className="tr-card">
      <div className="tr-head">
        <span className="q-num">{String(r.n).padStart(2, "0")}</span>
        <span className={`verdict verdict-${r.verdict}`}>{VERDICT_LABEL[r.verdict]}</span>
        <span className="pts" style={{ marginLeft: "auto" }}>
          {r.score}/2
        </span>
      </div>
      <div className="translit">
        <div className="translit-row">
          <span className="translit-lang">Telugu</span>
          <span className="translit-text">{r.telugu}</span>
        </div>
        <div className="translit-row">
          <span className="translit-lang">Tinglish</span>
          <span className="translit-text">{r.tinglish}</span>
        </div>
        <div className="translit-row">
          <span className="translit-lang">Hinglish</span>
          <span className="translit-text">{r.hinglish}</span>
        </div>
      </div>
      <p className="tr-yours">
        <b>Your translation:</b> {r.yours || "(blank)"}
      </p>
      <p className="tr-yours">
        <b>Model translation:</b> {r.reference}
      </p>
      <p className="tr-feedback">{r.feedback}</p>
      <FlagItemButton attemptId={attemptId} itemKey={`item:${r.n}`} flag={flag} onUpdate={onUpdate} />
    </li>
  );
}

type ResultAttempt = Pick<AttemptDTO, "id" | "detail" | "flags" | "verifyCount">;

export function TranslationResults({ attempt: initialAttempt }: { attempt: ResultAttempt }) {
  const [attempt, setAttempt] = useState(initialAttempt);

  useEffect(() => {
    saveFlagsToStorage(attempt.id, attempt.flags);
  }, [attempt.id, attempt.flags]);

  const result = attempt.detail as TranslationResult;
  const wrong = result.rows.filter((r) => r.verdict !== "correct");
  const correct = result.rows.filter((r) => r.verdict === "correct");
  const flagFor = (n: number) => attempt.flags.find((f) => f.itemKey === `item:${n}`);

  return (
    <section className="results drill accent-violet">
      <div className="scorecard">
        <p className="score-big">
          {result.total}
          <span> / {result.maxScore}</span>
        </p>
        <p className="score-pct">{Math.round(result.pct)}% correct, as graded</p>
        <div className="grade-line">
          <p className="grade-band">{result.band.code}</p>
          <p className="grade-name">{result.band.name}</p>
          <p className="grade-desc">{result.band.desc}</p>
        </div>
      </div>

      <div className="panel">
        <h3>Item-by-item review</h3>
        {wrong.length > 0 && (
          <ul className="review">
            {wrong.map((r) => (
              <ReviewCard
                key={r.n}
                r={r}
                attemptId={attempt.id}
                flag={flagFor(r.n)}
                onUpdate={setAttempt}
              />
            ))}
          </ul>
        )}
        {correct.length > 0 && (
          <details className="acc">
            <summary>
              {correct.length} correct translation{correct.length > 1 ? "s" : ""}
            </summary>
            <ul className="review">
              {correct.map((r) => (
                <ReviewCard
                  key={r.n}
                  r={r}
                  attemptId={attempt.id}
                  flag={flagFor(r.n)}
                  onUpdate={setAttempt}
                />
              ))}
            </ul>
          </details>
        )}
      </div>

      <VerifyBar
        attemptId={attempt.id}
        flagCount={attempt.flags.length}
        verifyCount={attempt.verifyCount}
        onVerified={setAttempt}
      />
    </section>
  );
}
