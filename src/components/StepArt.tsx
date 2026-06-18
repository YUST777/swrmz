type StepVariant = 'deploy' | 'guard' | 'radar';

function GridGlow({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}_glow`} cx="50%" cy="55%" r="62%">
          <stop offset="0%" stopColor="#c0444c" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#77262d" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#77262d" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}_grid`} width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M14 0H0V14" fill="none" stroke="#c0444c" strokeOpacity="0.1" strokeWidth="1" />
        </pattern>
        <linearGradient id={`${id}_stroke`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3c9cd" />
          <stop offset="100%" stopColor="#9a2f37" />
        </linearGradient>
        <filter id={`${id}_blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <rect width="120" height="120" fill={`url(#${id}_grid)`} />
      <rect width="120" height="120" fill={`url(#${id}_glow)`} />
    </>
  );
}

function DeployArt() {
  const nodes = [
    { x: 22, y: 30 },
    { x: 50, y: 18 },
    { x: 80, y: 24 },
    { x: 100, y: 46 },
  ];
  const hub = { x: 56, y: 92 };
  const cycle = 3.2;
  return (
    <svg viewBox="0 0 120 120" fill="none" className="size-full">
      <GridGlow id="dp" />
      {/* faint base connections */}
      <g stroke="url(#dp_stroke)" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2 3" strokeOpacity="0.32">
        {nodes.map((n, i) => (
          <line key={i} x1={hub.x} y1={hub.y} x2={n.x} y2={n.y} />
        ))}
      </g>
      {/* deploy pulses fired from the hub one after another */}
      {nodes.map((n, i) => (
        <circle key={`p${i}`} r="2.4" fill="#f3c9cd" opacity="0">
          <animateMotion
            dur={`${cycle}s`}
            begin={`${i * 0.55}s`}
            repeatCount="indefinite"
            path={`M${hub.x},${hub.y} L${n.x},${n.y}`}
            keyPoints="0;1;1"
            keyTimes="0;0.4;1"
            calcMode="linear"
          />
          <animate
            attributeName="opacity"
            dur={`${cycle}s`}
            begin={`${i * 0.55}s`}
            repeatCount="indefinite"
            values="0;1;1;0;0"
            keyTimes="0;0.06;0.36;0.46;1"
          />
        </circle>
      ))}
      {/* nodes light up as each pulse arrives */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="6" fill="#1a1012" stroke="#e7b3b7" strokeWidth="1.4" strokeOpacity="0.5" />
          <g style={{ animation: `deploy-node ${cycle}s ease-in-out infinite`, animationDelay: `${i * 0.55}s` }}>
            <circle cx={n.x} cy={n.y} r="8" fill="#c0444c" filter="url(#dp_blur)" />
            <circle cx={n.x} cy={n.y} r="6" fill="none" stroke="#f3c9cd" strokeWidth="1.4" />
            <circle cx={n.x} cy={n.y} r="2" fill="#f3c9cd" />
          </g>
        </g>
      ))}
      {/* hub with SWRMZ logo */}
      <circle
        cx={hub.x}
        cy={hub.y}
        r="16"
        fill="#c0444c"
        filter="url(#dp_blur)"
        style={{ animation: 'art-pulse 2.4s ease-in-out infinite' }}
      />
      <g fill="#f3c9cd" transform={`translate(${hub.x} ${hub.y}) scale(0.17) translate(-74 -73)`}>
        <path d="m97 51-21.8-8.2-21.8 8.3s9 18.2 10.2 20.9h0.1l-8.9-5.8 0.6 26.3 19.5 22.2h0.2l19.4-22.2 0.7-26.4c-0.1-0.1-9 5.9-9 5.9l10.1-21zm-12.2 34.7-9.7 11.2-10-11.5-0.1-9.5c0.1-0.2 10 9.2 10.1 9.2l9.6-9.1 0.1-0.1v9.8z" />
        <path d="m93.8 43.3 31.6-14.9 0.8-0.2 6.2-0.4-2.8 6-0.5 0.6c-1.7 1.7-28.8 21.9-29.4 22.3-0.5 0.2 4.8-12 4.6-12.3h-2l-8.5-1v-0.1z" />
        <path d="m56.3 43.4c0.7 0.2-0.3 0.3-0.3 0.3l-10.5 0.9 4.9 12.1h-0.1c-0.2-0.2-29.3-21.7-29.7-22.7s-3-6.1-3-6.2c0-0.2 6.2 0.4 6.7 0.5 0.4 0 31.2 14.7 32 15.1z" />
        <path d="m17.1 47.2c0.4 0.2-0.1 0.4-2.1 4.5-2.9-0.8-11.9-5.4-13.7-16.6-2-12.3 6.1-22 13.4-25.5 2.6-1.1 5.4-2.1 9-2.1 14-0.1 20.3 12.3 20.4 12.8l-4.4 1.9c-1.8-3.4-6.9-9.7-15.2-9.9-2.6 0-4.7 0.1-7.5 1.3-6.4 2.7-11.4 9.7-11.4 16.9-0.1 5 1.8 8.8 4.3 12 2.1 2.5 4.9 4 6.9 4.9l0.3-0.2z" />
        <path d="m135.3 9.4c-2.7-1.2-5.7-1.9-9-1.9-14 0-19.9 12.2-20.5 12.8l4.6 2c0.7 0.2 3.5-8.3 13.2-9.9 1.4-0.2 2.6-0.2 4.6-0.1 8.1 0.8 16.3 8.3 16.3 18.4 0 4.2-1.5 7.7-3.3 10.4-2.8 4-6.6 5.4-8 6.1-0.2 0.2 0.1 0.1 2.1 4.6 5.7-1.9 12.4-7.8 13.8-16.9 0.1-1 0.1-2.3 0.1-3.7 0-9.9-6.2-18.2-13.9-21.8z" />
        <path d="m134.4 98.7-0.9-0.3-1.4 2.8c-0.2 0.5-0.5 1 0 1.3 1.9 1 10.9 5.1 11.7 15.9 0.4 6-2.4 12-7.4 15.7-2.4 1.8-6.1 3.5-10.4 3.6-5.8 0.3-12.9-3.4-15.3-9.8l-4.3 2c0 0.4 1.1 2.3 2.3 4 2.2 2.9 7.6 8.2 16.9 8.4 10.8 0.2 21.1-6.7 22.8-18.9 0.2-2.1 0.2-3.4-0.1-6.4-0.7-5-4.4-13.7-13.9-18.3z" />
        <path d="m129.4 115.7 0.2 0.3 3.1 6.4c-0.3 0.3-4.2-0.7-6.4-0.8l-0.9-0.3-32.4-18.1-0.1-0.2-0.1-0.3c1 0 9.5 0 10.8 0.2l-1.7-4.5-2.2-6.4v-0.3l29.7 23.8v0.2z" />
        <path d="m43.5 129.6c-2.1-0.5-3.7-1.9-4.1-1.7-3 6.1-10.4 9.8-16 9.8-11.2 0.2-17.4-8.8-17.5-16.8-0.2-6.9 3.6-12.8 8.6-15.9l3.2-2-2.1-4.1-0.6 0.1c-5.1 2.4-7.4 5-9.6 7.7-1.9 2.9-4.7 7.7-4 15.7 1 8.7 8.2 19.2 20.6 19.9h3c7.1-0.3 14-3.9 17.6-9.6l0.8-1.3s0.4-0.9 0.1-1v-0.8z" />
        <path d="m46.3 103c-0.3 0.5 2.2-0.3 11-0.3l-0.1 0.3-33 18.3c-0.6 0.3-6.1 0.9-6.8 1.1l3.1-6.7 0.3-0.2 29.6-23.6 0.1-0.2c0.7-0.5-0.5 2.2-4.2 11.3z" />
      </g>
    </svg>
  );
}

function GuardArt() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="size-full">
      <GridGlow id="gd" />
      {/* threshold guardrail (static) */}
      <line
        x1="12"
        y1="58"
        x2="108"
        y2="58"
        stroke="#e7b3b7"
        strokeWidth="1.2"
        strokeDasharray="4 4"
        opacity="0.6"
        style={{ animation: 'dash-flow 1.4s linear infinite' }}
      />
      {/* live chart — each point rises and falls like a trading line */}
      <path
        d="M14 84 L30 78 L42 82 L54 64 L66 86 L80 74 L92 80 L106 70"
        stroke="#9a2f37"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      >
        <animate
          attributeName="d"
          dur="4.5s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
          values="M14 84 L30 78 L42 82 L54 64 L66 86 L80 74 L92 80 L106 70;M14 80 L30 84 L42 74 L54 70 L66 80 L80 68 L92 82 L106 64;M14 86 L30 76 L42 80 L54 62 L66 88 L80 78 L92 74 L106 72;M14 82 L30 80 L42 76 L54 68 L66 82 L80 72 L92 84 L106 66;M14 84 L30 78 L42 82 L54 64 L66 86 L80 74 L92 80 L106 70"
        />
      </path>
      <circle cx="54" cy="64" r="6" fill="#c0444c" filter="url(#gd_blur)" style={{ animation: 'art-pulse 1.5s ease-in-out infinite' }}>
        <animate attributeName="cy" dur="4.5s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" values="64;70;62;68;64" />
      </circle>
      <circle cx="54" cy="64" r="3" fill="#f3c9cd">
        <animate attributeName="cy" dur="4.5s" repeatCount="indefinite" keyTimes="0;0.25;0.5;0.75;1" values="64;70;62;68;64" />
      </circle>
      {/* shield */}
      <g transform="translate(60 46)">
        <path
          d="M0 -28 L20 -20 V2 C20 18 11 26 0 32 C-11 26 -20 18 -20 2 V-20 Z"
          fill="#c0444c"
          filter="url(#gd_blur)"
          style={{ animation: 'art-pulse 2.6s ease-in-out infinite' }}
        />
        <path
          d="M0 -26 L18 -19 V2 C18 16 10 24 0 30 C-10 24 -18 16 -18 2 V-19 Z"
          fill="#1a1012"
          stroke="url(#gd_stroke)"
          strokeWidth="1.8"
        />
        <path d="M-8 0 L-2 7 L10 -8" stroke="#f3c9cd" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

function RadarArt() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="size-full">
      <GridGlow id="rd" />
      <defs>
        <linearGradient id="rd_sweep" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c0444c" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c0444c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g stroke="#c0444c" strokeOpacity="0.35" strokeWidth="1">
        <circle cx="60" cy="60" r="40" fill="none" />
        <circle cx="60" cy="60" r="27" fill="none" />
        <circle cx="60" cy="60" r="14" fill="none" />
        <line x1="60" y1="18" x2="60" y2="102" />
        <line x1="18" y1="60" x2="102" y2="60" />
      </g>
      <g style={{ transformOrigin: '60px 60px', animation: 'spin 5s linear infinite' }}>
        <path d="M60 60 L60 18 A42 42 0 0 1 99 46 Z" fill="url(#rd_sweep)" />
        <line x1="60" y1="60" x2="60" y2="18" stroke="#f3c9cd" strokeWidth="1.4" strokeOpacity="0.8" />
      </g>
      {/* blips */}
      <circle cx="78" cy="40" r="6" fill="#c0444c" filter="url(#rd_blur)" opacity="0.6" />
      <circle cx="78" cy="40" r="2.6" fill="#f3c9cd" />
      <circle cx="42" cy="74" r="2.2" fill="#e7b3b7" opacity="0.85" />
      <circle cx="74" cy="80" r="1.8" fill="#e7b3b7" opacity="0.7" />
      <circle cx="60" cy="60" r="3" fill="#f3c9cd" />
    </svg>
  );
}

export function StepArt({ variant }: { variant: StepVariant }) {
  if (variant === 'deploy') return <DeployArt />;
  if (variant === 'guard') return <GuardArt />;
  return <RadarArt />;
}
