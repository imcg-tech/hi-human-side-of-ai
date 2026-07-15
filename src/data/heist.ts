/* The Heist, collaborative escape room. Clues are spread across roles
   (no one sees everything). Scenarios as data, new heists without code changes. */

export interface HeistRoom {
  name: string;
  prompt: string;       // what should be entered
  clues: string[];      // fragments, one per role (roleIndex % clues.length)
  answer: string;       // solution (compared normalized)
  hint: string;         // staggered hint
  solution: string;     // plaintext solution (shown when time runs out)
}
export interface HeistScenario { id: string; title: string; story: string; rooms: HeistRoom[]; durationSecs: number; }

export const normalizeAnswer = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");

export const HEIST: HeistScenario = {
  id: "after_hours",
  title: "After Hours",
  story: "It's 7:30pm and you're locked in the office after hours. The security system only opens once you solve three puzzles. Each of you sees only one part. Talk, combine, break out together.",
  durationSecs: 1200, // 20 min
  rooms: [
    {
      name: "Room 1 · The door code",
      prompt: "Enter the 4-digit door code.",
      clues: [
        "🗒️ On your notepad: “The first two digits: 4 7”",
        "🗒️ On your notepad: “The last two digits: 1 9”",
      ],
      answer: "4719",
      hint: "Read your two notes together, four digits in order.",
      solution: "4719",
    },
    {
      name: "Room 2 · The storage room",
      prompt: "Which room is meant? (one word)",
      clues: [
        "🔢 On the board is a number sequence: 8 · 1 · 12 · 12",
        "🔑 Note on the wall: “Each number is a letter, A=1, B=2, C=3 …”",
      ],
      answer: "HALL",
      hint: "Translate each number into the matching letter (8=H …), it spells a room.",
      solution: "HALL",
    },
    {
      name: "Finale · The breakout",
      prompt: "Enter the master code.",
      clues: [
        "🧩 Hint: The master code begins with the door code from room 1 …",
        "🧩 Hint: … followed by the FIRST letter of the word from room 2.",
      ],
      answer: "4719H",
      hint: "Door code (room 1) directly followed by the first letter of the word from room 2.",
      solution: "4719H",
    },
  ],
};

export const HEIST_DEBRIEF = [
  "How did you organize yourselves?",
  "Was there a moment where sharing brought the breakthrough?",
  "Who brought which strength?",
];
