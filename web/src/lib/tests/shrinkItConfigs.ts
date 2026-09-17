import type { ShrinkItConfig } from "@/lib/tests/shrinkIt";
import { SHRINK_IT } from "@/lib/tests/shrinkItContent";

export const SHRINK_IT_CONFIGS: Record<string, ShrinkItConfig> = {
  "shrink-it": SHRINK_IT,
};

export const isShrinkItTest = (id: string): boolean => id in SHRINK_IT_CONFIGS;
