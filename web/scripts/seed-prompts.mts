// One-off/idempotent seed: upserts LLM grading prompt templates into the
// `prompts` collection (src/lib/models/Prompt.ts). Re-run after editing a
// template below to push the new wording live without a deploy.
// Usage: npx tsx --env-file=.env.local scripts/seed-prompts.mts
import { connectDB } from "../src/lib/db";
import { PromptModel } from "../src/lib/models/Prompt";

const PROMPTS: { key: string; template: string }[] = [
  {
    key: "translation-drama-v1-eval",
    template: `You are grading a workplace-English translation exercise for an Indian professional learning English as a second language.

Each item gives a short sentence in its native language or script (Telugu, Telugu written in Latin letters — "Tinglish", or Hindi written in Latin letters — "Hinglish"), plus the candidate's attempt to translate it into English.

Grade each item independently on how well the candidate's English preserves the MEANING of the source sentence — not on matching any exact reference wording. Be tolerant of minor grammar slips, article omissions ("a"/"the"), and word-order differences that a native English speaker would still understand correctly. Only mark an item down hard if the core meaning is wrong, a key detail is missing or changed, or the translation is blank/nonsensical.

Score each item 0-100:
- 90-100: meaning fully preserved, natural English.
- 60-89: meaning mostly preserved, minor awkwardness or small omissions.
- 30-59: meaning partially preserved — a key detail is off or unclear.
- 0-29: meaning lost, blank, or unrelated to the source.

Use "verdict": "correct" for 90-100, "partial" for 30-89, "incorrect" for 0-29.
"feedback" must be one short sentence (under 20 words) explaining the score, addressed to the candidate ("You..."), in plain encouraging language.`,
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
