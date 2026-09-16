// One-off/idempotent seed: upserts LLM grading prompt templates into the
// `prompts` collection (src/lib/models/Prompt.ts). Re-run after editing a
// template below to push the new wording live without a deploy.
// Usage: npx tsx --env-file=.env.local scripts/seed-prompts.mts
import { connectDB } from "../src/lib/db";
import { PromptModel } from "../src/lib/models/Prompt";

const PROMPTS: { key: string; template: string }[] = [
  {
    key: "translation-drama-v1-eval",
    template: `You are grading a spoken-English translation exercise for an Indian professional learning English as a second language. The focus of this exercise is producing the correct English tense and sentence structure, not written mechanics.

Each item gives a short sentence in its native language or script (Telugu, Telugu written in Latin letters — "Tinglish", or Hindi written in Latin letters — "Hinglish"), a reference English translation showing the intended meaning and tense, and the candidate's own attempt to translate it into English.

Judge the candidate's answer against the MEANING and TENSE of the source, using the reference translation as your guide — do not penalize wording that differs from the reference as long as the meaning and tense are preserved and the English is natural. This is meant to be judged the way spoken English would be: ignore punctuation, capitalization, and other purely written-mechanics issues entirely — never dock points for a missing period, wrong comma, missing question mark, or lowercase "i", etc.

Several items specifically test whether the candidate lands on the right tense or structure — for example: present perfect ("I have just had my meal", not "I ate my meal now"), present perfect continuous ("I have been living here since 2015" / "I have been reading this book for an hour"), past perfect ("the train had already left"), simple future vs. "going to" future, first conditionals ("if it rains, I will..."), and cause/concession structures ("...that's why...", "even though..."). If the candidate's translation captures the general idea but picks the wrong tense or structure for these, treat that as a notable error.

Score each item:
2 = fully correct — captures the meaning accurately with the correct tense/structure in natural English (punctuation and capitalization never affect this score).
1 = partially correct — captures some but not all of the meaning, or gets the general idea right but uses the wrong tense/structure.
0 = incorrect — misses the meaning entirely, or was left blank.

"feedback" must be one short sentence (under 20 words) explaining the score, addressed to the candidate ("You..."), in plain encouraging language. Never mention punctuation or capitalization in the feedback.`,
  },
  {
    key: "framing-the-situation-eval",
    template: `You are evaluating a test taker's written English response to a workplace writing test. The test taker was given a background story and a task, and asked to write a Jira comment. Your job is to score the response on **tense usage, sentence framing, prepositions/word usage, clarity, and task coverage** — NOT on how "good" the business decision is, how polite it sounds, or which writing style/tone they chose.

## Context given to the test taker

**Story:** The test taker is a Senior Software Engineer on the Payments team. Product Manager Venkat committed a recurring UPI payments feature (PAY-482) to a client, with deployment scheduled for tomorrow. QA Tester Sneha logged an intermittent bug last night. While debugging with Arjun, the test taker found that the payment gateway has a hard limit of ₹10,000 on recurring mandates — never part of the original acceptance criteria. They added a banner warning and pushed the fix with test scenarios; Sneha validated it but flagged it as a deviation from signed-off acceptance criteria. The client wants this in tomorrow's release, but the test taker is unsure how often users would need mandates above ₹10,000.

**Task given:** Write a Jira comment (180–220 words) to Venkat that:
1. Explains the ₹10,000 limit and why it was added
2. Acknowledges Sneha's concern
3. Asks Venkat how likely users are to need higher amounts
4. Suggests splitting larger amounts into ₹10,000 blocks as a possible alternative — but notes it needs significant extra effort and can't be ready by tomorrow

## How to score

Score each category independently using the rubric below. Do not let a low score in one category pull down another unless it genuinely causes a comprehension problem in that other category (e.g., a tense error that also breaks clarity can be penalized in both, but a wordy sentence should not cost tense points).

### 1. Tense Usage — 30 pts
Check whether past, present perfect, and future/modal forms are used to correctly signal *when* things happened relative to now (today, the day the comment is written):
- Past simple for completed one-time events (the bug was found, the limit was discovered)
- Present perfect for actions with present relevance / status (has validated, have added)
- Future/modal for asks, plans, and hypotheticals (will need, could split, would require)

Judge by **whether the timeline is understandable**, not by matching one "correct" sentence. A test taker may correctly convey the same timeline using different tense choices than you'd expect — accept any construction that doesn't confuse sequence or completion status.

- 25–30: Timeline is clear throughout; shifts between past/present perfect/future are handled correctly or with at most one minor slip that doesn't obscure meaning.
- 15–24: Generally clear, but 2–4 errors that a careful reader would notice, without losing the overall timeline.
- 5–14: Frequent tense errors that make it genuinely hard to tell what's done vs. pending vs. proposed.
- 0–4: Tense appears near-random; timeline cannot be reconstructed from the text.

### 2. Sentence Framing / Structure — 25 pts
Assess whether ideas are organized logically and each sentence is a complete, well-formed unit — regardless of paragraph vs. bullet style, formal vs. casual tone, or short vs. long sentences.
- 20–25: Logical progression (issue → cause → action → ask), no fragments/run-ons, ideas connect smoothly.
- 12–19: Mostly clear; one or two sentences are overloaded, awkward, or slightly out of order.
- 5–11: Ideas are disjointed or oddly sequenced; reader must re-read to reconstruct the logic.
- 0–4: No discernible structure; sentences don't connect into a coherent whole.

### 3. Prepositions & Word Usage — 20 pts
Check for correct, natural prepositions and word choice in context (e.g., "a limit **on** the amount," "a deviation **from** the criteria," "flagged **as** a blocker," "reach out **to** Venkat," "by tomorrow," "beyond ₹10,000"). Also flag wrong word forms (e.g., "informations," "the develop of this").
- 16–20: Natural and accurate throughout; maybe one minor slip.
- 10–15: A handful of errors, meaning still fully clear.
- 4–9: Frequent errors; meaning is sometimes ambiguous or requires guessing intent.
- 0–3: Pervasive misuse; reads as broken or translated.

### 4. Clarity & Understandability — 15 pts
Imagine Venkat (a non-technical PM) reading this cold. Can he understand the situation and what's being asked of him in one read?
- 12–15: Fully clear in one read.
- 7–11: Understandable but needs a second pass on a part or two.
- 3–6: Meaning has to be pieced together with effort.
- 0–2: Confusing or ambiguous; the ask is unclear.

### 5. Task Coverage — 10 pts
Check off the four required content points (regardless of order or phrasing):
- [ ] Explains the ₹10,000 limit and why the banner/fix was added
- [ ] Acknowledges Sneha's concern about deviation from acceptance criteria
- [ ] Asks Venkat about the likelihood/need for mandates above ₹10,000
- [ ] Mentions the block-splitting alternative AND notes the extra effort / can't be done by tomorrow

Score: 8–10 (all 4), 5–7 (any 3), 2–4 (any 1–2), 0–1 (none).

## What to explicitly ignore
- Punctuation, capitalization, and spelling errors — UNLESS a word is unrecognizable or changes the meaning (e.g., "loose" instead of "lose").
- Formatting style (bullets vs. paragraph, greeting/sign-off or not).
- Tone/politeness/persuasiveness — this is not being scored, only the language mechanics and coverage.
- Length, as long as it's a good-faith attempt — don't penalize for being under/over 180–220 words unless brevity causes missing content (which is already captured under Task Coverage) or excessive length causes structural/clarity issues (already captured under those categories).

## Edge cases
- **Very short but covers everything**: Score tense/framing/prepositions/clarity on what's present; do not penalize brevity itself. Task coverage can still score full marks if all 4 points are genuinely present, even briefly.
- **Long and repetitive**: Penalize under Structure if repetition disrupts flow or Clarity if it forces re-reading; do not double-penalize the same repetition in both unless it independently hurts each.
- **Informal tone / casual phrasing** (e.g., "Hey Venkat, quick update"): Do not penalize — informality is not a language error.
- **Answers out of order** (e.g., asks the question before explaining the limit): Only penalize under Structure if it genuinely hurts logical flow for a first-time reader; do not penalize Task Coverage for order.
- **Mixed language influence** (e.g., translated-sounding phrasing, non-native constructions): Score under the relevant category (usually Prepositions/Word Usage or Framing) rather than marking down separately as a language-background penalty.
- **Missing recipient/greeting or sign-off**: Not required by the task; do not penalize.`,
  },
];

await connectDB();
for (const p of PROMPTS) {
  await PromptModel.findOneAndUpdate(
    { key: p.key },
    { $set: { template: p.template } },
    { upsert: true }
  );
  console.log(`Seeded prompt "${p.key}".`);
}
process.exit(0);
