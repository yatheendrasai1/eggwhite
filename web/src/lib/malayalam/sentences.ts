/**
 * The 100 revision sentences from the handbook, easiest first. Cover the
 * English, produce the Malayalam, then check.
 */

export type RevisionSentence = {
  /** 1–100, stable across edits (used as the localStorage key). */
  n: number;
  /** Curriculum row this sentence revises ("1", "4.5", "7b", …). */
  row: string;
  en: string;
  ml: string;
};

export const REVISION_ROWS: { row: string; title: string }[] = [
  { row: "1", title: "Row 1 — Being & Having" },
  { row: "2", title: "Row 2 — Asking & Owning" },
  { row: "3", title: "Row 3 — The Past" },
  { row: "4", title: "Row 4 — The Future & Wants" },
  { row: "4.5", title: "Row 4.5 — The Sealant" },
  { row: "5", title: "Row 5 — Other People" },
  { row: "6", title: "Row 6 — Commands & Requests" },
  { row: "7", title: "Row 7 — Describing" },
  { row: "7b", title: "Row 7 Part 2 — Comparing" },
  { row: "8", title: "Row 8 — Talking to People" },
];

const RAW: [string, string, string][] = [
  // Row 1 — Being & Having
  ["1", "I am a student.", "Njān vidyārthiyāṇu."],
  ["1", "This is a book.", "Ithu pusthakamāṇu."],
  ["1", "That is not a house.", "Athu veedalla."],
  ["1", "I have time.", "Enikku samayam uṇṭu."],
  ["1", "I don't have money.", "Enikku paṇam illa."],
  ["1", "I want tea.", "Enikku chāya vēnam."],
  ["1", "I don't want coffee.", "Enikku kāppi vēnda."],
  ["1", "I am eating.", "Njān kazhikkunnu."],
  ["1", "My name is Ravi.", "Ente pēru Raviyāṇu."],
  ["1", "I am a student, but I don't have a book.", "Njān vidyārthiyāṇu, pakshe enikku pusthakam illa."],
  // Row 2 — Asking & Owning
  ["2", "What is this?", "Ithu enthāṇu?"],
  ["2", "Where is your house?", "Ninte veedu evideyāṇu?"],
  ["2", "Who is that?", "Athu ārāṇu?"],
  ["2", "When are you coming?", "Nee eppōl varunnu?"],
  ["2", "What is your father's name?", "Ninte achante pēru enthāṇu?"],
  ["2", "Where is the bathroom?", "Bathroom evideyāṇu?"],
  ["2", "I am going to the shop.", "Njān kaḍayil pōkunnu."],
  ["2", "My house is in Hyderabad.", "Ente veedu Hyderabadilāṇu."],
  ["2", "Do you have time?", "Ninakku samayam uṇḍō?"],
  ["2", "I want one tea and one vada.", "Enikku oru chāyayum oru vaḍayum vēnam."],
  // Row 3 — The Past
  ["3", "I drank tea in the morning.", "Njān rāvile chāya kudichu."],
  ["3", "My father didn't come yesterday.", "Ente achan innale vannilla."],
  ["3", "Did you eat?", "Nee kazhichō?"],
  ["3", "Where did you go?", "Nee evide pōyi?"],
  ["3", "I didn't sing.", "Njān pāṭiyilla."],
  ["3", "When did your father come?", "Ninte achan eppōl vannu?"],
  ["3", "I went to the shop yesterday.", "Njān innale kaḍayil pōyi."],
  ["3", "My mother slept.", "Ente amma uranngi."],
  ["3", "Did you sleep?", "Nee uranngiyō?"],
  ["3", "No, I didn't eat. I drank tea.", "Illa, njān kazhichilla. Njān chāya kudichu."],
  // Row 4 — The Future & Wants
  ["4", "I will come tomorrow.", "Njān nāḷe varum."],
  ["4", "My friend won't eat rice.", "Ente kūṭṭukāran chōru kazhikkilla."],
  ["4", "Will you eat rice?", "Nee chōru kazhikkumō?"],
  ["4", "I want to see your house.", "Enikku ninte veedu kāṇaṇam."],
  ["4", "I want to drink water now.", "Enikku ippōl vellam kudikkaṇam."],
  ["4", "I want to go to Kerala.", "Enikku Keralathil pōkaṇam."],
  ["4", "I won't drink coffee.", "Njān kāppi kudikkilla."],
  ["4", "I didn't drink coffee.", "Njān kāppi kudichilla."],
  ["4", "I wanted to drink tea.", "Enikku chāya kudikkaṇamāyirunnu."],
  ["4", "I didn't want to go yesterday.", "Enikku innale pōkaṇṭāyirunnu."],
  // Row 4.5 — The Sealant
  ["4.5", "How are you?", "Ningaḷ engane uṇṭu?"],
  ["4.5", "Why didn't you come yesterday?", "Nee innale enthukoṇṭu vannilla?"],
  ["4.5", "How much for the tea?", "Chāyakku ethra?"],
  ["4.5", "Who will come tomorrow?", "Nāḷe āru varum?"],
  ["4.5", "Let's eat.", "Nammaḷ kazhikkām."],
  ["4.5", "I'll come tomorrow.", "Njān nāḷe varām."],
  ["4.5", "Do you want tea or coffee?", "Ninakku chāyayō kāppiyō vēnam?"],
  ["4.5", "What did you want to eat?", "Ninakku enthu kazhikkaṇamāyirunnu?"],
  ["4.5", "I didn't have time.", "Enikku samayam illāyirunnu."],
  [
    "4.5",
    "My father went to the shop, but he didn't drink tea.",
    "Ente achan kaḍayil pōyi, pakshe ayāḷ chāya kudichilla.",
  ],
  // Row 5 — Other People
  ["5", "He is coming.", "Avan varunnu."],
  ["5", "She wants tea.", "Avaḷkku chāya vēnam."],
  ["5", "They went to the shop.", "Avar kaḍayil pōyi."],
  ["5", "We will eat rice.", "Njangaḷ chōru kazhikkum."],
  ["5", "His name is Ravi.", "Avante pēru Raviyāṇu."],
  ["5", "Do they have a house?", "Avarkku veedu uṇḍō?"],
  ["5", "I saw her yesterday.", "Njān innale avaḷe kaṇḍu."],
  ["5", "What did he say?", "Ayāḷ enthu paranju?"],
  ["5", "She gave me tea.", "Avaḷ enikku chāya tannu."],
  ["5", "Did you see them?", "Nee avare kaṇḍō?"],
  // Row 6 — Commands & Requests
  ["6", "Come here.", "Ivide varū."],
  ["6", "Sit.", "Irikkū."],
  ["6", "Stop here.", "Ivide niṟtthū."],
  ["6", "Could you stop here?", "Onnu ivide niṟtthāmō?"],
  ["6", "Give me water.", "Enikku vellam tarū."],
  ["6", "Give mother tea.", "Ammakku chāya kodukkū."],
  ["6", "Don't go.", "Pōkaruthu."],
  ["6", "Don't drink coffee now.", "Ippōl kāppi kudikkaruthu."],
  ["6", "He gave me a book.", "Avan enikku oru pusthakam tannu."],
  ["6", "Don't give him money, give me.", "Avanu paṇam kodukkaruthu, enikku tarū."],
  // Row 7 — Describing
  ["7", "Good tea.", "Nalla chāya."],
  ["7", "That big house.", "Ā valiya veedu."],
  ["7", "This shop is small.", "Ī kaḍa cheruthāṇu."],
  ["7", "Come fast!", "Vēgam varū!"],
  ["7", "Two books.", "Raṇḍu pusthakam."],
  ["7", "My house is big.", "Ente veedu valuthāṇu."],
  ["7", "Say it slowly, I don't understand.", "Pathukke paṟayū, enikku manassilākilla."],
  ["7", "Those big houses are old.", "Ā valiya veedukaḷ pazhayathāṇu."],
  [
    "7",
    "Her small house is new, but my new house is big.",
    "Avaḷude cheriya veedu puthiyathāṇu, pakshe ente puthiya veedu valuthāṇu.",
  ],
  [
    "7",
    "Don't give him that old book, give me this new one.",
    "Avanu ā pazhaya pusthakam kodukkaruthu, enikku ī puthiyathu tarū.",
  ],
  // Row 7 Part 2 — Comparing
  ["7b", "Coffee is better than tea.", "Kāppi chāyayekkāḷ nallathāṇu."],
  ["7b", "My house is bigger than your house.", "Ente veedu ninte veeṭṭinekkāḷ valuthāṇu."],
  ["7b", "He is older than me.", "Avan ennekkāḷ valuthāṇu."],
  ["7b", "This shop is smaller than that shop.", "Ī kaḍa ā kaḍayekkāḷ cheruthāṇu."],
  ["7b", "This is the best shop.", "Ithu ettavum nalla kaḍayāṇu."],
  ["7b", "I want a little water.", "Enikku kuṟachu vellam vēnam."],
  ["7b", "Give me more time.", "Enikku kūṭuthal samayam tarū."],
  ["7b", "He has a lot of money.", "Avanu orupāṭu paṇam uṇṭu."],
  ["7b", "That tea is very good.", "Ā chāya valare nallathāṇu."],
  [
    "7b",
    "That black car is bigger than this red car.",
    "Ā kaṟutha kār ī chuvanna kārinekkāḷ valuthāṇu.",
  ],
  // Row 8 — Talking to People
  ["8", "Brother, where is the shop?", "Chēṭṭā, kaḍa evideyāṇu?"],
  ["8", "Sister, could you give me water?", "Chēchi, onnu vellam tarāmō?"],
  ["8", "How are you?", "Sukhamāṇō?"],
  ["8", "I'm fine, thanks.", "Sukhamāṇu, nandi."],
  ["8", "You will come tomorrow, right?", "Nee nāḷe varum, allē?"],
  ["8", "This is your house, isn't it?", "Ithu ninte veedāṇu, allē?"],
  ["8", "Sir, how much for the coffee?", "Sāṟ, kāppikku ethra?"],
  ["8", "See you later.", "Pinne kāṇām."],
  ["8", "Brother, is this the shop?", "Chēṭṭā, ithu kaḍayāṇō?"],
  ["8", "Sister, do you have change?", "Chēchi, ningaḷkku chillara uṇḍō?"],
];

export const REVISION_SENTENCES: RevisionSentence[] = RAW.map(([row, en, ml], i) => ({
  n: i + 1,
  row,
  en,
  ml,
}));
