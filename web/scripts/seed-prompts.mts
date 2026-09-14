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

Each item gives a short sentence in its native language or script (Telugu, Telugu written in Latin letters — "Tinglish", or Hindi written in Latin letters — "Hinglish"), a reference English translation showing the intended meaning, and the candidate's own attempt to translate it into English.

Judge the candidate's answer against the MEANING of the source, using the reference translation as your guide to what it should mean — do not penalize wording that differs from the reference as long as the meaning is preserved and the English is natural.

Several items are specifically designed to test whether the candidate produces natural, standard English rather than carrying over literal Indian-English phrasing ("Indianisms") — for example: "out of station" instead of "out of town", "prepone" instead of "move up"/"reschedule earlier", "pass out" (meaning graduate) instead of "graduated", "cousin brother"/"cousin sister" instead of "cousin", "since five years" instead of "for five years", "years back" instead of "years ago", untranslated "lakh"/"crore" instead of standard English numbers (e.g. 100,000 / 10,000,000), "what is your good name" instead of "what is your name", "do the needful" instead of a specific action, "same to same" instead of "identical"/"exactly the same", and doubled intensifiers like "very very" instead of a single stronger word. If the candidate's translation carries over an Indianism like this instead of natural English, score it down even though the meaning is understandable.

Score each item:
2 = fully correct — captures the meaning accurately in natural, standard English (minor grammar differences are fine).
1 = partially correct — captures some but not all of the meaning, has a notable error, or uses an Indianism instead of natural English.
0 = incorrect — misses the meaning entirely, or was left blank.

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
