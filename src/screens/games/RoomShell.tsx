import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import { Glass } from "../../components/ds";
import { supabaseReady } from "../../lib/supabase";
import { backBtn, primaryBtn, ghostBtn } from "./gameStyles";
import type { Player } from "./useGameRoom";
import type { Game } from "../../data/games";
import GameBrief from "./GameBrief";

interface RoomLike {
  name: string; setName: (s: string) => void;
  view: "menu" | "room"; code: string;
  joinCode: string; setJoinCode: (s: string) => void;
  isHost: boolean; players: Player[];
  createRoom: () => void; joinRoom: () => void;
}

/** Shared menu (create/join) + lobby UI for all live games. Renders `children`
 *  once the game has started (started=true). */
export function RoomShell({ room, emoji, title, intro, accent, backTo, started, lobbyHint, onStart, startLabel = "Start game", game, children }: {
  room: RoomLike; emoji: string; title: string; intro: string; accent: string; backTo: string;
  started: boolean; lobbyHint: string; onStart: () => void; startLabel?: string; game?: Game; children: ReactNode;
}) {
  const navigate = useNavigate();

  if (!supabaseReady) {
    return (
      <div style={{ height: "100%", padding: "8px 4px" }}>
        <button onClick={() => navigate(backTo)} style={backBtn}><Icon name="arrowLeft" size={16} /> back</button>
        <div style={{ maxWidth: 520, margin: "40px auto" }}><Glass pad={32}><h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)", margin: 0 }}>Live mode needs login</h2><p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", marginTop: 10 }}>Sign in first, then you can play together.</p></Glass></div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "8px 4px 40px", display: "flex", flexDirection: "column" }}>
      <button onClick={() => navigate(backTo)} style={backBtn}><Icon name="arrowLeft" size={16} /> back</button>

      {room.view === "menu" && (
        <div style={{ maxWidth: 520, margin: "auto", width: "100%" }}>
          <Glass pad={34}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: accent, display: "grid", placeItems: "center", fontSize: 30 }}>{emoji}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "var(--text-primary)", margin: "14px 0 2px" }}>{title}</h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.55, margin: "10px 0 4px" }}>{intro}</p>
            {game && <div style={{ margin: "0 0 20px" }}><GameBrief g={game} accent={accent} /></div>}
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 7, marginTop: game ? 0 : 18 }}>Your name</div>
            <input value={room.name} onChange={(e) => room.setName(e.target.value)} placeholder="Name" style={{ width: "100%", height: 48, padding: "0 16px", marginBottom: 16, borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
            <button onClick={room.createRoom} style={{ ...primaryBtn, width: "100%" }}>Create room <Icon name="arrowRight" size={18} /></button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border-default)" }} /><span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)" }}>or join</span><div style={{ flex: 1, height: 1, background: "var(--border-default)" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={room.joinCode} onChange={(e) => room.setJoinCode(e.target.value.toUpperCase())} placeholder="CODE" maxLength={4} style={{ flex: 1, height: 50, padding: "0 18px", borderRadius: 14, border: "1.5px solid var(--border-strong)", background: "rgba(255,255,255,0.7)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "0.15em", textAlign: "center", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
              <button onClick={room.joinRoom} style={ghostBtn}>Join</button>
            </div>
          </Glass>
        </div>
      )}

      {room.view === "room" && (
        <div style={{ maxWidth: 660, margin: "auto", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Room <span style={{ letterSpacing: "0.15em", color: accent }}>{room.code}</span></span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>{room.players.length} {room.players.length === 1 ? "person" : "people"}</span>
          </div>

          {!started ? (
            <Glass pad={28}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--text-primary)", marginBottom: 4 }}>Lobby</div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", margin: "0 0 16px" }}>{lobbyHint}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                {room.players.map((p) => (
                  <span key={p.key} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, background: "rgba(28,26,23,0.05)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" }}>{p.host ? "👑" : "🙂"} {p.name}</span>
                ))}
              </div>
              {room.isHost ? <button onClick={onStart} style={{ ...primaryBtn, width: "100%" }}>{startLabel} <Icon name="arrowRight" size={18} /></button> : <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-muted)", textAlign: "center" }}>Waiting for the host to start …</div>}
            </Glass>
          ) : children}
        </div>
      )}
    </div>
  );
}
