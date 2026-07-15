import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { searchAll } from "../data/searchIndex";

/* Globale Suche als Overlay. Autocomplete über den SEARCH_INDEX.
   Tastatur: ↑/↓ navigieren, Enter öffnet, Esc schließt. */
export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchAll(q), [q]);

  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current?.focus(), 40); } }, [open]);
  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function go(route: string) { onClose(); navigate(route); }
  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === "Enter" && results[sel]) { e.preventDefault(); go(results[sel].route); }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Search" onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "12vh 20px 20px", background: "rgba(28,26,23,0.28)", backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: "var(--sand-100)", borderRadius: 20, boxShadow: "var(--shadow-lg)", overflow: "hidden", border: "1px solid var(--border-default)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid var(--border-default)" }}>
          <Icon name="search" size={20} color="var(--text-muted)" stroke={1.75} />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onInputKey}
            placeholder="Game, topic or mood…" aria-label="Search term"
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-body)", fontSize: 17, color: "var(--text-primary)" }} />
          <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 8 }}><Icon name="arrowLeft" size={18} /></button>
        </div>

        <div style={{ maxHeight: "50vh", overflowY: "auto", padding: 8 }}>
          {q.trim() === "" ? (
            <div style={{ padding: "18px 14px", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.5 }}>Type to find games, areas or your mood.</div>
          ) : results.length === 0 ? (
            <div style={{ padding: "18px 14px", fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-muted)" }}>Nothing found for “{q}”.</div>
          ) : (
            results.map((r, i) => (
              <button key={r.route + r.label} onMouseEnter={() => setSel(i)} onClick={() => go(r.route)}
                style={{ display: "flex", alignItems: "center", gap: 13, width: "100%", textAlign: "left", padding: "11px 12px", borderRadius: 12, border: "none", cursor: "pointer", background: i === sel ? "var(--brand-subtle)" : "transparent" }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(28,26,23,0.05)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon name={r.icon} size={17} color="var(--text-secondary)" stroke={1.75} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
                  <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.sub}</span>
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", flexShrink: 0 }}>{r.kind}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
