"use client";

/**
 * Client-only home for pending (unverified) item flags/comments. Flags never
 * touch the server until "Verify" is clicked — until then they exist only
 * here, so a plain "back to home" link can warn before discarding them
 * without needing to share React state with the results view.
 */

const FLAG_PREFIX = "eggwhite:flags:";
const SESSION_MARKER_KEY = "eggwhite:flags-session";

export type StoredFlag = { itemKey: string; comment: string };

function storageKey(attemptId: string): string {
  return `${FLAG_PREFIX}${attemptId}`;
}

/**
 * Pending flags are only ever meant to survive within the current tab's
 * session — closing the tab or the browser should abandon any that were
 * never verified, not resurrect them on the next visit. localStorage
 * outlives a browser restart but sessionStorage doesn't, so a sessionStorage
 * marker tells us whether this is a fresh session (sweep away every
 * leftover draft, for every test) or just a reload of the same tab (leave
 * them alone).
 */
function sweepStaleFlagsOnNewSession(): void {
  try {
    if (sessionStorage.getItem(SESSION_MARKER_KEY)) return;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(FLAG_PREFIX)) localStorage.removeItem(k);
    }
    sessionStorage.setItem(SESSION_MARKER_KEY, "1");
  } catch {
    // ignore — worst case a stale draft lingers until it's next read/written.
  }
}

if (typeof window !== "undefined") {
  sweepStaleFlagsOnNewSession();
}

export function loadFlagsFromStorage(attemptId: string): StoredFlag[] {
  try {
    const raw = localStorage.getItem(storageKey(attemptId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFlagsToStorage(attemptId: string, flags: StoredFlag[]): void {
  try {
    if (flags.length === 0) {
      localStorage.removeItem(storageKey(attemptId));
      return;
    }
    localStorage.setItem(
      storageKey(attemptId),
      JSON.stringify(flags.map((f) => ({ itemKey: f.itemKey, comment: f.comment })))
    );
  } catch {
    // localStorage can be unavailable (private mode, quota) — flagging still
    // works for the session, this is just the persistence/leave-page warning.
  }
}

export function hasActiveFlags(attemptId: string): boolean {
  return loadFlagsFromStorage(attemptId).length > 0;
}

export function clearFlagsFromStorage(attemptId: string): void {
  try {
    localStorage.removeItem(storageKey(attemptId));
  } catch {
    // ignore
  }
}
