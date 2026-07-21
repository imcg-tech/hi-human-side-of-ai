/* Balance Hub, Oberbereich mentale Gesundheit. 5 Unterbereiche, überwiegend Solo.
   Leitprinzip: maximale Privatsphäre, kein Tracking/Vergleich, niedrigschwellig, einladend.
   Prävention & Selbstfürsorge, keine Therapie. */

export interface BalanceGame { id: string; title: string; desc: string; status: "built" | "soon"; route?: string; }
export interface SubArea { id: string; title: string; tagline: string; emoji: string; color: string; games: BalanceGame[]; }

export const SUBAREAS: SubArea[] = [
  { id: "meditation", title: "Meditation & Mindfulness", tagline: "Breathe and arrive", emoji: "🌬️", color: "var(--candy-mint)", games: [
    { id: "breath", title: "Breath Sync", desc: "Guided breathing, visual & with sound", status: "built", route: "/meditation" },
    { id: "bodyscan", title: "Bodyscan Journey", desc: "Guided body journey, 5–15 min", status: "soon" },
    { id: "soundbath", title: "Sound Bath", desc: "Ambient soundscapes to wind down", status: "built", route: "/app/balance/soundbath" },
  ] },
  { id: "stress", title: "Stress & Recovery", tagline: "Release pressure, recharge", emoji: "🫧", color: "var(--candy-blue)", games: [
    { id: "reset", title: "Reset Ritual", desc: "2-min micro-break between meetings", status: "built", route: "/app/balance/reset" },
    { id: "valve", title: "Pressure Valve", desc: "Stress relief in acute moments", status: "built", route: "/app/balance/valve" },
    { id: "boundary", title: "Boundary Builder", desc: "Weekly challenge: consciously set a boundary", status: "built", route: "/app/balance/boundary" },
    { id: "recovery", title: "Recovery Wins", desc: "Share small moments of recovery", status: "built", route: "/app/balance/recovery" },
  ] },
  { id: "selfcare", title: "Self-care & Mood", tagline: "Look after yourself", emoji: "💛", color: "var(--candy-yellow)", games: [
    { id: "gratitude", title: "Gratitude Drop", desc: "One line of gratitude daily", status: "built", route: "/app/balance/gratitude" },
  ] },
  { id: "resilience", title: "Resilience & Mindset", tagline: "Grow your inner strength", emoji: "🌱", color: "var(--candy-lilac)", games: [
    { id: "setback", title: "Setback Stories", desc: "Reflect on setbacks you've overcome", status: "built", route: "/app/balance/setback" },
    { id: "strength", title: "Strength Spotting", desc: "Spot each other's strengths", status: "built", route: "/app/balance/strength" },
    { id: "comeback", title: "The Comeback", desc: "Mini scenarios: what helps you back up?", status: "built", route: "/app/balance/comeback" },
  ] },
  { id: "connection", title: "Connection & Loneliness", tagline: "You're not alone", emoji: "🤝", color: "var(--candy-peri)", games: [
    { id: "reachout", title: "Reach Out", desc: "A gentle nudge to reach out to someone", status: "built", route: "/app/balance/reachout" },
    { id: "checkon", title: "Check on a Colleague", desc: "A guide for an honest “How are you?”", status: "built", route: "/app/balance/checkon" },
    { id: "notalone", title: "Not Alone", desc: "Anonymous, shared micro-feelings", status: "built", route: "/app/balance/notalone" },
    { id: "coffee", title: "Coffee Roulette", desc: "A random virtual coffee date", status: "built", route: "/app/balance/coffee" },
  ] },
];

/* ── Reset Ritual (Stress), geführte 2-Min-Mikropause (5-4-3-2-1-Grounding) ── */
export interface ResetStep { t: string; d: string; secs: number; }
export const RESET_STEPS: ResetStep[] = [
  { t: "Arrive", d: "Sit comfortably. Feel the floor under your feet.", secs: 15 },
  { t: "Breathe", d: "Three deep breaths, slowly in, slowly back out.", secs: 27 },
  { t: "5 · see", d: "Silently name 5 things you can see right now.", secs: 23 },
  { t: "4 · hear", d: "Listen: 4 sounds around you.", secs: 20 },
  { t: "3 · feel", d: "3 things you can physically feel: the chair, your clothes, the air.", secs: 20 },
  { t: "1 · take with you", d: "One word for this moment. Take it with you into the next step.", secs: 17 },
];

/* Sanfter Verweis auf echte Hilfe, kein Tracking, keine Diagnose. */
export const HELP_NOTE = "This area is prevention and self-care, not therapy. If something is weighing on you more seriously: reaching out for help is a strong move. Telefonseelsorge 0800 111 0 111 (free, anonymous, 24/7), your EAP or your doctor.";

/* ── Boundary Builder (Stress), one healthy boundary held for a week ── */
export interface BoundarySuggestion { text: string; area: string; }
export const BOUNDARY_SUGGESTIONS: BoundarySuggestion[] = [
  { text: "No messages after 6pm", area: "after-hours" },
  { text: "A real lunch break, no screen", area: "during-day" },
  { text: "No meeting without an agenda", area: "meetings" },
  { text: "Phone stays out of the bedroom", area: "sleep" },
  { text: "One focused afternoon a week, no calls", area: "focus" },
  { text: "10 minutes outside after work, before anything else", area: "transition" },
];

/* ── Recovery Wins (Stress), normalise rest by sharing small recovery moments ── */
export const RECOVERY_CHIPS: string[] = [
  "Short walk",
  "A real coffee break",
  "Got some fresh air",
  "Lunch without a screen",
  "Finished early",
  "Slept well",
  "Put the phone away",
];

/* Demo team feed for Recovery Wins (own shares are added on top, locally). */
export const RECOVERY_DEMO: { who: string; text: string }[] = [
  { who: "Someone on the team", text: "Took a real lunch break away from the desk" },
  { who: "Mara", text: "A short walk between two calls" },
  { who: "Someone on the team", text: "Logged off on time for once" },
  { who: "Jon", text: "Got some fresh air at midday" },
];

/* ── Setback Stories (Resilience), mine a survived setback for evidence of strength ── */
export const SETBACK_QUESTIONS: string[] = [
  "What or who helped you back then?",
  "Which strength of yours showed up?",
  "What would the you of back then say to the you of today?",
];

/* ── Strength Spotting (Resilience), a strengths-based self-image, solo + peer ── */
export const STRENGTHS_VOCAB: string[] = [
  "Patient", "Clear", "Reliable", "Creative", "Brave", "A good listener",
  "Structured", "Empathetic", "Solution-focused", "Calm under pressure", "Encouraging", "Thorough",
];

/* A couple of seeded, anonymous peer affirmations so the "received" side isn't empty in demo. */
export const STRENGTH_RECEIVED_DEMO: { text: string; example: string }[] = [
  { text: "Calm under pressure", example: "In last week's incident call you kept everyone steady." },
  { text: "Encouraging", example: "You made space for the quieter voices in the retro." },
];

/* ── The Comeback (Resilience), discover what helps YOU bounce back ── */
export interface ComebackScenario { situation: string; }
export const COMEBACK_SCENARIOS: ComebackScenario[] = [
  { situation: "A project you put your heart into gets rejected. What helps you now?" },
  { situation: "You made a mistake others saw. How do you come back?" },
  { situation: "A week just went badly. What lifts you again?" },
];
export const COMEBACK_OPTIONS: string[] = [
  "Movement", "Talk to someone", "A bit of distance", "Finish something", "Something kind for myself", "Replan",
];

/* ── Check on a Colleague (Connection), tap-and-adapt openers for a real check-in ── */
export const STARTER_LINES: string[] = [
  "Hey, I noticed you've been a bit quieter lately. Everything okay with you?",
  "No particular reason, I just wanted to check how you're doing.",
  "If you ever want to talk, I'm here.",
];

/* ── Not Alone (Connection), anonymous shared micro-feelings ── */
export const FEELING_CHIPS: string[] = [
  "A bit overwhelmed", "A little lonely", "Tired", "Unsure", "Actually pretty good", "Tense", "Grateful",
];
/* Demo aggregate counts (anonymous, always above the min-count threshold of 4). */
export const FEELING_COUNTS: Record<string, number> = {
  "A bit overwhelmed": 23, "A little lonely": 11, "Tired": 27, "Unsure": 9,
  "Actually pretty good": 18, "Tense": 14, "Grateful": 21,
};

/* Gratitude Drop, sanfte rotierende Anregungen. Rein optional, nie verpflichtend. */
export const GRATITUDE_PROMPTS = [
  "Someone who was good to you today?",
  "A small moment that briefly made you happy?",
  "Something you usually take for granted?",
  "One thing about yourself?",
  "Something that was easier today than expected?",
  "A place where you feel at ease?",
];
