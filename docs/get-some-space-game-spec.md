# Get Some Space! — Game Spec

A 2D trivia-driven ascent game. Every correctly answered question is a **jump**
that pushes the player higher through Earth's atmosphere, from the ground
toward the edge of space and beyond. This document is the design spec for the
current scope (Segments 1–3). Implementation has not started yet — this file
is the source of truth to build against.

## 1. Concept

- The player climbs through real atmospheric layers by answering trivia
  questions correctly.
- The game does **not** track literal kilometers traveled. Altitude is a
  narrative/visual skin — each segment (level) is simply harder than the one
  before it, gated by a required number of correct answers, not real physics.
- The long-term vision is an endless climb with an eventual upper limit of
  **200 jumps**, continuing past low Earth orbit into deeper space (Moon,
  Mars, Sun/Lagrange point milestones, per ISRO history — see §7). This spec
  only covers **Segments 1–3**; later segments will be appended as separate
  additions to this doc without changing what's already shipped.

## 2. Core loop

1. A question is shown to the player with a 20-second timer.
2. The timer starts only once the player clicks **"Next Question"** — it does
   not start automatically on question load.
3. **Correct answer** → points awarded (rate depends on the segment, see §4)
   and the player's correct-answer count for the current level increments.
4. **Wrong answer or timeout (no answer)** → no score change, but costs
   **1 life** from the shared life pool (see §5). The question does not
   repeat automatically; the next question is served normally.
5. **Reload/page-close-and-reopen mid-question**: the in-progress timer is
   discarded. On return, the **same question** is re-shown (not a new one),
   and the player must click "Next Question" again to restart the 20s clock.
   This has **no penalty** — no life lost, no score change. This is a known
   exploit for the current UI-only timer (a player can dodge any question by
   reloading before time runs out) and is explicitly deferred to a future
   version, once the timer becomes server-authoritative.
6. A level is cleared once the player has accumulated the required number of
   correct answers for that level (see §4) — there is no separate per-level
   wrong-answer cap; the shared life pool is the only failure gate.

## 3. Segments (current scope)

Each segment = one level. Difficulty increases per segment; it is not tied to
real altitude math, only to real-world landmark theming.

| Segment | Theme (flavor) | Questions | Points/correct | Milestones |
|---|---|---|---|---|
| 1 | Troposphere → Armstrong limit | Q1–Q6 (6 questions) | 5 | After Q6 |
| 2 | Stratosphere → Mesosphere boundary | Q7–Q14 (8 questions) | 10 | After Q14 |
| 3 | Mesosphere → Kármán line (edge of space) | Q15–Q24 (10 questions) | 20 | Halfway (Q19), completion (Q24) |

Segment 4 (ISS/LEO altitude range) and beyond are intentionally **out of
scope** for this build; the architecture should not preclude appending more
segments later.

## 4. Scoring

- Points are awarded only for correct answers, at the per-segment rate above.
- Wrong/unanswered questions never reduce score.
- **Perfect-level bonus**: clearing a level with **zero wrong answers**
  awards **+10 bonus points**, tracked in a **separate bonus quota** (not
  merged into the main score). This quota is reserved for a future feature
  (see §8) and has no gameplay effect yet.
- There are currently no other score-related constraints or gates — score is
  purely for leaderboard display and the future bonus/retest feature.

## 5. Lives

- Each session starts with **5 lives**, shared across all levels in that
  session — the pool does **not** reset when a level is cleared.
- Every wrong or unanswered question costs exactly 1 life.
- **Life pool reaches 0** → the run ends immediately (game over). A cooldown
  period begins (see §6). Once the cooldown elapses, the player resumes at
  their **latest recorded milestone** with the life pool refilled to 5.
- **Reward**: clearing a level while having lost **at least 1 life** during
  it grants **+1 life** back, up to the max of 5 (no overflow above 5 — a
  reward earned while already at 5 lives is simply not applied).
- There is no per-level wrong-answer counter — the shared life pool fully
  replaces that mechanic.

## 6. Sessions & cooldowns

- A player gets **4 sessions per day**, resetting at **midnight**.
- A "session" is one continuous life-cycle: it begins fresh with 5 lives and
  ends when the life pool hits 0 (game over/cooldown) or the player stops
  playing.
- Gaps required **between** sessions:
  - Session 1 → Session 2: no gap required (back-to-back allowed).
  - Session 2 → Session 3: at least **1 hour** must pass.
  - Session 3 → Session 4: no gap required (back-to-back allowed).
- Once all 4 sessions for the day are used, the player must wait until
  **midnight** — there is no way to earn an extra attempt that day.

## 7. Progress persistence

- Milestone/level-clear progress is **permanent** per player account — it is
  not reset by the midnight session-count reset, and a cleared level never
  needs to be re-cleared to continue progressing.
- On respawn (after a cooldown), the player resumes exactly at their latest
  recorded milestone, not from the start of the game.
- A future **"retest"** feature will let players replay already-cleared
  levels to earn additional score. No such scoring constraints exist yet —
  for now, only progress (which milestone has been reached) is stored.

## 8. Real-world theming reference (flavor/lore, non-functional)

Used for question theming and milestone framing, not for altitude math:

- **Armstrong limit (~19 km)** — unprotected human blood boils at body
  temperature above this altitude.
- **Ozone layer / stratosphere (~20–50 km)**.
- **Kármán line (100 km)** — internationally recognized edge of space.
- **ISS altitude (~400 km)** — reserved for future Segment 4.
- Indian milestones worth weaving into questions/lore: Aryabhata (1975),
  Rohini RS-1 (1980), Rakesh Sharma aboard Soyuz T-11 (1984), INSAT/GSAT
  geostationary programs, Gaganyaan (India's crewed program), Chandrayaan-1/3,
  Mars Orbiter Mission (Mangalyaan), Aditya-L1.

## 9. UI requirements

### 9.1 Altitude visualization (required)

The player's progress must be represented visually as **ascending
altitude**, not just as a numeric score or question counter. Requirements:

- A persistent **vertical altitude gauge/meter** (e.g., a rising marker
  against a fixed backdrop depicting ground → sky → upper atmosphere → edge
  of space) that reflects the player's current position within the overall
  climb (segment + progress within segment).
- The gauge should visually differentiate the three current segments (e.g.,
  distinct background bands/colors per segment: troposphere, stratosphere/
  mesosphere, edge-of-space), reinforcing the "each level is a layer" theme
  from §3, even though the underlying progression is question-count-based,
  not literal-km-based.
- Milestone markers (§3) should be visibly marked on the gauge, and reaching
  one should trigger a distinct visual acknowledgment (e.g., a marker
  lighting up or a brief animation) — this is the moment progress is
  registered for respawn purposes (§7), so it should read as a clear "save
  point" to the player.
- On respawn, the gauge should visibly reset/animate back down to the last
  registered milestone rather than jumping silently, to communicate the
  setback clearly.
- Lives (§5) and the current session's countdown/timer (§2) should be shown
  alongside the altitude gauge as persistent HUD elements.
- Exact visual style (illustration vs. abstract meter, animation approach,
  color palette) is left to implementation/design — this section only fixes
  the functional requirement that altitude progress must be shown visually,
  segmented by level, with milestone markers.

## 10. Explicitly out of scope for this build

- Segment 4 and beyond.
- The future retest/replay-for-more-score feature.
- Any use of the perfect-level bonus quota beyond storing it.
- Server-authoritative timer enforcement (current timer is UI-only and
  reload-exploitable by design, for now).
