/* "Hi" — the logo face grown into a full little character: head, body, arms,
   feet. Blinks, its antenna sparks, bobs, and waves. Poses: wave / point / idle.
   Pure SVG + CSS; animations disabled under reduced-motion. */

type Pose = "wave" | "point" | "idle";

const INK = "#211E1A";
const CREAM = "#F4F1EB";
const SPARK = "#3B6FF6";

export default function HiMascot({ size = 120, pose = "idle", reduced = false, style }: { size?: number; pose?: Pose; reduced?: boolean; style?: React.CSSProperties }) {
  const w = size * (150 / 200);
  const anim = !reduced;
  const waving = pose === "wave";

  return (
    <div style={{ width: w, height: size, ...style }} aria-hidden="true">
      <style>{`
        @keyframes hi-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes hi-blink { 0%,90%,100%{transform:scaleY(1)} 94%{transform:scaleY(0.1)} }
        @keyframes hi-spark { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.55;transform:scale(0.82)} }
        @keyframes hi-wave { 0%,100%{transform:rotate(-8deg)} 25%{transform:rotate(22deg)} 50%{transform:rotate(-4deg)} 75%{transform:rotate(18deg)} }
        .him-bob{ animation:${anim ? "hi-bob 3.4s ease-in-out infinite" : "none"}; transform-origin:center bottom; }
        .him-eyes{ transform-box:fill-box; transform-origin:center; ${anim ? "animation:hi-blink 5.5s ease-in-out infinite;" : ""} }
        .him-spark{ transform-box:fill-box; transform-origin:center; ${anim ? "animation:hi-spark 2.6s ease-in-out infinite;" : ""} }
        .him-wave{ transform-box:fill-box; transform-origin:12% 88%; ${anim && waving ? "animation:hi-wave 0.7s ease-in-out infinite;" : ""} }
      `}</style>
      <div className="him-bob" style={{ width: "100%", height: "100%" }}>
        <svg viewBox="0 0 150 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="56" cy="188" rx="14" ry="8" fill={INK} />
          <ellipse cx="92" cy="188" rx="14" ry="8" fill={INK} />
          <rect x="40" y="104" width="70" height="78" rx="28" fill={INK} />
          <ellipse cx="75" cy="146" rx="19" ry="24" fill={CREAM} opacity="0.06" />

          {/* left arm, down */}
          <path d="M48 120 Q32 144 36 172" stroke={INK} strokeWidth="13" fill="none" strokeLinecap="round" />
          <circle cx="36" cy="174" r="9" fill={INK} />

          {/* right arm, pose-dependent */}
          {pose === "wave" && (
            <g className="him-wave">
              <path d="M104 116 Q130 102 140 76" stroke={INK} strokeWidth="13" fill="none" strokeLinecap="round" />
              <circle cx="141" cy="72" r="10" fill={INK} />
            </g>
          )}
          {pose === "point" && (
            <>
              <path d="M104 116 Q132 100 146 82" stroke={INK} strokeWidth="13" fill="none" strokeLinecap="round" />
              <circle cx="147" cy="80" r="10" fill={INK} />
            </>
          )}
          {pose === "idle" && (
            <>
              <path d="M106 120 Q122 146 116 172" stroke={INK} strokeWidth="13" fill="none" strokeLinecap="round" />
              <circle cx="116" cy="174" r="9" fill={INK} />
            </>
          )}

          {/* head */}
          <circle className="him-spark" cx="75" cy="12" r="7" fill={SPARK} />
          <rect x="30" y="24" width="90" height="86" rx="29" fill={INK} />
          <g className="him-eyes">
            <circle cx="60" cy="62" r="12" fill={CREAM} />
            <circle cx="90" cy="62" r="12" fill={CREAM} />
            <circle cx="61" cy="63" r="5.4" fill={INK} />
            <circle cx="91" cy="63" r="5.4" fill={INK} />
          </g>
          <path d="M60 86 Q75 98 90 86" stroke={CREAM} strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
