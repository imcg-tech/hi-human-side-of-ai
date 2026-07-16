/* "Hi" — the logo face brought to life as the guide mascot.
   Dark rounded head, blue antenna spark, blinking eyes, a smile, and a hand
   that waves. Pure SVG + CSS; animations disabled under reduced-motion. */

export default function HiMascot({ size = 96, waving = false, reduced = false, style }: { size?: number; waving?: boolean; reduced?: boolean; style?: React.CSSProperties }) {
  const w = size;
  const h = size * (138 / 120);
  const anim = !reduced;
  return (
    <div style={{ width: w, height: h, ...style }} aria-hidden="true">
      <style>{`
        @keyframes hi-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes hi-blink { 0%,90%,100%{transform:scaleY(1)} 94%{transform:scaleY(0.1)} }
        @keyframes hi-spark { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.55;transform:scale(0.82)} }
        @keyframes hi-wave { 0%,100%{transform:rotate(-8deg)} 25%{transform:rotate(24deg)} 50%{transform:rotate(-4deg)} 75%{transform:rotate(20deg)} }
        .hi-bob${anim ? "" : "-off"} { animation:${anim ? "hi-bob 3.4s ease-in-out infinite" : "none"}; }
        .hi-eyes { transform-box:fill-box; transform-origin:center; ${anim ? "animation:hi-blink 5.5s ease-in-out infinite;" : ""} }
        .hi-spark { transform-box:fill-box; transform-origin:center; ${anim ? "animation:hi-spark 2.6s ease-in-out infinite;" : ""} }
        .hi-hand { transform-box:fill-box; transform-origin:bottom center; ${anim && waving ? "animation:hi-wave 0.7s ease-in-out infinite;" : ""} }
      `}</style>
      <div className="hi-bob" style={{ width: "100%", height: "100%" }}>
        <svg viewBox="0 0 120 138" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          {/* antenna spark */}
          <circle className="hi-spark" cx="60" cy="12" r="7" fill="#3B6FF6" />
          {/* head */}
          <rect x="18" y="24" width="84" height="84" rx="26" fill="#211E1A" />
          {/* eyes */}
          <g className="hi-eyes">
            <circle cx="47" cy="58" r="12" fill="#F4F1EB" />
            <circle cx="73" cy="58" r="12" fill="#F4F1EB" />
            <circle cx="47" cy="59" r="5.4" fill="#211E1A" />
            <circle cx="73" cy="59" r="5.4" fill="#211E1A" />
          </g>
          {/* smile */}
          <path d="M47 82 Q60 93 73 82" fill="none" stroke="#F4F1EB" strokeWidth="3.5" strokeLinecap="round" />
          {/* waving hand (beside the head, lower-right) */}
          <g className="hi-hand">
            <rect x="99" y="74" width="15" height="22" rx="7.5" fill="#211E1A" />
            <circle cx="98" cy="88" r="4.5" fill="#211E1A" />
          </g>
        </svg>
      </div>
    </div>
  );
}
