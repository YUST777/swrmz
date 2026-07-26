import { useLayoutEffect, useRef, useState } from 'react'

import { DroneGlyph } from '@/components/brand-logo'

/**
 * The six looping illustrations behind the feature grid.
 *
 * Each one is hand-drawn SVG rather than an icon, because every card is
 * selling a behaviour — a swarm converging, an action held at a gate, a
 * payload landing — and a static glyph can't carry a behaviour. The motion
 * is all CSS (see the bento block in styles.css): no React state, no rAF,
 * nothing that re-renders. That keeps six simultaneous loops off the main
 * thread.
 *
 * Sizing contract: the frame measures its box and hands the drawing its
 * real pixel size, so the viewBox is always 1:1 with the card. Nothing is
 * ever scaled and nothing is ever cropped — a 10px label is 10px at every
 * breakpoint. The cost is that every visual has to lay itself out from
 * (w, h) instead of hard-coded coordinates; the helpers below and the
 * shared PAD / caption baseline keep that cheap.
 *
 * House style, borrowed from the review grid: dense repeated geometry that
 * fills the box, one thing in motion, sparse red accents, and a mono
 * caption bottom-left that states a concrete number.
 */

type Size = { w: number; h: number }

const RED = '#ff3b3b'
const HOT = '#ff6b6b'
const DIM = '#5c5c5c'
const TEXT = '#8a8a8a'

/** side gutter, and the baseline every caption sits on */
const PAD = 24
const capBaseline = (h: number) => h - 13

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** distance a CSS travel keyframe should cover, in user units */
const run = (px: number, extra?: React.CSSProperties) =>
  ({ '--bv-run': `${px}px`, ...extra }) as React.CSSProperties

function useBoxSize() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size>({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      // round, and ignore sub-pixel churn so a resize can't loop
      setSize((prev) =>
        Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1
          ? prev
          : { w: Math.round(width), h: Math.round(height) },
      )
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, size] as const
}

function VisualFrame({ children }: { children: (size: Size) => React.ReactNode }) {
  const [ref, size] = useBoxSize()

  return (
    <div ref={ref} className="absolute inset-0">
      {size.w > 0 && size.h > 0 ? (
        <svg
          aria-hidden
          viewBox={`0 0 ${size.w} ${size.h}`}
          className="absolute inset-0 h-full w-full"
        >
          {children(size)}
        </svg>
      ) : null}
    </div>
  )
}

function Caption({ h, children }: { h: number; children: React.ReactNode }) {
  return (
    <text x={PAD} y={capBaseline(h)} className="font-mono" fontSize="10" fill={DIM}>
      {children}
    </text>
  )
}

/* ── 1 · swarm orchestration ─────────────────────────────────────────── */

const ROLES = ['recon', 'scan', 'respond']

export function SwarmVisual() {
  return (
    <VisualFrame>
      {({ w, h }) => {
        const top = 14
        const floor = capBaseline(h) - 20
        const cy = Math.round((top + floor) / 2)

        const ring = clamp((floor - top) / 2 - 10, 20, 48)
        const goalX = Math.round(w - PAD - ring - 6)

        // One row of agent chips per role. The pitch is capped so the rows
        // stop short of the goal — the gap they leave is the trunk, and
        // without it the convergence has nowhere to happen.
        const chipsX = PAD + 54
        const chip = 20
        const room = goalX - ring - 26 - chipsX
        const count = clamp(Math.floor(room / 30), 3, 10)
        const pitch = clamp(room / count, 26, 38)
        const trunkX = chipsX + (count - 1) * pitch + chip + 8

        const band = clamp((floor - top) / 2 - 16, 20, 56)
        const bands = [cy - band, cy, cy + band]

        return (
          <>
            <defs>
              <radialGradient id="swarm-core">
                <stop offset="0%" stopColor="#ffe8e8" />
                <stop offset="40%" stopColor={RED} />
                <stop offset="100%" stopColor="#8f1116" />
              </radialGradient>
              <linearGradient id="swarm-packet" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={HOT} stopOpacity="0.15" />
                <stop offset="100%" stopColor="#fff2f2" />
              </linearGradient>
            </defs>

            {/* every role runs its own trunk into the one shared objective */}
            {bands.map((by, b) => {
              const d = `M${trunkX} ${by} C ${trunkX + 44} ${by}, ${goalX - ring - 44} ${cy}, ${goalX - ring} ${cy}`
              return (
                <g key={`t${b}`}>
                  <path d={d} fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
                  <path
                    d={d}
                    pathLength={100}
                    fill="none"
                    stroke="url(#swarm-packet)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    className="bv-flow"
                    style={{ animationDelay: `${b * 0.55}s` }}
                  />
                </g>
              )
            })}

            {bands.map((by, b) => (
              <g key={`b${b}`}>
                <text x={PAD} y={by + 3.5} className="font-mono" fontSize="9.5" fill={DIM}>
                  {ROLES[b]}
                </text>

                {Array.from({ length: count }, (_, i) => {
                  const x = chipsX + i * pitch
                  return (
                    <g key={i}>
                      <rect
                        x={x}
                        y={by - chip / 2}
                        width={chip}
                        height={chip}
                        rx="6"
                        fill="#ffffff"
                        fillOpacity="0.035"
                        stroke="#ffffff"
                        strokeOpacity="0.05"
                      />
                      <circle
                        cx={x + chip / 2}
                        cy={by}
                        r="3"
                        fill={RED}
                        className="bv-breathe"
                        style={{ animationDelay: `${(b * count + i) * 0.13}s` }}
                      />
                    </g>
                  )
                })}
              </g>
            ))}

            {/* the objective everything is pulling toward */}
            <circle cx={goalX} cy={cy} r={ring + 16} fill={RED} opacity="0.06" />
            <circle
              cx={goalX}
              cy={cy}
              r={ring}
              fill="none"
              stroke={RED}
              strokeOpacity="0.18"
              strokeWidth="1"
              strokeDasharray="3 8"
              className="bv-spin-slow"
              style={{ transformOrigin: `${goalX}px ${cy}px` }}
            />
            <circle
              cx={goalX}
              cy={cy}
              r={ring * 0.62}
              fill="#0b0809"
              stroke={RED}
              strokeOpacity="0.32"
              strokeWidth="1"
            />
            {/* the objective is the product itself, so it wears the mark */}
            <DroneGlyph x={goalX} y={cy} size={ring * 0.94} fill={HOT} />

            <Caption h={h}>{count * 3} agents · 1 shared objective</Caption>
          </>
        )
      }}
    </VisualFrame>
  )
}

/* ── 2 · always-on defense ───────────────────────────────────────────── */

/**
 * A 24-hour activity strip, not a radar dish. The dish was a circle
 * floating in a rectangle — it left the corners empty and said nothing
 * about *when*. A timeline fills the box and puts the 3am spike where the
 * copy claims it is.
 */
const HOURS = [0, 6, 12, 18, 24]

export function RadarVisual() {
  return (
    <VisualFrame>
      {({ w, h }) => {
        const top = 14
        const axisY = capBaseline(h) - 21
        const base = axisY - 12
        const span = w - PAD * 2

        const n = clamp(Math.floor(span / 9), 14, 56)
        const pitch = span / n
        const barW = clamp(pitch - 4.6, 2.4, 5)

        const chipH = 24
        const chipW = clamp(span * 0.42, 118, 148)
        const peak = Math.max(20, base - top - chipH - 20)

        // deterministic, so the strip looks like traffic and never re-rolls
        const height = (i: number) => 3 + (((i * 37) % 17) / 17) * peak * 0.66

        const ev = Math.round(n * 0.14) // ~03:00
        const evX = PAD + ev * pitch + barW / 2
        const chipX = clamp(evX - chipW / 2, PAD, w - PAD - chipW)

        return (
          <>
            <defs>
              <linearGradient id="defense-sweep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={RED} stopOpacity="0" />
                <stop offset="45%" stopColor={RED} stopOpacity="0.55" />
                <stop offset="100%" stopColor={RED} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="defense-wake" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={RED} stopOpacity="0" />
                <stop offset="100%" stopColor={RED} stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {Array.from({ length: n }, (_, i) => {
              const bh = i === ev ? peak : height(i)
              return (
                <rect
                  key={i}
                  x={PAD + i * pitch}
                  y={base - bh}
                  width={barW}
                  height={bh}
                  rx={barW / 2}
                  fill={i === ev ? RED : '#ffffff'}
                  fillOpacity={i === ev ? 1 : 0.14}
                  className={i === ev ? 'bv-alert' : undefined}
                />
              )
            })}

            <line
              x1={PAD}
              y1={base}
              x2={w - PAD}
              y2={base}
              stroke="#ffffff"
              strokeOpacity="0.09"
            />

            {/* the watch, running the clock whether or not anyone is awake */}
            <g className="bv-track" style={run(span - 2)}>
              <rect x={PAD - 76} y={top} width="76" height={base - top} fill="url(#defense-wake)" />
              <rect x={PAD} y={top} width="2" height={base - top} fill="url(#defense-sweep)" />
            </g>

            <circle
              cx={evX}
              cy={base - peak}
              r="10"
              fill="none"
              stroke={RED}
              strokeWidth="1.5"
              className="bv-ping"
              style={{ animationDelay: '0.72s' }}
            />
            <circle cx={evX} cy={base - peak} r="3.4" fill={HOT} />

            <line
              x1={evX}
              y1={top + chipH + 2}
              x2={evX}
              y2={base - peak - 13}
              stroke={RED}
              strokeOpacity="0.35"
              strokeDasharray="2 4"
            />

            <g className="bv-reveal" style={{ animationDelay: '0.9s' }}>
              <rect
                x={chipX}
                y={top}
                width={chipW}
                height={chipH}
                rx={chipH / 2}
                fill="#1a0709"
                stroke={RED}
                strokeOpacity="0.45"
              />
              <path
                d={`M${chipX + 16} ${top + 12} l3.6 3.8 6.6 -7.6`}
                fill="none"
                stroke={HOT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x={chipX + 34}
                y={top + 16}
                className="font-mono"
                fontSize="10.5"
                fill="#ffb3b3"
              >
                auto-contained
              </text>
            </g>

            {HOURS.map((hr, i) => (
              <text
                key={hr}
                x={PAD + (hr / 24) * span}
                y={axisY}
                className="font-mono"
                fontSize="9"
                fill="#4a4a4a"
                textAnchor={i === 0 ? 'start' : i === HOURS.length - 1 ? 'end' : 'middle'}
              >
                {String(hr).padStart(2, '0')}
              </text>
            ))}

            <Caption h={h}>03:14 · contained · nobody paged</Caption>
          </>
        )
      }}
    </VisualFrame>
  )
}

/* ── 3 · permission gate ─────────────────────────────────────────────── */

/**
 * A queue crossing a gate rail. The earlier boom-barrier read as a grey
 * stick over two empty dotted lines; a stack of named actions makes the
 * split legible at a glance — four walk through, one stops.
 */
const ACTIONS = [
  { label: 'map exposed routes', short: 'map routes', safe: true },
  { label: 'read source tree', short: 'read source', safe: true },
  { label: 'fuzz login params', short: 'fuzz params', safe: true },
  { label: 'diff dependencies', short: 'diff deps', safe: true },
  { label: 'drop table users', short: 'drop table', safe: false },
]

export function GateVisual() {
  return (
    <VisualFrame>
      {({ w, h }) => {
        const top = 14
        const rowH = 20
        const space = capBaseline(h) - 18 - top
        const pitch = clamp(space / ACTIONS.length, 21, 38)
        const rowY = (i: number) => top + rowH / 2 + i * pitch

        const chipW = clamp(w * 0.27, 92, 118)
        const chipX = w - PAD - chipW
        const railX = Math.round(clamp(w * 0.58, PAD + 132, chipX - 18))
        const safeW = railX + 44 - PAD
        const heldW = railX - 18 - PAD
        const lastY = rowY(ACTIONS.length - 1)

        // the tick sits at the far end of each bar, so the label has to give
        // way rather than run underneath it
        const short = safeW < 240

        return (
          <>
            {/* the rail itself — everything harmful stops on this line */}
            <line
              x1={railX}
              y1={top - 2}
              x2={railX}
              y2={lastY + rowH / 2 + 8}
              stroke={RED}
              strokeOpacity="0.42"
              strokeDasharray="3 6"
            />

            {ACTIONS.map((a, i) => {
              const y = rowY(i)
              const barW = a.safe ? safeW : heldW

              return (
                <g key={a.label}>
                  <rect
                    x={PAD}
                    y={y - rowH / 2}
                    width={barW}
                    height={rowH}
                    rx="7"
                    fill={a.safe ? '#ffffff' : RED}
                    fillOpacity={a.safe ? 0.04 : 0.1}
                    stroke={a.safe ? '#ffffff' : RED}
                    strokeOpacity={a.safe ? 0.05 : 0.32}
                  />
                  <text
                    x={PAD + 26}
                    y={y + 3.5}
                    className="font-mono"
                    fontSize="10.5"
                    fill={a.safe ? TEXT : '#ffb3b3'}
                  >
                    {short ? a.short : a.label}
                  </text>

                  {a.safe ? (
                    <path
                      d={`M${PAD + barW - 26} ${y} l3.4 3.6 6.4 -7.4`}
                      fill="none"
                      stroke="#6f6f6f"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}

                  {/* the action itself, walking its lane */}
                  <circle
                    cx={PAD + 13}
                    cy={y}
                    r="3.4"
                    fill={a.safe ? '#8a8a8a' : HOT}
                    className={a.safe ? 'bv-pass' : 'bv-hold'}
                    style={
                      a.safe
                        ? run(safeW - 26, { animationDelay: `${i * 0.5}s` })
                        : ({
                            '--bv-run': `${heldW - 26}px`,
                            '--bv-run-2': `${safeW - 26}px`,
                          } as React.CSSProperties)
                    }
                  />
                </g>
              )
            })}

            {/* the only button in the whole product that has to be pressed */}
            <g className="bv-reveal" style={{ animationDelay: '2.6s' }}>
              <rect
                x={chipX}
                y={lastY - 13}
                width={chipW}
                height="26"
                rx="13"
                fill="#1a0709"
                stroke={RED}
                strokeOpacity="0.45"
              />
              <path
                d={`M${chipX + 16} ${lastY} l3.6 3.8 6.6 -7.6`}
                fill="none"
                stroke={HOT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x={chipX + 34}
                y={lastY + 4}
                className="font-mono"
                fontSize="10.5"
                fill="#ffb3b3"
              >
                approve
              </text>
            </g>

            <Caption h={h}>4 auto · 1 waiting on you</Caption>
          </>
        )
      }}
    </VisualFrame>
  )
}

/* ── 4 · proof, not alarms ───────────────────────────────────────────── */

/**
 * Noise on the left, the reproduction on the right. The card has to carry
 * a comparison — "not another alarm" only means something next to the
 * alarms — and a lone transcript in a window frame wasn't making it. The
 * left column is deliberately repetitive and unreadable-ish; the right one
 * is the only place anything is confirmed.
 */
const NOISE = [
  'possible sqli',
  'weak cipher suite',
  'open redirect?',
  'verbose error page',
  'missing csp header',
  'cookie not httponly',
  'possible sqli',
]

const PROOF_LINES = [
  { text: 'POST /api/login', hot: "' OR 1=1--" },
  { text: '200 OK · 1482 rows · 41ms', hot: '' },
  { text: 'auth bypassed — no password', hot: '' },
  { text: 'poc.http + har attached', hot: '' },
]

export function ProofVisual() {
  return (
    <VisualFrame>
      {({ w, h }) => {
        const top = 14
        const bottom = capBaseline(h) - 16

        // Below ~430 there isn't room for two columns. The noise side is the
        // one that goes — the proof is the point of the card.
        const showNoise = w >= 430
        const divX = showNoise ? Math.round(PAD + (w - PAD * 2) * 0.4) : PAD - 18
        const leftW = divX - 18 - PAD
        const rightX = divX + 18
        const rightW = w - PAD - rightX

        const labelY = top + 9
        const listTop = labelY + 14

        const noisePitch = clamp((bottom - listTop) / NOISE.length, 15, 24)
        const noiseH = Math.min(15, noisePitch - 5)

        const fs = rightW < 250 ? 10 : 11
        const adv = fs * 0.6 // Geist Mono advance width
        const chipH = 24
        const chipW = clamp(rightW * 0.46, 100, 130)
        const chipY = bottom - chipH
        const rowPitch = clamp((chipY - 14 - listTop) / PROOF_LINES.length, 18, 30)

        return (
          <>
            {showNoise ? (
              <>
                <text x={PAD} y={labelY} className="font-mono" fontSize="9.5" fill="#4a4a4a">
                  everyone else
                </text>

                {NOISE.map((label, i) => {
                  const y = listTop + i * noisePitch
                  return (
                    <g key={`${label}${i}`}>
                      <rect
                        x={PAD}
                        y={y}
                        width={leftW}
                        height={noiseH}
                        rx="4"
                        fill="#ffffff"
                        fillOpacity="0.025"
                      />
                      <circle
                        cx={PAD + 11}
                        cy={y + noiseH / 2}
                        r="3"
                        fill="none"
                        stroke="#4a4a4a"
                        strokeWidth="1.1"
                        className="bv-breathe"
                        style={{ animationDelay: `${i * 0.42}s` }}
                      />
                      <text
                        x={PAD + 22}
                        y={y + noiseH / 2 + 3.2}
                        className="font-mono"
                        fontSize="9.5"
                        fill="#4a4a4a"
                      >
                        {label}
                      </text>
                    </g>
                  )
                })}

                <line
                  x1={divX}
                  y1={top}
                  x2={divX}
                  y2={bottom}
                  stroke="#ffffff"
                  strokeOpacity="0.07"
                />
              </>
            ) : null}

            <text x={rightX} y={labelY} className="font-mono" fontSize="9.5" fill={RED}>
              swrmz
            </text>

            {PROOF_LINES.map((line, i) => {
              const y = listTop + 12 + i * rowPitch
              return (
                <g key={line.text} className="bv-step" style={{ animationDelay: `${0.3 + i * 0.6}s` }}>
                  <circle cx={rightX + 4} cy={y - 4} r="3.2" fill={RED} />
                  <text x={rightX + 18} y={y} className="font-mono" fontSize={fs} fill="#9a9a9a">
                    {line.text}
                  </text>
                  {line.hot ? (
                    <text
                      x={rightX + 18 + (line.text.length + 1) * adv}
                      y={y}
                      className="font-mono"
                      fontSize={fs}
                      fill="#ff8a8a"
                    >
                      {line.hot}
                    </text>
                  ) : null}
                </g>
              )
            })}

            <g className="bv-reveal" style={{ animationDelay: '2.4s' }}>
              <rect
                x={rightX}
                y={chipY}
                width={chipW}
                height={chipH}
                rx={chipH / 2}
                fill="#1a0709"
                stroke={RED}
                strokeOpacity="0.45"
              />
              <path
                d={`M${rightX + 16} ${chipY + 12} l3.6 3.8 6.6 -7.6`}
                fill="none"
                stroke={HOT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x={rightX + 34}
                y={chipY + 16}
                className="font-mono"
                fontSize="10.5"
                fill="#ffb3b3"
              >
                exploited
              </text>
            </g>

            <Caption h={h}>247 alerts · 1 reproduction</Caption>
          </>
        )
      }}
    </VisualFrame>
  )
}

/* ── 5 · team-scale review ───────────────────────────────────────────── */

export function ReviewVisual() {
  return (
    <VisualFrame>
      {({ w, h }) => {
        const top = 12
        const gridX = PAD + 18
        const cell = 24
        const pitch = 32
        const gap = pitch - cell

        const cols = clamp(Math.floor((w - gridX - PAD + gap) / pitch), 4, 18)
        const rows = clamp(Math.floor((capBaseline(h) - 18 - top + gap) / pitch), 3, 7)
        const gridW = cols * pitch - gap
        const gridH = rows * pitch - gap
        const beamW = 76

        // spread the findings over distinct rows and rising columns
        const flagged = [0, 1, 2, 3].map(
          (k) => ((k + 1) % rows) * cols + Math.round(((k + 1) / 5) * (cols - 1)),
        )

        return (
          <>
            <defs>
              <linearGradient id="review-beam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={RED} stopOpacity="0" />
                <stop offset="50%" stopColor={RED} stopOpacity="0.4" />
                <stop offset="100%" stopColor={RED} stopOpacity="0" />
              </linearGradient>
            </defs>

            {Array.from({ length: cols * rows }, (_, i) => (
              <rect
                key={i}
                x={gridX + (i % cols) * pitch}
                y={top + Math.floor(i / cols) * pitch}
                width={cell}
                height={cell}
                rx="6"
                fill="#ffffff"
                fillOpacity="0.035"
                stroke="#ffffff"
                strokeOpacity="0.05"
              />
            ))}

            {/* The pass, sweeping the surface left to right. It parks fully
                outside the card so that with motion disabled you get a clean
                grid rather than a red slab down the left edge. */}
            <rect
              x={-beamW}
              y={top - 4}
              width={beamW}
              height={gridH + 8}
              fill="url(#review-beam)"
              className="bv-scan"
              style={run(gridX + gridW + beamW)}
            />

            {flagged.map((i) => {
              const x = gridX + (i % cols) * pitch
              const y = top + Math.floor(i / cols) * pitch
              return (
                <g
                  key={`f${i}`}
                  className="bv-flag"
                  // lights the moment the beam's centre reaches its column
                  style={{
                    animationDelay: `${(5 * (x + cell / 2 + beamW / 2)) / (gridX + gridW + beamW)}s`,
                  }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={cell}
                    height={cell}
                    rx="6"
                    fill={RED}
                    fillOpacity="0.2"
                    stroke={RED}
                    strokeOpacity="0.7"
                  />
                  <circle cx={x + cell / 2} cy={y + cell / 2} r="3.2" fill={HOT} />
                </g>
              )
            })}

            <Caption h={h}>{cols * rows} files · 4 flagged</Caption>
          </>
        )
      }}
    </VisualFrame>
  )
}

/* ── 6 · zero-install access ─────────────────────────────────────────── */

/**
 * The URL is the product, so the URL is the biggest thing in the frame.
 * The old browser mock spent most of its box drawing a window that isn't
 * the point, and the rows inside it read as a loading skeleton. Here the
 * pill carries the claim and the two chip rows carry the proof of it:
 * what you skipped, and what came up anyway.
 */
const SKIPPED = ['git clone', 'npm install', 'api key', 'webhook config']

const BOOT = [
  { label: 'recon', status: 'ready' },
  { label: 'scan', status: 'ready' },
  { label: 'defend', status: 'armed' },
]

export function AccessVisual() {
  return (
    <VisualFrame>
      {({ w, h }) => {
        const top = 12
        const bottom = capBaseline(h) - 16
        const total = bottom - top
        const colW = w - PAD * 2
        const gap = 10

        const pillH = clamp(total * 0.24, 34, 46)
        const rowH = clamp(total * 0.17, 26, 34)
        const band = clamp((total - pillH - rowH * 2) / 2, 12, 30)
        const y0 = top + (total - (pillH + rowH * 2 + band * 2)) / 2

        const pillY = y0
        const skipY = pillY + pillH + band
        const bootY = skipY + rowH + band

        const urlFs = clamp(pillH * 0.34, 12, 16)
        const urlX = PAD + 42
        const urlW = 'swarms.tech'.length * urlFs * 0.6

        // as many struck chips as fit without squeezing the labels
        const skipN = clamp(Math.floor((colW + gap) / (104 + gap)), 2, SKIPPED.length)
        const skipW = (colW - gap * (skipN - 1)) / skipN
        const bootW = (colW - gap * 2) / 3

        return (
          <>
            <defs>
              <clipPath id="access-type">
                <rect
                  x={urlX}
                  y={pillY + pillH / 2 - 10}
                  width={urlW + 2}
                  height="20"
                  className="bv-type"
                />
              </clipPath>
            </defs>

            {/* the whole install process */}
            <rect
              x={PAD}
              y={pillY}
              width={colW}
              height={pillH}
              rx={pillH / 2}
              fill="#ffffff"
              fillOpacity="0.045"
              stroke="#ffffff"
              strokeOpacity="0.1"
            />
            <path
              d={`M${PAD + 21} ${pillY + pillH / 2 - 1} v-3 a4 4 0 0 1 8 0 v3`}
              fill="none"
              stroke="#6f6f6f"
              strokeWidth="1.4"
            />
            <rect
              x={PAD + 19}
              y={pillY + pillH / 2 - 1}
              width="12"
              height="9"
              rx="2"
              fill="none"
              stroke="#6f6f6f"
              strokeWidth="1.4"
            />
            <g clipPath="url(#access-type)">
              <text
                x={urlX}
                y={pillY + pillH / 2 + urlFs * 0.36}
                className="font-mono"
                fontSize={urlFs}
                fill="#e6e6e6"
              >
                swarms.tech
              </text>
            </g>
            <rect
              x={urlX + urlW + 2}
              y={pillY + pillH / 2 - urlFs * 0.55}
              width="1.6"
              height={urlFs * 1.1}
              fill={HOT}
              className="bv-caret"
            />
            <circle cx={w - PAD - 56} cy={pillY + pillH / 2} r="3.4" fill={RED} className="bv-breathe" />
            <text
              x={w - PAD - 20}
              y={pillY + pillH / 2 + 3.5}
              className="font-mono"
              fontSize="10"
              fill="#7a7a7a"
              textAnchor="end"
            >
              live
            </text>

            {/* what you never did */}
            {SKIPPED.slice(0, skipN).map((label, i) => {
              const x = PAD + i * (skipW + gap)
              return (
                <g key={label}>
                  <rect
                    x={x}
                    y={skipY}
                    width={skipW}
                    height={rowH}
                    rx="8"
                    fill="#ffffff"
                    fillOpacity="0.02"
                    stroke="#ffffff"
                    strokeOpacity="0.045"
                  />
                  <text
                    x={x + skipW / 2}
                    y={skipY + rowH / 2 + 3.4}
                    className="font-mono"
                    fontSize="10"
                    fill="#5a5a5a"
                    textAnchor="middle"
                  >
                    {label}
                  </text>
                  <rect
                    x={x + 10}
                    y={skipY + rowH / 2 - 0.9}
                    width={skipW - 20}
                    height="1.8"
                    fill={RED}
                    className="bv-strike"
                    style={{ animationDelay: `${1.8 + i * 0.18}s` }}
                  />
                </g>
              )
            })}

            {/* and what came up regardless */}
            {BOOT.map((agent, i) => {
              const x = PAD + i * (bootW + gap)
              return (
                <g key={agent.label} className="bv-boot" style={{ animationDelay: `${0.5 + i * 0.26}s` }}>
                  <rect
                    x={x}
                    y={bootY}
                    width={bootW}
                    height={rowH}
                    rx="8"
                    fill="#ffffff"
                    fillOpacity="0.045"
                  />
                  <circle
                    cx={x + 15}
                    cy={bootY + rowH / 2}
                    r="3.4"
                    fill={RED}
                    opacity={0.85 - i * 0.16}
                  />
                  <text
                    x={x + 28}
                    y={bootY + rowH / 2 + 3.4}
                    className="font-mono"
                    fontSize="10"
                    fill="#8a8a8a"
                  >
                    {agent.label}
                  </text>
                  <text
                    x={x + bootW - 12}
                    y={bootY + rowH / 2 + 3.4}
                    className="font-mono"
                    fontSize="9.5"
                    fill="#4f4f4f"
                    textAnchor="end"
                  >
                    {agent.status}
                  </text>
                </g>
              )
            })}

            <Caption h={h}>0 installs · 0 keys · 1 url</Caption>
          </>
        )
      }}
    </VisualFrame>
  )
}