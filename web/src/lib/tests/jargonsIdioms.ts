import type { McqPairConfig } from "@/lib/tests/mcqPair";

export const JARGONS_IDIOMS: McqPairConfig = {
  id: "jargons-idioms",
  slug: "jargons-idioms",
  href: "/tests/jargons-idioms",
  accent: "rose",
  eyebrow: "Pro · Jargons & Idioms",
  titleLead: "Jargons ",
  titleEm: "&",
  titleTail: " Idioms",
  lede: "20 phrases people actually say in meetings and Slack threads — \"circle back,\" \"low-hanging fruit,\" \"move the goalposts.\" This isn't memorization: it tests whether you can pick the right idiom for a real situation, and decode one you're hearing for the first time from context.",
  howto: [
    "<b>Part I — Pick the idiom.</b> A short workplace situation is described. Choose the idiom or jargon term that actually fits it.",
    "<b>Part II — Decode the meaning.</b> A sentence uses an idiom or jargon term in context. Choose what it means.",
    "<b>Scoring:</b> each item is worth 1 point, 20 total. No two idioms repeat across the two parts.",
  ],
  part1: {
    title: "Pick the idiom",
    note: "Read the situation, then choose the idiom that actually fits it.",
    items: [
      {
        sentence:
          "In the meeting, someone raises a tricky question you're not ready to answer. You want to revisit it later without derailing the discussion now.",
        options: ["Circle back on that", "Move the needle on that", "Throw that under the bus", "Boil the ocean on that"],
        correct: 0,
        why: "\"Circle back\" means to return to a topic later, once you're ready to address it properly.",
      },
      {
        sentence: "Your team just launched a small feature that noticeably improved conversion rates.",
        options: ["That was low-hanging fruit", "That moved the needle", "That drank the Kool-Aid", "That took it offline"],
        correct: 1,
        why: "\"Move the needle\" means to make a measurable, meaningful impact on a metric that matters.",
      },
      {
        sentence: "Before tackling the big redesign, the team wants to start with the easiest, fastest improvements first.",
        options: ["Let's start with the low-hanging fruit", "Let's check our bandwidth", "Let's get on the same page", "Let's not drop the ball"],
        correct: 0,
        why: "\"Low-hanging fruit\" refers to the easiest wins — tasks worth tackling first because they take the least effort.",
      },
      {
        sentence:
          "The new VP wants to redesign the entire onboarding flow, the pricing model, and the support system all at once, in a single sprint.",
        options: ["That would move the needle", "That's trying to boil the ocean", "That's a quick win", "Let's circle back on it"],
        correct: 1,
        why: "\"Boil the ocean\" describes attempting something unrealistically broad or ambitious all at once.",
      },
      {
        sentence: "After the workshop, everyone confirmed they understood the new process the same way.",
        options: ["We're on the same page", "We threw her under the bus", "We're in the weeds", "We have the bandwidth"],
        correct: 0,
        why: "\"On the same page\" means everyone is aligned and in agreement.",
      },
      {
        sentence: "The engineer forgot to send the client the report he'd promised, and now the client is upset.",
        options: ["He moved the needle", "He dropped the ball", "He took it offline", "He ran it up the flagpole"],
        correct: 1,
        why: "\"Drop the ball\" means to fail to follow through on a responsibility you were expected to handle.",
      },
      {
        sentence:
          "When the project failed, the manager blamed a junior teammate in front of the client to avoid taking responsibility himself.",
        options: ["He threw her under the bus", "He touched base with her", "He put a pin in it", "He got the ball rolling"],
        correct: 0,
        why: "\"Throw someone under the bus\" means to blame or sacrifice someone else to protect yourself.",
      },
      {
        sentence:
          "The discussion is getting too detailed for the whole group — you suggest continuing just between the two of you after the call.",
        options: ["Let's take this offline", "Let's boil the ocean", "Let's move the needle", "Let's drop the ball"],
        correct: 0,
        why: "\"Take this offline\" means to continue a discussion separately, outside the main meeting.",
      },
      {
        sentence: "Instead of the big redesign, you suggest shipping a small, fast improvement this week to show early progress.",
        options: ["Let's ship a quick win", "Let's check our bandwidth", "That's real synergy", "We're on the same page"],
        correct: 0,
        why: "\"Quick win\" refers to a small, fast success — something visible and easy to deliver soon.",
      },
      {
        sentence: "Your manager asks if you have room in your schedule to take on a new project this sprint.",
        options: ["Do you have the bandwidth?", "Is that low-hanging fruit?", "Can you circle back?", "Would that be under the bus?"],
        correct: 0,
        why: "\"Bandwidth\" means available capacity or time — borrowed from network/data terminology.",
      },
    ],
  },
  part2: {
    title: "Decode the meaning",
    note: "The sentence uses the idiom in context — pick what it actually means.",
    items: [
      {
        sentence: "\"Let's touch base early next week to see where things stand.\"",
        options: ["Have a brief check-in conversation", "Physically meet at the office", "Sign a formal agreement", "End the project"],
        correct: 0,
        why: "\"Touch base\" means to make brief contact or check in with someone.",
      },
      {
        sentence: "\"Can you get the ball rolling on the vendor contract today?\"",
        options: ["Cancel the contract", "Start the process moving", "Finish it completely", "Delay it indefinitely"],
        correct: 1,
        why: "\"Get the ball rolling\" means to start a process in motion.",
      },
      {
        sentence: "\"We need to think outside the box if we want a real solution here.\"",
        options: ["Follow the standard process exactly", "Ask someone else to decide", "Come up with a creative, unconventional idea", "Stick to the original plan"],
        correct: 2,
        why: "\"Think outside the box\" means to approach a problem in a creative, non-obvious way.",
      },
      {
        sentence: "\"Let's peel back the onion on this outage before we point fingers.\"",
        options: ["Blame the person responsible immediately", "Investigate the root cause layer by layer", "Ignore the issue and move on", "Summarize it in one sentence"],
        correct: 1,
        why: "\"Peel back the onion\" means to investigate something by working through it layer by layer.",
      },
      {
        sentence: "\"Halfway through the sprint, the client moved the goalposts again.\"",
        options: ["Approved the work early", "Gave positive feedback", "Changed the requirements after work had already started", "Extended the deadline generously"],
        correct: 2,
        why: "\"Move the goalposts\" means to change the criteria for success after the work is already underway.",
      },
      {
        sentence: "\"Good idea, but let's put a pin in it until after the launch.\"",
        options: ["Reject the idea permanently", "Implement it right away", "Set it aside to revisit later", "Assign it to someone else immediately"],
        correct: 2,
        why: "\"Put a pin in it\" means to pause an idea and come back to it later — not to reject it.",
      },
      {
        sentence: "\"Before we commit budget, let's run it up the flagpole with leadership.\"",
        options: ["Announce it publicly on social media", "Propose it informally to gauge reaction", "Keep it a secret from leadership", "Cancel the proposal"],
        correct: 1,
        why: "\"Run it up the flagpole\" means to float an idea informally to see how people react before committing.",
      },
      {
        sentence: "\"He's fully drunk the Kool-Aid on the new strategy — he won't hear a single objection.\"",
        options: ["He's skeptical of the strategy", "He's followed it enthusiastically without question", "He proposed the strategy himself", "He's unaware the strategy exists"],
        correct: 1,
        why: "\"Drink the Kool-Aid\" means to accept and follow something enthusiastically and uncritically.",
      },
      {
        sentence: "\"Stop reviewing every font size — you're in the weeds and we're missing the deadline.\"",
        options: ["Focused on high-level strategy", "Too deep in unimportant details", "Working efficiently", "Ahead of schedule"],
        correct: 1,
        why: "\"In the weeds\" means overly focused on small details, losing sight of the bigger picture.",
      },
      {
        sentence: "\"Combining design and engineering early created real synergy on this project.\"",
        options: ["A conflict between teams", "A delay caused by miscommunication", "A combined effect greater than each team working alone", "An unnecessary duplication of effort"],
        correct: 2,
        why: "\"Synergy\" means the combined effect of two things working together exceeds what each could achieve alone.",
      },
    ],
  },
  bands: [
    { max: 40, code: "Newcomer", name: "Still decoding", desc: "Most of these phrases are still unfamiliar — situational picks and meaning checks are both closer to guesses than recognition. Worth building a personal glossary as you hear these in meetings." },
    { max: 65, code: "Regular", name: "Meeting-room familiar", desc: "Recognizes the common ones but still trips on the less obvious idioms, especially when picking the right one to use rather than just recognizing a meaning." },
    { max: 85, code: "Fluent", name: "Boardroom fluent", desc: "Comfortable with almost all of these — both using the right idiom for a situation and decoding one heard for the first time." },
    { max: 100, code: "Native-like", name: "Second nature", desc: "Picks the exact right idiom for any situation and never misreads one in context — this vocabulary is fully internalized." },
  ],
  ladder: [
    ["Newcomer", "Still decoding"],
    ["Regular", "Meeting-room familiar"],
    ["Fluent", "Boardroom fluent"],
    ["Native-like", "Second nature"],
  ],
  ladderEnds: ["Newcomer", "Native-like"],
  tiles: { labels: ["Situations", "Meanings"] },
  footNote: "Each item has exactly one correct answer — check the review to see the idiom explained.",
};
