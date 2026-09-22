"use client";

import { useEffect, useState } from "react";
import { WORDS, type WordEntry } from "@/lib/wordOfTheDay";

function randomOtherWord(current: WordEntry): WordEntry {
  if (WORDS.length < 2) return current;
  let next = current;
  while (next.word === current.word) {
    next = WORDS[Math.floor(Math.random() * WORDS.length)];
  }
  return next;
}

/** Prefers an Indian-English voice, falling back to the en-IN locale (which
 *  most engines still pick a sensible voice for) if none is installed. */
function pickIndianVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "en-IN") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en-in")) ??
    null
  );
}

export function WordOfTheDay({ entry }: { entry: WordEntry }) {
  const [current, setCurrent] = useState(entry);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    // Voice lists load asynchronously in most browsers; this just warms the
    // cache so the first click already has en-IN voices to pick from.
    window.speechSynthesis.getVoices();
  }, []);

  function handleSpeak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(current.word);
    utterance.lang = "en-IN";
    const voice = pickIndianVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

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
          <button
            type="button"
            className={`wotd-icon-btn${speaking ? " speaking" : ""}`}
            aria-label={`Pronounce "${current.word}" (Indian English)`}
            onClick={handleSpeak}
          >
            🔊
          </button>
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
