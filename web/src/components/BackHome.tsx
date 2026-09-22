"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { hasActiveFlags, clearFlagsFromStorage } from "@/lib/client/flagStorage";
import { useConfirm } from "@/components/ConfirmDialog";

/**
 * Consistent top-left "back to home" link, used at the top of every page.
 * When `attemptId` is given and that attempt still has flagged items
 * (see flagStorage.ts), confirms before leaving since the flags/comments
 * are discarded rather than carried anywhere.
 */
export function BackHome({ attemptId }: { attemptId?: string }) {
  const router = useRouter();
  const confirm = useConfirm();

  async function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (!attemptId || !hasActiveFlags(attemptId)) return;
    e.preventDefault();
    if (
      !(await confirm("If you go back, the flagged comments will be discarded.", {
        title: "Discard flagged comments?",
        confirmLabel: "Go back",
      }))
    )
      return;
    clearFlagsFromStorage(attemptId);
    router.push("/");
  }

  return (
    <Link href="/" className="back-home-btn" aria-label="Back to home page" onClick={handleClick}>
      ←
    </Link>
  );
}
