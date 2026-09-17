"use client";

/**
 * Mirrors an attempt's flagged items to localStorage, keyed by attempt id.
 * Lets any client component (e.g. a plain "back to home" link that has no
 * shared React state with the results view) check whether there's anything
 * flagged worth warning about before navigating away, without prop-drilling
 * live flag state through the tree.
 */

type StoredFlag = { itemKey: string; comment: string };

function storageKey(attemptId: string): string {
  return `eggwhite:flags:${attemptId}`;
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
    // works via the server either way, this is just the leave-page warning.
  }
}

export function hasActiveFlags(attemptId: string): boolean {
  try {
    const raw = localStorage.getItem(storageKey(attemptId));
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

export function clearFlagsFromStorage(attemptId: string): void {
  try {
    localStorage.removeItem(storageKey(attemptId));
  } catch {
    // ignore
  }
}
