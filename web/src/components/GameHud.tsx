"use client";

import type { GssStateDTO } from "@/lib/games/getSomeSpaceState";
import { MAX_LIVES, SESSIONS_PER_DAY } from "@/lib/games/getSomeSpace";

export function GameHud({ state, compact = false }: { state: GssStateDTO; compact?: boolean }) {
  return (
    <div className={compact ? "gss-hud gss-hud-compact" : "gss-hud"}>
      <div className="gss-hud-item" aria-label={`${state.lives} of ${MAX_LIVES} lives left`}>
        {Array.from({ length: MAX_LIVES }).map((_, i) => (
          <span key={i} className={`gss-life ${i < state.lives ? "gss-life-on" : "gss-life-off"}`}>
            ♥
          </span>
        ))}
      </div>
      <div className="gss-hud-item gss-hud-score">
        Score <strong>{state.score}</strong>
      </div>
      <div className="gss-hud-item gss-hud-bonus">
        Bonus <strong>{state.bonusQuota}</strong>
      </div>
      {!compact && (
        <div className="gss-hud-item gss-hud-sessions">
          Session {state.sessionsUsedToday}/{SESSIONS_PER_DAY}
        </div>
      )}
    </div>
  );
}
