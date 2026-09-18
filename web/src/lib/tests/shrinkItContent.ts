import type { ShrinkItConfig } from "@/lib/tests/shrinkIt";

export const SHRINK_IT: ShrinkItConfig = {
  id: "shrink-it",
  slug: "shrink-it",
  href: "/tests/shrink-it",
  eyebrow: "Pro · AI-graded",
  titleLead: "Shrink ",
  titleEm: "It",
  titleTail: "!",
  lede: "5 sentences to shrink without losing the plot, then 10 words to swap for their plain-English twin. Ruthless editing meets vocabulary — both scored, both count.",
  howto: [
    "<b>Section A — Shrink it.</b> You'll get 5 sentences (25–40 words each). Rewrite each as short as you can without losing the meaning.",
    "<b>Scoring for Section A:</b> the shorter your version, the more points for shrinkage — but an AI checks how much of the original meaning survived, and losing the point of the sentence costs you those points right back.",
    "<b>Section B — Simplify it.</b> 10 words, each with 4 possible everyday synonyms. Pick the one that actually means the same thing — some of the wrong options are designed to look right.",
  ],
  promptKey: "shrink-it-eval",
  bands: [
    { max: 40, code: "D", name: "Still Bloated", desc: "Sentences barely shrink, or the shrinking loses the point entirely — needs real practice at cutting without cutting meaning." },
    { max: 65, code: "C", name: "Trimming Down", desc: "Gets shorter without much trouble, but either the cuts are too timid or a few key details go missing." },
    { max: 85, code: "B", name: "Lean and Clear", desc: "Consistently cuts a sentence down while keeping the meaning intact, with only occasional slips." },
    { max: 100, code: "A", name: "Master Editor", desc: "Ruthless, precise cuts that keep every important detail — nothing wasted, nothing lost." },
  ],
  sentences: [
    {
      original:
        "After reviewing months of customer feedback, the product team found the onboarding flow confusing and decided to redesign the setup screens.",
    },
    {
      original:
        "Even though deployment was scheduled for Friday evening, the engineering lead pushed it to Monday after QA found a critical payment gateway bug.",
    },
    {
      original:
        "Finance asked all department heads to submit quarterly budget forecasts by the fifteenth so the planning committee can finalize allocation before the board meeting.",
    },
    {
      original:
        "Since the client raised data privacy concerns, legal is working with engineering to encrypt customer information in transit and at rest.",
    },
    {
      original:
        "Although new to the company's tools, the intern finished onboarding, set up her dev environment, and submitted her first pull request in two days.",
    },
  ],
  synonyms: [
    {
      word: "Ameliorate",
      example: "The consultant's report suggested several ways to ameliorate morale across the department.",
      options: ["Improve", "Aggravate", "Alleviate", "Accelerate"],
      correct: 0,
      why: "\"Ameliorate\" means to make something better — \"improve\" is the plain-English match. \"Alleviate\" means to ease a burden, which is close but not the same as making something better overall.",
    },
    {
      word: "Ubiquitous",
      example: "By the following quarter, the new dashboard had become ubiquitous in every team's morning stand-up.",
      options: ["Widespread", "Ancient", "Fragile", "Obsolete"],
      correct: 0,
      why: "\"Ubiquitous\" means present everywhere — \"widespread\" is the simplified match.",
    },
    {
      word: "Meticulous",
      example: "Her meticulous approach to the audit meant nothing was ever really settled until she said so.",
      options: ["Careless", "Thorough", "Curious", "Cautious"],
      correct: 1,
      why: "\"Meticulous\" means showing great attention to detail — \"thorough\" is the closest simple synonym. \"Cautious\" is about avoiding risk, not attention to detail.",
    },
    {
      word: "Ambiguous",
      example: "The clause in the contract remained ambiguous even after three rounds of legal review.",
      options: ["Unclear", "Untrue", "Unlikely", "Unwilling"],
      correct: 0,
      why: "\"Ambiguous\" means open to more than one interpretation — \"unclear\" is the simplified match.",
    },
    {
      word: "Redundant",
      example: "Once the new system went live, half the manual approval steps were declared redundant.",
      options: ["Unnecessary", "Unreliable", "Unusual", "Unstable"],
      correct: 0,
      why: "\"Redundant\" means no longer needed — \"unnecessary\" is the simplified match.",
    },
    {
      word: "Concise",
      example: "The CEO praised the memo for being unusually concise given the topic.",
      options: ["Brief", "Confusing", "Complex", "Careful"],
      correct: 0,
      why: "\"Concise\" means giving information clearly in a few words — \"brief\" is the simplified match.",
    },
    {
      word: "Facilitate",
      example: "A dedicated coordinator was hired to facilitate communication between the two offices.",
      options: ["Help", "Forbid", "Finalize", "Fabricate"],
      correct: 0,
      why: "\"Facilitate\" means to make a process easier — \"help\" is the simplified match.",
    },
    {
      word: "Substantiate",
      example: "Without receipts, the finance team couldn't substantiate the expense claim.",
      options: ["Prove", "Substitute", "Subtract", "Summarize"],
      correct: 0,
      why: "\"Substantiate\" means to provide evidence for something — \"prove\" is the simplified match.",
    },
    {
      word: "Mitigate",
      example: "The team added a fallback server to mitigate the risk of another outage.",
      options: ["Reduce", "Migrate", "Multiply", "Motivate"],
      correct: 0,
      why: "\"Mitigate\" means to make something less severe — \"reduce\" is the simplified match. \"Migrate\" is a sound-alike trap, not a synonym.",
    },
    {
      word: "Feasible",
      example: "Engineering pushed back, saying the deadline simply wasn't feasible.",
      options: ["Possible", "Fragile", "Forceful", "Flexible"],
      correct: 0,
      why: "\"Feasible\" means able to be done — \"possible\" is the simplified match. \"Flexible\" is a plausible-sounding trap but means adaptable, not achievable.",
    },
  ],
};
