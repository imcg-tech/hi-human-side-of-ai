/* Sound Bath (Meditation & Mindfulness). Ambient soundscapes, no spoken guidance,
   just curated audio + a calming visual. The tracks are self-produced (drop your loops
   in public/audio/), so there are NO third-party licensing concerns.

   SOUND_LIBRARY is intentionally easy to extend: add one more entry, no code change.
   Titles/moods below are editable placeholders, rename them to your real tracks. */

export interface Sound {
  id: string;
  title: string;   // editable
  mood: string;    // short "when to use" label
  emoji: string;
  file: string;    // relative to the public dir, resolved with BASE_URL
  color: string;   // accent for the card + visual gradient
}

export const SOUND_LIBRARY: Sound[] = [
  { id: "rain-leaves", title: "Rain & Leaves", mood: "Cosy & enveloping", emoji: "🍃", file: "audio/rain-leaves.mp3", color: "var(--candy-blue)" },
  { id: "ocean", title: "Oceanic", mood: "Rhythmic & spacious", emoji: "🌊", file: "audio/ocean.mp3", color: "var(--candy-teal)" },
  { id: "natural-resonance", title: "Natural Resonance", mood: "Grounded & alive", emoji: "🌲", file: "audio/natural-resonance.mp3", color: "var(--candy-mint)" },
  { id: "nirvana", title: "Nirvana", mood: "Deep & meditative", emoji: "🌙", file: "audio/nirvana.mp3", color: "var(--candy-peri)" },
  { id: "singing-bowls", title: "Tibetan Singing Bowls", mood: "Meditative & still", emoji: "🎐", file: "audio/singing-bowls.mp3", color: "var(--candy-lilac)" },
  { id: "warm-sanctuary", title: "Warm Sanctuary", mood: "Warm & cocooning", emoji: "🌅", file: "audio/warm-sanctuary.mp3", color: "var(--candy-yellow)" },
];

/* Resolve a library file against the app base (works in dev and the base:"./" build). */
export const soundUrl = (file: string) => `${import.meta.env.BASE_URL}${file}`;

/* Timer options in minutes; 0 = endless. */
export const DURATIONS: { min: number; label: string }[] = [
  { min: 5, label: "5 min" },
  { min: 10, label: "10 min" },
  { min: 20, label: "20 min" },
  { min: 0, label: "Endless" },
];
