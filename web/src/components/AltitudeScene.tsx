"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GssStateDTO } from "@/lib/games/getSomeSpaceState";
import type { AnswerOutcome } from "@/lib/games/getSomeSpace";
import { MILESTONES, SEGMENTS, currentAltitudeKm } from "@/lib/games/getSomeSpace";

type LandmarkRef = { label: string; fraction: number };

type SegmentDecor = {
  className: string;
  landmarks: LandmarkRef[];
  historical: LandmarkRef[];
};

/**
 * Fractions here are flavor, not physics (the game already doesn't track
 * literal km — see the spec) — they place each reference roughly where it
 * would sit within that segment's real-world altitude band.
 */
const SEGMENT_DECOR: Record<1 | 2 | 3, SegmentDecor> = {
  1: {
    className: "gss-band-1",
    landmarks: [
      { label: "Eiffel Tower — 0.3 km", fraction: 0.03 },
      { label: "Mt. Everest — 8.8 km", fraction: 0.46 },
      { label: "Cruising airliner — ~11 km", fraction: 0.58 },
    ],
    historical: [{ label: "Yuri Gagarin's launch, 1961", fraction: 0.85 }],
  },
  2: {
    className: "gss-band-2",
    landmarks: [
      { label: "Ozone layer — ~25 km", fraction: 0.2 },
      { label: "Weather balloons — ~35 km", fraction: 0.5 },
    ],
    historical: [{ label: "Alexei Leonov's spacewalk, 1965", fraction: 0.7 }],
  },
  3: {
    className: "gss-band-3",
    landmarks: [{ label: "Kármán line — 100 km, edge of space", fraction: 1 }],
    historical: [
      { label: "Rakesh Sharma, first Indian in space, 1984", fraction: 0.3 },
      { label: "Mangalyaan reaches Mars orbit, 2014", fraction: 0.65 },
    ],
  },
};

function segmentFraction(state: GssStateDTO): number {
  if (state.segmentIndex > 3) return 1;
  const seg = SEGMENTS[state.segmentIndex as 1 | 2 | 3];
  return Math.max(0, Math.min(1, state.correctInSegment / seg.requiredCorrect));
}

/** Milestones that belong to the CURRENT segment (only segment 3 has one mid-segment: the halfway checkpoint). */
function milestonesInCurrentSegment(segmentIndex: number) {
  if (segmentIndex !== 3) return [];
  return MILESTONES.filter((m) => m.key === "segment-3-half").map((m) => ({
    key: m.key,
    label: m.label,
    fraction: m.correctBaseline / SEGMENTS[3].requiredCorrect,
  }));
}

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

function SegmentBackdrop({ segment }: { segment: 1 | 2 | 3 }) {
  if (segment === 1) {
    return (
      <div className="gss-decor" aria-hidden="true">
        <div className="gss-cloud" style={{ left: "12%", bottom: "62%", width: 90 }} />
        <div className="gss-cloud" style={{ left: "60%", bottom: "74%", width: 130 }} />
        <div className="gss-cloud" style={{ left: "35%", bottom: "50%", width: 70 }} />
        <span className="gss-bird" style={{ left: "20%", bottom: "68%" }}>
          ‹✈›
        </span>
        <span className="gss-bird gss-bird-2" style={{ left: "70%", bottom: "58%" }}>
          ‹✈›
        </span>
        <svg className="gss-mountains" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
          <polygon points="0,100 40,45 80,72 125,25 175,65 225,15 275,60 330,30 400,100" />
        </svg>
      </div>
    );
  }
  if (segment === 2) {
    return (
      <div className="gss-decor" aria-hidden="true">
        <div className="gss-cirrus" style={{ left: "5%", bottom: "30%", width: 160 }} />
        <div className="gss-cirrus" style={{ left: "50%", bottom: "55%", width: 200 }} />
        <div className="gss-cirrus" style={{ left: "25%", bottom: "78%", width: 120 }} />
      </div>
    );
  }
  return (
    <div className="gss-decor" aria-hidden="true">
      <div className="gss-stars" />
      <div className="gss-meteor" style={{ left: "20%", top: "15%" }} />
      <div className="gss-meteor gss-meteor-2" style={{ left: "65%", top: "35%" }} />
    </div>
  );
}

export function AltitudeScene({
  state,
  lastOutcome,
  outcomeSeq,
}: {
  state: GssStateDTO;
  lastOutcome: AnswerOutcome | null;
  outcomeSeq: number;
}) {
  const segment = Math.min(3, Math.max(1, state.segmentIndex)) as 1 | 2 | 3;
  const decor = SEGMENT_DECOR[segment];
  const pct = segmentFraction(state) * 100;
  const reachedKey = lastOutcome?.milestoneReached ?? null;
  const midMilestones = milestonesInCurrentSegment(state.segmentIndex);
  const segmentMeta = SEGMENTS[segment];

  return (
    <div className={`gss-scene-full ${lastOutcome?.gameOver ? "gss-scene-respawn" : ""}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={segment}
          className={`gss-band-full ${decor.className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SegmentBackdrop segment={segment} />

          <span className="gss-band-full-label">{segmentMeta.name}</span>

          {decor.landmarks.map((l) => (
            <div key={l.label} className="gss-landmark" style={{ bottom: `${l.fraction * 100}%` }}>
              <span className="gss-landmark-line" />
              <span className="gss-landmark-label">{l.label}</span>
            </div>
          ))}

          {decor.historical.map((h) => (
            <div key={h.label} className="gss-historical" style={{ bottom: `${h.fraction * 100}%` }}>
              🛰️ {h.label}
            </div>
          ))}

          {midMilestones.map((m) => (
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
            aria-label={`Current altitude: ${currentAltitudeKm(state).toFixed(1)} km`}
          >
            🚀
            <span className="gss-marker-altitude">{currentAltitudeKm(state).toFixed(1)} km</span>
          </motion.div>
        </motion.div>
      </AnimatePresence>

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
