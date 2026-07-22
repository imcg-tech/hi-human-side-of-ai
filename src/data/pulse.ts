/* Team Pulse Survey: vierteljährliche anonyme Engagement-Umfrage (Fragenkatalog
   portiert aus dem Fluido-Survey-Projekt). Konkrete Multiple-Choice-Fragen statt
   generischer Zustimmungs-Skalen; jede Option trägt einen versteckten Score 1-5,
   "favourable" = 4+. Gespeichert wird nur der Options-Index, nie der Score.
   Anonymität: nur Aggregate, nie Einzelantworten, Schwelle PULSE_MIN_GROUP. */

export type PulseDim = "eng" | "role" | "lead" | "dev" | "cul" | "well" | "fair";

export const PULSE_DIMS: Record<PulseDim, string> = {
  eng: "Engagement",
  role: "Role & Purpose",
  lead: "Leadership",
  dev: "Development",
  cul: "Culture & Belonging",
  well: "Wellbeing",
  fair: "Fairness & Reward",
};

export type PulseQuestion =
  | { d: PulseDim; t: string; type: "enps" }
  | { d: PulseDim; t: string; type: "choice"; o: [string, number][] }
  | { d: null; t: string; type: "text" };

/* Wie beim Mood-Puls gilt: Team-Werte nur ab einer Mindestzahl anonymer
   Beiträge. Der Survey nutzt 5 (kleine Gruppen + 30 Antworten pro Person
   sind re-identifizierbarer als ein einzelner Mood-Wert). */
export const PULSE_MIN_GROUP = 5;

export const PULSE_QUESTIONS: PulseQuestion[] = [
  { d: "eng", t: "How likely are you to recommend your company as a place to work?", type: "enps" },
  { d: "eng", t: "When a new workday starts, how do you usually feel about it?", type: "choice", o: [
    ["Energised, I look forward to most days", 5],
    ["Fine, it's a good job", 4],
    ["Flat, I mostly go through the motions", 2],
    ["Drained, I have to push myself to start", 1]] },
  { d: "eng", t: "Have you thought about leaving in the last six months?", type: "choice", o: [
    ["No, not really", 5],
    ["Briefly, but nothing serious", 4],
    ["Yes, I've browsed other openings", 2],
    ["Yes, I'm actively applying or interviewing", 1]] },
  { d: "eng", t: "Do you see yourself still working here in two years?", type: "choice", o: [
    ["Yes, and in a bigger role", 5],
    ["Yes, if things stay as they are", 4],
    ["Only if some things change", 2],
    ["Probably not", 1]] },
  { d: "role", t: "Do your current role and tasks reflect what you actually want to be doing?", type: "choice", o: [
    ["Yes, this is exactly the work I want", 5],
    ["Mostly, with a few tasks I'd gladly drop", 4],
    ["Only partly, too much of my week isn't why I joined", 2],
    ["No, my goals lie somewhere else", 1]] },
  { d: "role", t: "How much of your week goes into work you consider genuinely useful?", type: "choice", o: [
    ["Almost all of it", 5],
    ["Most of it, with some busywork", 4],
    ["About half, meetings and admin eat the rest", 2],
    ["Less than half", 1]] },
  { d: "role", t: "Do you know what you need to achieve this quarter to be doing well?", type: "choice", o: [
    ["Yes, my goals are clear and measurable", 5],
    ["Mostly, though priorities shift a lot", 4],
    ["Vaguely, I'm often guessing", 2],
    ["No, nobody has defined that with me", 1]] },
  { d: "lead", t: "Overall, how is your team lead doing?", type: "choice", o: [
    ["Great, I feel genuinely supported", 5],
    ["Good, though often stretched too thin", 4],
    ["Mixed, it depends on the week", 2],
    ["Not well, I don't get what I need", 1]] },
  { d: "lead", t: "When did your team lead last give you feedback you could actually use?", type: "choice", o: [
    ["Within the last few weeks", 5],
    ["Within the last few months", 4],
    ["Only at my last formal review", 2],
    ["I honestly can't remember", 1]] },
  { d: "lead", t: "If you raised a problem with your team lead tomorrow, what would happen?", type: "choice", o: [
    ["They'd take it seriously and act on it", 5],
    ["They'd listen, action depends on the topic", 4],
    ["They'd listen, but little would change", 2],
    ["I wouldn't raise it in the first place", 1]] },
  { d: "lead", t: "How much do you trust the decisions of senior leadership?", type: "choice", o: [
    ["A lot, they communicate openly and deliver", 5],
    ["Reasonably, though some decisions puzzle me", 4],
    ["Not much, too much happens behind closed doors", 2],
    ["Very little", 1]] },
  { d: "lead", t: "How well informed do you feel about what's happening in the company?", type: "choice", o: [
    ["Well informed, news reaches me early and openly", 5],
    ["Informed enough for my day-to-day", 4],
    ["Often among the last to know", 2],
    ["I mostly hear things through the grapevine", 1]] },
  { d: "dev", t: "Where is your current role taking you?", type: "choice", o: [
    ["Towards where I want to be", 5],
    ["I'm learning, though without a clear direction", 4],
    ["I'm standing still", 2],
    ["Away from my goals", 1]] },
  { d: "dev", t: "When did you last learn something at work that moved you forward?", type: "choice", o: [
    ["This month", 5],
    ["This quarter", 4],
    ["At some point this year", 2],
    ["Longer ago than that", 1]] },
  { d: "dev", t: "Has anyone talked with you about your career direction in the last six months?", type: "choice", o: [
    ["Yes, and it led to concrete steps", 5],
    ["Yes, a good talk, but no follow-up yet", 3],
    ["Only when I pushed for it myself", 2],
    ["No", 1]] },
  { d: "cul", t: "In team discussions, how freely do you speak your mind?", type: "choice", o: [
    ["Freely, including disagreeing with my lead", 5],
    ["Mostly, unless the topic is sensitive", 4],
    ["Carefully, I weigh every word", 2],
    ["I mostly keep quiet", 1]] },
  { d: "cul", t: "When you're stuck and need help, what usually happens?", type: "choice", o: [
    ["Someone steps in quickly, that's normal here", 5],
    ["I get help if I ask the right person", 4],
    ["Help is hit and miss", 2],
    ["I'm mostly on my own", 1]] },
  { d: "cul", t: "How connected do you feel to your colleagues, also when working remotely?", type: "choice", o: [
    ["Very, we're a real team", 5],
    ["Fairly connected", 4],
    ["Somewhat isolated", 2],
    ["Very isolated", 1]] },
  { d: "cul", t: "How does working with other teams feel?", type: "choice", o: [
    ["Smooth, handovers are clean", 5],
    ["Decent, with some friction", 4],
    ["Slow, too many loops and unclear owners", 2],
    ["Frustrating, things fall through the cracks", 1]] },
  { d: "cul", t: "Do you live your company's values in your day-to-day work?", type: "choice", o: [
    ["Yes, they genuinely guide how I work", 5],
    ["Mostly, though deadlines sometimes win", 4],
    ["Honestly, I rarely think about them", 2],
    ["I couldn't even name them", 1]] },
  { d: "cul", t: "And the other way around: does the company live up to its own values?", type: "choice", o: [
    ["Yes, decisions consistently reflect them", 5],
    ["Mostly, with some gaps", 4],
    ["Only when it's convenient", 2],
    ["No, they're just words on a wall", 1]] },
  { d: "well", t: "How has your workload been over the last month?", type: "choice", o: [
    ["Healthy, challenging but doable", 5],
    ["Full, but fine for a stretch", 4],
    ["Too high, I'm regularly working late", 2],
    ["Unsustainable, I'm close to burning out", 1]] },
  { d: "well", t: "How often does work spill into your evenings or weekends?", type: "choice", o: [
    ["Rarely or never", 5],
    ["Occasionally, and by my own choice", 4],
    ["Most weeks", 2],
    ["Almost daily", 1]] },
  { d: "well", t: "Do you have the tools and information you need to do your job well?", type: "choice", o: [
    ["Yes, everything I need", 5],
    ["Mostly, with occasional blockers", 4],
    ["Missing tools or info slow me down every week", 2],
    ["No, I fight my setup daily", 1]] },
  { d: "fair", t: "When someone on a team consistently underperforms, what happens?", type: "choice", o: [
    ["It gets addressed openly and fairly", 5],
    ["It gets addressed, but too slowly", 3],
    ["Everyone sees it, nobody acts", 2],
    ["Others quietly absorb the extra work", 1]] },
  { d: "fair", t: "How do you feel about your pay for the work you do?", type: "choice", o: [
    ["Fairly paid", 5],
    ["A bit below where it should be", 3],
    ["I can't tell, pay here is a black box", 2],
    ["Clearly underpaid", 1]] },
  { d: "fair", t: "Do you understand how raises and promotions are decided?", type: "choice", o: [
    ["Yes, the criteria are clear and applied fairly", 5],
    ["The criteria are clear, but not always applied fairly", 3],
    ["The criteria are vague", 2],
    ["It feels completely arbitrary", 1]] },
  { d: "fair", t: "Is good work noticed here?", type: "choice", o: [
    ["Yes, recognition comes reliably", 5],
    ["Sometimes, it depends on who you work with", 3],
    ["Rarely, quiet work goes unseen", 2],
    ["No", 1]] },
  { d: null, t: "What is the ONE thing we should change to make this a better place to work?", type: "text" },
  { d: null, t: "What is working well that we should keep doing?", type: "text" },
];

/* Quartals-Zyklus, z.B. "Q3 2026". Eine Teilnahme pro Person und Quartal. */
export function currentCycle(d: Date = new Date()): string {
  return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
}

export type PulseAnswers = Record<number, number | string>;

/* Deterministischer PRNG, damit die Demo-Antworten pro Session stabil sind
   (gleiche Werte bei jedem Render, kein Flackern im Dashboard). */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SAMPLE_COMMENTS_CHANGE = [
  "Fewer status meetings, more time to actually do the work.",
  "Clearer priorities from quarter to quarter.",
  "More transparency on how pay and promotions work.",
];
const SAMPLE_COMMENTS_KEEP = [
  "Keep the flexible working setup exactly as it is.",
  "The learning budget, please keep it.",
  "Honest all-hands sessions.",
];

/* Demo: 6 anonyme Antworten aus dem restlichen Team (7 Mitglieder, eine Person
   hat noch nicht teilgenommen). Damit liegt die Gruppe über der Schwelle und
   das Dashboard ist in der Demo sichtbar. */
export const MOCK_PULSE_RESPONSES: PulseAnswers[] = (() => {
  const rand = mulberry32(20260721);
  const out: PulseAnswers[] = [];
  for (let m = 0; m < 6; m++) {
    const a: PulseAnswers = {};
    PULSE_QUESTIONS.forEach((q, i) => {
      if (q.type === "enps") a[i] = 5 + Math.floor(rand() * 6); // 5..10
      else if (q.type === "choice") {
        const r = rand();
        a[i] = r < 0.38 ? 0 : r < 0.72 ? 1 : r < 0.9 ? 2 : 3;
      } else if (rand() < 0.4) {
        const pool = q.t.includes("keep doing") ? SAMPLE_COMMENTS_KEEP : SAMPLE_COMMENTS_CHANGE;
        a[i] = pool[Math.floor(rand() * pool.length)];
      }
    });
    out.push(a);
  }
  return out;
})();

export interface PulseDimStat { d: PulseDim; name: string; avg: number; fav: number }
export interface PulseStats {
  n: number;
  enps: number;         // -100..100
  overall: number;      // 1..5
  favShare: number;     // 0..1
  dims: PulseDimStat[]; // worst-first
  comments: { q: string; texts: string[] }[];
}

export function pulseStats(responses: PulseAnswers[]): PulseStats {
  const byDim = {} as Record<PulseDim, { sum: number; n: number; fav: number }>;
  (Object.keys(PULSE_DIMS) as PulseDim[]).forEach((d) => (byDim[d] = { sum: 0, n: 0, fav: 0 }));
  let promoters = 0, detractors = 0, enpsN = 0;
  const comments: { q: string; texts: string[] }[] = PULSE_QUESTIONS
    .filter((q) => q.type === "text").map((q) => ({ q: q.t, texts: [] }));

  responses.forEach((r) => {
    let textIdx = 0;
    PULSE_QUESTIONS.forEach((q, i) => {
      const a = r[i];
      if (q.type === "text") {
        if (typeof a === "string" && a.trim()) comments[textIdx].texts.push(a.trim());
        textIdx++;
        return;
      }
      if (typeof a !== "number") return;
      if (q.type === "enps") {
        enpsN++;
        if (a >= 9) promoters++; else if (a <= 6) detractors++;
      } else {
        const opt = q.o[a];
        if (!opt) return;
        const v = opt[1];
        byDim[q.d].sum += v; byDim[q.d].n++;
        if (v >= 4) byDim[q.d].fav++;
      }
    });
  });

  const dims = (Object.keys(PULSE_DIMS) as PulseDim[])
    .map((d) => ({ d, name: PULSE_DIMS[d], avg: byDim[d].n ? byDim[d].sum / byDim[d].n : 0, fav: byDim[d].n ? byDim[d].fav / byDim[d].n : 0 }))
    .sort((a, b) => a.avg - b.avg);
  const withData = dims.filter((x) => x.avg > 0);
  const overall = withData.length ? withData.reduce((s, x) => s + x.avg, 0) / withData.length : 0;
  const favShare = withData.length ? withData.reduce((s, x) => s + x.fav, 0) / withData.length : 0;
  const enps = enpsN ? Math.round(((promoters - detractors) / enpsN) * 100) : 0;

  return { n: responses.length, enps, overall, favShare, dims, comments };
}

/* Status-Einordnung pro Dimension, gleiche Sprache wie im HI-Design (Badge-Töne). */
export function pulseTag(avg: number): { label: string; tone: "safe" | "info" | "warning" | "danger" } {
  if (avg >= 4) return { label: "Strength", tone: "safe" };
  if (avg >= 3.5) return { label: "Healthy", tone: "info" };
  if (avg >= 3) return { label: "Watch", tone: "warning" };
  return { label: "Priority", tone: "danger" };
}
