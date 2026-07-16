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
  { title: "Hi, I'm Hi", line: "Your little guide here. Welcome! Let me show you around in ten seconds.", clip: "hi-1.mp3", wave: true },
  { title: "Home", line: "Your home base, a calm overview of your week, this week's focus, your mood, and your gentle momentum. All at a glance, no pressure.", target: "nav-home", clip: "hi-2.mp3" },
  { title: "Modules", line: "Playful mini-games to grow together, communication, trust, leadership. Short and light.", target: "nav-modules", clip: "hi-3.mp3" },
  { title: "Balance", line: "Your private corner: breathe, reset, recharge. Just for you.", target: "nav-balance", clip: "hi-4.mp3" },
  { title: "Pulse", line: "Check in with how you feel. Always anonymous, always yours.", target: "nav-signal", clip: "hi-5.mp3" },
  { title: "You're all set", line: "Everything here is private and yours to control. Tap me any time you need me. Have fun!", clip: "hi-6.mp3", wave: true },
];

export const tourClipUrl = (clip: string) => import.meta.env.BASE_URL + "tour/" + clip;
