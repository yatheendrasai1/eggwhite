"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

type ConfirmOptions = {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type PendingConfirm = ConfirmOptions & {
  message: string;
};

type ConfirmContextValue = {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  useBodyScrollLock(pending !== null);

  const confirm = useCallback((message: string, options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setPending({ message, ...options });
    });
  }, []);

  function settle(ok: boolean) {
    resolver.current?.(ok);
    resolver.current = null;
    setPending(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {pending && (
        <div className="modal-overlay" onClick={() => settle(false)}>
          <div
            className="modal-card confirm-card"
            role="alertdialog"
            aria-modal="true"
            aria-label={pending.title ?? "Confirm"}
            onClick={(e) => e.stopPropagation()}
          >
            {pending.title ? <h3 className="confirm-title">{pending.title}</h3> : null}
            <p className="confirm-message">{pending.message}</p>
            <div className="confirm-actions">
              <button type="button" className="btn btn-ghost confirm-btn" onClick={() => settle(false)}>
                {pending.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                className={`btn confirm-btn${pending.danger ? " confirm-btn-danger" : ""}`}
                onClick={() => settle(true)}
                autoFocus
              >
                {pending.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

/** Promise-based replacement for window.confirm(), themed to match the app. */
export function useConfirm(): ConfirmContextValue["confirm"] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx.confirm;
}
