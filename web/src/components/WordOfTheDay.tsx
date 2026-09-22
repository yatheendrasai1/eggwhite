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

const POS_ABBREVIATIONS: Record<string, string> = {
  noun: "n.",
  verb: "v.",
  adjective: "adj.",
  adverb: "adv.",
  pronoun: "pron.",
  preposition: "prep.",
  conjunction: "conj.",
  interjection: "interj.",
};

function abbreviatePartOfSpeech(partOfSpeech: string): string {
  return POS_ABBREVIATIONS[partOfSpeech.toLowerCase()] ?? partOfSpeech;
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
          Word bank
        </p>
        <div className="wotd-top-actions">
          <button
            type="button"
            className="wotd-icon-btn"
            aria-label="Show a different word"
            onClick={() => setCurrent((c) => randomOtherWord(c))}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
          </button>
          <button
            type="button"
            className={`wotd-icon-btn${speaking ? " speaking" : ""}`}
            aria-label={`Pronounce "${current.word}" (Indian English)`}
            onClick={handleSpeak}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="4 9 8 9 13 4 13 20 8 15 4 15 4 9" />
              <path d="M16 8a5 5 0 0 1 0 8" />
              <path d="M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          </button>
        </div>
      </div>
      <div className="wotd-word-center">
        <div className="wotd-word-row">
          <h3 className="wotd-word">{current.word}</h3>
          <span className="wotd-pos">{abbreviatePartOfSpeech(current.partOfSpeech)}</span>
        </div>
      </div>
      <p className="wotd-meaning">{current.meaning}</p>
      <span className={`wotd-sentiment wotd-sentiment-${current.sentiment}`}>
        {current.sentiment} tone
      </span>
      <div className="wotd-example-box">
        <p className="wotd-example-label">Usage</p>
        <p className="wotd-example">&ldquo;{current.example}&rdquo;</p>
      </div>
    </section>
  );
}
