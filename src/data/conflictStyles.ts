/* Conflict Styles (Conflict & Repair), educational solo game after Thomas-Kilmann.
   Five conflict modes on two axes: assertiveness (pushing your concern) and
   cooperativeness (accommodating the other's). No style is "best", each fits some
   moments. Private, local only, a lens not a label. */

export type StyleId = "competing" | "collaborating" | "compromising" | "avoiding" | "accommodating";

export interface ConflictStyle {
  id: StyleId;
  name: string;
  tagline: string;      // one-line "sounds like"
  color: string;
  assert: number;       // 0..100
  coop: number;         // 0..100
  desc: string;
  helps: string[];      // when it serves you
  watch: string[];      // when it costs you
}

export const CONFLICT_STYLES: ConflictStyle[] = [
  {
    id: "competing", name: "Competing", tagline: "“I push for what I think is right.”", color: "#E0794B", assert: 90, coop: 15,
    desc: "High assertiveness, low cooperation. You stand your ground and go for your position, even if others push back.",
    helps: ["Emergencies that need a fast, firm call", "Unpopular but necessary decisions", "When you're being taken advantage of and need to hold a line"],
    watch: ["Can shut others down and erode trust", "People stop speaking up around you", "Turns a small issue into a power struggle"],
  },
  {
    id: "collaborating", name: "Collaborating", tagline: "“Let's find something that works for both of us.”", color: "#5CA396", assert: 90, coop: 90,
    desc: "High on both. You dig into what each side really needs and look for a solution that genuinely satisfies everyone.",
    helps: ["High-stakes issues where both concerns matter", "Building real buy-in and commitment", "Finding a creative option no one had alone"],
    watch: ["Takes time and energy, overkill for small stuff", "Can stall when the other side won't engage", "Easy to get exploited by someone just competing"],
  },
  {
    id: "compromising", name: "Compromising", tagline: "“Let's meet in the middle.”", color: "#4E7CB0", assert: 50, coop: 50,
    desc: "Moderate on both. You look for a fair middle ground, each gives a little, so you can move on.",
    helps: ["Quick, good-enough fixes under time pressure", "Equal-power standoffs", "A temporary settlement while you find something better"],
    watch: ["No one is fully satisfied", "Can skip past a better collaborative solution", "“Splitting the difference” isn't always the fair split"],
  },
  {
    id: "avoiding", name: "Avoiding", tagline: "“Not now, maybe not at all.”", color: "#8C86A0", assert: 15, coop: 15,
    desc: "Low on both. You step around the conflict, delay it, or let it pass rather than engage.",
    helps: ["Genuinely trivial issues", "Cooling off when emotions are too high", "Buying time when you need more information"],
    watch: ["Real problems fester and grow", "Others feel unheard or dismissed", "Decisions stall and resentment builds quietly"],
  },
  {
    id: "accommodating", name: "Accommodating", tagline: "“It matters more to you, so okay.”", color: "#5C6BC0", assert: 15, coop: 90,
    desc: "Low assertiveness, high cooperation. You set your own concern aside to meet the other person's, often to keep the peace.",
    helps: ["When you're wrong, or the issue matters far more to them", "Showing goodwill and building credit", "Preserving an important relationship over a small point"],
    watch: ["Your own needs get buried", "Quiet resentment adds up over time", "Others may learn to expect you to give in"],
  },
];

export const styleById = (id: StyleId) => CONFLICT_STYLES.find((s) => s.id === id)!;

export interface CSScenario {
  situation: string;
  options: { id: StyleId; text: string }[]; // shuffled at render
}

export const CS_SCENARIOS: CSScenario[] = [
  { situation: "A teammate keeps missing a deadline you depend on. In the moment, you tend to…", options: [
    { id: "competing", text: "Call it out directly and insist it changes now." },
    { id: "collaborating", text: "Ask what's getting in the way and fix it together." },
    { id: "compromising", text: "Agree a later but firm date you can both live with." },
    { id: "avoiding", text: "Let it slide for now and hope it improves." },
    { id: "accommodating", text: "Quietly pick up the slack yourself." },
  ] },
  { situation: "In a heated meeting, you and someone clearly disagree. You usually…", options: [
    { id: "competing", text: "Make your case firmly until you win the point." },
    { id: "collaborating", text: "Dig into what's really behind each position." },
    { id: "compromising", text: "Find a quick middle ground so you can move on." },
    { id: "avoiding", text: "Go quiet and let it pass." },
    { id: "accommodating", text: "Defer to them to keep the peace." },
  ] },
  { situation: "Someone gives you feedback that feels unfair. Your first move is to…", options: [
    { id: "competing", text: "Push back and defend your side." },
    { id: "collaborating", text: "Ask questions to understand where it's coming from." },
    { id: "compromising", text: "Accept part of it and let part of it go." },
    { id: "avoiding", text: "Nod and change the subject." },
    { id: "accommodating", text: "Take it on board, even if you don't fully agree." },
  ] },
  { situation: "Your team can't agree on a priority. You tend to…", options: [
    { id: "competing", text: "Argue hard for the option you believe in." },
    { id: "collaborating", text: "Get everyone's real needs on the table and build a plan." },
    { id: "compromising", text: "Broker a split everyone can live with." },
    { id: "avoiding", text: "Wait and see if it resolves itself." },
    { id: "accommodating", text: "Go with whatever the others want." },
  ] },
  { situation: "A colleague crossed a small line with you. You…", options: [
    { id: "competing", text: "Tell them straight that it wasn't okay." },
    { id: "collaborating", text: "Raise it and talk through what you both need." },
    { id: "compromising", text: "Mention it lightly and meet halfway." },
    { id: "avoiding", text: "Let it go, it's not worth it." },
    { id: "accommodating", text: "Give them the benefit of the doubt and move on." },
  ] },
];
