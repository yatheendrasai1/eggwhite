/**
 * Word-of-the-day vocabulary bank for the landing page card. Target is 200
 * entries; being built up in reviewed batches — see conversation history
 * for the calibration rounds. Keep entries workplace-relevant, moderate
 * difficulty (similar register to the Shrink It! test's vocabulary), and
 * avoid duplicating words already used as test content elsewhere.
 */
export type WordEntry = {
  word: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
};

export const WORDS: WordEntry[] = [
  {
    word: "Pragmatic",
    partOfSpeech: "adjective",
    meaning: "Dealing with things sensibly and realistically, based on what actually works rather than on theory or ideals.",
    example: "Rather than debating the perfect solution for hours, the team took a pragmatic approach and shipped a fix that worked.",
  },
  {
    word: "Candid",
    partOfSpeech: "adjective",
    meaning: "Truthful and straightforward, even when the truth might be uncomfortable to hear.",
    example: "In her candid feedback, the manager admitted the launch timeline had been too optimistic.",
  },
  {
    word: "Diligent",
    partOfSpeech: "adjective",
    meaning: "Showing careful and persistent effort in one's work or duties.",
    example: "His diligent tracking of every bug meant nothing slipped through before release.",
  },
  {
    word: "Versatile",
    partOfSpeech: "adjective",
    meaning: "Able to adapt to many different functions, roles, or situations.",
    example: "The new hire turned out to be versatile, moving easily between design work and customer calls.",
  },
  {
    word: "Conundrum",
    partOfSpeech: "noun",
    meaning: "A confusing and difficult problem or question with no easy answer.",
    example: "Choosing between the two vendors was a conundrum, since each one solved a different half of the problem.",
  },
];

/**
 * Deterministic day-of-year rotation so every visitor sees the same word on
 * a given day, cycling back to the start once the bank is exhausted.
 */
export function wordOfTheDay(date: Date = new Date()): WordEntry {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const startOfDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((startOfDay - startOfYear) / 86_400_000);
  return WORDS[dayOfYear % WORDS.length];
}
