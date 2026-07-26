import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import type { MotionValue } from 'motion/react'

import { DroneGlyph } from '@/components/brand-logo'

/**
 * The attack run — the one scroll-scrubbed moment on the page.
 *
 * Everything else here loops on a timer and ignores you. This section hands
 * the timeline to the scroll wheel: the drone descends, locks, fires, lands a
 * reproduction, and then stops dead at a rail it will not cross without you.
 *
 * That last beat is the whole reason the section exists. A drone that just
 * blows something up would argue against the product — the bento spends two
 * cards promising that destructive work waits for a human. So the climax is
 * the pause, not the hit.
 *
 * Scrubbing only runs where the layout is side-by-side. The scene is 420px
 * tall, and stacked under the copy it is taller than the viewport it would
 * have to be sticky in — so the scene would crop its own ending. Below
 * 1024px the whole thing renders as the finished frame and fades in once.
 */

/** where each line lights up, in scroll progress */
const STAGES = [
  { at: 0.05, step: '01', label: 'recon', detail: '412 routes mapped' },
  { at: 0.27, step: '02', label: 'locked', detail: 'POST /api/login' },
  { at: 0.44, step: '03', label: 'firing', detail: "' OR 1=1--" },
  { at: 0.63, step: '04', label: 'confirmed', detail: 'reproduction captured' },
  { at: 0.83, step: '05', label: 'held', detail: 'patch waiting on you' },
]

/**
 * The stage is a fixed 420px box so every offset below can be a plain pixel
 * number. Percentages would drift the drone off the beam the moment the box
 * changed height, and the payload has to land exactly on the target's edge.
 */
const STAGE_H = 420
const DRONE_BOX = 84
const DRONE_TOP = 6 // resting offset of the drone's box inside the stage
const TARGET_H = 104
const TARGET_TOP = STAGE_H - TARGET_H // 316
const DRONE_END_Y = 104 // travel at the end of the dive
const BEAM_TOP = DRONE_TOP + DRONE_END_Y + DRONE_BOX - 10 // just inside the hull
const BEAM_RUN = TARGET_TOP - BEAM_TOP
const RAIL_TOP = 226

/**
 * True once the viewport is wide enough for the scrubbed version.
 *
 * 1024px is not arbitrary — it is exactly where the grid below goes
 * two-column (`lg:`). Below that the copy stacks on top of the 420px stage,
 * which together are taller than a laptop viewport, so a sticky scene would
 * crop its own ending. The threshold and the layout have to be the same
 * number or the tablet range breaks.
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const sync = () => setIsDesktop(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return isDesktop
}

function StageLine({
  progress,
  at,
  step,
  label,
  detail,
  isLast,
}: {
  progress: MotionValue<number>
  at: number
  step: string
  label: string
  detail: string
  isLast: boolean
}) {
  // a short ramp rather than a hard switch, so a fast scroll still reads as
  // lines arriving in order instead of all five snapping on at once
  const lit = [at - 0.06, at]

  const labelColor = useTransform(progress, lit, ['#4d4d4d', '#f2f3f4'])
  const detailColor = useTransform(progress, lit, ['#3d3d3d', isLast ? '#ff6b6b' : '#9a9a9a'])
  const stepColor = useTransform(progress, lit, ['#2c2c2c', '#6f6f6f'])
  const markColor = useTransform(progress, lit, ['#262626', isLast ? '#ff3b3b' : '#ff6b6b'])
  const markGlow = useTransform(progress, [at - 0.06, at, at + 0.18], [0, 1, 0.4])

  return (
    <li className="flex items-baseline gap-3.5">
      <motion.span
        className="font-mono text-[10.5px] tracking-[0.14em]"
        style={{ color: stepColor }}
      >
        {step}
      </motion.span>

      {/* the marker rides its own glow so the active line has a light source
          and the spent ones settle back to a dim ember */}
      <span className="relative flex h-[7px] w-[7px] shrink-0 translate-y-[-2px] items-center justify-center">
        <motion.span
          aria-hidden
          className="absolute h-[15px] w-[15px] rounded-full blur-[5px]"
          style={{ backgroundColor: markColor, opacity: markGlow }}
        />
        <motion.span
          className="h-[6px] w-[6px] rounded-full"
          style={{ backgroundColor: markColor }}
        />
      </span>

      <motion.span
        className="font-mono text-[13px] tracking-[-0.01em]"
        style={{ color: labelColor }}
      >
        {label}
      </motion.span>

      <motion.span className="font-mono text-[12.5px]" style={{ color: detailColor }}>
        · {detail}
      </motion.span>
    </li>
  )
}

/**
 * The lock-on reticle.
 *
 * Four corner brackets rather than a ring. The target is a wide, opaque
 * rectangle, so a circle centred on it comes out bisected — you see an arc
 * above and an arc below and it reads as two stray marks. Brackets hug the
 * shape whatever its aspect ratio, and they are the more legible targeting
 * idiom anyway.
 */
function Reticle({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.24, 0.33, 0.88, 0.96], [0, 1, 1, 0.28])
  const scale = useTransform(progress, [0.24, 0.36], [1.22, 1])

  const CORNERS = [
    '-top-[7px] -left-[7px] border-t-2 border-l-2',
    '-top-[7px] -right-[7px] border-t-2 border-r-2',
    '-bottom-[7px] -left-[7px] border-b-2 border-l-2',
    '-bottom-[7px] -right-[7px] border-b-2 border-r-2',
  ]

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-[7%]"
      style={{ top: 0, height: TARGET_H, opacity, scale }}
    >
      {CORNERS.map((corner) => (
        <span
          key={corner}
          className={`absolute h-[15px] w-[15px] rounded-[3px] border-blood-100/75 ${corner}`}
        />
      ))}
    </motion.div>
  )
}

/** the endpoint taking the hit */
function Target({ progress }: { progress: MotionValue<number> }) {
  const shellBorder = useTransform(
    progress,
    [0.24, 0.34, 0.6, 0.7],
    [
      'rgba(255,255,255,0.07)',
      'rgba(255,59,59,0.28)',
      'rgba(255,59,59,0.28)',
      'rgba(255,59,59,0.6)',
    ],
  )
  const verdictOpacity = useTransform(progress, [0.62, 0.7], [0, 1])

  // the injected string arrives in the field the moment the payload lands, so
  // the log line and the picture are visibly the same event
  const cleanField = useTransform(progress, [0.5, 0.58], [1, 0])
  const dirtyField = useTransform(progress, [0.52, 0.6], [0, 1])

  // The blast is centred on where the payload actually meets the shell — the
  // top edge, not the middle — so it expands out of a point instead of being
  // cut in half by the slab. It is drawn after the shell, so it passes over it.
  const hitOpacity = useTransform(progress, [0.57, 0.61, 0.76], [0, 1, 0])
  const hitScale = useTransform(progress, [0.57, 0.76], [0.16, 1])
  const innerOpacity = useTransform(progress, [0.56, 0.6, 0.69], [0, 1, 0])
  const innerScale = useTransform(progress, [0.56, 0.69], [0.1, 1])
  // short and hot. A wide soft one reads as a lens smudge, not a hit.
  const flashOpacity = useTransform(progress, [0.565, 0.59, 0.65], [0, 1, 0])
  // the shell takes the punch — 3px is invisible as motion but you feel it
  const shellNudge = useTransform(progress, [0.57, 0.6, 0.66], [0, -3, 0])

  return (
    <div className="absolute inset-x-0" style={{ top: TARGET_TOP, height: TARGET_H }}>
      <Reticle progress={progress} />

      <motion.div
        className="absolute inset-x-[7%] top-0 overflow-hidden rounded-[14px] border bg-[linear-gradient(180deg,#100c0d,#080607)] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]"
        style={{ borderColor: shellBorder, height: TARGET_H, y: shellNudge }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-2">
          <span className="font-mono text-[11.5px] text-neutral-300">POST /api/login</span>
          <motion.span
            className="rounded-md border border-blood-100/40 bg-blood-500/40 px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-blood-50"
            style={{ opacity: verdictOpacity }}
          >
            SQLI
          </motion.span>
        </div>

        {/* two inert rows: enough to read as a login form, not enough to look
            like a component we are asking anyone to evaluate */}
        <div className="px-3.5 py-3">
          <div className="relative h-[15px]">
            <motion.div
              className="absolute top-[3px] h-[9px] w-[62%] rounded-full bg-white/[0.07]"
              style={{ opacity: cleanField }}
            />
            <motion.span
              className="absolute top-0 font-mono text-[11.5px] text-blood-50"
              style={{ opacity: dirtyField }}
            >
              &apos; OR 1=1--
            </motion.span>
          </div>
          <div className="mt-2 h-[9px] w-[44%] rounded-full bg-white/[0.05]" />
        </div>
      </motion.div>

      {/* impact, on top of the shell so it reads as a shockwave through it —
          two rings on the same centre, the inner one a beat ahead */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blood-100/70"
        style={{ top: 0, opacity: hitOpacity, scale: hitScale }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-1/2 h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blood-50/60"
        style={{ top: 0, opacity: innerOpacity, scale: innerScale }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-[4px]"
        style={{ top: 0, opacity: flashOpacity }}
      />
    </div>
  )
}

function AttackRunScene({ scrub, reduceMotion }: { scrub: boolean; reduceMotion: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)

  // One motion value feeds every transform below, and its identity never
  // changes — the scroll spring is piped into it only when scrubbing is on.
  // With scrubbing off it rests at 1, so the fallback is the finished frame
  // rather than an empty stage.
  const progress = useMotionValue(scrub ? 0 : 1)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // the reference site smooths its one scrubbed effect by about 0.07 per
  // frame; a spring is the same lag with better behaviour on a flick
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    restDelta: 0.0005,
  })

  useEffect(() => {
    if (!scrub) {
      progress.set(1)
      return
    }
    progress.set(smoothed.get())
    return smoothed.on('change', (value) => progress.set(value))
  }, [scrub, smoothed, progress])

  // A long dive. The first version moved the drone 138px over 2500px of
  // scroll, which is not a dive — it is a still photograph that drifts.
  const droneY = useTransform(progress, [0, 0.3, 0.52, 0.68], [-104, 54, DRONE_END_Y, DRONE_END_Y])
  const droneScale = useTransform(progress, [0, 0.3, 0.52], [0.42, 0.95, 1.06])
  const droneRotate = useTransform(progress, [0, 0.3], [-14, 0])
  // lit from the first pixel of scroll — a stage with nothing in it looks
  // broken to anyone who lands here mid-page
  const droneOpacity = useTransform(progress, [0, 0.03], [0.35, 1])

  // the trajectory draws behind a bright head that travels down it, so the
  // payload reads as falling rather than as a line being stretched
  const trailScale = useTransform(progress, [0.4, 0.56], [0, 1])
  const trailOpacity = useTransform(progress, [0.38, 0.44, 0.68, 0.78], [0, 1, 1, 0])
  const headY = useTransform(progress, [0.4, 0.57], [0, BEAM_RUN])
  const headOpacity = useTransform(progress, [0.39, 0.43, 0.55, 0.6], [0, 1, 1, 0])

  const railScale = useTransform(progress, [0.76, 0.9], [0, 1])
  const railOpacity = useTransform(progress, [0.74, 0.81], [0, 1])
  const holdOpacity = useTransform(progress, [0.85, 0.94], [0, 1])

  return (
    <section
      ref={sectionRef}
      id="attack-run"
      // The tall box only exists to give the sticky scene something to scrub
      // against, so it collapses to content height when scrubbing is off.
      // 200vh, not 280: at 280 a full wheel notch barely moved the scene and
      // the whole thing read as static.
      className={scrub ? 'relative isolate h-[200vh]' : 'relative isolate'}
    >
      <div
        className={
          scrub
            ? 'sticky top-0 flex h-screen min-h-[660px] items-center'
            : 'flex items-center py-24'
        }
      >
        <motion.div
          initial={{ opacity: 0, y: reduceMotion || scrub ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[1180px] px-6"
        >
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] lg:gap-16">
            {/* ── the story, in words ─────────────────────────────── */}
            <div>
              {/* the break is hard-set: left to itself this lands as
                  "…Then it / waits." and orphans the payload word */}
              <h2 className="bg-[linear-gradient(100deg,#5f5f5f_0%,#ffffff_52%,#c9c9c9_100%)] bg-clip-text text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.1] font-light tracking-[-0.02em] text-transparent">
                <span className="block">It breaks in.</span>
                <span className="block">Then it waits.</span>
              </h2>

              <p className="mt-5 max-w-[46ch] text-[14px] leading-[1.65] text-neutral-500">
                One run, end to end. The swarm maps your surface, picks the way in, proves it lands
                — and parks the destructive half behind a rail only you can drop.
              </p>

              <ol className="mt-9 space-y-[13px]">
                {STAGES.map((stage, i) => (
                  <StageLine
                    key={stage.step}
                    progress={progress}
                    at={stage.at}
                    step={stage.step}
                    label={stage.label}
                    detail={stage.detail}
                    isLast={i === STAGES.length - 1}
                  />
                ))}
              </ol>
            </div>

            {/* ── the story, in pictures ──────────────────────────── */}
            <div
              aria-hidden
              className="relative mx-auto w-full max-w-[520px]"
              style={{ height: STAGE_H }}
            >
              {/* the surface being flown over, fading out before the type */}
              <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:radial-gradient(88%_78%_at_50%_58%,#000_16%,transparent_76%)]" />

              {/* the ember the whole scene is lit from */}
              <div className="pointer-events-none absolute -bottom-20 left-1/2 h-64 w-[74%] -translate-x-1/2 rounded-[100%] bg-blood-300/22 blur-[76px]" />

              {/* trajectory */}
              <motion.div
                className="pointer-events-none absolute left-1/2 w-[1.5px] origin-top -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,rgba(255,59,59,0),rgba(255,59,59,0.55))]"
                style={{
                  top: BEAM_TOP,
                  height: BEAM_RUN,
                  scaleY: trailScale,
                  opacity: trailOpacity,
                }}
              />

              {/* the payload itself */}
              <motion.div
                className="pointer-events-none absolute left-1/2 h-[26px] w-[2.5px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,rgba(255,59,59,0),#ff3b3b_45%,#fff4f4)] shadow-[0_0_12px_rgba(255,59,59,0.9)]"
                style={{ top: BEAM_TOP, y: headY, opacity: headOpacity }}
              />

              <Target progress={progress} />

              {/* ── the rail ──────────────────────────────────────────
                  Slams in from the centre after the proof lands. This is the
                  point of the section: the run is over, the fix is ready, and
                  it is not going anywhere. */}
              <motion.div
                className="pointer-events-none absolute inset-x-0 flex justify-center"
                style={{ top: RAIL_TOP, opacity: railOpacity }}
              >
                <motion.div
                  className="h-[2px] w-full rounded-full bg-[linear-gradient(90deg,transparent,#ff3b3b_18%,#ffb4b4_50%,#ff3b3b_82%,transparent)] shadow-[0_0_18px_rgba(255,59,59,0.55)]"
                  style={{ scaleX: railScale }}
                />
              </motion.div>

              <motion.div
                className="absolute inset-x-0 flex justify-center"
                style={{ top: RAIL_TOP + 12, opacity: holdOpacity }}
              >
                <span className="rounded-full border border-blood-100/45 bg-[#140a0b]/90 px-3 py-1 font-mono text-[10.5px] tracking-[0.12em] text-blood-50 backdrop-blur-sm">
                  HOLD · YOUR APPROVAL
                </span>
              </motion.div>

              {/* the drone, flown by the scroll wheel */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  top: DRONE_TOP,
                  width: DRONE_BOX,
                  height: DRONE_BOX,
                  y: droneY,
                  scale: droneScale,
                  rotate: droneRotate,
                  opacity: droneOpacity,
                }}
              >
                {/* the idle bob lives in here so it stacks with, rather than
                    overwrites, the scroll-driven transform on the wrapper */}
                <span className="bv-hover absolute inset-0 block">
                  <span className="pointer-events-none absolute inset-[-22%] rounded-full bg-blood-200/22 blur-[16px]" />
                  <svg viewBox="0 0 150 150" className="relative h-full w-full">
                    <DroneGlyph x={75} y={75} size={150} fill="#ff5252" />
                  </svg>
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function AttackRun() {
  const reduceMotion = useReducedMotion()
  const isDesktop = useIsDesktop()

  // Width only. This used to be `isDesktop && !reduceMotion`, which meant a
  // browser reporting `prefers-reduced-motion: reduce` got a still frame and
  // no explanation — the section looked broken rather than considerate. The
  // preference still shortens the one-shot entrance below; it no longer
  // switches the scene itself off.
  const scrub = isDesktop

  // Remounted on the flip, deliberately. useScroll measures its target's
  // offsets once; the section switches between 200vh-and-sticky and plain
  // content height underneath it, and without a fresh mount those offsets
  // stay pinned to the old layout and the scrub silently stops tracking.
  return (
    <AttackRunScene
      key={scrub ? 'scrub' : 'still'}
      scrub={scrub}
      reduceMotion={Boolean(reduceMotion)}
    />
  )
}
