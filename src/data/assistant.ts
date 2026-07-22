/* Shared "Ask Hi" intents: the mascot maps how you feel right now to one
   concrete game or Balance exercise. Used by the Home assistant card and the
   on-open welcome greeting. Pure client-side, nothing leaves the device. */

export type AssistantRec = { title: string; line: string; route: string };
export interface AssistantIntent { id: string; label: string; emoji: string; rec: AssistantRec; alt?: { title: string; route: string } }

export const ASSISTANT_INTENTS: AssistantIntent[] = [
  {
    id: "tension", label: "Something's tense with a colleague", emoji: "🌩️",
    rec: { title: "Cool Down", line: "A 2-minute reset to steady the heat before you respond.", route: "/app/conflict/cooldown" },
    alt: { title: "Repair Kit", route: "/app/conflict/repair" },
  },
  {
    id: "sayit", label: "I want to say something clearly", emoji: "🎯",
    rec: { title: "One Clear Ask", line: "Turn a fuzzy situation into one clear, kind request.", route: "/app/communication/oneclearask" },
    alt: { title: "Feedback Gym", route: "/app/game/feedback" },
  },
  {
    id: "stressed", label: "I feel stressed or wired", emoji: "🫧",
    rec: { title: "Pressure Valve", line: "Let the pressure out with a guided breathing moment.", route: "/app/balance/valve" },
    alt: { title: "Reset Ritual", route: "/app/balance/reset" },
  },
  {
    id: "lowenergy", label: "Low on energy, I need to recharge", emoji: "🌙",
    rec: { title: "Meditation", line: "A calm few minutes to breathe and arrive.", route: "/meditation" },
    alt: { title: "Sound Bath", route: "/app/balance/soundbath" },
  },
  {
    id: "connect", label: "I'd like to feel closer to the team", emoji: "🤝",
    rec: { title: "Common Ground", line: "A light team game about where you each stand.", route: "/app/live/commonground" },
    alt: { title: "Coffee Roulette", route: "/app/balance/coffee" },
  },
  {
    id: "checkin", label: "Just checking in on how I feel", emoji: "💛",
    rec: { title: "Mood check-in", line: "Log how you're doing today. Always private, always yours.", route: "/app/signal" },
  },
];
