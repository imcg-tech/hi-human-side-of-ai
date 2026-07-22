import { useNavigate, useParams, Navigate } from "react-router-dom";
import Icon from "../components/Icon";
import GameIcon from "../components/GameIcon";
import { Glass } from "../components/ds";
import { MODULES } from "../data/modules";
import { gamesFor, gameBadges, type Game } from "../data/games";

const sectionLabel: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 4px 12px" };

export default function ModuleDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const m = MODULES.find((x) => x.id === id);
  if (!m) return <Navigate to="/app/modules" replace />;
  const games = gamesFor(m.id);

  // Pick one game to recommend so the module doesn't present 8 equal choices.
  // Prefer solo-playable (never send a lone user into a live-only dead end) and
  // rotate by day so a returning user sees something fresh.
  const soloish = games.filter((g) => !/\/app\/live\//.test(g.route ?? ""));
  const pool = soloish.length ? soloish : games;
  const dayIdx = Math.floor(Date.now() / 86400000);
  const recommended = games.length > 1 ? pool[dayIdx % pool.length] : null;
  const rest = recommended ? games.filter((g) => g.key !== recommended.key) : games;

  function GameCard({ g, featured }: { g: Game; featured?: boolean }) {
    return (
      <Glass pad={22} hover style={featured ? { border: `2px solid ${m!.color}` } : undefined}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ width: 48, height: 48, borderRadius: 14, background: m!.color, display: "grid", placeItems: "center", flexShrink: 0 }}><GameIcon game={g} size={27} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", lineHeight: 1.15 }}>{g.title}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>{g.skill}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
          {gameBadges(g).map((b) => {
            const live = b.kind === "live";
            return (
              <span key={b.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 999, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
                background: live ? "rgba(226,75,77,0.10)" : "rgba(28,26,23,0.05)", color: live ? "var(--danger, #E24B4D)" : "var(--text-secondary)", border: `1px solid ${live ? "rgba(226,75,77,0.28)" : "var(--border-default)"}` }}>
                {b.kind === "time" && <Icon name="clock" size={12} />}
                {b.kind === "mode" && b.label === "Team" && <Icon name="users" size={12} />}
                {live && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger, #E24B4D)", flexShrink: 0 }} />}
                {b.label}
              </span>
            );
          })}
        </div>

        <button onClick={() => navigate(g.route ?? `/app/game/${g.key}`)} style={{ marginTop: 16, width: "100%", height: 44, borderRadius: 999, border: "none", background: "var(--ink-fill)", color: "var(--text-on-ink)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="play" size={16} /> Play
        </button>
      </Glass>
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px" }}>
      <button onClick={() => navigate("/app/modules")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, border: "1px solid var(--border-strong)", background: "rgba(255,255,255,0.5)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, marginBottom: 18 }}>
        <Icon name="arrowLeft" size={16} /> All modules
      </button>

      {/* module header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: m.color, borderRadius: 24, padding: "24px 26px", marginBottom: 22 }}>
        <span style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.55)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon name={m.icon} size={26} color="var(--ink-fill)" />
        </span>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>{m.title}</h1>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)" }}>{m.desc}</div>
        </div>
      </div>

      {games.length > 0 ? (
        <>
          {recommended && (
            <div style={{ marginBottom: 24 }}>
              <div style={sectionLabel}>Recommended for you today</div>
              <div style={{ maxWidth: 520 }}><GameCard g={recommended} featured /></div>
            </div>
          )}

          <div style={sectionLabel}>{recommended ? "All games" : `${games.length} ${games.length === 1 ? "game" : "games"}`}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {rest.map((g) => <GameCard key={g.key} g={g} />)}
          </div>
        </>
      ) : (
        <Glass pad={28}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>Coming soon</div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", margin: "8px 0 0", lineHeight: 1.55 }}>The first games for this area are in the works. Check back soon.</p>
        </Glass>
      )}
    </div>
  );
}
