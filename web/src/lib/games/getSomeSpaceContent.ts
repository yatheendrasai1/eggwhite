export type GssQuestion = {
  id: string;
  segment: 1 | 2 | 3;
  prompt: string;
  options: readonly [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

/** Public shape sent to the client — never includes the answer key. */
export type GssPublicQuestion = Omit<GssQuestion, "correctIndex">;

export function toPublicQuestion(q: GssQuestion): GssPublicQuestion {
  return { id: q.id, segment: q.segment, prompt: q.prompt, options: q.options };
}

/**
 * Segment 1 — Troposphere climb. General, easy space/atmosphere facts.
 * Pool is larger than the 6 correct answers required, so a few wrong
 * answers don't dead-end the segment before the life pool does.
 */
const SEGMENT_1: GssQuestion[] = [
  {
    id: "s1-01",
    segment: 1,
    prompt: "Which layer of Earth's atmosphere do we live in, where weather happens?",
    options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"],
    correctIndex: 0,
  },
  {
    id: "s1-02",
    segment: 1,
    prompt: "What is commonly called the \"edge of space\"?",
    options: ["The ozone layer", "The Kármán line", "The Van Allen belt", "The tropopause"],
    correctIndex: 1,
  },
  {
    id: "s1-03",
    segment: 1,
    prompt: "Roughly how high above sea level is the Kármán line?",
    options: ["10 km", "50 km", "100 km", "400 km"],
    correctIndex: 2,
  },
  {
    id: "s1-04",
    segment: 1,
    prompt: "Which gas makes up about 78% of Earth's atmosphere?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"],
    correctIndex: 2,
  },
  {
    id: "s1-05",
    segment: 1,
    prompt: "What is Earth's only natural satellite called?",
    options: ["Titan", "The Moon", "Europa", "Phobos"],
    correctIndex: 1,
  },
  {
    id: "s1-06",
    segment: 1,
    prompt: "Who was the first human to travel into space?",
    options: ["Neil Armstrong", "John Glenn", "Yuri Gagarin", "Buzz Aldrin"],
    correctIndex: 2,
  },
  {
    id: "s1-07",
    segment: 1,
    prompt: "Who was the first Indian to travel to space?",
    options: ["Kalpana Chawla", "Rakesh Sharma", "Vikram Sarabhai", "Sunita Williams"],
    correctIndex: 1,
  },
  {
    id: "s1-08",
    segment: 1,
    prompt: "What is India's national space agency called?",
    options: ["NASA", "ISRO", "ESA", "JAXA"],
    correctIndex: 1,
  },
  {
    id: "s1-09",
    segment: 1,
    prompt: "Which planet is known as the \"Red Planet\"?",
    options: ["Venus", "Jupiter", "Mars", "Saturn"],
    correctIndex: 2,
  },
  {
    id: "s1-10",
    segment: 1,
    prompt: "Which star is closest to Earth?",
    options: ["Proxima Centauri", "The Sun", "Sirius", "Alpha Centauri"],
    correctIndex: 1,
  },
];

/**
 * Segment 2 — Stratosphere push. Medium difficulty: ozone/mesosphere and
 * early space-history facts.
 */
const SEGMENT_2: GssQuestion[] = [
  {
    id: "s2-01",
    segment: 2,
    prompt: "Which atmospheric layer contains the ozone layer?",
    options: ["Troposphere", "Stratosphere", "Mesosphere", "Exosphere"],
    correctIndex: 1,
  },
  {
    id: "s2-02",
    segment: 2,
    prompt: "Roughly what altitude does the stratosphere extend up to?",
    options: ["12 km", "50 km", "85 km", "600 km"],
    correctIndex: 1,
  },
  {
    id: "s2-03",
    segment: 2,
    prompt:
      "The \"Armstrong limit\" (~19 km altitude) marks the point where, without a pressure suit, what happens?",
    options: [
      "The air becomes unbreathable",
      "Unprotected blood boils at body temperature",
      "Radio signals stop working",
      "Gravity becomes noticeably weaker",
    ],
    correctIndex: 1,
  },
  {
    id: "s2-04",
    segment: 2,
    prompt: "Which atmospheric layer lies directly above the stratosphere?",
    options: ["Thermosphere", "Exosphere", "Mesosphere", "Troposphere"],
    correctIndex: 2,
  },
  {
    id: "s2-05",
    segment: 2,
    prompt: "Most meteors burn up completely in which atmospheric layer?",
    options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"],
    correctIndex: 2,
  },
  {
    id: "s2-06",
    segment: 2,
    prompt: "What was the first satellite launched by a rocket built and launched from Indian soil?",
    options: ["Aryabhata", "Rohini RS-1", "Bhaskara-I", "INSAT-1A"],
    correctIndex: 1,
  },
  {
    id: "s2-07",
    segment: 2,
    prompt: "In which year was Aryabhata, India's first satellite, launched?",
    options: ["1969", "1975", "1980", "1984"],
    correctIndex: 1,
  },
  {
    id: "s2-08",
    segment: 2,
    prompt: "ISRO's INSAT satellite series is primarily used for what?",
    options: [
      "Lunar navigation",
      "Communication and weather broadcasting",
      "Deep-space imaging",
      "Crewed spaceflight",
    ],
    correctIndex: 1,
  },
  {
    id: "s2-09",
    segment: 2,
    prompt: "Who performed the first-ever spacewalk?",
    options: ["Buzz Aldrin", "Valentina Tereshkova", "Alexei Leonov", "Neil Armstrong"],
    correctIndex: 2,
  },
  {
    id: "s2-10",
    segment: 2,
    prompt: "What was the name of the first artificial satellite ever launched into orbit?",
    options: ["Explorer 1", "Vanguard 1", "Sputnik 1", "Telstar 1"],
    correctIndex: 2,
  },
  {
    id: "s2-11",
    segment: 2,
    prompt: "Roughly how many kilometers above Earth does the International Space Station orbit?",
    options: ["100 km", "400 km", "2,000 km", "36,000 km"],
    correctIndex: 1,
  },
  {
    id: "s2-12",
    segment: 2,
    prompt: "Which country launched Sputnik 1?",
    options: ["United States", "Soviet Union", "China", "United Kingdom"],
    correctIndex: 1,
  },
];

/**
 * Segment 3 — Edge of space. Hard but approachable: the Kármán line itself
 * and deeper ISRO/space-history facts.
 */
const SEGMENT_3: GssQuestion[] = [
  {
    id: "s3-01",
    segment: 3,
    prompt: "The Kármán line, the internationally recognized edge of space, sits at approximately what altitude?",
    options: ["50 km", "80 km", "100 km", "160 km"],
    correctIndex: 2,
  },
  {
    id: "s3-02",
    segment: 3,
    prompt: "Which Indian mission made India the first Asian nation to reach Mars orbit?",
    options: ["Chandrayaan-1", "Mangalyaan (Mars Orbiter Mission)", "Aditya-L1", "Astrosat"],
    correctIndex: 1,
  },
  {
    id: "s3-03",
    segment: 3,
    prompt: "In what year did India's Mars Orbiter Mission enter orbit around Mars?",
    options: ["2008", "2013", "2014", "2019"],
    correctIndex: 2,
  },
  {
    id: "s3-04",
    segment: 3,
    prompt: "Chandrayaan-3 made India the first country to successfully soft-land near which lunar region?",
    options: ["The lunar equator", "The Moon's south pole", "The far side of the Moon", "The lunar north pole"],
    correctIndex: 1,
  },
  {
    id: "s3-05",
    segment: 3,
    prompt: "What did Chandrayaan-1 famously discover on the Moon?",
    options: ["Liquid water", "Water molecules", "An atmosphere", "Volcanic activity"],
    correctIndex: 1,
  },
  {
    id: "s3-06",
    segment: 3,
    prompt: "What is India's first crewed spaceflight program called?",
    options: ["Gaganyaan", "Vyommitra", "Aditya", "Antariksh"],
    correctIndex: 0,
  },
  {
    id: "s3-07",
    segment: 3,
    prompt: "Aditya-L1 is India's mission to study which celestial body?",
    options: ["The Moon", "Mars", "The Sun", "Venus"],
    correctIndex: 2,
  },
  {
    id: "s3-08",
    segment: 3,
    prompt: "At which Lagrange point is Aditya-L1 stationed?",
    options: ["L1", "L2", "L3", "L4"],
    correctIndex: 0,
  },
  {
    id: "s3-09",
    segment: 3,
    prompt: "Approximately how far from Earth is the L1 Lagrange point where Aditya-L1 sits?",
    options: ["100,000 km", "400,000 km", "1.5 million km", "150 million km"],
    correctIndex: 2,
  },
  {
    id: "s3-10",
    segment: 3,
    prompt: "At roughly what altitude do geostationary satellites orbit?",
    options: ["2,000 km", "20,200 km", "35,786 km", "384,000 km"],
    correctIndex: 2,
  },
  {
    id: "s3-11",
    segment: 3,
    prompt: "Which Indian satellite series is primarily used for geostationary communication and weather?",
    options: ["IRS", "INSAT/GSAT", "Cartosat", "RISAT"],
    correctIndex: 1,
  },
  {
    id: "s3-12",
    segment: 3,
    prompt: "Who was the first American to orbit the Earth?",
    options: ["Alan Shepard", "John Glenn", "Gus Grissom", "Scott Carpenter"],
    correctIndex: 1,
  },
  {
    id: "s3-13",
    segment: 3,
    prompt: "Which spacecraft carried Rakesh Sharma to the Salyut 7 space station?",
    options: ["Soyuz T-11", "Vostok 1", "Apollo 11", "Voskhod 2"],
    correctIndex: 0,
  },
  {
    id: "s3-14",
    segment: 3,
    prompt: "In what year did Rakesh Sharma become the first Indian in space?",
    options: ["1975", "1980", "1984", "1990"],
    correctIndex: 2,
  },
  {
    id: "s3-15",
    segment: 3,
    prompt: "Which was the first commercial geostationary communications satellite?",
    options: ["Syncom 3", "Telstar 1", "Intelsat I (\"Early Bird\")", "Sputnik 2"],
    correctIndex: 2,
  },
];

export const GSS_QUESTIONS: readonly GssQuestion[] = [...SEGMENT_1, ...SEGMENT_2, ...SEGMENT_3];

export function poolForSegment(segment: 1 | 2 | 3): readonly GssQuestion[] {
  return GSS_QUESTIONS.filter((q) => q.segment === segment);
}

export function findQuestion(id: string): GssQuestion | undefined {
  return GSS_QUESTIONS.find((q) => q.id === id);
}
