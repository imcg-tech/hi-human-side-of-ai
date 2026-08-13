export type FFLevel = "leicht" | "mittel" | "wild";
export interface FFCard {
  level: FFLevel;
  text: string;
  /** Card-specific reflection question (solo mode). */
  reflection: string;
  /** Card-specific micro-lesson, revealed after the player thought for themselves. */
  lesson: string;
  /** A ready-to-use sentence for the real-life version of this moment. */
  steal: string;
}

export const FF_LEVEL: Record<FFLevel, { label: string; color: string }> = {
  leicht: { label: "Easy", color: "var(--candy-blue)" },
  mittel: { label: "Medium", color: "var(--candy-yellow)" },
  wild: { label: "Wild", color: "var(--danger)" },
};

/* Generic prompts for the LIVE version, where the learning happens in the
   team conversation itself. Solo mode uses the card-specific fields instead. */
export const FF_REFLECTIONS = [
  "What would your first step be?",
  "What would you learn from it?",
  "How would you explain it to the team?",
];

export const FF_CARDS: FFCard[] = [
  {
    level: "leicht",
    text: "You presented the wrong deck in an all-hands, and only notice after slide 5.",
    reflection: "Confess on the spot, or bluff through and hope nobody noticed?",
    lesson: "The cover-up always costs more than the slip. Everyone has watched a presenter slowly melt while bluffing. A one-liner with a smile resets the room in ten seconds, and what people remember afterwards is your calm, not your slide.",
    steal: "Wrong deck, that's on me. Thirty seconds, the real one is better anyway.",
  },
  {
    level: "leicht",
    text: "Your mic was on the whole time. The team heard you grumbling about the meeting.",
    reflection: "They heard it. What do you say in the first minute after you realize?",
    lesson: "Being caught venting is a trust moment: something private became public. Denial poisons it. A straight apology for the tone, plus the honest, constructive version of your point, often leaves MORE trust than before. The vent happened, so use its content.",
    steal: "You weren't meant to hear that, and I'm sorry for the tone. The fair version of my point is this: …",
  },
  {
    level: "leicht",
    text: "You sent an email to “everyone” that was only meant for one person.",
    reflection: "Recall won't work. Who do you talk to first, and in what order?",
    lesson: "Damage control has an order: first the person most affected, personally and fast. Then the broad correction. The apology tour comes last. And the upstream lesson: written words travel, so sensitive things belong in a call, not in a draft next to Reply All.",
    steal: "That mail reached more people than intended. I wanted you to hear the context from me directly.",
  },
  {
    level: "leicht",
    text: "You forgot to mute your mic on a call. No one interrupted you.",
    reflection: "Nobody said anything. Do you name it, or let it slide?",
    lesson: "The awkward-silence trap: everyone noticed, nobody speaks, and the silence gets more expensive by the minute. Naming your own slip, lightly, releases the whole room. Humor about yourself is a leadership move: it licenses everyone else to be human too.",
    steal: "That was my unplanned radio show, sorry about that. Where were we?",
  },
  {
    level: "mittel",
    text: "Your most important project deliverable vanishes from the cloud three hours before the deadline.",
    reflection: "Three hours left. What are the first two things you do?",
    lesson: "In a real emergency the order is: stabilize, inform, rebuild. Most people hide and rebuild in silence, hoping to make it. But an early heads-up buys options, an extension, help, a scope cut. A missed deadline plus a surprise buys nothing. Bad news early is a service, not a weakness.",
    steal: "Heads-up: the deliverable is gone, recovery is running. Worst case I need until tomorrow 10:00. What matters most to have first?",
  },
  {
    level: "mittel",
    text: "You take over a meeting at short notice and only realize live that you prepared the wrong topic.",
    reflection: "The room is looking at you. Bluff through, or reset?",
    lesson: "Fifteen honest seconds beat forty-five bluffed minutes. Name it, then re-contract the time: what can this hour still usefully deliver? Improvising honestly almost always lands better than performing preparation you don't have. Rooms forgive surprise, they don't forgive pretense.",
    steal: "I prepared the wrong topic, that's on me. Here's what I can usefully do with this hour instead.",
  },
  {
    level: "mittel",
    text: "A client escalates publicly on LinkedIn. And mentions your name.",
    reflection: "It's public and it's personal. What's your next move, and where does it happen?",
    lesson: "Public conflict wants a private resolution and a public one-liner, in that order. Never argue the details in the comments: move it to a call, and leave the audience exactly one calm, factual reply. And never answer in the first wave of anger, the internet remembers drafts you wish it didn't.",
    steal: "Thanks for the frankness, that's not the experience we want you to have. I've messaged you directly, and I'll close the loop here once it's resolved.",
  },
  {
    level: "mittel",
    text: "You accidentally sent the wrong project status to management.",
    reflection: "Do you correct it quietly in a 1:1, or loudly where everyone saw it?",
    lesson: "Correct with the same reach as the error. A wrong status fixed only in a quiet side conversation keeps the false picture alive for everyone else who read it. Same channel, same audience, clearly labeled as a correction: that's what keeps your reporting trusted in the long run.",
    steal: "Correction to my last status: that number was wrong, here is the right one. Anything decided on the old number is worth a second look.",
  },
  {
    level: "wild",
    text: "You're the only one who knows the password to the production system, and you've forgotten it.",
    reflection: "Past the panic: what does this moment reveal about how you've set things up?",
    lesson: "The forgotten password isn't the real fail. Being a single point of failure is. Anything only one person can do is a risk wearing that person's name. Feeling indispensable reads like job security, but it blocks the team, your vacations, and your promotion alike. Document, share, rotate.",
    steal: "I just noticed I'm the only one who can do X. Let's fix that this week, hit-by-a-bus rule.",
  },
  {
    level: "wild",
    text: "Your laptop catches fire right before an investor demo. Literally.",
    reflection: "The demo is gone. What do you actually still have?",
    lesson: "When the artifact dies, the story survives. Investors and clients buy conviction and clarity more than pixels; whoever can tell their thing without slides was always the real show. Practical version: know your three core points by heart. Everything else is decoration.",
    steal: "Tech has left the building, so you're getting the version with full eye contact. The three things that matter are …",
  },
  {
    level: "wild",
    text: "You get locked out of the system during a live webinar with 500 viewers.",
    reflection: "500 people are watching a frozen screen. What do they need from you right now?",
    lesson: "An audience doesn't need perfection, it needs a signal that someone is in control. Narrate the gap: what happened, how long it takes, what to do meanwhile. Dead air is the only real failure. A hiccup handled with routine often becomes the moment people call the session “human”.",
    steal: "You've found the unplanned intermission. Two minutes to fix it. Meanwhile: drop into the chat where you're joining from.",
  },
  {
    level: "wild",
    text: "Your competitor stole your entire pitch. And presented it better.",
    reflection: "Rage aside: what does “presented it better” actually tell you?",
    lesson: "Painful, and also the most honest compliment plus free consulting you'll ever get: the idea was strong, the delivery was beatable. Ideas are rarely a moat, execution and story are. Study their version like game film: what exactly landed better, and what do you own that can't be copied?",
    steal: "They validated the idea. Now we win on what can't be stolen: what do we have that they don't?",
  },
];
