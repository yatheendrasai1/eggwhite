import type { TestId } from "@/lib/models/Attempt";

/** Static guest-mode HTML file → the DB-backed test it corresponds to.
 *  translation-test.html has no DB-backed equivalent yet and is omitted. */
export const GUEST_FILE_TEST_ID: Record<string, TestId> = {
  "english-level-test.html": "english-level",
  "inbox-test.html": "business-english",
  "preposition-party-test.html": "preposition-party",
  "tension-test.html": "tension",
  "tension-test-2.html": "tension-2",
  "articles-test.html": "articles",
  "corporate-confusion-test.html": "corporate-confusion",
  "incorrectly-correct-test.html": "incorrectly-correct",
};

export const GUEST_FILES = Object.keys(GUEST_FILE_TEST_ID);

export function guestRecordKey(file: string): string {
  return "eggwhite:test:" + file;
}

export type GuestRecord = {
  file: string;
  title?: string;
  startedAt?: number;
  completedAt?: number;
  name?: string;
  status?: "in-progress" | "completed";
  answers?: unknown;
};
