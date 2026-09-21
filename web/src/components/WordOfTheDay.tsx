"use client";

import { useState } from "react";
import type { WordEntry } from "@/lib/wordOfTheDay";

export function WordOfTheDay({ entry }: { entry: WordEntry }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <section className="panel wotd-card">
      <div className="wotd-top">
        <p className="section-label" style={{ margin: 0 }}>
          Word of the day
        </p>
        <span className="wotd-speaker" aria-hidden="true">
          🔊
        </span>
      </div>
      <div className="wotd-word-row">
        <h3 className="wotd-word">{entry.word}</h3>
        <span className="wotd-pos">{entry.partOfSpeech}</span>
      </div>
      {revealed ? (
        <div className="wotd-reveal">
          <p className="wotd-meaning">{entry.meaning}</p>
          <div className="wotd-example-box">
            <p className="wotd-example-label">Example</p>
            <p className="wotd-example">&ldquo;{entry.example}&rdquo;</p>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-ghost wotd-reveal-btn" onClick={() => setRevealed(true)}>
          Reveal meaning
        </button>
      )}
    </section>
  );
}
