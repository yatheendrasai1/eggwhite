"use client";

import type { GssPublicQuestion } from "@/lib/games/getSomeSpaceContent";

export function QuestionPanel({
  question,
  timerRunning,
  secondsLeft,
  busy,
  onNextQuestion,
  onAnswer,
}: {
  question: GssPublicQuestion | null;
  timerRunning: boolean;
  secondsLeft: number;
  busy: boolean;
  onNextQuestion: () => void;
  onAnswer: (choiceIndex: number) => void;
}) {
  if (!question) {
    return <p className="gss-question-empty">No question queued — start a session to begin.</p>;
  }

  if (!timerRunning) {
    return (
      <div className="gss-question">
        <p className="gss-question-preview">{question.prompt}</p>
        <button type="button" className="btn" onClick={onNextQuestion} disabled={busy}>
          Next question
        </button>
      </div>
    );
  }

  const pct = Math.max(0, Math.min(1, secondsLeft / 20));

  return (
    <div className="gss-question">
      <div className="gss-timer" role="timer" aria-label={`${secondsLeft} seconds left`}>
        <svg viewBox="0 0 36 36" className="gss-timer-ring">
          <circle cx="18" cy="18" r="16" className="gss-timer-track" />
          <circle
            cx="18"
            cy="18"
            r="16"
            className="gss-timer-bar"
            style={{ strokeDasharray: `${pct * 100.5} 100.5` }}
          />
        </svg>
        <span className="gss-timer-num">{secondsLeft}</span>
      </div>

      <p className="gss-question-prompt">{question.prompt}</p>

      <div className="gss-options">
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className="gss-option-btn"
            disabled={busy}
            onClick={() => onAnswer(i)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
