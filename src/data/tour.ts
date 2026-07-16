/* Hi guide: the one-time interactive intro tour. Each step shows a speech bubble
   from the Hi mascot, optionally spotlights a nav target, and (optionally) plays a
   short ElevenLabs voice clip. Works fully silently too. */

export interface TourStep {
  title: string;
  line: string;
  target?: string; // data-tour="…" of the nav item to spotlight (omit for intro/outro)
  clip: string;    // voice file in public/tour/
  wave?: boolean;  // mascot waves on this step
}

export const TOUR: TourStep[] = [
  { title: "Hi, I'm Hi", line: "I live in here, and I'll show you around, super quick. Come on!", clip: "hi-1.mp3", wave: true },
  { title: "Home", line: "This is where you land. Your week, your mood, all calm. No to-dos, promise.", target: "nav-home", clip: "hi-2.mp3" },
  { title: "Modules", line: "Little games to play with your team, talking, trust, all the good stuff. Short and fun.", target: "nav-modules", clip: "hi-3.mp3" },
  { title: "Balance", line: "Your quiet corner. Breathe, reset, let things settle. This one's just for you.", target: "nav-balance", clip: "hi-4.mp3" },
  { title: "Pulse", line: "A little check-in with yourself. How are you, really? Stays private, always.", target: "nav-signal", clip: "hi-5.mp3" },
  { title: "That's the tour", line: "Everything here is yours and stays private. Need me? Just tap me. Have fun!", clip: "hi-6.mp3", wave: true },
];

export const tourClipUrl = (clip: string) => import.meta.env.BASE_URL + "tour/" + clip;
