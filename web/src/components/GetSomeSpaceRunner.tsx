"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GssStateDTO } from "@/lib/games/getSomeSpaceState";
import type { AnswerOutcome } from "@/lib/games/getSomeSpace";
import type { GssLeaderboardRow } from "@/lib/games/getSomeSpaceLeaderboard";
import { startGssSession, submitGssAnswer } from "@/lib/client/getSomeSpaceApi";
import { AltitudeScene } from "@/components/AltitudeScene";
import { QuestionPanel } from "@/components/QuestionPanel";
import { GameHud } from "@/components/GameHud";
import { GssLeaderboardCard } from "@/components/GssLeaderboardCard";

const QUESTION_SECONDS = 20;

type BlockedReason = "daily_limit" | "cooldown" | null;

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "now";
  const totalMin = Math.ceil(ms / 60000);
  if (totalMin < 60) return `${totalMin} min`;
  const hrs = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return min > 0 ? `${hrs}h ${min}m` : `${hrs}h`;
}

export function GetSomeSpaceRunner({
  initialState,
  initialCanStart,
  initialBlockedReason,
  initialAvailableAt,
  leaderboard,
}: {
  initialState: GssStateDTO;
  initialCanStart: boolean;
  initialBlockedReason: BlockedReason;
  initialAvailableAt: string | null;
  leaderboard: GssLeaderboardRow[];
}) {
  const [state, setState] = useState(initialState);
  const [canStart, setCanStart] = useState(initialCanStart);
  const [blockedReason, setBlockedReason] = useState<BlockedReason>(initialBlockedReason);
  const [availableAt, setAvailableAt] = useState<string | null>(initialAvailableAt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOutcome, setLastOutcome] = useState<AnswerOutcome | null>(null);
  const [outcomeSeq, setOutcomeSeq] = useState(0);

  // The 20s timer only starts once the player clicks "Next question" — a
  // reload discards it and re-shows the same question (spec §2.5). This is
  // a UI-only timer; the server never enforces it.
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const questionIdRef = useRef<string | null>(null);

  const stopTimer = useCallback(() => {
    setTimerRunning(false);
    setSecondsLeft(QUESTION_SECONDS);
  }, []);

  useEffect(() => {
    // A new question arriving (from any state update) invalidates any
    // running timer — the player must click "Next question" again.
    if (state.currentQuestion?.id !== questionIdRef.current) {
      questionIdRef.current = state.currentQuestion?.id ?? null;
      stopTimer();
    }
  }, [state.currentQuestion?.id, stopTimer]);

  useEffect(() => {
    if (!timerRunning) return;
    if (secondsLeft <= 0) {
      void handleAnswer(-1); // timeout — treated as an unanswered/wrong question
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning, secondsLeft]);

  async function handleStart() {
    setBusy(true);
    setError(null);
    try {
      const res = await startGssSession();
      if ("error" in res) {
        setCanStart(false);
        setBlockedReason(res.error as BlockedReason);
        setAvailableAt(res.availableAt);
        return;
      }
      setState(res.state);
      setLastOutcome(null);
    } catch {
      setError("Couldn't start a session — try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleNextQuestion() {
    setSecondsLeft(QUESTION_SECONDS);
    setTimerRunning(true);
  }

  async function handleAnswer(choiceIndex: number) {
    const q = state.currentQuestion;
    if (!q || busy) return;
    stopTimer();
    setBusy(true);
    setError(null);
    try {
      const res = await submitGssAnswer(q.id, choiceIndex);
      setState(res.state);
      setLastOutcome(res.outcome);
      setOutcomeSeq((n) => n + 1);
      if (res.outcome.gameOver) {
        setCanStart(false);
        setBlockedReason("cooldown");
        setAvailableAt(res.state.cooldownUntil);
      }
    } catch {
      setError("Couldn't submit that answer — try again.");
    } finally {
      setBusy(false);
    }
  }

  const showStartGate = state.status !== "active";

  return (
    <div className="gss-layout">
      <AltitudeScene state={state} lastOutcome={lastOutcome} outcomeSeq={outcomeSeq} />

      <div className="gss-panel">
        <GameHud state={state} />

        {error && <p className="gss-error">{error}</p>}

        {showStartGate ? (
          <div className="gss-gate">
            {state.status === "completed" ? (
              <>
                <h2>You reached space! 🚀</h2>
                <p>
                  Score: <strong>{state.score}</strong> · Bonus quota:{" "}
                  <strong>{state.bonusQuota}</strong>
                </p>
              </>
            ) : canStart ? (
              <>
                <p>Ready for another climb?</p>
                <button type="button" className="btn" onClick={handleStart} disabled={busy}>
                  Start session
                </button>
              </>
            ) : (
              <>
                <p>
                  {blockedReason === "daily_limit"
                    ? "You've used all 4 sessions for today."
                    : "Cooling off before your next session."}
                </p>
                {availableAt && (
                  <p className="gss-availat">
                    Next session in {fmtCountdown(new Date(availableAt).getTime() - Date.now())}
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <QuestionPanel
            question={state.currentQuestion}
            timerRunning={timerRunning}
            secondsLeft={secondsLeft}
            busy={busy}
            onNextQuestion={handleNextQuestion}
            onAnswer={handleAnswer}
          />
        )}

        <GssLeaderboardCard rows={leaderboard} />
      </div>
    </div>
  );
}
