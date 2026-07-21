import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import Logo from "../components/Logo";
import SearchOverlay from "../components/SearchOverlay";
import PrivacyIntro from "../components/PrivacyIntro";
import HiGuide from "../components/HiGuide";
import { useAuth } from "../lib/auth";
import { supabaseReady } from "../lib/supabase";
import { useStore } from "../lib/store";
import { useMediaQuery } from "../lib/useMediaQuery";
import { countryByCode } from "../data/countries";
import { gameForPath } from "../lib/freshness";
import { NAV_ITEMS, activeNavId, type NavItem } from "../data/nav";

const TITLES: Record<string, string> = { "": "Good morning, Mara", team: "Universe", culture: "Culture Map", modules: "Modules", balance: "Balance", signal: "Pulse" };

export default function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { session, signOut } = useAuth();
  const seg = pathname.replace(/^\/app\/?/, "");
  const active = activeNavId(seg);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [openId, setOpenId] = useState(active);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => { setOpenId(active); }, [active]);

  // 2.5 freshness: opening any game route counts as a play (deduped per day).
  useEffect(() => {
    const g = gameForPath(pathname);
    if (g) useStore.getState().recordPlay(g.key, g.module);
  }, [pathname]);

  const displayName = useStore((s) => s.displayName);
  const department = useStore((s) => s.department);
  const country = useStore((s) => s.country);
  const live = supabaseReady && session;
  const userEmail = session?.user?.email ?? "";
  const userName = live ? (displayName || userEmail.split("@")[0] || "Du") : "Mara Iqbal";
  const flag = countryByCode(country)?.flag ?? "";
  // Demo subline mirrors the live format (department · country) instead of the
  // cryptic "Product · Influence" DISC tag that read like jargon.
  const userSub = live ? [department, flag].filter(Boolean).join(" · ") || userEmail : "Product team · 🇸🇪 Sweden";
  const initial = (userName[0] || "?").toUpperCase();

  const activeItem = NAV_ITEMS.find((n) => n.id === active);
  const headerTitle = TITLES[seg] || activeItem?.label || "HI";

  /* ── one sidebar nav row (+ expandable children) ── */
  function NavRow({ n }: { n: NavItem }) {
    const on = active === n.id;
    const expanded = openId === n.id && !!n.children;
    return (
      <div>
        <button aria-current={on ? "page" : undefined} data-tour={`nav-${n.id || "home"}`} onClick={() => navigate(n.route)}
          style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, width: "100%",
            padding: "10px 12px", border: "none", borderRadius: 14, cursor: "pointer", textAlign: "left",
            background: on ? "var(--brand-subtle)" : "transparent", color: on ? "var(--brand-dark)" : "var(--text-secondary)",
            transition: reduced ? "none" : "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)" }}>
          {on && <span aria-hidden style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3.5, borderRadius: 999, background: n.color }} />}
          <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0, background: `color-mix(in srgb, ${n.color} 20%, transparent)` }}>
            <Icon name={n.icon} size={18} color={n.color} stroke={1.9} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, lineHeight: 1.15, color: on ? "var(--brand-dark)" : "var(--text-primary)" }}>{n.label}</span>
            {n.subtitle && <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.2 }}>{n.subtitle}</span>}
          </span>
          {n.children && (
            <span role="button" tabIndex={0} aria-label={expanded ? "Collapse" : "Expand"} aria-expanded={expanded}
              onClick={(e) => { e.stopPropagation(); setOpenId(expanded ? "__none" : n.id); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setOpenId(expanded ? "__none" : n.id); } }}
              style={{ flexShrink: 0, display: "grid", placeItems: "center", transform: expanded ? "rotate(180deg)" : "none", transition: reduced ? "none" : "transform var(--dur-fast) var(--ease-out)", color: "var(--text-muted)" }}>
              <Icon name="chevronDown" size={16} />
            </span>
          )}
        </button>

        {n.children && (
          <div style={{ display: "grid", gridTemplateRows: expanded ? "1fr" : "0fr", transition: reduced ? "none" : "grid-template-rows 0.26s var(--ease-out)" }}>
            <div style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "3px 0 6px 18px" }}>
                {n.children.map((c) => {
                  const conActive = pathname === c.route;
                  return (
                    <button key={c.label + c.route} onClick={() => navigate(c.route)} tabIndex={expanded ? 0 : -1}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "7px 12px", border: "none", borderRadius: 11, cursor: "pointer",
                        background: conActive ? "var(--brand-subtle)" : "transparent", color: conActive ? "var(--brand-dark)" : "var(--text-secondary)",
                        fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 999, flexShrink: 0, background: c.color ?? "var(--text-muted)" }} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1, display: "flex", width: "100%", height: "100dvh" }}>
      {/* Sidebar (Desktop) */}
      {!isMobile && (
        <aside style={{ width: 248, flexShrink: 0, display: "flex", flexDirection: "column", padding: "26px 18px", gap: 14,
          background: "rgba(247,244,239,0.55)", backdropFilter: "blur(24px) saturate(1.2)", WebkitBackdropFilter: "blur(24px) saturate(1.2)",
          borderRight: "1px solid rgba(255,255,255,0.5)" }}>
          <Logo iconSize={48} hiSize={26} style={{ alignSelf: "center", margin: "6px 0 4px" }} />

          {/* search */}
          <button onClick={() => setSearchOpen(true)} aria-label="Open search"
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 13, cursor: "pointer",
              border: "1px solid var(--border-default)", background: "rgba(255,255,255,0.5)", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: 13.5 }}>
            <Icon name="search" size={17} stroke={1.9} /> Game, topic or mood…
          </button>

          <nav aria-label="Main navigation" style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {NAV_ITEMS.map((n) => <NavRow key={n.id} n={n} />)}
          </nav>

          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 11, padding: "16px 8px 0", borderTop: "1px solid var(--border-default)" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--disc-i)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{initial}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userSub}</div>
            </div>
            {live && (
              <button onClick={async () => { await signOut(); navigate("/"); }} title="Sign out" style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid var(--border-default)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-muted)", flexShrink: 0 }}>
                <Icon name="arrowRight" size={16} />
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "16px 18px 4px" : "20px 32px 6px" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", textShadow: "0 1px 12px rgba(255,255,255,0.7)" }}>{headerTitle}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <button onClick={() => setSearchOpen(true)} aria-label="Search" style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid rgba(255,255,255,0.55)", background: "rgba(247,244,239,0.6)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
                <Icon name="search" size={19} />
              </button>
            )}
            <button onClick={() => navigate("/app/privacy")} aria-label="Your data & privacy" title="Your data & privacy" style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid rgba(255,255,255,0.55)", background: "rgba(247,244,239,0.6)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
              <Icon name="lock" size={18} />
            </button>
            <button aria-label="Notifications" style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid rgba(255,255,255,0.55)", background: "rgba(247,244,239,0.6)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
              <Icon name="bell" size={19} />
            </button>
          </div>
        </header>

        {/* Mobile: Unterbereiche als horizontale Chips */}
        {isMobile && activeItem?.children && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "6px 18px 4px", WebkitOverflowScrolling: "touch" }}>
            {activeItem.children.map((c) => {
              const conActive = pathname === c.route;
              return (
                <button key={c.label + c.route} onClick={() => navigate(c.route)} style={{ display: "inline-flex", alignItems: "center", gap: 7, flexShrink: 0, padding: "7px 13px", borderRadius: 999, cursor: "pointer", border: "1px solid var(--border-default)", background: conActive ? "var(--brand-subtle)" : "rgba(255,255,255,0.5)", color: conActive ? "var(--brand-dark)" : "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: c.color ?? "var(--text-muted)" }} />{c.label}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ flex: 1, minHeight: 0, padding: isMobile ? "6px 18px 0" : "8px 32px 0", paddingBottom: isMobile ? 74 : 0 }}>
          <Outlet />
        </div>
      </main>

      {/* Mobile: Bottom-Tab-Bar */}
      {isMobile && (
        <nav aria-label="Hauptnavigation" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, display: "flex", justifyContent: "space-around", alignItems: "stretch",
          padding: "6px 8px", background: "rgba(247,244,239,0.9)", backdropFilter: "blur(20px) saturate(1.2)", WebkitBackdropFilter: "blur(20px) saturate(1.2)", borderTop: "1px solid var(--border-default)" }}>
          {NAV_ITEMS.map((n) => {
            const on = active === n.id;
            return (
              <button key={n.id} aria-current={on ? "page" : undefined} data-tour={`nav-${n.id || "home"}`} onClick={() => navigate(n.route)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 2px", border: "none", background: "transparent", cursor: "pointer", color: on ? n.color : "var(--text-muted)" }}>
                <Icon name={n.icon} size={21} color={on ? n.color : "var(--text-muted)"} stroke={on ? 2.1 : 1.9} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: 10.5, fontWeight: on ? 700 : 500, color: on ? "var(--brand-dark)" : "var(--text-muted)" }}>{n.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <PrivacyIntro />
      <HiGuide />
    </div>
  );
}
