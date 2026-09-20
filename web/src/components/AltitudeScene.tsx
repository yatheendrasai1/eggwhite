"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { GssStateDTO } from "@/lib/games/getSomeSpaceState";
import type { AnswerOutcome } from "@/lib/games/getSomeSpace";
import { MILESTONES, SEGMENTS } from "@/lib/games/getSomeSpace";

const TOTAL_CORRECT = SEGMENTS[1].requiredCorrect + SEGMENTS[2].requiredCorrect + SEGMENTS[3].requiredCorrect;

function cumulativeBefore(segmentIndex: number): number {
  let sum = 0;
  if (segmentIndex > 1) sum += SEGMENTS[1].requiredCorrect;
  if (segmentIndex > 2) sum += SEGMENTS[2].requiredCorrect;
  return sum;
}

function progressFraction(state: GssStateDTO): number {
  if (state.segmentIndex > 3) return 1;
  const count = cumulativeBefore(state.segmentIndex) + state.correctInSegment;
  return Math.max(0, Math.min(1, count / TOTAL_CORRECT));
}

/** Milestone flag positions along the track, as a fraction of total height (0 = ground, 1 = space). */
const MILESTONE_MARKERS = MILESTONES.filter((m) => m.key !== "start").map((m) => ({
  key: m.key,
  label: m.label,
  fraction:
    (cumulativeBefore(m.segmentIndex > 3 ? 3 : m.segmentIndex) +
      (m.segmentIndex > 3 ? SEGMENTS[3].requiredCorrect : m.correctBaseline)) /
    TOTAL_CORRECT,
}));

/**
 * Mounts showing `children`, then unmounts itself after `ms`. Remounting it
 * under a fresh `key` (see usage below) replays the reveal for each new
 * event, without comparing props across renders — the state-setting happens
 * only inside the timeout callback, never synchronously in the effect body.
 */
function AutoHide({ ms, children }: { ms: number; children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  if (!visible) return null;
  return <>{children}</>;
}

export function AltitudeScene({
  state,
  lastOutcome,
  outcomeSeq,
}: {
  state: GssStateDTO;
  lastOutcome: AnswerOutcome | null;
  /** Increments on every answer — lets milestone/respawn effects replay even for the same milestone key twice. */
  outcomeSeq: number;
}) {
  const pct = progressFraction(state) * 100;
  const reachedKey = lastOutcome?.milestoneReached ?? null;

  return (
    <div className={`gss-scene ${lastOutcome?.gameOver ? "gss-scene-respawn" : ""}`}>
      {/* Sky bands, ground at the bottom, edge of space at the top. */}
      <div className="gss-band gss-band-1" style={{ flexBasis: `${(SEGMENTS[1].requiredCorrect / TOTAL_CORRECT) * 100}%` }}>
        <span className="gss-band-label">{SEGMENTS[1].name}</span>
      </div>
      <div className="gss-band gss-band-2" style={{ flexBasis: `${(SEGMENTS[2].requiredCorrect / TOTAL_CORRECT) * 100}%` }}>
        <span className="gss-band-label">{SEGMENTS[2].name}</span>
      </div>
      <div className="gss-band gss-band-3" style={{ flexBasis: `${(SEGMENTS[3].requiredCorrect / TOTAL_CORRECT) * 100}%` }}>
        <span className="gss-band-label">{SEGMENTS[3].name}</span>
        <div className="gss-stars" aria-hidden="true" />
      </div>

      {MILESTONE_MARKERS.map((m) => (
        <div key={m.key} className="gss-milestone" style={{ bottom: `${m.fraction * 100}%` }} title={m.label}>
          <span className="gss-milestone-flag" />
          {reachedKey === m.key && (
            <AutoHide key={outcomeSeq} ms={1800}>
              <span className="gss-milestone-flag gss-milestone-flag-flash" />
            </AutoHide>
          )}
          <span className="gss-milestone-label">{m.label}</span>
        </div>
      ))}

      <motion.div
        className="gss-marker"
        animate={{ bottom: `${pct}%` }}
        transition={{ type: "spring", stiffness: 70, damping: 16 }}
        aria-label="Current altitude"
      >
        🚀
      </motion.div>

      {reachedKey && (
        <AutoHide key={outcomeSeq} ms={1800}>
          <motion.div
            className="gss-milestone-toast"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {MILESTONES.find((m) => m.key === reachedKey)?.label}
          </motion.div>
        </AutoHide>
      )}
    </div>
  );
}
