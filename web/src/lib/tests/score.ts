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
import {
  scoreMcqPair,
  countDoneMcqPair,
  totalMcqPair,
  type McqPairAnswers,
} from "@/lib/tests/mcqPair";
import { MCQ_PAIR_CONFIGS, isMcqPair } from "@/lib/tests/mcqPairConfigs";
import { countDoneTranslation, type TranslationAnswers } from "@/lib/tests/translation";
import { TRANSLATION_CONFIGS, isTranslationTest } from "@/lib/tests/translationConfigs";
import { countDoneJiraComment, type JiraCommentAnswers } from "@/lib/tests/jiraComment";
import { isJiraCommentTest } from "@/lib/tests/jiraCommentConfigs";
import { countDoneGrammarCourt, type GrammarCourtAnswers } from "@/lib/tests/grammarCourt";
import { GRAMMAR_COURT_CONFIGS, isGrammarCourtTest } from "@/lib/tests/grammarCourtConfigs";

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
  if (isMcqPair(testId)) {
    const config = MCQ_PAIR_CONFIGS[testId];
    return {
      done: countDoneMcqPair((answers ?? { picks1: {}, picks2: {} }) as McqPairAnswers),
      total: totalMcqPair(config),
    };
  }
  if (isTranslationTest(testId)) {
    return {
      done: countDoneTranslation((answers ?? { fills: {} }) as TranslationAnswers),
      total: TRANSLATION_CONFIGS[testId].items.length,
    };
  }
  if (isJiraCommentTest(testId)) {
    return {
      done: countDoneJiraComment((answers ?? { response: "" }) as JiraCommentAnswers),
      total: 1,
    };
  }
  if (isGrammarCourtTest(testId)) {
    return {
      done: countDoneGrammarCourt(
        (answers ?? { verdicts: {}, issues: {}, fixes: {} }) as GrammarCourtAnswers
      ),
      total: GRAMMAR_COURT_CONFIGS[testId].items.length,
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

  if (isMcqPair(testId)) {
    const config = MCQ_PAIR_CONFIGS[testId];
    const r = scoreMcqPair(config, (answers ?? { picks1: {}, picks2: {} }) as McqPairAnswers);
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
