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

          {/* And fades them out vertically too. Without this the wrapper's
              overflow-hidden sliced the ribbons at y=1040 — right where their
              gradients are hottest — leaving a dead-straight bright line across
              both flanks. */}
          <linearGradient id={`${id}-fade-y`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="62%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>

          <mask id={`${id}-mask`}>
            <rect x="0" y="0" width="400" height="1040" fill={`url(#${id}-fade)`} />
          </mask>

          <mask id={`${id}-mask-y`}>
            <rect x="0" y="0" width="400" height="1040" fill={`url(#${id}-fade-y)`} />
          </mask>
        </defs>

        <g mask={`url(#${id}-mask-y)`}>
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
        </g>
      </svg>
    </div>
  )
}

/**
 * The hero's chevron artwork.
 *
 * This used to carry the hero's entire light rig too — six blooms plus a
 * vignette. That light now comes from SiteAtmosphere, which spans the whole
 * page, so keeping a second set here just doubled the exposure at the top and
 * blew the hero out relative to everything below it. What is left is the
 * geometry: the ribbons themselves, catching the page's light.
 */
export function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <ChevronStack side="left" />
      <ChevronStack side="right" />

      {/* Keeps the centre of the stage dark enough for the headline. Sized to
          the chevrons rather than the viewport, and it fades out completely at
          its edges so it never reads as a box over the page field. */}
      <div className="absolute inset-x-0 top-0 h-[1040px] bg-[radial-gradient(ellipse_56%_58%_at_50%_32%,#030303_0%,rgba(3,3,3,0.88)_42%,rgba(3,3,3,0.4)_72%,transparent_100%)]" />
    </div>
  )
}
