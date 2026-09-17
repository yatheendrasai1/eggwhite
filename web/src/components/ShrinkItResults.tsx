"use client";

import { useEffect, useState } from "react";
import type {
  ShrinkItResult,
  ShrinkItSentenceResult,
  ShrinkItSynonymResult,
} from "@/lib/tests/shrinkIt";
import type { AttemptDTO } from "@/lib/attempts";
import { FlagItemButton } from "@/components/FlagItemButton";
import { VerifyBar } from "@/components/VerifyBar";
import {
  type StoredFlag,
  loadFlagsFromStorage,
  saveFlagsToStorage,
} from "@/lib/client/flagStorage";

function SentenceCard({
  r,
  flag,
  onFlag,
  onUnflag,
}: {
  r: ShrinkItSentenceResult;
  flag: StoredFlag | undefined;
  onFlag: (itemKey: string, comment: string) => void;
  onUnflag: (itemKey: string) => void;
}) {
  return (
    <li className="tr-card">
      <div className="tr-head">
        <span className="q-num">{String(r.n).padStart(2, "0")}</span>
        <span className="pts pts-1" style={{ marginLeft: "auto" }}>
          {r.pts}/10
        </span>
      </div>
      <p className="tr-yours">
        <b>Original ({r.originalWords} words):</b> {r.original}
      </p>
      <p className="tr-yours">
        <b>Yours ({r.yourWords} words):</b> {r.yours || "(blank)"}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0" }}>
        <span className="pts pts-h">Shrink {r.shrinkPct}% → {r.shrinkPts}/5</span>
        <span className={`pts ${r.infoLossPct <= 30 ? "pts-1" : "pts-0"}`}>
          Info lost {r.infoLossPct}% → {r.infoPts}/5
        </span>
      </div>
      <p className="tr-feedback">{r.feedback}</p>
      <FlagItemButton
        itemKey={`sentence:${r.n}`}
        flag={flag}
        onFlag={onFlag}
        onUnflag={onUnflag}
      />
    </li>
  );
}

function SynonymCard({
  r,
  flag,
  onFlag,
  onUnflag,
}: {
  r: ShrinkItSynonymResult;
  flag: StoredFlag | undefined;
  onFlag: (itemKey: string, comment: string) => void;
  onUnflag: (itemKey: string) => void;
}) {
  return (
    <li className="rev">
      <span className="rev-n">{String(r.n).padStart(2, "0")}</span>
      <span className="rev-i">{r.ok ? "✅" : "❌"}</span>
      <div className="rev-b" style={{ flex: 1 }}>
        <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{r.word}</p>
        <span className="yours">
          You picked <b>{r.picked !== undefined ? r.options[r.picked] : "(nothing)"}</b>
          {!r.ok && (
            <>
              {" "}
              — correct was <b>{r.options[r.correct]}</b>
            </>
          )}
        </span>
        <em>{r.why}</em>
        <FlagItemButton
          itemKey={`synonym:${r.n}`}
          flag={flag}
          onFlag={onFlag}
          onUnflag={onUnflag}
        />
      </div>
      <span className={`pts ${r.ok ? "pts-1" : "pts-0"}`}>{r.ok ? "+1" : "0"}</span>
    </li>
  );
}

type ResultAttempt = Pick<AttemptDTO, "id" | "detail" | "verifyCount">;

export function ShrinkItResults({ attempt: initialAttempt }: { attempt: ResultAttempt }) {
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

  const result = attempt.detail as ShrinkItResult;
  const wrongSynonyms = result.synonymRows.filter((r) => !r.ok);
  const correctSynonyms = result.synonymRows.filter((r) => r.ok);
  const flagFor = (itemKey: string) => flags.find((f) => f.itemKey === itemKey);

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
        <h3>Section A — shrink review ({result.sectionATotal}/{result.sectionAMax})</h3>
        <ul className="review">
          {result.sentenceRows.map((r) => (
            <SentenceCard
              key={r.n}
              r={r}
              flag={flagFor(`sentence:${r.n}`)}
              onFlag={handleFlag}
              onUnflag={handleUnflag}
            />
          ))}
        </ul>
      </div>

      <div className="panel">
        <h3>Section B — synonym review ({result.sectionBTotal}/{result.sectionBMax})</h3>
        {wrongSynonyms.length > 0 && (
          <ul className="review">
            {wrongSynonyms.map((r) => (
              <SynonymCard
                key={r.n}
                r={r}
                flag={flagFor(`synonym:${r.n}`)}
                onFlag={handleFlag}
                onUnflag={handleUnflag}
              />
            ))}
          </ul>
        )}
        {correctSynonyms.length > 0 && (
          <details className="acc">
            <summary>
              {correctSynonyms.length} correct pick{correctSynonyms.length > 1 ? "s" : ""}
            </summary>
            <ul className="review">
              {correctSynonyms.map((r) => (
                <SynonymCard
                  key={r.n}
                  r={r}
                  flag={flagFor(`synonym:${r.n}`)}
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
