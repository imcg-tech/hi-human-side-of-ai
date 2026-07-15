# Sound Bath audio

Drop your **self-produced** ambient loops here:

```
public/audio/sound-1.mp3
public/audio/sound-2.mp3
public/audio/sound-3.mp3
public/audio/sound-4.mp3
public/audio/sound-5.mp3
```

- These are referenced by `src/data/soundBath.ts` (`SOUND_LIBRARY`) via `audio/sound-N.mp3`,
  resolved with `import.meta.env.BASE_URL` so they work in dev and in the `base: "./"` build.
- Because the tracks are your own, there are **no third-party licensing concerns**.
- **Looping:** export each file with clean loop points (no click/gap at the seam), the player
  sets `loop = true` for the endless / timed modes.
- Adding more sounds later = one more entry in `SOUND_LIBRARY`, no code change needed.

Until the files are added, the player still runs (visual + timer); it just shows a small
"add your audio" hint instead of sound.
