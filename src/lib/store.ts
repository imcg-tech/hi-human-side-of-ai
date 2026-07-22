import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DiscType = "D" | "I" | "S" | "C";

export type CoffeeCadence = "weekly" | "biweekly" | "monthly";
export type CoffeePref = "same" | "other" | "any";

/* 1:1 Companion (Leadership). Sessions are strictly local to the two people involved,
   no HR / employer access. Open agreements carry over into the next session (the "red thread"). */
export type OooSide = "you" | "them" | "both";
export interface OooTopic { id: string; text: string; by: "you" | "them"; addressed: boolean; }
export interface OooAgreement { id: string; text: string; owner: OooSide; done: boolean; carried?: boolean; }
export interface OooSession {
  id: string;
  partner: string;      // the report's name
  date: string;         // YYYY-MM-DD
  topics: OooTopic[];
  steps: string[];      // ids of completed guide steps
  notes: string;        // private, stays on device
  agreements: OooAgreement[];
  mood: number | null;  // optional mood impulse, only if the report shares it
  closed: boolean;
}

/** Full DISC result produced by the assessment (see data/assessment.ts). */
export interface DiscProfile {
  primary: DiscType;
  secondary: DiscType;
  raw: Record<DiscType, number>;
  percent: Record<DiscType, number>; // 0–100, profile-relative bar strength
  share: Record<DiscType, number>;   // sums to 100, for the mix/donut
  profileCode: string;               // e.g. "DCIS"
  isBalanced: boolean;
}

export interface HiState {
  email: string | null;
  displayName: string | null;
  department: string | null;
  country: string | null; // ISO code (Herkunftsland)
  teamId: string | null;
  profileLoaded: boolean; // true once the backend profile has been pulled (or in demo mode)
  discType: DiscType | null; // = primary (kept for existing consumers)
  scores: Record<DiscType, number> | null; // = percent (kept for existing consumers)
  profile: DiscProfile | null;
  shareWithTeam: boolean; // consent opt-in: include my result in team aggregate / 1:1
  notify: boolean;
  mood: number | null; // 1..5 (today's / last pulse, für die Dashboard-Kachel)

  // Puls: private Stimmungs-Historie (nur lokal, nie synchronisiert, niemand sonst sieht sie).
  // Beitrag zum anonymen Team-Puls ist Opt-in (privacy by default).
  moodHistory: Record<string, { mood: number; share: boolean; note?: string }>; // YYYY-MM-DD → Eintrag
  moodShareDefault: boolean; // gemerkte Grundeinstellung fürs anonyme Beitragen

  // Balance, private Dankbarkeits-Einträge (bleiben lokal, werden nie synchronisiert)
  gratitude: { date: string; text: string }[];

  // Sternenwarte, deck answers + streak
  deckAnswers: Record<string, string>; // questionId → optionId
  streakCurrent: number;
  streakLongest: number;
  lastAnsweredDate: string | null; // YYYY-MM-DD
  todayCount: number; // answers today

  // First Week Quest (Onboarding), Fortschritt muss über Tage erhalten bleiben.
  fwqStart: string | null; // ISO-Datum des ersten Öffnens (Basis der Tagesstaffelung)
  fwqDone: string[];       // erledigte Quest-Ids

  // Engagement: verzeihendes „Momentum“ (kein harter Streak, bricht nie auf null).
  momentum: number;            // 0..100, sinkt langsam bei Pause, baut sich sofort wieder auf
  momentumDate: string | null; // letzter aktiver Tag (YYYY-MM-DD)
  activeDays: string[];        // aktive Tage, rollierend, fürs wohlwollende Wochenfenster
  lastGap: number;             // Tage Pause beim letzten Besuch (für „schön, dass du wieder da bist“)
  isManager: boolean;          // sieht dezente Manager-Impulse, nie Einzeldaten

  // One Clear Ask, adaptive Schwierigkeit: gelöste Bitten schalten Level frei.
  ocaSolved: number;

  // 1:1 Companion (Leadership), local per manager, carry-over between sessions.
  oneOnOnes: OooSession[];

  // Trust layer: one-time privacy intro shown before any data entry (persists across resets).
  privacyIntroSeen: boolean;

  // Hi guide: one-time interactive intro tour (persists across resets; replayable via the helper).
  tourSeen: boolean;

  // Onboarding: new users are sent through the DISC assessment first; this lets them defer it.
  assessmentSkipped: boolean;
  // Are they a fresh joiner or an established employee? Only newcomers get the
  // First Week Quest / onboarding content pushed on Home. null = not asked yet.
  tenure: "new" | "existing" | null;

  // Coffee Roulette (Connection & Bonding), local participation state. Feedback is anonymous.
  coffeeEnabled: boolean;
  coffeeCadence: CoffeeCadence;
  coffeePref: CoffeePref;
  coffeePaused: boolean;
  coffeeMet: string[];   // member ids already matched with (to avoid repeats)
  coffeeGood: number;    // anonymous feedback tally, only informs matching
  coffeeMeh: number;

  // Boundary Builder (Stress & Recovery): one boundary held for a week, forgiving daily log. Local only.
  boundary: { text: string; start: string; log: Record<string, boolean> } | null;
  // Recovery Wins (Stress & Recovery): small recovery moments, private by default. Local only.
  recovery: { id: string; date: string; text: string; shared: boolean }[];
  // Strength Spotting (Resilience): private, growing collection of strengths (own + received). Local only.
  strengths: { id: string; text: string; moment?: string; source: "self" | "received"; date: string }[];
  // The Comeback (Resilience): private comeback kit, 3-5 personal recovery strategies. Local only.
  comebackKit: string[];
  // 2.5 freshness: which game was opened when (game key, module id, ymd). One
  // entry per game+day, capped. Powers "last played / this week" instead of %.
  playLog: { k: string; m: string; d: string }[];

  // Team Pulse Survey (quarterly, anonymous). Only the fact of participation plus
  // the own answers stay on this device (they feed the aggregate in demo mode).
  // Never synced with a name attached; team results are aggregates only.
  pulseCycle: string | null;                          // cycle of the last submission, e.g. "Q3 2026"
  pulseAnswers: Record<number, number | string> | null;

  hydrate: (partial: Partial<HiState>) => void; // fill from backend on login
  setEmail: (email: string) => void;
  setProfile: (profile: DiscProfile) => void;
  setShareWithTeam: (on: boolean) => void;
  setNotify: (on: boolean) => void;
  setMood: (mood: number) => void;
  setMoodShare: (share: boolean) => void;             // heutigen Eintrag anonym beitragen (merkt die Wahl)
  setMoodNote: (date: string, note: string) => void;  // private Notiz zu einem Tag
  recordDeckAnswer: (questionId: string, optionId: string) => void;
  addGratitude: (text: string) => void;
  fwqStartJourney: () => void;     // setzt das Startdatum, falls noch nicht gesetzt
  fwqCompleteQuest: (id: string) => void;
  recordVisit: () => void;         // verzeihendes Momentum, einmal pro Tag beim Öffnen
  incrementOca: () => void;        // eine Bitte abgeschlossen (adaptive Schwierigkeit)
  oooCreate: (partner: string) => string;              // new 1:1, carries over open agreements; returns id
  oooUpdate: (id: string, patch: Partial<OooSession>) => void;
  oooRemove: (id: string) => void;
  setPrivacyIntroSeen: () => void;
  setTourSeen: () => void;
  setAssessmentSkipped: () => void;
  setTenure: (tenure: "new" | "existing") => void;
  coffeeSet: (patch: Partial<Pick<HiState, "coffeeEnabled" | "coffeeCadence" | "coffeePref" | "coffeePaused">>) => void;
  coffeeAddMet: (id: string) => void;
  coffeeRate: (good: boolean) => void;
  boundaryCommit: (text: string) => void;         // start a fresh one-week boundary
  boundaryMark: (day: string, held: boolean) => void; // forgiving daily touchpoint
  boundaryEnd: () => void;                          // end the week / clear for a new one
  addRecovery: (text: string, shared: boolean) => void; // log a recovery moment
  addStrength: (text: string, moment: string, source: "self" | "received") => void; // add to strengths collection
  setComebackKit: (items: string[]) => void;        // save the comeback kit
  recordPlay: (gameKey: string, moduleId: string) => void; // freshness log, deduped per game+day
  pulseSubmit: (cycle: string, answers: Record<number, number | string>) => void; // one submission per quarter
  reset: () => void;
}

function ymd(d: Date): string { return d.toISOString().slice(0, 10); }

/**
 * Central app state. Persisted to localStorage today; the same shape will be
 * backed by Supabase (auth + profiles row) once the backend is wired in.
 */
export const useStore = create<HiState>()(
  persist(
    (set) => ({
      email: null,
      displayName: null,
      department: null,
      country: null,
      teamId: null,
      profileLoaded: false,
      discType: null,
      scores: null,
      profile: null,
      shareWithTeam: false,
      notify: false,
      mood: null,
      moodHistory: {},
      moodShareDefault: false,
      gratitude: [],
      deckAnswers: {},
      streakCurrent: 0,
      streakLongest: 0,
      lastAnsweredDate: null,
      todayCount: 0,
      fwqStart: null,
      fwqDone: [],
      momentum: 0,
      momentumDate: null,
      activeDays: [],
      lastGap: 0,
      isManager: false,
      ocaSolved: 0,
      oneOnOnes: [],
      privacyIntroSeen: false,
      tourSeen: false,
      assessmentSkipped: false,
      tenure: null,
      coffeeEnabled: false,
      coffeeCadence: "weekly",
      coffeePref: "any",
      coffeePaused: false,
      coffeeMet: [],
      coffeeGood: 0,
      coffeeMeh: 0,
      boundary: null,
      recovery: [],
      strengths: [],
      comebackKit: [],
      playLog: [],
      pulseCycle: null,
      pulseAnswers: null,
      hydrate: (partial) => set(partial),
      setEmail: (email) => set({ email }),
      setProfile: (profile) => set({ profile, discType: profile.primary, scores: profile.percent }),
      setShareWithTeam: (shareWithTeam) => set({ shareWithTeam }),
      setNotify: (notify) => set({ notify }),
      setMood: (mood) => set((s) => {
        const today = ymd(new Date());
        const prev = s.moodHistory[today];
        return { mood, moodHistory: { ...s.moodHistory, [today]: { mood, share: prev?.share ?? s.moodShareDefault, note: prev?.note } } };
      }),
      setMoodShare: (share) => set((s) => {
        const today = ymd(new Date());
        const prev = s.moodHistory[today];
        const entry = prev ?? (s.mood ? { mood: s.mood, share, note: undefined } : null);
        return { moodShareDefault: share, ...(entry ? { moodHistory: { ...s.moodHistory, [today]: { ...entry, share } } } : {}) };
      }),
      setMoodNote: (date, note) => set((s) => {
        const prev = s.moodHistory[date];
        if (!prev) return {};
        return { moodHistory: { ...s.moodHistory, [date]: { ...prev, note: note.trim() || undefined } } };
      }),
      recordDeckAnswer: (questionId, optionId) =>
        set((s) => {
          const deckAnswers = { ...s.deckAnswers, [questionId]: optionId };
          const today = ymd(new Date());
          if (s.lastAnsweredDate === today) {
            return { deckAnswers, todayCount: s.todayCount + 1 };
          }
          // first answer of a new day → update streak (yesterday continues it, gap resets it)
          const yesterday = ymd(new Date(Date.now() - 86400000));
          const streakCurrent = s.lastAnsweredDate === yesterday ? s.streakCurrent + 1 : 1;
          return {
            deckAnswers,
            streakCurrent,
            streakLongest: Math.max(s.streakLongest, streakCurrent),
            lastAnsweredDate: today,
            todayCount: 1,
          };
        }),
      addGratitude: (text) => set((s) => ({ gratitude: [{ date: ymd(new Date()), text }, ...s.gratitude] })),
      fwqStartJourney: () => set((s) => (s.fwqStart ? {} : { fwqStart: ymd(new Date()) })),
      fwqCompleteQuest: (id) => set((s) => (s.fwqDone.includes(id) ? {} : { fwqDone: [...s.fwqDone, id], fwqStart: s.fwqStart ?? ymd(new Date()) })),
      recordVisit: () => set((s) => {
        const today = ymd(new Date());
        if (s.momentumDate === today) return {}; // heute schon gezählt
        const gap = s.momentumDate ? Math.max(0, Math.round((Date.parse(today) - Date.parse(s.momentumDate)) / 86400000) - 1) : 0;
        const decayed = Math.round(s.momentum * Math.pow(0.82, gap)); // sanfter Zerfall, nie hart auf 0
        const momentum = Math.min(100, decayed + 14);
        const activeDays = [...s.activeDays.filter((d) => Date.parse(today) - Date.parse(d) <= 28 * 86400000), today];
        return { momentum, momentumDate: today, activeDays, lastGap: gap };
      }),
      incrementOca: () => set((s) => ({ ocaSolved: s.ocaSolved + 1 })),
      oooCreate: (partner) => {
        const uid = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
        const id = uid();
        set((s) => {
          // carry over open agreements from the most recent session with this report (the red thread)
          const prev = [...s.oneOnOnes].reverse().find((o) => o.partner === partner);
          const carried: OooAgreement[] = prev
            ? prev.agreements.filter((a) => !a.done).map((a) => ({ ...a, id: uid(), carried: true }))
            : [];
          const session: OooSession = { id, partner, date: ymd(new Date()), topics: [], steps: [], notes: "", agreements: carried, mood: null, closed: false };
          return { oneOnOnes: [...s.oneOnOnes, session] };
        });
        return id;
      },
      oooUpdate: (id, patch) => set((s) => ({ oneOnOnes: s.oneOnOnes.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      oooRemove: (id) => set((s) => ({ oneOnOnes: s.oneOnOnes.filter((o) => o.id !== id) })),
      setPrivacyIntroSeen: () => set({ privacyIntroSeen: true }),
      setTourSeen: () => set({ tourSeen: true }),
      setAssessmentSkipped: () => set({ assessmentSkipped: true }),
      setTenure: (tenure) => set({ tenure }),
      coffeeSet: (patch) => set(patch),
      coffeeAddMet: (id) => set((s) => (s.coffeeMet.includes(id) ? {} : { coffeeMet: [...s.coffeeMet, id] })),
      coffeeRate: (good) => set((s) => (good ? { coffeeGood: s.coffeeGood + 1 } : { coffeeMeh: s.coffeeMeh + 1 })),
      boundaryCommit: (text) => set({ boundary: { text: text.trim(), start: ymd(new Date()), log: {} } }),
      boundaryMark: (day, held) => set((s) => (s.boundary ? { boundary: { ...s.boundary, log: { ...s.boundary.log, [day]: held } } } : {})),
      boundaryEnd: () => set({ boundary: null }),
      addRecovery: (text, shared) => set((s) => ({ recovery: [{ id: Math.random().toString(36).slice(2, 10), date: ymd(new Date()), text: text.trim(), shared }, ...s.recovery] })),
      addStrength: (text, moment, source) => set((s) => ({ strengths: [{ id: Math.random().toString(36).slice(2, 10), text: text.trim(), moment: moment.trim() || undefined, source, date: ymd(new Date()) }, ...s.strengths] })),
      setComebackKit: (items) => set({ comebackKit: items }),
      recordPlay: (gameKey, moduleId) => set((s) => {
        const today = ymd(new Date());
        if (s.playLog.some((p) => p.k === gameKey && p.d === today)) return {};
        return { playLog: [{ k: gameKey, m: moduleId, d: today }, ...s.playLog].slice(0, 300) };
      }),
      pulseSubmit: (cycle, answers) => set({ pulseCycle: cycle, pulseAnswers: answers }),
      reset: () => set({ email: null, displayName: null, department: null, country: null, teamId: null, profileLoaded: false, discType: null, scores: null, profile: null, shareWithTeam: false, notify: false, mood: null, moodHistory: {}, moodShareDefault: false, gratitude: [], deckAnswers: {}, streakCurrent: 0, streakLongest: 0, lastAnsweredDate: null, todayCount: 0, fwqStart: null, fwqDone: [], momentum: 0, momentumDate: null, activeDays: [], lastGap: 0, isManager: false, ocaSolved: 0, oneOnOnes: [], coffeeEnabled: false, coffeeCadence: "weekly", coffeePref: "any", coffeePaused: false, coffeeMet: [], coffeeGood: 0, coffeeMeh: 0, boundary: null, recovery: [], strengths: [], comebackKit: [], playLog: [], pulseCycle: null, pulseAnswers: null, assessmentSkipped: false, tenure: null }),
    }),
    { name: "hi-app" }
  )
);
