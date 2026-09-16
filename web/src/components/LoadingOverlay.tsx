"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type LoadingContextValue = {
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

// Below this, a request resolves too fast for React to ever commit a paint
// with the overlay visible, so it would otherwise flash in and out unseen.
const SHOW_DELAY_MS = 120;
// Once shown, keep it up at least this long so it isn't a single unreadable frame.
const MIN_VISIBLE_MS = 300;

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const pendingCount = useRef(0);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownAt = useRef<number | null>(null);

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    pendingCount.current += 1;
    if (pendingCount.current === 1 && showTimer.current === null) {
      showTimer.current = setTimeout(() => {
        showTimer.current = null;
        if (pendingCount.current > 0) {
          shownAt.current = Date.now();
          setVisible(true);
        }
      }, SHOW_DELAY_MS);
    }
    try {
      return await fn();
    } finally {
      pendingCount.current -= 1;
      if (pendingCount.current === 0) {
        if (showTimer.current !== null) {
          clearTimeout(showTimer.current);
          showTimer.current = null;
        }
        if (shownAt.current !== null) {
          const elapsed = Date.now() - shownAt.current;
          const remaining = MIN_VISIBLE_MS - elapsed;
          if (remaining > 0) {
            setTimeout(() => {
              if (pendingCount.current === 0) {
                shownAt.current = null;
                setVisible(false);
              }
            }, remaining);
          } else {
            shownAt.current = null;
            setVisible(false);
          }
        }
      }
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ withLoading }}>
      {children}
      {visible && (
        <div className="loading-overlay" role="status" aria-live="polite" aria-label="Loading">
          <span className="spinner loading-overlay-spinner" />
        </div>
      )}
    </LoadingContext.Provider>
  );
}

/** Wraps an async call so the full-page overlay shows for its duration. */
export function useLoading(): LoadingContextValue {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within a LoadingProvider");
  return ctx;
}
