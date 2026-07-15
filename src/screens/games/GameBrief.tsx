import Icon from "../../components/Icon";
import type { Game } from "../../data/games";
import { metaChip, briefLabel, conceptChip } from "./gameStyles";

/* Shared "what is this game" context block for game intro cards:
   meta chips (rounds / time / format) + How it works steps + What you'll practice. */
export default function GameBrief({ g, accent, rounds }: { g: Game; accent: string; rounds?: number }) {
  const showRounds = !!rounds && rounds > 0;
  const hasChips = showRounds || !!g.estMinutes || !!(g.metaTags && g.metaTags.length);

  return (
    <>
      {hasChips && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "14px 0 2px" }}>
          {showRounds && <span style={metaChip}><Icon name="target" size={13} /> {rounds} {rounds === 1 ? "round" : "rounds"}</span>}
          {g.estMinutes && <span style={metaChip}><Icon name="clock" size={13} /> ~{g.estMinutes} min</span>}
          {(g.metaTags ?? []).map((t) => <span key={t} style={metaChip}>{t}</span>)}
        </div>
      )}

      {g.howItWorks && g.howItWorks.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={briefLabel}>How it works</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {g.howItWorks.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: accent, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>{i + 1}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-body)", lineHeight: 1.4, paddingTop: 2 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {g.concepts && g.concepts.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={briefLabel}>What you'll practice</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {g.concepts.map((c) => <span key={c} style={conceptChip}>{c}</span>)}
          </div>
        </div>
      )}
    </>
  );
}
