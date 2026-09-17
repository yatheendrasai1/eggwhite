"use client";

import { useEffect, useState } from "react";
import type { JiraCommentConfig, JiraCommentResult } from "@/lib/tests/jiraComment";
import type { AttemptDTO } from "@/lib/attempts";
import { JiraCommentExportPanel } from "@/components/JiraCommentExportPanel";
import { FlagItemButton } from "@/components/FlagItemButton";
import { VerifyBar } from "@/components/VerifyBar";
import {
  type StoredFlag,
  loadFlagsFromStorage,
  saveFlagsToStorage,
} from "@/lib/client/flagStorage";

const RESPONSE_FLAG_KEY = "response";

type ResultAttempt = Pick<AttemptDTO, "id" | "detail" | "verifyCount">;

export function JiraCommentResults({
  attempt: initialAttempt,
  config,
}: {
  attempt: ResultAttempt;
  config: JiraCommentConfig;
}) {
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

  const result = attempt.detail as JiraCommentResult;
  const flag = flags.find((f) => f.itemKey === RESPONSE_FLAG_KEY);

  return (
    <section className="results drill accent-violet">
      <div className="scorecard">
        <p className="score-big">
          {result.total}
          <span> / {result.maxScore}</span>
        </p>
        <p className="score-pct">{Math.round((result.total / result.maxScore) * 100)}%, as graded</p>
        <div className="grade-line">
          <p className="grade-band">{result.band.code}</p>
          <p className="grade-name">{result.band.name}</p>
          <p className="grade-desc">{result.band.desc}</p>
        </div>
      </div>

      <div className="panel">
        <h3>Score breakdown</h3>
        <ul className="levels">
          {result.categories.map((c) => (
            <li key={c.key}>
              <span className="lv-code">
                {c.score}/{c.max}
              </span>
              <div className="lv-body">
                <b>{c.label}</b>
                <span>{c.justification}</span>
              </div>
            </li>
          ))}
        </ul>
        <FlagItemButton
          itemKey={RESPONSE_FLAG_KEY}
          flag={flag}
          onFlag={handleFlag}
          onUnflag={handleUnflag}
        />
      </div>

      {result.suggestions.length > 0 && (
        <div className="panel">
          <h3>Suggestions</h3>
          <ul className="review">
            {result.suggestions.map((s, i) => (
              <li className="rev" key={i}>
                <span className="rev-i">✎</span>
                <div className="rev-b">
                  <span className="from">{s.quote}</span> → <span className="to">{s.fix}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="panel">
        <h3>Your response</h3>
        <p className="q-text" style={{ whiteSpace: "pre-wrap" }}>
          {result.response || "(blank)"}
        </p>
      </div>

      <details className="acc">
        <summary>Scenario for reference</summary>
        <p className="q-ctx" style={{ margin: "10px 0" }}>
          {config.scenario.role} · Ticket {config.scenario.ticket} · Writing to{" "}
          {config.scenario.recipient}
        </p>
        {config.scenario.story.map((p, i) => (
          <p className="q-text" key={i} style={{ marginBottom: 10 }}>
            {p}
          </p>
        ))}
      </details>

      <JiraCommentExportPanel result={result} config={config} />

      <VerifyBar
        attemptId={attempt.id}
        flags={flags}
        verifyCount={attempt.verifyCount}
        onVerified={handleVerified}
      />
    </section>
  );
}
