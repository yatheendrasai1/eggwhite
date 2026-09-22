"use client";

import { useState } from "react";
import { WORDS, type WordEntry } from "@/lib/wordOfTheDay";

function randomOtherWord(current: WordEntry): WordEntry {
  if (WORDS.length < 2) return current;
  let next = current;
  while (next.word === current.word) {
    next = WORDS[Math.floor(Math.random() * WORDS.length)];
  }
  return next;
}

export function WordOfTheDay({ entry }: { entry: WordEntry }) {
  const [current, setCurrent] = useState(entry);

  return (
    <section className="panel wotd-card">
      <div className="wotd-top">
        <p className="section-label" style={{ margin: 0 }}>
          Word of the day
        </p>
        <div className="wotd-top-actions">
          <button
            type="button"
            className="wotd-icon-btn"
            aria-label="Show a different word"
            onClick={() => setCurrent((c) => randomOtherWord(c))}
          >
            🔀
          </button>
          <span className="wotd-icon-btn" aria-hidden="true">
            🔊
          </span>
        </div>
      </div>
      <div className="wotd-word-center">
        <h3 className="wotd-word">{current.word}</h3>
        <span className="wotd-pos">{current.partOfSpeech}</span>
        <span className={`wotd-sentiment wotd-sentiment-${current.sentiment}`}>
          {current.sentiment} tone
        </span>
      </div>
      <p className="wotd-meaning">{current.meaning}</p>
      <div className="wotd-example-box">
        <p className="wotd-example-label">Corporate style example</p>
        <p className="wotd-example">&ldquo;{current.example}&rdquo;</p>
      </div>
    </section>
  );
}
