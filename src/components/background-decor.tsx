import { cn } from '@/lib/utils'

/**
 * The folded crimson chevrons that frame the hero.
 *
 * Each "ribbon" is a thick mitred polyline, so the fold at the apex comes for
 * free — no polygon maths. The gradient runs near-black at the top to hot red at
 * the bottom, which is what gives the whole frame its lit-from-below look; the
 * ribbons themselves are unlit geometry catching that light.
 *
 * The svg is pinned to a fixed 1040px box anchored at the top of the section so
 * the artwork keeps its scale no matter how tall the page grows.
 */
function ChevronStack({ side }: { side: 'left' | 'right' }) {
  const id = `chev-${side}`

  return (
    <div
      className={cn(
        // the pair must never eat the whole viewport, so the floor drops on phones
        'absolute top-0 h-[1040px] w-[31vw] max-w-[370px] min-w-[112px] overflow-hidden sm:min-w-[230px]',
        side === 'left' ? 'left-0' : 'right-0 -scale-x-100',
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 400 1040"
        preserveAspectRatio="xMinYMid slice"
        className="h-full w-full"
      >
        <defs>
          {/* every ribbon shares the same top-dark / bottom-hot ramp, only the
              saturation changes with how near the front the ribbon sits */}
          <linearGradient id={`${id}-far`} x1="0" y1="0" x2="0.18" y2="1">
            <stop offset="0%" stopColor="#120203" />
            <stop offset="38%" stopColor="#490810" />
            <stop offset="72%" stopColor="#b81318" />
            <stop offset="100%" stopColor="#ff3d3d" />
          </linearGradient>

          <linearGradient id={`${id}-mid`} x1="0" y1="0" x2="0.26" y2="1">
            <stop offset="0%" stopColor="#1d0305" />
            <stop offset="34%" stopColor="#750d13" />
            <stop offset="66%" stopColor="#dd1418" />
            <stop offset="100%" stopColor="#ff6060" />
          </linearGradient>

          <linearGradient id={`${id}-near`} x1="0.08" y1="0" x2="0.38" y2="1">
            <stop offset="0%" stopColor="#3a060a" />
            <stop offset="48%" stopColor="#c11318" />
            <stop offset="100%" stopColor="#ff5252" />
          </linearGradient>

          <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>

          <filter id={`${id}-haze`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="22" />
          </filter>

          {/* fades the ribbons out as they travel toward the centre of the page */}
          <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="52%" stopColor="#fff" stopOpacity="0.88" />
            <stop offset="92%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={`${id}-mask`}>
            <rect x="0" y="0" width="400" height="1040" fill={`url(#${id}-fade)`} />
          </mask>
        </defs>

        <g mask={`url(#${id}-mask)`}>
          {/* widest, dimmest ribbon sitting furthest back */}
          <polyline
            points="-140,-90 340,470 -140,1060"
            fill="none"
            stroke={`url(#${id}-far)`}
            strokeWidth="168"
            strokeLinejoin="miter"
            opacity="0.42"
            filter={`url(#${id}-haze)`}
          />

          {/* the hero ribbon — the shape the eye actually reads */}
          <polyline
            points="-95,30 250,355 -95,690"
            fill="none"
            stroke={`url(#${id}-mid)`}
            strokeWidth="122"
            strokeLinejoin="miter"
            opacity="0.96"
          />

          {/* thin bright fold catching the light on the inner edge */}
          <polyline
            points="-95,120 178,355 -95,600"
            fill="none"
            stroke={`url(#${id}-near)`}
            strokeWidth="26"
            strokeLinejoin="miter"
            opacity="0.85"
            filter={`url(#${id}-soft)`}
          />

          {/* clipped streak in the very top corner */}
          <polyline
            points="-60,-170 190,45 -60,270"
            fill="none"
            stroke={`url(#${id}-near)`}
            strokeWidth="22"
            strokeLinejoin="miter"
            opacity="0.34"
            filter={`url(#${id}-soft)`}
          />

          {/* a second fold low on the flank, where the frame is hottest */}
          <polyline
            points="-80,620 210,860 -80,1100"
            fill="none"
            stroke={`url(#${id}-near)`}
            strokeWidth="74"
            strokeLinejoin="miter"
            opacity="0.5"
            filter={`url(#${id}-haze)`}
          />
        </g>
      </svg>
    </div>
  )
}

/**
 * Anchored to the hero, but deliberately not clipped by it.
 *
 * The section used to carry `overflow-hidden`, which cut every bloom off at
 * the hero's bottom edge — a dead straight line where a lit red stage became
 * flat black. The clip now lives on <main>, so the low glow is free to carry
 * past the boundary and the grid below starts inside the same light. Nothing
 * here is anchored to a page offset; the bleed hangs off the section's own
 * bottom edge, so it stays put however tall the hero gets.
 */
export function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <ChevronStack side="left" />
      <ChevronStack side="right" />

      {/* The bloom pools LOW on both flanks — it is what makes the frame read as
          lit from below rather than evenly tinted. Sits under the vignette so the
          headline never has to fight it. */}
      <div className="absolute top-[560px] -left-56 h-[620px] w-[560px] rounded-full bg-blood-200/40 blur-[150px]" />
      <div className="absolute top-[560px] -right-56 h-[620px] w-[560px] rounded-full bg-blood-200/40 blur-[150px]" />

      {/* hotter, tighter core inside each bloom */}
      <div className="absolute top-[700px] -left-32 h-[380px] w-[300px] rounded-full bg-blood-100/35 blur-[110px]" />
      <div className="absolute top-[700px] -right-32 h-[380px] w-[300px] rounded-full bg-blood-100/35 blur-[110px]" />

      {/* The carry-through. Same flanks, wider and dimmer, hung off the
          bottom edge so roughly half of each one lands in the next section —
          this is what removes the seam. */}
      <div className="absolute -bottom-[440px] -left-64 h-[860px] w-[620px] rounded-full bg-blood-300/20 blur-[190px]" />
      <div className="absolute -bottom-[440px] -right-64 h-[860px] w-[620px] rounded-full bg-blood-300/20 blur-[190px]" />

      {/* and one broad ember on the centre line, low enough to come up under
          the next section's heading rather than pooling on the boundary */}
      <div className="absolute -bottom-[400px] left-1/2 h-[660px] w-[1150px] -translate-x-1/2 rounded-[100%] bg-blood-400/20 blur-[170px]" />

      {/* keeps the centre of the stage black so the type stays legible */}
      <div className="absolute inset-x-0 top-0 h-[1040px] bg-[radial-gradient(ellipse_58%_60%_at_50%_32%,#030303_0%,#030303_36%,rgba(3,3,3,0.9)_58%,rgba(3,3,3,0.45)_80%,transparent_100%)]" />

      {/* top vignette so the header sits on solid black */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink via-ink/80 to-transparent" />
    </div>
  )
}
