import type { TranslationConfig } from "@/lib/tests/translation";
import { TRANSLATION_DRAMA_V1 } from "@/lib/tests/translationDrama";

export const TRANSLATION_CONFIGS: Record<string, TranslationConfig> = {
  "translation-drama-v1": TRANSLATION_DRAMA_V1,
};

export const isTranslationTest = (id: string): boolean => id in TRANSLATION_CONFIGS;
