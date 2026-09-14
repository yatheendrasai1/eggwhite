import type { TranslationConfig } from "@/lib/tests/translation";

export const TRANSLATION_DRAMA_V1: TranslationConfig = {
  id: "translation-drama-v1",
  slug: "translation-drama-v1",
  href: "/tests/translation-drama-v1",
  eyebrow: "Pro · LLM-graded",
  titleLead: "The ",
  titleEm: "Translation",
  titleTail: " Drama",
  lede: "15 workplace lines, each given in Telugu script, Tinglish, and Hinglish — read whichever you find easiest, and translate it into English. Graded by AI on meaning, not exact wording.",
  howto: [
    "<b>Each item</b> shows the same sentence three ways — Telugu script, Telugu-in-English (Tinglish), and Hindi-in-English (Hinglish). Read whichever version is easiest for you.",
    "<b>Type your English translation</b> in the box below it. Minor grammar slips are fine — you're graded on meaning, not word-for-word accuracy.",
    "<b>Scoring:</b> an AI grades each translation 0–100 for how well it preserves the source meaning, then your overall score is the average across all 15.",
  ],
  promptKey: "translation-drama-v1-eval",
  bands: [
    { max: 40, code: "D", name: "Just Starting", desc: "Core meaning is slipping through in several translations — worth revisiting the basics." },
    { max: 65, code: "C", name: "Getting There", desc: "You're catching most of the meaning, with some details lost along the way." },
    { max: 85, code: "B", name: "Fluent Enough", desc: "Solid translations overall — meaning comes through clearly, minor rough edges." },
    { max: 100, code: "A", name: "Native-Level Ease", desc: "Consistently accurate, natural English translations across scripts and languages." },
  ],
  items: [
    {
      telugu: "నాకు ఈ రోజు సాయంత్రం క్లయింట్‌తో మీటింగ్ ఉంది.",
      tinglish: "Naaku ee roju sayamtram client tho meeting undi.",
      hinglish: "Mujhe aaj shaam client ke saath meeting hai.",
    },
    {
      telugu: "దయచేసి ఈ రిపోర్ట్ రేపటిలోపు పంపండి.",
      tinglish: "Please ee report repatlopu pampandi.",
      hinglish: "Kripya yeh report kal tak bhej dijiye.",
    },
    {
      telugu: "నేను రేపు సెలవు పెడుతున్నాను.",
      tinglish: "Nenu repu selavu pedutunnanu.",
      hinglish: "Main kal chhutti le raha hoon.",
    },
    {
      telugu: "మన టీమ్ ప్రాజెక్ట్ ఆలస్యం అవుతోంది.",
      tinglish: "Mana team project alasyam avutondi.",
      hinglish: "Hamari team ka project late ho raha hai.",
    },
    {
      telugu: "క్లయింట్ కాల్ ఇంకా అరగంటలో మొదలవుతుంది.",
      tinglish: "Client call inka aragantalo modalavutundi.",
      hinglish: "Client call aadhe ghante mein shuru hogi.",
    },
    {
      telugu: "మేనేజర్ ఆమోదం లేకుండా ఈ ఇమెయిల్ పంపవద్దు.",
      tinglish: "Manager approval lekunda ee email pampoddu.",
      hinglish: "Manager ki approval ke bina yeh email mat bhejo.",
    },
    {
      telugu: "నేను ఈ కోడ్ రివ్యూ చేసి ఫీడ్‌బ్యాక్ ఇస్తాను.",
      tinglish: "Nenu ee code review chesi feedback istanu.",
      hinglish: "Main is code ko review karke feedback dunga.",
    },
    {
      telugu: "మన బడ్జెట్ వచ్చే వారం ఖరారు అవుతుంది.",
      tinglish: "Mana budget next week finalize avutundi.",
      hinglish: "Hamara budget agle hafte finalize ho jayega.",
    },
    {
      telugu: "మనం ఈ పనిని డెడ్‌లైన్‌కి ముందు పూర్తి చేయగలమా?",
      tinglish: "Manam ee pani deadline ki mundu complete cheyagalama?",
      hinglish: "Kya hum yeh kaam deadline se pehle khatam kar sakte hain?",
    },
    {
      telugu: "నాకు ఈ ప్లాన్ కొంచెం రిస్కీగా అనిపిస్తోంది.",
      tinglish: "Naaku ee plan konchem risky ga anipistondi.",
      hinglish: "Mujhe lagta hai yeh plan thoda risky hai.",
    },
    {
      telugu: "దీన్ని రేపటి స్టాండ్-అప్‌లో చర్చిద్దాం.",
      tinglish: "Dinni repati stand-up lo discuss cheddam.",
      hinglish: "Ise kal ke stand-up mein discuss karte hain.",
    },
    {
      telugu: "అతను సోమవారం వరకు ఆఫీస్‌లో ఉండడు.",
      tinglish: "Athanu somavaram varaku office lo undadu.",
      hinglish: "Woh Monday tak office mein nahi honge.",
    },
    {
      telugu: "ఈ బగ్‌ని ఈ రోజే సరిచేయాలి.",
      tinglish: "Ee bug ni ee roje fix cheyali.",
      hinglish: "Is bug ko aaj hi theek karna hoga.",
    },
    {
      telugu: "మీరు ఇప్పుడు కొంచెం సేపు కాల్ చేయగలరా?",
      tinglish: "Meeru ippudu konchem sepu call cheyagalara?",
      hinglish: "Kya aap abhi thodi der call kar sakte hain?",
    },
    {
      telugu: "వెండర్ ఆలస్యం వల్ల మనం డెడ్‌లైన్ మిస్ అయ్యాము.",
      tinglish: "Vendor delay valla manam deadline miss ayyamu.",
      hinglish: "Vendor ki delay ki wajah se hum deadline miss kar gaye.",
    },
  ],
};
