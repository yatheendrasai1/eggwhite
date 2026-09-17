import type { RightOrWrongConfig } from "@/lib/tests/rightOrWrong";
import { RIGHT_OR_WRONG } from "@/lib/tests/rightOrWrongContent";

export const RIGHT_OR_WRONG_CONFIGS: Record<string, RightOrWrongConfig> = {
  "right-or-wrong": RIGHT_OR_WRONG,
};

export const isRightOrWrongTest = (id: string): boolean => id in RIGHT_OR_WRONG_CONFIGS;
