"use client";

import { useEffect } from "react";

/** Locks page scroll while `active` is true, so scrolling inside a modal/drawer
 *  doesn't also scroll the page behind it. Locks both <html> and <body> since
 *  the browser's actual scrolling box is <html> here (body has no fixed
 *  height), so body-only would leave the page free to scroll under the
 *  overlay. Restores each element's previous overflow on cleanup, so nested
 *  lockers (e.g. a confirm dialog over a modal) don't clobber each other. */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    const body = document.body;
    const previousHtml = html.style.overflow;
    const previousBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtml;
      body.style.overflow = previousBody;
    };
  }, [active]);
}
