import type { McqPairConfig } from "@/lib/tests/mcqPair";
import { ARTICLES } from "@/lib/tests/articles";
import { CORPORATE_CONFUSION } from "@/lib/tests/corporateConfusion";
import { INCORRECTLY_CORRECT } from "@/lib/tests/incorrectlyCorrect";

export const MCQ_PAIR_CONFIGS: Record<string, McqPairConfig> = {
  articles: ARTICLES,
  "corporate-confusion": CORPORATE_CONFUSION,
  "incorrectly-correct": INCORRECTLY_CORRECT,
};

export const isMcqPair = (id: string): boolean => id in MCQ_PAIR_CONFIGS;
