# HI — the Human side of AI

Gamified bonding for remote teams. Small, recurring games that build connection,
communication, leadership and cross-cultural understanding — tuned to each
person's (private) DISC profile.

## Stack

- **Vite + React + TypeScript** — app shell & build
- **React Three Fiber / Three.js** — the living shader "aura" (welcome experience)
- **GSAP** (`@gsap/react`) — UI motion & entrance animations
- **Zustand** — app state (persisted to localStorage; later backed by Supabase)
- **React Router** (HashRouter) — screens

## Run locally

Requires Node.js (a local copy is installed under `~/.local/node`; it's on your
PATH via `~/.zshenv`).

```bash
npm install      # once
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build → dist/
```

## Structure

```
src/
  main.tsx            # entry
  App.tsx             # router (/, /home)
  styles/
    tokens.css        # design tokens (single source of truth)
    global.css        # base styles + shared .btn
  lib/
    store.ts          # Zustand store (email, DISC profile, notify…)
  three/
    Aura.tsx          # R3F fullscreen shader aura
  screens/
    Welcome.tsx       # immersive entry (aura + GSAP)
    Home.tsx          # light-themed app home (scaffold)
```

## Migration plan (from the single-file prototype in `_legacy-prototype/`)

The prototype holds the full feature set already designed & validated:
DISC assessment, profile, weekly team shuffle, the games (Aktiv zuhören,
Klar bitten, Feedback Gym, Kultur-Code, Decision Roulette, Fail Forward,
Signal & Noise), the Culture tab (Culture Map, holidays/customs, language of
the day) and the company star-map network.

These are ported screen-by-screen into `src/screens` + `src/features` as real
components, reusing `tokens.css` and the Zustand store. Next up: Auth/onboarding
(Supabase magic-link), the assessment flow, and the company network as an R3F scene.
