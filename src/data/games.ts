/* Interactive mini-games (ported from the prototype), assigned to the module categories.
   Each round: a scenario + answer options; ok=true is the confident/connecting answer. */

export interface GameOption { t: string; ok: boolean; fb: string; }
export interface GameRound {
  msg: string;
  options: GameOption[];
  speaker?: { name: string; flag?: string };
  dim?: string;
}
export type GameKind = "quiz" | "commonground" | "signalnoise" | "failforward" | "crisisroom" | "feedbackclass";

export interface Game {
  key: string;
  category: string; // module id
  emoji: string;
  title: string;
  skill: string;
  intro: string;
  closing: string;
  howItWorks?: string[]; // 2-4 short steps shown on the intro card
  concepts?: string[]; // frameworks / ideas the game draws on (educational context)
  estMinutes?: number; // rough time to play
  metaTags?: string[]; // extra intro-card chips (format, e.g. "Timed", "Private")
  kind?: GameKind; // undefined = "quiz"
  route?: string; // direct route (for live-only games without a solo entry)
  scoreNoun?: string;
  proLabel?: string;
  rounds: GameRound[];
}

export const GAMES: Record<string, Game> = {
  listen: {
    key: "listen", category: "communication", emoji: "🎧", title: "Active listening", skill: "Active listening",
    intro: "A colleague shares something with you. Choose the answer that shows you really listened, instead of immediately judging or giving advice.",
    closing: "Active listening means: mirror first, then respond. Try it today in a real conversation: once, summarize what you heard before you reply.",
    howItWorks: ["Read what a colleague just shared", "Pick the reply that shows you truly heard them", "See instantly why it connects, or misses"],
    concepts: ["Mirroring", "Open questions", "Naming the feeling"],
    estMinutes: 3,
    metaTags: ["Private & solo"],
    rounds: [
      { speaker: { name: "Mara", flag: "🇸🇪" }, msg: "I just can't get the hang of the new tool. I feel like I'm the only one who doesn't get it.", options: [
        { t: "Don't make such a big deal, it's easy.", ok: false, fb: "That belittles and shuts things down. The person doesn't feel heard." },
        { t: "You should just watch the tutorial.", ok: false, fb: "Advice, but too early. The person first wanted to be understood, not solved." },
        { t: "Sounds frustrating, you feel alone with it right now. Want to show me where you're stuck?", ok: true, fb: "Strong! You mirror the feeling and open the conversation. That's exactly how connection happens." },
      ] },
      { speaker: { name: "Kenji", flag: "🇯🇵" }, msg: "I didn't say anything in the meeting, even though I had a different opinion.", options: [
        { t: "Why didn't you say something?!", ok: false, fb: "“Why” questions sound like an accusation and trigger justification." },
        { t: "So you had a different view but held it back. What stopped you?", ok: true, fb: "Perfect: paraphrase + open question. That invites, instead of judging." },
        { t: "Next time just say something.", ok: false, fb: "Well-meant, but it skips over the real concern." },
      ] },
      { speaker: { name: "Luca", flag: "🇮🇹" }, msg: "Since moving to home office, I somehow feel cut off from the team.", options: [
        { t: "Same here! For me it's actually like…", ok: false, fb: "You redirect to yourself, that takes the person's space away." },
        { t: "That's just remote, you have to push through it.", ok: false, fb: "Brushing it off signals: your feeling doesn't count." },
        { t: "Cut off, that sounds lonely. What would help you feel more connected again?", ok: true, fb: "Yes! Name the feeling + ask about the need. That's how real closeness happens." },
      ] },
    ],
  },
  ask: {
    key: "ask", category: "communication", emoji: "🎯", title: "Ask clearly", skill: "Clear communication",
    intro: "Remote, requests often fail on ambiguity. Each time, choose the wording that's clearest: unambiguous recipient, unambiguous what, unambiguous by-when.",
    closing: "A clear request names: WHO, WHAT exactly and BY WHEN. In remote teams that saves an enormous amount of back-and-forth.",
    howItWorks: ["Read a real remote request", "Choose the clearest wording", "See what makes it unambiguous"],
    concepts: ["Who · What · By when", "Removing ambiguity"],
    estMinutes: 2,
    metaTags: ["Private & solo"],
    rounds: [
      { msg: "You need feedback on your presentation. How do you ask for it?", options: [
        { t: "Can someone take a look at my slides?", ok: false, fb: "“Someone” and no time: no one feels responsible, no deadline." },
        { t: "@Mara, could you review slides 3–5 by Thursday 12pm and tell me if the message is clear?", ok: true, fb: "Clear: recipient, exact what, concrete time. That lands." },
        { t: "Could use some feedback on the slides sometime, that'd be nice.", ok: false, fb: "“Sometime” is non-committal, that fizzles out." },
      ] },
      { msg: "You'd like the docs updated. Which request is clearest?", options: [
        { t: "The docs are out of date.", ok: false, fb: "A statement, not a request, unclear who should do what." },
        { t: "Could someone maybe update the docs at some point?", ok: false, fb: "Lots of softeners, no recipient, no deadline." },
        { t: "@Kenji, can you update section 2 of the docs to the new process by Friday?", ok: true, fb: "Top: concrete person, concrete part, concrete deadline." },
      ] },
    ],
  },
  feedback: {
    key: "feedback", category: "communication", emoji: "💬", title: "Feedback Gym", skill: "Constructive feedback",
    intro: "Good feedback follows the SBI method: Situation – Behavior – Impact. Choose the feedback that's appreciative AND clear.",
    closing: "SBI separates observation from judgment: concrete situation, observable behavior, its impact on you. That keeps feedback fair and acceptable.",
    howItWorks: ["Read a feedback situation", "Pick the version that's kind and clear", "Learn why it lands without triggering defense"],
    concepts: ["SBI method", "Observation vs. judgment", "Praise that's specific"],
    estMinutes: 3,
    metaTags: ["Private & solo"],
    rounds: [
      { msg: "A colleague often interrupts you in meetings. How do you give feedback?", options: [
        { t: "You're so dominant and never let anyone finish.", ok: false, fb: "A character judgment (“you are…”). That triggers defensiveness." },
        { t: "In the standup today you interrupted me twice before I was done. It threw me off.", ok: true, fb: "SBI at its purest: situation, concrete behavior, impact on you, without an attack." },
        { t: "You always talk over everyone.", ok: false, fb: "“Always” generalizes and describes no concrete behavior." },
      ] },
      { msg: "You want to give positive feedback (which often gets missed!). Which is most effective?", options: [
        { t: "Well done, keep it up!", ok: false, fb: "Nice, but vague, the person doesn't know what exactly was good." },
        { t: "In the demo yesterday you explained the client's question calmly and in simple words. That saved us the deal.", ok: true, fb: "Praise works with SBI too: concrete, observable, with impact. That reinforces specifically." },
        { t: "You're just a natural.", ok: false, fb: "Sounds nice, but it's unspecific and hard to repeat." },
      ] },
    ],
  },
  culture: {
    key: "culture", category: "communication", emoji: "🌍", title: "Culture Code", skill: "Intercultural communication",
    intro: "Across many nationalities, many “conflicts” are really different cultural norms. Decode the scenarios and choose the reaction that reads the situation correctly in cultural terms: understand tendencies instead of taking them personally.",
    closing: "Golden rule: behavior is often culturally shaped, not personally meant. Make expectations explicit and ask (“How is that usually done where you're from?”), instead of judging from your own norm.",
    howItWorks: ["Read a cross-cultural scene", "Choose the culturally-aware reaction", "Decode the norm behind the behavior"],
    concepts: ["The Culture Map", "Direct vs. indirect", "Task vs. relationship trust"],
    estMinutes: 5,
    metaTags: ["Private & solo"],
    rounds: [
      { speaker: { name: "Kenji", flag: "🇯🇵" }, dim: "Giving criticism: direct ↔ indirect", msg: "On the call you give direct criticism: “That doesn't work like this.” Kenji goes very quiet and barely says anything afterwards.", options: [
        { t: "I check in: “Am I reading this right, is something about my feedback not sitting well? How would you put it?”", ok: true, fb: "Read correctly: in indirect cultures, very direct criticism quickly feels hurtful. Checking in opens things up again." },
        { t: "His silence means agreement, I'll just carry on.", ok: false, fb: "A fallacy. Silence can be irritation or saving face, not agreement." },
        { t: "He's probably offended, typically sensitive.", ok: false, fb: "That takes it personally and judges. It's a difference in feedback norms, not a character flaw." },
      ] },
      { speaker: { name: "Luca", flag: "🇮🇹" }, dim: "Time & planning: linear ↔ flexible", msg: "The meeting starts at 5:00pm. Luca joins at 5:08, completely relaxed, but for you that's too late.", options: [
        { t: "I raise it with the team: “Let's agree together on what ‘on time' means for us.”", ok: true, fb: "Strong: instead of judging, you make the expectation explicit. That resolves time conflicts for good." },
        { t: "I make a pointed remark about his lateness.", ok: false, fb: "Shaming worsens the relationship. Flexible time cultures often don't see 5:08 as “late”." },
        { t: "I make a mental note: Luca is unreliable.", ok: false, fb: "A snap judgment. It's a different sense of time, not a lack of reliability." },
      ] },
      { speaker: { name: "Amara", flag: "🇳🇬" }, dim: "Deciding: top-down ↔ consensus", msg: "You expect the team to decide for itself. Amara, however, visibly waits for a clear call from the team lead.", options: [
        { t: "I clarify openly: “Do we want to decide this together, or would you prefer a clear directive?”", ok: true, fb: "Exactly: expectations of “leadership” vary a lot by culture. Making it explicit creates clarity for everyone." },
        { t: "I think: she's just not self-reliant.", ok: false, fb: "A misreading. In more hierarchical cultures, waiting for a directive is respectful, not passive." },
        { t: "I ignore it and just decide alone.", ok: false, fb: "Wastes the chance to agree on a shared approach, the uncertainty stays." },
      ] },
      { speaker: { name: "Priya", flag: "🇮🇳" }, dim: "Trust: task-based ↔ relationship-based", msg: "Before the actual topic, Priya first wants to chat and connect personally. For you that's too much lead-up.", options: [
        { t: "I take the few minutes, relationship is the basis for the work here.", ok: true, fb: "Right: in relationship-based cultures, trust grows through the person. That's not lost time, it's the foundation." },
        { t: "I interrupt and get straight to the point.", ok: false, fb: "Can come across as cold and rude and cost trust, especially when trust is built through relationship." },
        { t: "Small talk is a waste of time, I think.", ok: false, fb: "That's your norm. For others, that's exactly the trust-building that makes good collaboration possible." },
      ] },
    ],
  },
  leadership: {
    key: "leadership", category: "leadership", emoji: "🎲", title: "Decision Roulette", skill: "Leadership",
    scoreNoun: "confident decisions", proLabel: "Leadership pro!",
    intro: "Leadership shows in small decisions, regardless of title. Read the dilemma and choose the most confident reaction. Then you'll see the consequence and the matching leadership principle.",
    closing: "Good leadership usually means: raise things early and calmly, coach instead of command, give feedback privately and concretely, and under uncertainty make a reversible decision rather than none at all.",
    howItWorks: ["Read a real leadership dilemma", "Choose your most confident reaction", "See the consequence and the principle behind it"],
    concepts: ["GROW coaching", "SBI feedback", "Reversible decisions", "Psychological safety"],
    estMinutes: 5,
    metaTags: ["Private & solo"],
    rounds: [
      { dim: "Delegation & trust", msg: "A team member misses a deadline for the third time. You're annoyed. How do you react as an (informal) leader?", options: [
        { t: "From now on I check every intermediate step daily.", ok: false, fb: "Consequence: micromanagement. It solves the problem short-term, but undermines trust and ownership." },
        { t: "I just take the task off their plate.", ok: false, fb: "Consequence: you become the bottleneck and the person learns nothing. Overload is guaranteed." },
        { t: "I seek a calm conversation: “What's holding you up? What do you need to hit the deadline?”", ok: true, fb: "Confidently led (GROW model): understand first, then clarify the solution & responsibility together. Coach instead of punish." },
      ] },
      { dim: "Moderating conflict", msg: "Two colleagues clash in the meeting, the mood tips. Everyone's watching how you react.", options: [
        { t: "I let it run, they can sort it out among themselves.", ok: false, fb: "Consequence: the conflict keeps smoldering and poisons the team dynamic. Looking away is also a decision." },
        { t: "I name it calmly: “I notice two views are colliding here, let's hear both of them out clearly.”", ok: true, fb: "Confident: you make the conflict discussable without taking sides. Creates psychological safety." },
        { t: "I side with the person who's usually right on the facts.", ok: false, fb: "Consequence: taking sides damages trust and reinforces camp-building." },
      ] },
      { dim: "Difficult feedback", msg: "The work quality of an otherwise strong colleague has noticeably dropped. How do you raise it?", options: [
        { t: "I mention it casually in the team call so everyone hears.", ok: false, fb: "Consequence: public criticism shames and destroys safety. Criticism belongs one-on-one." },
        { t: "I say nothing, she'll surely notice herself.", ok: false, fb: "Consequence: the problem grows, and you miss the chance to support early." },
        { t: "I ask for a 1:1 and use SBI: concrete situation, observed behavior, its impact, and I ask questions.", ok: true, fb: "Confident (SBI + 1:1): concrete, appreciative, private. That keeps feedback acceptable and solution-oriented." },
      ] },
      { dim: "Deciding under uncertainty", msg: "You have to set a direction, but data is still missing. The team looks to you.", options: [
        { t: "I wait until we really have all the information.", ok: false, fb: "Consequence: paralysis. Perfect data rarely exists, hesitating blocks the whole team." },
        { t: "I decide quickly alone and communicate it as final.", ok: false, fb: "Consequence: pace, yes, but without input & without a way back you risk a wrong call and resistance." },
        { t: "I make a deliberately reversible decision, explain the assumption and set a review date.", ok: true, fb: "Confident: able to act despite uncertainty. Reversible decisions + transparency = pace without recklessness." },
      ] },
    ],
  },
};

/* ── Live games from the game-design sheets (solo-playable adaptations) ── */
GAMES.commonground = {
  key: "commonground", category: "bonding", kind: "commonground", emoji: "🎚️",
  title: "Common Ground", skill: "Intercultural awareness",
  intro: "Make invisible work norms visible. Position yourself on the scale, then it appears how differently your team sees the same question. No right, no wrong.",
  closing: "The same terms mean something different to everyone. That very spread is the conversation starter: make expectations visible instead of assuming them.",
  estMinutes: 5, metaTags: ["Team or solo"],
  howItWorks: ["Read a work-norm statement", "Place yourself on the scale", "See how differently the team reads the same thing"],
  concepts: ["Invisible norms", "Making expectations explicit"],
  rounds: [],
};
GAMES.signalnoise = {
  key: "signalnoise", category: "communication", kind: "signalnoise", emoji: "📡",
  title: "Signal & Noise", skill: "Clear communication & feedback",
  intro: "How big is the gap between what's meant and what lands? Read a pure word description and draw what you understand, then compare with the original.",
  closing: "Words leave room. In round 2 you're allowed to ask questions. That very feedback closes the gap. Carry it into your workday.",
  estMinutes: 5, metaTags: ["Draw & compare", "2 rounds"],
  howItWorks: ["Read a words-only description", "Draw what you understand", "Compare with the original, then retry with feedback"],
  concepts: ["The say-understand gap", "Feedback loops"],
  rounds: [],
};
GAMES.failforward = {
  key: "failforward", category: "safety", kind: "failforward", emoji: "🛟",
  title: "Fail Forward", skill: "Psychological safety & resilience",
  intro: "Worst-case lottery: draw a fictional, exaggerated disaster card and react spontaneously. No one shares anything personal, humor lowers the barrier. The reflection is the learning.",
  closing: "Playing through mistakes in a safe space builds resilience and safety. In a real team: mistakes are allowed. What counts is the next step.",
  estMinutes: 5, metaTags: ["Solo or team", "Playful"],
  howItWorks: ["Draw an exaggerated disaster card", "React spontaneously, no real secrets shared", "Reflect, that's where the learning sits"],
  concepts: ["Psychological safety", "Resilience", "Mistakes as learning"],
  rounds: [],
};

GAMES.crisisroom = {
  key: "crisisroom", category: "leadership", kind: "crisisroom", emoji: "🚨",
  title: "Crisis Room", skill: "Situational leadership & self-organization",
  intro: "A fictional crisis, a time limit, no pre-named leader. You make decisions under pressure, react to unexpected turns, and reflect afterwards on which role you took.",
  closing: "Leadership emerges situationally, not from titles. Whoever brings structure under pressure, offers options or stays calm, leads, even without a role. In a real team, notice when you take on which role.",
  estMinutes: 10, metaTags: ["Timed", "Solo or live"],
  howItWorks: ["A fictional crisis lands and the clock starts", "Make calls under pressure as new turns hit", "Capture your plan, roles and a plan B", "Reflect on which role you naturally took"],
  concepts: ["Situational leadership", "Self-organization", "Deciding under pressure"],
  rounds: [],
};

GAMES.feedbackclass = {
  key: "feedbackclass", category: "leadership", kind: "feedbackclass", emoji: "🎓",
  title: "Feedback training", skill: "Feedback culture for leads",
  intro: "An interactive mini-class: what holds you back from giving feedback? You choose your barriers, work through short learning paths with scenarios and practice how feedback lands, incl. culture map.",
  closing: "",
  estMinutes: 10, metaTags: ["Interactive class", "Private"],
  howItWorks: ["Pick the barriers that hold you back", "Work through short scenario-based paths", "Place feedback styles on the culture map", "Practice wording that actually lands"],
  concepts: ["SBI method", "Feedback barriers", "Culture map"],
  rounds: [],
};

GAMES.defuse = {
  key: "defuse", category: "communication", route: "/app/live/defuse", emoji: "💣",
  title: "Defuse", skill: "Precise communication under pressure · Live",
  intro: "Asymmetric live game: one sees the device, the others the manual. Only precise talking defuses it.",
  closing: "",
  estMinutes: 10, metaTags: ["Live", "In pairs+"],
  howItWorks: ["One sees the device, the others hold the manual", "Talk precisely enough to defuse it in time", "Debrief what made the talk clear or murky"],
  concepts: ["Precision under pressure", "Shared language"],
  rounds: [],
};
GAMES.heist = {
  key: "heist", category: "bonding", route: "/app/live/heist", emoji: "🔓",
  title: "The Heist", skill: "Team effort · Live escape room",
  intro: "Collaborative escape room: no one sees all the clues. Only by sharing and combining do you break out together.",
  closing: "",
  estMinutes: 15, metaTags: ["Live", "Team"],
  howItWorks: ["Everyone gets different clues", "Share and combine what each of you sees", "Break out together before time runs out"],
  concepts: ["Information sharing", "Collaboration"],
  rounds: [],
};

/* ── Communication: One Clear Ask (solo) + Translate This (live) ── */
GAMES.oneclearask = {
  key: "oneclearask", category: "communication", route: "/app/communication/oneclearask", emoji: "🎯",
  title: "One Clear Ask", skill: "Ask clearly · Solo, daily",
  intro: "Daily micro-challenge: turn a situation into a crystal-clear request, along four building blocks.",
  closing: "",
  estMinutes: 3, metaTags: ["Solo", "Daily"],
  howItWorks: ["Take a real, fuzzy situation", "Shape it into one clear ask", "Check it against the four building blocks"],
  concepts: ["Who · What · By when", "Crisp requests"],
  rounds: [],
};
GAMES.translatethis = {
  key: "translatethis", category: "communication", route: "/app/live/translatethis", emoji: "🔁",
  title: "Translate This", skill: "Active listening · Live, in pairs",
  intro: "One talks, the other mirrors before replying. Makes the gap between said and understood tangible.",
  closing: "",
  estMinutes: 8, metaTags: ["Live", "In pairs"],
  howItWorks: ["One person talks", "The other mirrors before replying", "Notice the gap between said and understood"],
  concepts: ["Mirroring", "Active listening"],
  rounds: [],
};

/* ── Performance-Driven Culture: Ownership Cards (solo+live) + The Trade-Off (live) ── */
GAMES.ownershipcards = {
  key: "ownershipcards", category: "performance", route: "/app/performance/ownershipcards", emoji: "🛡️",
  title: "Ownership Cards", skill: "Responsibility without blame · Solo & Live",
  intro: "Practice constructive responsibility instead of blame. Mistakes as a source of learning, on fictional cards.",
  closing: "",
  estMinutes: 8, metaTags: ["Solo & live"],
  howItWorks: ["Draw a fictional mistake card", "Choose the response that owns it, without blame", "See how ownership turns a mistake into learning"],
  concepts: ["Ownership vs. blame", "Learning from mistakes"],
  rounds: [],
};
GAMES.thetradeoff = {
  key: "thetradeoff", category: "performance", route: "/app/live/thetradeoff", emoji: "⚖️",
  title: "The Trade-Off", skill: "Saying yes means saying no too · Live",
  intro: "You can't do everything at once. Prioritize together and make the trade-offs visible, deliberately leaving things out is the win.",
  closing: "",
  estMinutes: 10, metaTags: ["Live", "Team"],
  howItWorks: ["Face more asks than you can possibly do", "Prioritize together, out loud", "Make the deliberate 'no's visible"],
  concepts: ["Prioritization", "Trade-offs", "Focus"],
  rounds: [],
};

/* ── Performance-Driven Culture: Goalcraft, solo + live ── */
GAMES.goalcraft = {
  key: "goalcraft", category: "performance", route: "/app/performance/goalcraft", emoji: "🎯",
  title: "Goalcraft", skill: "Vague becomes measurable · Solo & Live",
  intro: "Turn a vague directive into a goal that pulls instead of pushes. Solo to practice, or live with the team.",
  closing: "",
  estMinutes: 8, metaTags: ["Solo & live"],
  howItWorks: ["Start from a vague directive", "Shape it into a goal that pulls, not pushes", "Make it concrete and measurable"],
  concepts: ["Outcome over output", "Measurable goals"],
  rounds: [],
};

/* ── Onboarding: First Week Quest, solo to team over the first days ── */
GAMES.firstweek = {
  key: "firstweek", category: "onboarding", route: "/app/onboarding/firstweek", emoji: "🌅",
  title: "First Week Quest", skill: "Arriving & connecting · Solo & Team",
  intro: "Guides you through the first days: small steps that connect you with the team quite naturally.",
  closing: "",
  estMinutes: 10, metaTags: ["Solo → team", "Over your first days"],
  howItWorks: ["Take small steps, day by day", "Connect with the team naturally", "Build momentum through your first week"],
  concepts: ["Gentle onboarding", "Belonging"],
  rounds: [],
};

/* ── Leadership: 1:1 Companion, structured guide for one-on-ones ── */
GAMES.oneonone = {
  key: "oneonone", category: "leadership", route: "/app/leadership/oneonone", emoji: "🧭",
  title: "1:1 Companion", skill: "Better one-on-ones · Solo & shared",
  intro: "Turn a routine check-in into a conversation worth having: a shared agenda, rotating questions, a gentle guide, and agreements that carry over each time.",
  closing: "",
  estMinutes: 15, metaTags: ["Solo prep + shared", "Private"],
  howItWorks: ["Prep privately, then build a shared agenda", "Capture what they raise, add your own topics", "Follow the gentle guide with rotating questions", "Leave with agreements that carry into the next one"],
  concepts: ["Shared agenda", "Rotating questions", "Carry-over agreements", "No HR reporting"],
  rounds: [],
};

/* ── Conflict & Repair: private solo preparation tool ── */
GAMES.cleartheair = {
  key: "cleartheair", category: "conflict", route: "/app/conflict/cleartheair", emoji: "🌬️",
  title: "Clear the Air", skill: "Raise tensions fairly · Solo & private",
  intro: "Sort out a tension calmly for yourself and find a good way to raise it. Calm, fair and without blame.",
  closing: "",
  estMinutes: 8, metaTags: ["Solo", "Private"],
  howItWorks: ["Name the tension for yourself, calmly", "Separate the facts from the story", "Shape a fair way to raise it, no blame"],
  concepts: ["Fair repair", "Non-blaming language"],
  rounds: [],
};

GAMES.conflictstyles = {
  key: "conflictstyles", category: "conflict", route: "/app/conflict/styles", emoji: "⚖️",
  title: "Conflict Styles", skill: "Know your default · Solo & private",
  intro: "React to a few everyday conflict moments and discover which of the five conflict styles you lean on by default, plus when each one actually helps. A lens, not a label.",
  closing: "",
  estMinutes: 5, metaTags: ["Solo & private", "Educational"],
  howItWorks: ["React to a few quick conflict moments", "See which style you reach for by default", "Learn when each of the five styles helps, and costs"],
  concepts: ["Thomas-Kilmann modes", "Assertiveness × cooperation", "No style is 'best'"],
  rounds: [],
};

GAMES.cooldown = {
  key: "cooldown", category: "conflict", route: "/app/conflict/cooldown", emoji: "🧊",
  title: "Cool Down", skill: "Steady the heat · Solo & private",
  intro: "Something just got under your skin. Before you fire back, take a moment to let the heat drop, separate the fact from the story, and choose your next move on purpose.",
  closing: "",
  estMinutes: 2, metaTags: ["Solo & private", "In the moment"],
  howItWorks: ["Take one steadying beat", "Split what happened from the story about it", "Decide, on purpose, to respond now or later"],
  concepts: ["Fact vs. story", "The gap between spark and reaction", "Naming the feeling"],
  rounds: [],
};

GAMES.repairkit = {
  key: "repairkit", category: "conflict", route: "/app/conflict/repair", emoji: "🧰",
  title: "Repair Kit", skill: "Mend after a rupture · Solo & private",
  intro: "After friction, a genuine repair matters more than being right. Work through the impact, own your part, and shape a message that opens the door again.",
  closing: "",
  estMinutes: 5, metaTags: ["Solo & private"],
  howItWorks: ["Look at what happened, from both sides", "Own your part, even a small one", "Shape a warm, non-blaming way back in"],
  concepts: ["Repair over being right", "Owning your part", "Impact before intent"],
  rounds: [],
};

export const GAME_LIST: Game[] = Object.values(GAMES);
export const gamesFor = (moduleId: string): Game[] => GAME_LIST.filter((g) => g.category === moduleId);

/* At-a-glance badges for a game card: duration, Solo/Team, and a Live flag for
   synchronous formats. Derived from existing metaTags / route / estMinutes, so a
   solo player can tell before clicking whether a game needs the team to be there. */
export interface GameBadge { label: string; kind: "time" | "mode" | "live"; }
export function gameBadges(g: Game): GameBadge[] {
  const meta = (g.metaTags ?? []).join(" ").toLowerCase();
  const liveOnly = /\/app\/live\//.test(g.route ?? "");
  const hasLive = liveOnly || meta.includes("live");
  const teamOnly = liveOnly || (!meta.includes("solo") && (meta.includes("team") || meta.includes("pair")));
  const out: GameBadge[] = [];
  if (g.estMinutes) out.push({ label: `${g.estMinutes} min`, kind: "time" });
  out.push({ label: teamOnly ? "Team" : "Solo", kind: "mode" });
  if (hasLive) out.push({ label: "Live", kind: "live" });
  return out;
}
