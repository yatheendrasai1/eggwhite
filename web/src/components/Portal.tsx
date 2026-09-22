"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children directly under document.body, outside whatever DOM
 * position this component was mounted at. Without this, a fixed-position
 * overlay nested inside an ancestor that has backdrop-filter/filter/
 * transform/perspective gets trapped inside that ancestor's box instead of
 * covering the viewport, per the CSS containing-block rules for those
 * properties (this bit us for real: the navbar's glass backdrop-filter
 * squeezed every popup nested inside <nav> into the navbar's own height).
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Standard SSR-safe portal pattern: document doesn't exist on the server,
    // so we can only portal after mounting on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
