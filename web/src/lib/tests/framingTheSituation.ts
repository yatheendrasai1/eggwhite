import type { JiraCommentConfig } from "@/lib/tests/jiraComment";

export const FRAMING_THE_SITUATION: JiraCommentConfig = {
  id: "framing-the-situation",
  slug: "framing-the-situation",
  href: "/tests/framing-the-situation",
  eyebrow: "Pro · LLM-graded",
  titleLead: "Framing ",
  titleEm: "the Situation",
  titleTail: "",
  lede: "Read a real workplace scenario and write the Jira comment it calls for. Graded by AI on tense, sentence framing, prepositions/word usage, clarity, and whether you covered everything asked — not on spelling or punctuation.",
  howto: [
    "<b>Read the story below</b> — it's the full context you need, the same way you'd get it from a ticket and a debugging session.",
    "<b>Write the Jira comment</b> the task asks for, aiming for 180–220 words. Formal, casual, bullets, paragraph — the style is up to you.",
    "<b>Scoring:</b> an AI grades your comment out of 100 across five categories — tense usage, sentence framing, prepositions/word usage, clarity, and task coverage. Spelling and punctuation are never scored.",
  ],
  scenario: {
    role: "Senior Software Engineer, Payments team",
    ticket: "PAY-482",
    recipient: "Venkat, Product Manager",
    story: [
      "You're a Senior Software Engineer on the Payments team. Product Manager Venkat committed a recurring UPI payments feature (PAY-482) to a client, with deployment scheduled for tomorrow.",
      "QA Tester Sneha logged an intermittent bug last night. While debugging with Arjun, you found that the payment gateway has a hard limit of ₹10,000 on recurring mandates — this was never part of the original acceptance criteria.",
      "You added a banner warning and pushed a fix with test scenarios; Sneha validated it, but flagged it as a deviation from the signed-off acceptance criteria.",
      "The client wants this in tomorrow's release, but you're unsure how often users would actually need mandates above ₹10,000.",
    ],
    task: [
      "Explain the ₹10,000 limit and why it was added",
      "Acknowledge Sneha's concern",
      "Ask Venkat how likely users are to need higher amounts",
      "Suggest splitting larger amounts into ₹10,000 blocks as a possible alternative — but note it needs significant extra effort and can't be ready by tomorrow",
    ],
    wordRange: [180, 220],
  },
  categories: [
    { key: "tense", label: "Tense Usage", max: 30 },
    { key: "framing", label: "Sentence Framing / Structure", max: 25 },
    { key: "prepositions", label: "Prepositions & Word Usage", max: 20 },
    { key: "clarity", label: "Clarity & Understandability", max: 15 },
    { key: "coverage", label: "Task Coverage", max: 10 },
  ],
  promptKey: "framing-the-situation-eval",
  bands: [
    { max: 44, code: "D", name: "Struggles to Communicate", desc: "The writing struggles to communicate clearly — needs foundational work on tense, structure, or clarity." },
    { max: 64, code: "C", name: "Understandable", desc: "Gets the message across, but needs real improvement in mechanics and structure." },
    { max: 84, code: "B", name: "Good", desc: "Minor polish needed — mostly professional-ready English." },
    { max: 100, code: "A", name: "Fluent", desc: "Professional-ready — reads like natural, fluent workplace English." },
  ],
};
