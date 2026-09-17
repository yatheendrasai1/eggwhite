import type { GrammarCourtConfig } from "@/lib/tests/grammarCourt";
import { GRAMMAR_COURT } from "@/lib/tests/grammarCourtContent";

export const GRAMMAR_COURT_CONFIGS: Record<string, GrammarCourtConfig> = {
  "grammar-court": GRAMMAR_COURT,
};

export const isGrammarCourtTest = (id: string): boolean => id in GRAMMAR_COURT_CONFIGS;
