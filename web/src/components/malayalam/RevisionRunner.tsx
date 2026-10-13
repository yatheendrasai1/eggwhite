"use client";

import { useEffect, useMemo, useState } from "react";
import { REVISION_ROWS, REVISION_SENTENCES, type RevisionSentence } from "@/lib/malayalam/sentences";

/** Per-sentence self-marks, kept in this browser only. */
type Marks = Record<number, "got" | "missed">;

const STORAGE_KEY = "egvit.malayalam.revision.v1";
const WEAK = "weak";

function loadMarks(): Marks {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Marks) : {};
  } catch {
    return {};
  }
}

function saveMarks(marks: Marks) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(marks));
  } catch {
    // Private mode / storage blocked — marks just won't persist.
  }
}

function shuffled<T>(items: T[]): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function RevisionRunner() {
  const [marks, setMarks] = useState<Marks>({});
  const [filter, setFilter] = useState<string>("all");
  const [shuffle, setShuffle] = useState(false);
  const [deck, setDeck] = useState<RevisionSentence[]>(REVISION_SENTENCES);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ got: 0, missed: 0 });

  // Reading localStorage must wait until after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMarks(loadMarks()), []);

  const weakCount = useMemo(
    () => Object.values(marks).filter((m) => m === "missed").length,
    [marks]
  );

  function buildDeck(nextFilter: string, nextShuffle: boolean, currentMarks: Marks) {
    const base =
      nextFilter === "all"
        ? REVISION_SENTENCES
        : nextFilter === WEAK
          ? REVISION_SENTENCES.filter((s) => currentMarks[s.n] === "missed")
          : REVISION_SENTENCES.filter((s) => s.row === nextFilter);
    setDeck(nextShuffle ? shuffled(base) : base);
    setPos(0);
    setRevealed(false);
    setSession({ got: 0, missed: 0 });
  }

  function chooseFilter(next: string) {
    setFilter(next);
    buildDeck(next, shuffle, marks);
  }

  function toggleShuffle() {
    const next = !shuffle;
    setShuffle(next);
    buildDeck(filter, next, marks);
  }

  function mark(result: "got" | "missed") {
    const card = deck[pos];
    const next = { ...marks, [card.n]: result };
    setMarks(next);
    saveMarks(next);
    setSession((s) => ({ ...s, [result]: s[result] + 1 }));
    setRevealed(false);
    setPos((p) => p + 1);
  }

  function resetMarks() {
    setMarks({});
    saveMarks({});
    if (filter === WEAK) buildDeck(WEAK, shuffle, {});
  }

  const card = deck[pos];
  const finished = pos >= deck.length;
  const rowTitle = (row: string) => REVISION_ROWS.find((r) => r.row === row)?.title ?? `Row ${row}`;

  return (
    <>
      <div className="ml-filters" role="group" aria-label="Choose sentences">
        <button
          type="button"
          className={`ml-filter${filter === "all" ? " on" : ""}`}
          onClick={() => chooseFilter("all")}
        >
          All
        </button>
        {REVISION_ROWS.map((r) => (
          <button
            key={r.row}
            type="button"
            title={r.title}
            className={`ml-filter${filter === r.row ? " on" : ""}`}
            onClick={() => chooseFilter(r.row)}
          >
            {r.row === "7b" ? "7·2" : r.row}
          </button>
        ))}
        <button
          type="button"
          className={`ml-filter ml-filter-weak${filter === WEAK ? " on" : ""}`}
          onClick={() => chooseFilter(WEAK)}
          disabled={weakCount === 0 && filter !== WEAK}
        >
          Missed · {weakCount}
        </button>
      </div>

      <div className="ml-rev-bar">
        <span>
          {finished ? deck.length : Math.min(pos + 1, deck.length)} / {deck.length}
        </span>
        <span className="ml-rev-tally">
          <span className="ml-rev-got">✓ {session.got}</span>
          <span className="ml-rev-missed">✗ {session.missed}</span>
        </span>
        <label className="ml-rev-shuffle">
          <input type="checkbox" checked={shuffle} onChange={toggleShuffle} /> Shuffle
        </label>
      </div>

      {deck.length === 0 ? (
        <div className="panel ml-rev-card">
          <p className="ml-rev-empty">Nothing missed yet — pick a row to revise.</p>
        </div>
      ) : finished ? (
        <div className="panel ml-rev-card">
          <p className="ml-rev-row">Round done</p>
          <p className="ml-rev-en">
            {session.got} / {deck.length} produced correctly
          </p>
          <div className="ml-rev-actions">
            <button type="button" className="btn" onClick={() => buildDeck(filter, shuffle, marks)}>
              Go again
            </button>
            {weakCount > 0 && filter !== WEAK && (
              <button type="button" className="btn btn-ghost" onClick={() => chooseFilter(WEAK)}>
                Revise missed ({weakCount})
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="panel ml-rev-card">
          <p className="ml-rev-row">
            #{card.n} · {rowTitle(card.row)}
            {marks[card.n] === "missed" && <span className="ml-rev-flag">missed last time</span>}
          </p>
          <p className="ml-rev-en">{card.en}</p>
          {revealed ? (
            <>
              <p className="ml-rev-ml">{card.ml}</p>
              <div className="ml-rev-actions">
                <button type="button" className="btn ml-btn-got" onClick={() => mark("got")}>
                  Got it
                </button>
                <button type="button" className="btn ml-btn-missed" onClick={() => mark("missed")}>
                  Missed
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="ml-rev-hint">Say it aloud in Malayalam, then check.</p>
              <div className="ml-rev-actions">
                <button type="button" className="btn" onClick={() => setRevealed(true)}>
                  Reveal
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {Object.keys(marks).length > 0 && (
        <p className="foot">
          Marks are saved in this browser.{" "}
          <button type="button" className="ml-link-btn" onClick={resetMarks}>
            Clear marks
          </button>
        </p>
      )}
    </>
  );
}
