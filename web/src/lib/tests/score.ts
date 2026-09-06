import type { TestId } from "@/lib/models/Attempt";
import {
  scoreEnglishLevel,
  countDone as elCountDone,
  TOTAL_QUESTIONS as EL_TOTAL,
  type ELAnswers,
} from "@/lib/tests/englishLevel";
import {
  scoreBusinessEnglish,
  countDone as beCountDone,
  VOCAB_TOTAL as BE_TOTAL,
  type BEAnswers,
} from "@/lib/tests/businessEnglish";
import {
  scoreDrill,
  countDoneDrill,
  DRILL_TOTAL,
  type DrillAnswers,
} from "@/lib/tests/drill";
import { DRILL_CONFIGS } from "@/lib/tests/drillConfigs";

export type AttemptSummary = {
  line: string;
  pct: number;
  level: string;
  parts: Record<string, number>;
};

export function computeProgress(
  testId: TestId,
  answers: unknown
): { done: number; total: number } {
  if (testId === "english-level") {
    return { done: elCountDone((answers ?? {}) as ELAnswers), total: EL_TOTAL };
  }
  if (testId === "business-english") {
    return {
      done: beCountDone((answers ?? { flagged: {}, picks: {} }) as BEAnswers),
      total: BE_TOTAL,
    };
  }
  return {
    done: countDoneDrill((answers ?? { fills: {}, picks: {} }) as DrillAnswers),
    total: DRILL_TOTAL,
  };
}

export function computeSummary(testId: TestId, answers: unknown): AttemptSummary {
  if (testId === "english-level") {
    const r = scoreEnglishLevel((answers ?? {}) as ELAnswers);
    return {
      line: r.summaryLine,
      pct: Math.round(r.pct),
      level: r.band.code,
      parts: { vocabulary: r.vs, grammar: r.gs, total: r.total },
    };
  }
  if (testId === "business-english") {
    const r = scoreBusinessEnglish((answers ?? { flagged: {}, picks: {} }) as BEAnswers);
    return {
      line: r.summaryLine,
      pct: Math.round(r.overall),
      level: r.band.code,
      parts: {
        editing: Math.round(r.mailPct),
        vocabulary: Math.round(r.vPct),
        spotted: r.found,
        falseFlags: r.falseFlags,
      },
    };
  }

  const config = DRILL_CONFIGS[testId];
  const r = scoreDrill(config, (answers ?? { fills: {}, picks: {} }) as DrillAnswers);
  return {
    line: r.summaryLine,
    pct: Math.round(r.pct),
    level: r.band.code,
    parts: {
      total: r.total,
      [r.tiles[0].label]: r.tiles[0].score,
      [r.tiles[1].label]: r.tiles[1].score,
    },
  };
}
