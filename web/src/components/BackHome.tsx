"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { hasActiveFlags, clearFlagsFromStorage } from "@/lib/client/flagStorage";

/**
 * Consistent top-left "back to home" link, used at the top of every page.
 * When `attemptId` is given and that attempt still has flagged items
 * (see flagStorage.ts), confirms before leaving since the flags/comments
 * are discarded rather than carried anywhere.
 */
export function BackHome({ attemptId }: { attemptId?: string }) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (!attemptId || !hasActiveFlags(attemptId)) return;
    if (!confirm("If you go back, the flagged comments will be discarded.")) {
      e.preventDefault();
      return;
    }
    clearFlagsFromStorage(attemptId);
  }

  return (
    <Link href="/" className="back-home-btn" aria-label="Back to home page" onClick={handleClick}>
      ←
    </Link>
  );
}
