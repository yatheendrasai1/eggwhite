const FUN_FACTS = [
  "Taking a practice test helps you remember material better than simply re-reading it — it's called the testing effect.",
  "The word 'quiz' is rumored to come from a Dublin theatre owner who bet he could invent a nonsense word and make it famous overnight.",
  "Multiple-choice testing was popularized in 1914 by psychologist Frederick J. Kelly, who wanted a faster way to grade exams.",
  "Handwriting answers, rather than typing them, has been shown to improve recall in several memory studies.",
  "Spaced-out practice — testing yourself over several days — beats a single cram session for long-term retention.",
];

export function randomFunFact(): string {
  return FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
}
