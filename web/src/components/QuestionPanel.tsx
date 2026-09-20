"use client";

import type { GssPublicQuestion } from "@/lib/games/getSomeSpaceContent";
import type { AnswerOutcome } from "@/lib/games/getSomeSpace";

export type ReviewInfo = {
  question: GssPublicQuestion;
  selectedIndex: number; // -1 means the timer ran out with no answer
  outcome: AnswerOutcome;
};

function reviewSummary(outcome: AnswerOutcome): string {
  if (outcome.milestoneReached && outcome.milestoneReached !== "start") {
    if (outcome.perfectBonusAwarded > 0) return `Correct! Level cleared perfectly — +${outcome.pointsAwarded} points, +${outcome.perfectBonusAwarded} bonus.`;
    if (outcome.lifeRewardAwarded > 0) return `Correct! Level cleared — +${outcome.pointsAwarded} points, +1 life back.`;
    return `Correct! +${outcome.pointsAwarded} points.`;
  }
  if (outcome.correct) return `Correct! +${outcome.pointsAwarded} points.`;
  if (outcome.gameOver) return "Wrong — that was your last life. Session over.";
  return "Wrong — no points lost, but that cost a life.";
}

function ReviewPanel({ reviewing, onContinue }: { reviewing: ReviewInfo; onContinue: () => void }) {
  const { question, selectedIndex, outcome } = reviewing;
  return (
    <div className="gss-question">
      <p
        className={`gss-review-summary ${outcome.correct ? "gss-review-correct" : "gss-review-wrong"}`}
      >
        {selectedIndex === -1 ? "Time's up! " : ""}
        {reviewSummary(outcome)}
      </p>

      <p className="gss-question-prompt">{question.prompt}</p>

      <div className="gss-options">
        {question.options.map((opt, i) => {
          const isCorrectOption = i === outcome.correctIndex;
          const isSelected = i === selectedIndex;
          const cls = isCorrectOption
            ? "gss-option-btn gss-option-correct"
            : isSelected
              ? "gss-option-btn gss-option-wrong"
              : "gss-option-btn";
          return (
            <button key={i} type="button" className={cls} disabled>
              {opt}
              {isCorrectOption && <span className="gss-option-mark"> ✓</span>}
              {isSelected && !isCorrectOption && <span className="gss-option-mark"> ✗</span>}
            </button>
          );
        })}
      </div>

      <button type="button" className="btn" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

export function QuestionPanel({
  question,
  timerRunning,
  secondsLeft,
  busy,
  reviewing,
  onNextQuestion,
  onAnswer,
  onContinue,
}: {
  question: GssPublicQuestion | null;
  timerRunning: boolean;
  secondsLeft: number;
  busy: boolean;
  reviewing: ReviewInfo | null;
  onNextQuestion: () => void;
  onAnswer: (choiceIndex: number) => void;
  onContinue: () => void;
}) {
  if (reviewing) {
    return <ReviewPanel reviewing={reviewing} onContinue={onContinue} />;
  }

  if (!question) {
    return <p className="gss-question-empty">No question queued — start a session to begin.</p>;
  }

  if (!timerRunning) {
    return (
      <div className="gss-question">
        <p className="gss-question-preview">Ready for the next question? You&rsquo;ll have 20 seconds once it appears.</p>
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
