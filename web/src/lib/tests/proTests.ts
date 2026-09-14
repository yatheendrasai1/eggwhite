import type { TestId } from "@/lib/models/Attempt";

/** Test ids that require LLM validation/scoring and are gated behind pro access. */
export const PRO_TEST_IDS: Set<TestId> = new Set(["translation-drama-v1"]);

export function isProTest(id: TestId): boolean {
  return PRO_TEST_IDS.has(id);
}
