# VOICE SHEET — Reset Ritual (TTS narration)
## HI · Balance › Stress › Reset Ritual

> Narration script for an API/TTS voice that guides the 2-minute Reset Ritual
> (5-4-3-2-1 grounding). The narration is **German** to match the app; the notes
> are English. Each step's **break (silence)** is the time left after the spoken
> line, so the voice never rushes the user through the grounding.

Source of truth: `src/data/balance.ts` → `RESET_STEPS`. Timer: `src/screens/games/ResetRitual.tsx` auto-advances each step after `secs`.

---

## 1. Voice direction

| Aspect | Setting |
|---|---|
| Tone | Warm, calm, unhurried, like a friend guiding a breath, not a meditation guru |
| Pace | Slow (~0.85× normal rate). Leave the line breathing room. |
| Pitch | Neutral to slightly low |
| Style | Soft, no upspeak, gentle downward intonation at line ends |
| Language | German (de-DE), Du-form |
| Loudness | Quiet. This plays during a micro-break, not an announcement. |

Suggested voices: **ElevenLabs** multilingual (e.g. a calm female/neutral German voice), **OpenAI TTS** `shimmer` or `nova` (de), **Azure** `de-DE-SeraphinaMultilingualNeural` (very warm), **Google** `de-DE-Neural2-C`.

---

## 2. Script + breaks (the core)

Total ritual = **95 s** across 6 steps. `Speak ≈` is an estimate at the calm pace; `Break ≈` is the silence the user gets to actually do the step. `Speak + Break = step secs`.

| # | Step (on-screen) | Spoken line (de-DE) | Speak ≈ | Break ≈ | Step secs |
|---|---|---|---|---|---|
| — | *Intro (optional)* | „Zwei kleine Minuten für dich. Lass den Rest kurz warten." | 4 s | 1 s | (5) |
| 1 | **Komm an** | „Setz dich bequem hin. Spür den Boden unter deinen Füßen, und komm ganz hier an." | 7 s | **8 s** | 15 |
| 2 | **Atme** | „Drei tiefe Atemzüge. Ein … und langsam wieder aus. Nochmal ein … und aus. Ein letztes Mal ein … und ganz sanft aus." | ~20 s (paced) | in-line | 20 |
| 3 | **5 · sehen** | „Sieh dich um. Benenne innerlich fünf Dinge, die du gerade siehst." | 5 s | **13 s** | 18 |
| 4 | **4 · hören** | „Und jetzt lausche. Vier Geräusche um dich herum." | 4 s | **11 s** | 15 |
| 5 | **3 · spüren** | „Spür drei Dinge, die dich berühren. Den Stuhl, deine Kleidung, die Luft auf der Haut." | 7 s | **8 s** | 15 |
| 6 | **1 · mitnehmen** | „Ein Wort für diesen Moment. Nimm es mit in deinen nächsten Schritt." | 6 s | **6 s** | 12 |
| — | *Outro (done screen)* | „Angekommen. Nimm das ruhige Gefühl mit." | 4 s | — | — |

Step 2 (**Atme**) is special: the breaks pace the breathing itself. Give each „ein …" ~2 s, each „aus" ~3 s, with a short break between cycles so one full inhale/exhale ≈ 6 s × 3 ≈ 18–20 s.

---

## 3. SSML (single-file option)

For engines that support SSML `<break>` (Azure, Google, Amazon Polly). Note the **break caps** (see §5) — the long grounding pauses may need chained breaks or the per-clip approach in §4.

```xml
<speak>
  <prosody rate="-12%" pitch="-1st" volume="soft">
    Setz dich bequem hin. <break time="900ms"/> Spür den Boden unter deinen Füßen, und komm ganz hier an.
    <break time="8s"/>

    Drei tiefe Atemzüge.
    <break time="800ms"/> Ein <break time="2s"/> und langsam wieder aus. <break time="3s"/>
    Nochmal ein <break time="2s"/> und aus. <break time="3s"/>
    Ein letztes Mal ein <break time="2s"/> und ganz sanft aus. <break time="2s"/>

    Sieh dich um. Benenne innerlich fünf Dinge, die du gerade siehst.
    <break time="10s"/><break time="3s"/>

    Und jetzt lausche. Vier Geräusche um dich herum.
    <break time="10s"/>

    Spür drei Dinge, die dich berühren. <break time="700ms"/> Den Stuhl, deine Kleidung, die Luft auf der Haut.
    <break time="8s"/>

    Ein Wort für diesen Moment. <break time="4s"/> Nimm es mit in deinen nächsten Schritt.
  </prosody>
</speak>
```

Two chained `<break>`s (e.g. `10s` + `3s`) get you past a single-break cap when needed.

---

## 4. Recommended integration: one clip per step (cleanest)

The app **already** has a per-step timer (`RESET_STEPS[i].secs`). So the simplest, most robust setup:

1. Pre-generate **6 short MP3s** (`reset-1.mp3` … `reset-6.mp3`), each containing **only the spoken line** (no long trailing silence). Optional `reset-intro.mp3` / `reset-outro.mp3`.
2. On each step start, `play()` that step's clip. The line plays (~4–7 s), then the existing timer keeps counting → the remaining seconds **are the break**, during which the breathing circle animates and the user does the grounding.
3. Add a soft chime on step change (optional). Add a **mute toggle** (🔊/🔇) — audio in a wellbeing tool must be opt-out-able.

Why this is better than one long file: no visual-sync drift, no break-length caps, easy to tweak one line, and the pause length is literally driven by the same `secs` the UI already uses. Break math per step is in the table above.

Sketch (fits `ResetRitual.tsx`, only if you later want it wired):
```ts
// preload: const audio = RESET_STEPS.map((_, i) => new Audio(`/audio/reset-${i+1}.mp3`));
// on step change: if (!muted) { audio[step].currentTime = 0; audio[step].play(); }
```

---

## 5. Per-provider notes

| Provider | Break support | Notes |
|---|---|---|
| **ElevenLabs** | `<break time="1.5s" />`, **max ~3 s** | Best quality/warmth. For long grounding pauses use the per-clip approach (§4). Overusing breaks can cause artifacts — prefer ellipses „…" for micro-pauses. |
| **OpenAI TTS** (`tts-1-hd`) | No SSML | Chunk one request per line; insert silence between clips yourself (or use §4). Voices: `shimmer`, `nova`, `alloy`. Set the calm tone via the text + slower delivery. |
| **Azure Speech** | Full SSML, long breaks OK | Great German neural voices (`SeraphinaMultilingual`, `Katja`). `<mstts:express-as style="calm">` available. Single-file §3 works well. |
| **Google Cloud TTS** | `<break>` (cap a few seconds) | Chain breaks for long pauses, or §4. |
| **Amazon Polly** | `<break>` **max 10 s**, `<amazon:effect>` | Long breaks fine (≤10 s). Neural voices for de-DE. |
| **Web Speech API** (browser) | None (free) | One `SpeechSynthesisUtterance` per line + `setTimeout` for the pause. Robotic quality; fine as a free fallback. |

---

## 6. Options / nice-to-haves

- **Mute + remember choice** (store flag, default on or off — your call; I'd default audio **off** and let the user enable it, least surprising).
- **Restore the „2" step:** the app currently skips it (5-4-3-**1**). For the full 5-4-3-2-1, add `2 · riechen`: „Zwei Dinge, die du riechst oder schmeckst." (~10–12 s). Would also need adding to `RESET_STEPS`.
- **Reduced-motion users:** they may also want no sudden audio — tie the mute default to a calm default.
- **Loudness ducking:** if any background sound/music plays, duck it under the voice.

---

## 7. Definition of done (for the voice feature)
- [ ] 6 step clips (+ optional intro/outro) generated from the §2 lines, calm German voice
- [ ] Played per step, silence = step `secs` − speak time (the "break")
- [ ] Mute toggle, choice remembered
- [ ] No autoplay without user having started the ritual
- [ ] Breaks never shorter than the grounding needs (see table)
