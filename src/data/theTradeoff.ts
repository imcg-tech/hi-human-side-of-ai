/* The Trade-Off (Performance-Driven Culture). Honest expectation management &
   shared prioritization against the "everything at once, immediately, perfect" culture.
   Deliberately leaving things out is the win. No "do more" framing, no ranking. */

export interface TradeoffOption { label: string; consequence: string; }
export interface Scenario {
  id: string;
  title: string;
  situation: string;
  pick: number;        // how many are deliberately chosen
  options: TradeoffOption[];
}

export const SCENARIOS: Scenario[] = [
  { id: "week", title: "The overloaded week", pick: 2,
    situation: "This week you have capacity for 2 of 4 important tasks. All four seem urgent.",
    options: [
      { label: "Important client", consequence: "Relationship & revenue, but takes a lot of time." },
      { label: "Internal project", consequence: "Pays off long-term, but isn't acutely visible." },
      { label: "Critical bugfix", consequence: "Protects against an outage, not glamorous." },
      { label: "Exec presentation", consequence: "High visibility, but demanding." },
    ] },
  { id: "iron", title: "The iron triangle", pick: 2,
    situation: "A project is supposed to get faster, better AND bigger. At most two of those at once. Choose deliberately.",
    options: [
      { label: "Faster", consequence: "Done sooner, but less scope or polish." },
      { label: "Better", consequence: "High quality, but more time or less scope." },
      { label: "Bigger", consequence: "More features, but slower or more unfinished." },
    ] },
  { id: "request", title: "The new request", pick: 3,
    situation: "Mid-sprint, a new “urgent” request comes from above. Something has to give. Keep three, make the trade-off visible.",
    options: [
      { label: "Sprint goal A", consequence: "Committed, others are waiting on it." },
      { label: "Sprint goal B", consequence: "Almost done, would be a shame to drop." },
      { label: "Sprint goal C", consequence: "Important, but not critical this week." },
      { label: "New urgent request", consequence: "From above, but deliberately displaces something else." },
    ] },
  { id: "quality", title: "Quality vs. deadline", pick: 2,
    situation: "The deadline is tight. Decide what's “good enough” for the date and what really needs perfection.",
    options: [
      { label: "Core feature solid", consequence: "Has to work, care pays off here." },
      { label: "Nice-to-have details", consequence: "Lovely, but dispensable for the date." },
      { label: "Comprehensive tests", consequence: "Safety, but costs time." },
      { label: "Polish & design", consequence: "Impact, can be added later." },
    ] },
];

export const FORMULA = "Yes to X means a deliberate No or Later to Y. We say both transparently.";

export const PRINCIPLES = [
  "Every yes has a price. Naming it is strength, not weakness.",
  "A transparent “later” beats silently not getting it done.",
  "Prioritization is a team effort, not individual overwhelm.",
];

export const REFLECTIONS = [
  "Where do we act, day to day, as if we could do everything at once?",
  "How does it feel to deliberately NOT do something?",
  "What makes a “no” easier, for us and for those who hear it?",
];
