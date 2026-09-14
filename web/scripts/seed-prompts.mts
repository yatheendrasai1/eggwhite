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
