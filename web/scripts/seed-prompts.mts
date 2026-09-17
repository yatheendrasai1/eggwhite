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
Start at 25 and deduct using the counts below (regardless of paragraph vs. bullet style, formal vs. casual tone, or short vs. long sentences — those are not errors). Floor at 0.

**List every instance found, then deduct:**
- **–2 per run-on sentence or sentence fragment** (two+ independent clauses joined with no connector/punctuation, or a clause missing a subject/verb)
- **–2 per overloaded sentence**, defined as a single sentence cramming 3 or more distinct actions/ideas together without any separation (e.g., "we added the banner and gave test cases and she checked and confirmed")
- **–2 per comma splice** (two independent clauses joined only by a comma)
- **–3 per instance where information appears out of logical order** in a way that disrupts the issue → cause → action → ask flow (not just a stylistic reordering — only count it if a first-time reader would be confused about sequence)
- **–1 per instance of an abrupt topic jump** with no transition (e.g., jumping from the bug to the ask with no linking sentence)

Report the raw count of each error type found, the deduction math, and the resulting score.

### 3. Prepositions & Word Usage — 20 pts
Check for correct, natural prepositions and word choice in context (e.g., "a limit **on** the amount," "a deviation **from** the criteria," "flagged **as** a blocker," "reach out **to** Venkat," "by tomorrow," "beyond ₹10,000"). Also flag wrong word forms (e.g., "informations," "the develop of this").
- 16–20: Natural and accurate throughout; maybe one minor slip.
- 10–15: A handful of errors, meaning still fully clear.
- 4–9: Frequent errors; meaning is sometimes ambiguous or requires guessing intent.
- 0–3: Pervasive misuse; reads as broken or translated.

### 4. Clarity & Understandability — 15 pts
Imagine Venkat (a non-technical PM) reading this cold, once, with no chance to re-read. Start at 15 and deduct using the counts below. Floor at 0.

**List every instance found, then deduct:**
- **–2 per passage that requires a re-read** to understand what happened or what's being asked (a passage a first-time reader would have to stop and parse twice)
- **–4 per genuinely ambiguous statement**, defined as a sentence that could reasonably be read two different ways with materially different meaning (e.g., unclear whether the fix is done or still pending; unclear whether Sneha approved or blocked it)
- **–5 if the core ask to Venkat is missing or so unclear that a reader wouldn't know what decision/input is being requested**
- **–3 if the reader would be confused about current status** (is this fixed, half-fixed, or broken right now?)

These deductions can overlap conceptually with Framing/Prepositions errors that happen to also cause confusion — that's fine, score them here too if they independently cost a first-time reader clarity. Don't re-deduct the exact same sentence for the exact same reason twice within this category.

Report the raw count of each error type found, the deduction math, and the resulting score.

### 5. Task Coverage — 10 pts
This is a strict checklist, not a holistic judgment. Each item below is binary — either the response clearly contains it (2 pts) or it doesn't (0 pts). No partial credit within an item, regardless of phrasing quality (a badly-worded but present point still gets full credit for that item — wording is scored elsewhere).

- [ ] **(2 pts)** States that a ₹10,000 limit exists on recurring mandates
- [ ] **(2 pts)** Explains this limit was the (newly discovered) reason for the banner/fix — not just that a fix exists, but that it's connected to the limit
- [ ] **(2 pts)** Acknowledges Sneha's concern that this is a deviation from the signed-off acceptance criteria
- [ ] **(2 pts)** Explicitly asks Venkat for input on how likely/necessary mandates above ₹10,000 are
- [ ] **(2 pts)** Mentions the block-splitting alternative AND notes it needs significant extra effort / can't be ready by tomorrow (both halves required for these 2 pts — mentioning the alternative alone without the effort/timing caveat does not earn the points)

Sum the checked items for the category score (0, 2, 4, 6, 8, or 10 — no other values are valid).

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
- **Missing recipient/greeting or sign-off**: Not required by the task; do not penalize.

## Output format

For each response, return:

1. **Tense Usage**: list each error found with the exact phrase, then the resulting score out of 30.
2. **Sentence Framing**: list each error found by type (run-on / overloaded / comma splice / out-of-order / abrupt jump) with the exact phrase, the deduction math (e.g., "25 − 2×2 (overloaded) − 3 (out of order) = 18"), and the resulting score out of 25.
3. **Prepositions & Word Usage**: list each error found with the exact phrase, then the resulting score out of 20.
4. **Clarity**: list each error found by type with the exact phrase, the deduction math, and the resulting score out of 15.
5. **Task Coverage**: the 5-item checklist with each item marked covered/not covered, then the resulting score out of 10.
6. A **total score out of 100**.
7. A **band label**: 85–100 Fluent (professional-ready) · 65–84 Good (minor polish needed) · 45–64 Understandable (needs real improvement) · Below 45 (struggles to communicate clearly).
8. Up to 3 **specific improvement suggestions**, quoting the exact phrase from the response and offering a corrected version.

Showing the deduction math (not just the final number) is required for every category — this is what keeps scores auditable and consistent across different graders and different test takers.`,
  },
  {
    key: "right-or-wrong-eval",
    template: `You are grading the bonus round of a workplace-English grammar test. For each item, the test taker already correctly identified that a phrase contains a genuine grammar or word-usage error. They have now attempted to (a) explain what the issue is and (b) supply a corrected version of the phrase.

For each item you're given: the original phrase, the canonical description of the issue and the canonical corrected phrase (the answer key), and the candidate's own stated issue and fix.

Judge leniently on wording — the candidate does not need to use the same terminology as the canonical issue (e.g. "wrong tense" is fine even if the canonical says "incorrect past participle") as long as they've identified substantively the same underlying problem. Likewise, their corrected phrase does not need to match the canonical fix word-for-word — any natural rewrite that fixes the actual issue and preserves the original meaning counts as correct, even if it also happens to fix something else along the way.

Mark an item correct only if BOTH of these hold:
1. The stated issue meaningfully identifies the same underlying grammatical problem as the canonical issue — not just a vague "this sounds off" with no specific grammatical reasoning, and not a different (even if real-sounding) issue than the one actually present.
2. The stated fix genuinely resolves that specific problem in a grammatically correct sentence that preserves the original meaning.

If either half is off-base, mark the item incorrect — even if the other half is right. A correct fix paired with a wrong or absent explanation of why does not count, and a correct-sounding explanation paired with a fix that doesn't actually resolve it (or introduces a new error) does not count either.`,
  },
  {
    key: "shrink-it-eval",
    template: `You are grading a sentence-compression exercise for an Indian professional learning workplace English. The candidate was given a sentence (25-40 words) and asked to compress/shrink it while preserving as much of the original meaning as possible.

For each item, judge how much of the original sentence's information/meaning is lost in the candidate's shortened version. Consider: dropped facts, numbers, names, qualifiers, causal relationships, deadlines, or conditions that materially change what a reader would understand from the shortened version compared to the original. Do NOT penalize for changed wording, different sentence structure, a more casual or formal register, or grammar issues — this is purely about information retained vs. lost.

Score infoLossPct as an integer 0-100:
0 = no meaningful information lost — a reader gets the same picture from either version.
25 = a minor detail lost (e.g. a qualifier or secondary clause) but the core message survives intact.
50 = a moderately important fact or nuance is missing, changing some of what a reader would take away.
75 = a major piece of information (a key fact, condition, or the main point itself) is missing or distorted.
100 = the shortened version conveys essentially nothing of the original meaning, or was left blank or unrelated to the original.

Use the full range, not just these five anchor values, when a response falls between them.

"feedback" must be one short sentence (under 20 words) addressed to the candidate, naming what (if anything) was lost.`,
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
