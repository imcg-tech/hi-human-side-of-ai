export interface CrisisScenario {
  id: string;
  tension: string;
  crisis: string;
  complications: [string, string];
}

/* Scenario pool from the game-design sheet (dramaturgically fleshed out). */
export const CR_SCENARIOS: CrisisScenario[] = [
  { id: "C01", tension: "Speed vs. care",
    crisis: "It's 2pm. Your most important client is presenting to your shared board at 4pm. The message just came in: the central demo environment has crashed, and the person who built it is off sick and unreachable. What do you do?",
    complications: ["Update: The client asks for a status update. They're getting nervous.", "Update: There's an old backup version, but no one knows if it runs stably."] },
  { id: "C02", tension: "Redistribution under pressure",
    crisis: "In the middle of the hot project phase, your most important team member is out for two weeks. Three critical tasks sit with that person alone, and the deadline stands. How do you organize yourselves?",
    complications: ["Update: One of the tasks is more complex than thought. No one knows the system.", "Update: Management asks whether the deadline still holds."] },
  { id: "C03", tension: "Response speed vs. alignment",
    crisis: "An angry client posts a harsh complaint about your product. It's spreading fast right now, the first people are chiming in. How do you respond?",
    complications: ["Update: An industry account with big reach shares the post.", "Update: Internally, two departments disagree on who's even allowed to reply."] },
  { id: "C04", tension: "Prioritization & sacrifice",
    crisis: "Two important deadlines fall on the same day, and half the team is off sick. Delivering both in full is impossible. What do you do?",
    complications: ["Update: Client A signals that some delay would be okay, client B does not.", "Update: A colleague offers to work overtime, but already seems exhausted."] },
  { id: "C05", tension: "Transparency vs. caution",
    crisis: "You discover that customer data may have leaked. The scale is still completely unclear. Every minute counts. What are your first steps?",
    complications: ["Update: Early signs point to more affected records than thought.", "Update: Someone asks whether you should inform the customers already now."] },
  { id: "C06", tension: "Risk vs. safety",
    crisis: "A big deal is close to closing, but the client now demands a commitment you can't safely keep as stated. A decision has to be made in the next few minutes. How do you proceed?",
    complications: ["Update: The client sets an ultimatum, answer in 10 minutes.", "Update: A team member proposes a compromise that makes no one entirely happy."] },
];

export const CR_REFLECTIONS = [
  "Did you first create structure, or act right away?",
  "How quickly did you commit to a plan? Too early, too late, just right?",
  "Did you deliberately keep a plan B in mind?",
  "Was there a moment where you missed leadership, and who could have provided it?",
];

export const CR_ROLES: { label: string; desc: string }[] = [
  { label: "Driver", desc: "You set the pace and pushed for a decision." },
  { label: "Organizer", desc: "You brought order, assigned tasks, created an overview." },
  { label: "Idea-giver", desc: "You brought in options and paths to a solution." },
  { label: "Supporter", desc: "You had others' backs and pulled along with them." },
  { label: "Observer", desc: "You listened and held back first, before stepping in." },
];
