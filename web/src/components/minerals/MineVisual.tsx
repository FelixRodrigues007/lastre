/** Decorative open-pit mine — simulated mineral supply chain scene.
 *  Fictional assets only; hidden from assistive tech. */
export function MineVisual() {
  const mineCx = 630;
  const mineCy = 395;

  return (
    <svg
      className="minerals__svg"
      viewBox="0 0 1440 640"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mine-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4f3e6" />
          <stop offset="55%" stopColor="#e7e6d0" />
          <stop offset="100%" stopColor="#dadbc2" />
        </linearGradient>
        <linearGradient id="mine-mtn-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8c9063" />
          <stop offset="100%" stopColor="#6e7249" />
        </linearGradient>
        <linearGradient id="mine-mtn-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#545736" />
          <stop offset="100%" stopColor="#3f4329" />
        </linearGradient>
        <linearGradient id="mine-pit-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#545736" />
          <stop offset="100%" stopColor="#3f4329" />
        </linearGradient>
        <linearGradient id="mine-pit-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f4329" />
          <stop offset="100%" stopColor="#262916" />
        </linearGradient>
        <linearGradient id="mine-ore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6e7249" />
          <stop offset="100%" stopColor="#545736" />
        </linearGradient>
        <linearGradient id="mine-headframe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#30331e" />
          <stop offset="100%" stopColor="#181b0c" />
        </linearGradient>
        <filter id="mine-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* sky */}
      <rect width="1440" height="640" fill="url(#mine-sky)" />

      {/* distant mountains */}
      <path
        d="M0 380 L180 280 L320 340 L480 240 L640 310 L820 210 L980 290 L1140 230 L1320 300 L1440 260 L1440 640 L0 640 Z"
        fill="url(#mine-mtn-far)"
        opacity="0.55"
      />
      <path
        d="M0 420 L240 340 L420 390 L580 310 L760 370 L960 300 L1180 360 L1440 320 L1440 640 L0 640 Z"
        fill="url(#mine-mtn-mid)"
        opacity="0.72"
      />

      {/* ground plane */}
      <path
        d="M0 480 Q360 460 720 475 T1440 465 L1440 640 L0 640 Z"
        fill="#545736"
      />
      <path
        d="M0 510 Q400 495 800 505 T1440 498 L1440 640 L0 640 Z"
        fill="#3f4329"
      />

      {/* open-pit mine site */}
      <g>
        {/* spoil / ore stockpiles */}
        <ellipse cx="460" cy="468" rx="88" ry="22" fill="url(#mine-ore)" opacity="0.9" />
        <ellipse cx="460" cy="462" rx="72" ry="14" fill="#6e7249" opacity="0.55" />
        <ellipse cx="820" cy="472" rx="64" ry="18" fill="url(#mine-ore)" opacity="0.85" />
        <ellipse cx="820" cy="467" rx="50" ry="11" fill="#6e7249" opacity="0.5" />

        {/* pit rim — outer terrace */}
        <ellipse cx={mineCx} cy={mineCy + 42} rx="248" ry="62" fill="url(#mine-pit-rim)" />
        <ellipse
          cx={mineCx}
          cy={mineCy + 38}
          rx="248"
          ry="62"
          fill="none"
          stroke="rgba(231,230,208,0.08)"
          strokeWidth="1.5"
        />

        {/* terrace 2 */}
        <ellipse cx={mineCx} cy={mineCy + 18} rx="196" ry="50" fill="#4a4e31" />
        <path
          d={`M${mineCx - 196} ${mineCy + 18} A196 50 0 0 1 ${mineCx + 196} ${mineCy + 18} L${mineCx + 168} ${mineCy + 48} A168 42 0 0 0 ${mineCx - 168} ${mineCy + 48} Z`}
          fill="url(#mine-pit-inner)"
          opacity="0.65"
        />

        {/* terrace 3 */}
        <ellipse cx={mineCx} cy={mineCy - 2} rx="148" ry="40" fill="#3f4329" />
        <path
          d={`M${mineCx - 148} ${mineCy - 2} A148 40 0 0 1 ${mineCx + 148} ${mineCy - 2} L${mineCx + 124} ${mineCy + 22} A124 34 0 0 0 ${mineCx - 124} ${mineCy + 22} Z`}
          fill="#353824"
        />

        {/* terrace 4 — inner bench */}
        <ellipse cx={mineCx} cy={mineCy - 22} rx="100" ry="28" fill="#30331e" />
        <ellipse cx={mineCx} cy={mineCy - 18} rx="72" ry="20" fill="#262916" />
        <ellipse cx={mineCx} cy={mineCy - 14} rx="44" ry="12" fill="#1f2211" />

        {/* haul road spiral hint */}
        <path
          d={`M${mineCx - 220} ${mineCy + 30} C${mineCx - 160} ${mineCy - 10}, ${mineCx - 80} ${mineCy + 10}, ${mineCx - 40} ${mineCy - 8}`}
          fill="none"
          stroke="rgba(231,230,208,0.12)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* headframe / derrick */}
        <g transform={`translate(${mineCx + 118} 248)`}>
          <polygon points="0,150 18,28 36,150" fill="url(#mine-headframe)" />
          <polygon points="36,150 54,28 72,150" fill="#1f2211" />
          <rect x="10" y="24" width="52" height="7" rx="1" fill="#30331e" />
          <line x1="18" y1="28" x2="54" y2="28" stroke="#6e7249" strokeWidth="1.5" />
          {/* cable */}
          <line
            x1="36"
            y1="31"
            x2="36"
            y2="95"
            stroke="#fef16f"
            strokeWidth="1.5"
            strokeDasharray="4 5"
            opacity="0.45"
          />
          {/* skip bucket */}
          <rect x="28" y="95" width="16" height="14" rx="2" fill="#262916" stroke="#6e7249" strokeWidth="1" />
        </g>

        {/* conveyor from pit to export lane */}
        <g>
          <path
            d={`M${mineCx + 90} ${mineCy + 8} L${mineCx + 200} ${mineCy - 18} L${mineCx + 310} ${mineCy - 28} L920 338`}
            fill="none"
            stroke="#30331e"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
          <path
            d={`M${mineCx + 90} ${mineCy + 8} L${mineCx + 200} ${mineCy - 18} L${mineCx + 310} ${mineCy - 28} L920 338`}
            fill="none"
            stroke="rgba(231,230,208,0.1)"
            strokeWidth="1"
            strokeDasharray="6 8"
          />
          {/* conveyor supports */}
          <line x1={mineCx + 155} y1={mineCy - 4} x2={mineCx + 155} y2={mineCy + 28} stroke="#262916" strokeWidth="3" />
          <line x1={mineCx + 255} y1={mineCy - 22} x2={mineCx + 255} y2={mineCy + 12} stroke="#262916" strokeWidth="3" />
          <line x1={780} y1={332} x2={780} y2={360} stroke="#262916" strokeWidth="3" />
        </g>

        {/* seal ring — provenance reticle on pit center */}
        <circle cx={mineCx} cy={mineCy} r="72" fill="none" stroke="#fef16f" strokeWidth="3" opacity="0.85" />
        <circle cx={mineCx} cy={mineCy} r="48" fill="none" stroke="#fef16f" strokeWidth="2" opacity="0.5" />
        {/* crosshair ticks */}
        <line x1={mineCx - 82} y1={mineCy} x2={mineCx - 74} y2={mineCy} stroke="#fef16f" strokeWidth="2" opacity="0.7" />
        <line x1={mineCx + 74} y1={mineCy} x2={mineCx + 82} y2={mineCy} stroke="#fef16f" strokeWidth="2" opacity="0.7" />
        <line x1={mineCx} y1={mineCy - 82} x2={mineCx} y2={mineCy - 74} stroke="#fef16f" strokeWidth="2" opacity="0.7" />
        <line x1={mineCx} y1={mineCy + 74} x2={mineCx} y2={mineCy + 82} stroke="#fef16f" strokeWidth="2" opacity="0.7" />
      </g>

      {/* provenance path — origin → mine → export */}
      <path
        d={`M120 520 C240 470 380 420 ${mineCx - 40} ${mineCy + 20} C${mineCx + 120} ${mineCy - 40} 980 340 1320 320`}
        fill="none"
        stroke="#fef16f"
        strokeWidth="2"
        strokeDasharray="8 10"
        opacity="0.7"
        filter="url(#mine-glow)"
      />
      <circle cx="120" cy="520" r="6" fill="#6f8f2e" />
      <circle cx={mineCx} cy={mineCy} r="5" fill="#fef16f" />
      <circle cx="1320" cy="320" r="6" fill="#6f8f2e" />

      {/* foreground rock silhouettes */}
      <g fill="#121407" opacity="0.88">
        <path d="M0 560 Q40 520 60 560 L80 640 L0 640 Z" />
        <path d="M60 545 Q90 500 110 545 L130 640 L40 640 Z" />
        <path d="M1180 550 Q1220 505 1250 550 L1270 640 L1160 640 Z" />
        <path d="M1280 540 Q1320 490 1350 540 L1380 640 L1260 640 Z" />
        <path d="M1360 555 Q1390 515 1410 555 L1440 640 L1340 640 Z" />
      </g>

      {/* export container at lane end */}
      <rect x="1260" y="328" width="48" height="32" rx="3" fill="#262916" stroke="#6e7249" strokeWidth="1" />
      <rect x="900" y="340" width="380" height="8" rx="4" fill="#30331e" opacity="0.6" />
    </svg>
  );
}
