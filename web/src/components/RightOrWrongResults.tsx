"use client";

import { useEffect, useState } from "react";
import type { RightOrWrongResult, RightOrWrongItemResult } from "@/lib/tests/rightOrWrong";
import type { AttemptDTO } from "@/lib/attempts";
import { FlagItemButton } from "@/components/FlagItemButton";
import { VerifyBar } from "@/components/VerifyBar";
import {
  type StoredFlag,
  loadFlagsFromStorage,
  saveFlagsToStorage,
} from "@/lib/client/flagStorage";

function ReviewCard({
  r,
  flag,
  onFlag,
  onUnflag,
}: {
  r: RightOrWrongItemResult;
  flag: StoredFlag | undefined;
  onFlag: (itemKey: string, comment: string) => void;
  onUnflag: (itemKey: string) => void;
}) {
  const verdictRight = r.basePts > 0;
  return (
    <li className="rev">
      <span className="rev-n">{String(r.n).padStart(2, "0")}</span>
      <span className="rev-i">{verdictRight ? "✅" : "❌"}</span>
      <div className="rev-b" style={{ flex: 1 }}>
        <p style={{ margin: "0 0 4px", fontWeight: 600 }}>&ldquo;{r.phrase}&rdquo;</p>
        <span className="yours">
          You called it <b>{r.verdict === "correct" ? "right" : "wrong"}</b> — it was actually{" "}
          <b>{r.actual ? "right" : "wrong"}</b>.
        </span>
        {!r.actual && r.correctFix && <em>Fix: {r.correctFix}</em>}
        {r.attemptedBonus && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--line)" }}>
            <span className="yours">
              Your case: &ldquo;{r.yourIssue}&rdquo; → &ldquo;{r.yourFix}&rdquo;
            </span>
            <em>{r.bonusFeedback}</em>
          </div>
        )}
        <FlagItemButton itemKey={`item:${r.n}`} flag={flag} onFlag={onFlag} onUnflag={onUnflag} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
        <span className={`pts ${verdictRight ? "pts-1" : "pts-0"}`}>
          {verdictRight ? "+1" : "-1"}
        </span>
        {r.attemptedBonus && (
          <span className={`pts ${r.bonusEarned ? "pts-h" : "pts-n"}`}>
            {r.bonusEarned ? "+1 bonus" : "no bonus"}
          </span>
        )}
      </div>
    </li>
  );
}

type ResultAttempt = Pick<AttemptDTO, "id" | "detail" | "verifyCount">;

export function RightOrWrongResults({ attempt: initialAttempt }: { attempt: ResultAttempt }) {
  const [attempt, setAttempt] = useState(initialAttempt);
  const [flags, setFlags] = useState<StoredFlag[]>(() => loadFlagsFromStorage(initialAttempt.id));

  useEffect(() => {
    saveFlagsToStorage(attempt.id, flags);
  }, [attempt.id, flags]);

  function handleFlag(itemKey: string, comment: string) {
    setFlags((prev) => {
      const idx = prev.findIndex((f) => f.itemKey === itemKey);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { itemKey, comment };
        return next;
      }
      return [...prev, { itemKey, comment }];
    });
  }

  function handleUnflag(itemKey: string) {
    setFlags((prev) => prev.filter((f) => f.itemKey !== itemKey));
  }

  function handleVerified(verified: AttemptDTO) {
    setAttempt(verified);
    setFlags([]);
  }

  const result = attempt.detail as RightOrWrongResult;
  const wrong = result.rows.filter((r) => r.basePts < 0);
  const correct = result.rows.filter((r) => r.basePts > 0);
  const flagFor = (n: number) => flags.find((f) => f.itemKey === `item:${n}`);

  return (
    <section className="results drill accent-violet">
      <div className="scorecard">
        <p className="score-big">
          {result.total}
          <span> / {result.maxScore}</span>
        </p>
        <p className="score-pct">{Math.round(result.pct)}%, as graded</p>
        <div className="grade-line">
          <p className="grade-band">{result.band.code}</p>
          <p className="grade-name">{result.band.name}</p>
          <p className="grade-desc">{result.band.desc}</p>
        </div>
      </div>

      <div className="panel">
        <h3>Call-by-call review</h3>
        {wrong.length > 0 && (
          <ul className="review">
            {wrong.map((r) => (
              <ReviewCard key={r.n} r={r} flag={flagFor(r.n)} onFlag={handleFlag} onUnflag={handleUnflag} />
            ))}
          </ul>
        )}
        {correct.length > 0 && (
          <details className="acc">
            <summary>
              {correct.length} correct call{correct.length > 1 ? "s" : ""}
            </summary>
            <ul className="review">
              {correct.map((r) => (
                <ReviewCard
                  key={r.n}
                  r={r}
                  flag={flagFor(r.n)}
                  onFlag={handleFlag}
                  onUnflag={handleUnflag}
                />
              ))}
            </ul>
          </details>
        )}
      </div>

      <VerifyBar
        attemptId={attempt.id}
        flags={flags}
        verifyCount={attempt.verifyCount}
        onVerified={handleVerified}
      />
    </section>
  );
}
