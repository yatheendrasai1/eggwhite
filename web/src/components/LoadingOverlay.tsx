"use client";

import { createContext, useCallback, useContext, useState } from "react";

type LoadingContextValue = {
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setCount((c) => c + 1);
    try {
      return await fn();
    } finally {
      setCount((c) => c - 1);
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ withLoading }}>
      {children}
      {count > 0 && (
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
