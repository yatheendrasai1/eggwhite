"use client";

import { useState } from "react";
import type { WordEntry } from "@/lib/wordOfTheDay";

export function WordOfTheDay({ entry }: { entry: WordEntry }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <section className="panel wotd-card">
      <p className="section-label" style={{ marginBottom: 10 }}>
        Word of the day
      </p>
      <div className="wotd-word-row">
        <h3 className="wotd-word">{entry.word}</h3>
        <span className="wotd-pos">{entry.partOfSpeech}</span>
      </div>
      {revealed ? (
        <div className="wotd-reveal">
          <p className="wotd-meaning">{entry.meaning}</p>
          <p className="wotd-example">&ldquo;{entry.example}&rdquo;</p>
        </div>
      ) : (
        <button type="button" className="btn btn-ghost wotd-reveal-btn" onClick={() => setRevealed(true)}>
          Reveal meaning
        </button>
      )}
    </section>
  );
}
