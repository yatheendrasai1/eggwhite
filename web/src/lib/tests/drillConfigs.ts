import type { DrillConfig } from "@/lib/tests/drill";
import { PREPOSITION_PARTY } from "@/lib/tests/prepositionParty";
import { TENSION } from "@/lib/tests/tension";
import { TENSION_2 } from "@/lib/tests/tension2";

export const DRILL_CONFIGS: Record<string, DrillConfig> = {
  "preposition-party": PREPOSITION_PARTY,
  tension: TENSION,
  "tension-2": TENSION_2,
};

export const isDrill = (id: string): boolean => id in DRILL_CONFIGS;
