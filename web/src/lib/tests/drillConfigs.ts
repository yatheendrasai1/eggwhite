import type { DrillConfig } from "@/lib/tests/drill";
import { PREPOSITION_PARTY } from "@/lib/tests/prepositionParty";
import { TENSION } from "@/lib/tests/tension";

export const DRILL_CONFIGS: Record<string, DrillConfig> = {
  "preposition-party": PREPOSITION_PARTY,
  tension: TENSION,
};

export const isDrill = (id: string): boolean => id in DRILL_CONFIGS;
