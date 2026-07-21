import { GAMES } from "../data/games";

/* 2.5: freshness over percent. Communication skills are never "done", so module
   cards show recency and rhythm instead of a completion number. */

type PlayEntry = { k: string; m: string; d: string };

/** Resolve an app route to the game it opens (its own route or /app/game/:key). */
export function gameForPath(path: string): { key: string; module: string } | null {
  for (const g of Object.values(GAMES)) {
    if ((g.route ?? `/app/game/${g.key}`) === path) return { key: g.key, module: g.category };
  }
  return null;
}

const DAY = 86400000;

/** Human line for a module's play history, e.g. "Played today · 2× this week". */
export function moduleFreshness(playLog: PlayEntry[], moduleId: string): { line: string; fresh: boolean } {
  const entries = playLog.filter((p) => p.m === moduleId);
  if (!entries.length) return { line: "Not started yet", fresh: false };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const last = entries.map((p) => p.d).sort().at(-1)!;
  const lastDay = new Date(last + "T00:00:00");
  const days = Math.round((today.getTime() - lastDay.getTime()) / DAY);
  const weekCount = entries.filter((p) => (today.getTime() - new Date(p.d + "T00:00:00").getTime()) / DAY < 7).length;

  const when = days <= 0 ? "Played today" : days === 1 ? "Last played yesterday" : days <= 28 ? `Last played ${days} days ago` : "Last played a while ago";
  const rhythm = weekCount >= 2 ? ` · ${weekCount}× this week` : "";
  return { line: when + rhythm, fresh: days <= 3 };
}
