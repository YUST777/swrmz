import { useCallback, useEffect, useRef, useState } from 'react'
import { animate } from 'motion/react'
import type { MotionValue } from 'motion/react'

/**
 * The toy at the end of the attack run.
 *
 * The scene stops at `HOLD · YOUR APPROVAL` and refuses to go further. This
 * is what happens when you clear it: the rail drops, the drone takes a
 * defensive position over the endpoint, and threats start falling. You fly
 * it, you fire, you keep them off the box.
 *
 * The framing matters. A shooter bolted onto this section would argue against
 * the product — the whole page promises the swarm stops and asks. So nothing
 * starts until a human acts: the drone only moves once you clear it, which is
 * the approval gate the copy has been describing all the way down.
 *
 * Desktop only, and opt-in. It never starts on its own.
 */

export type GamePhase = 'idle' | 'playing' | 'over'

export type StageGeometry = {
  stageH: number
  targetTop: number
  droneTop: number
  droneBox: number
  droneEndY: number
}

/** Fixed pools. Nothing is allocated once the loop is running. */
const MAX_THREATS = 16
const MAX_SHOTS = 14
const MAX_BURSTS = 10

const PLAY_MS = 26_000
const FIRE_COOLDOWN = 165
const MAX_BREACHES = 5

/** how far the drone drops to guard the endpoint once it is cleared */
const GUARD_DROP = 56

/**
 * How much the drone shrinks for the run. At full size it is nearly three
 * times the height of a threat chip, which makes the play area feel cramped
 * and the drone feel slow. This is a multiplier on top of the scroll's own
 * scale, applied to an inner element so the two never contend.
 */
const PLAY_SCALE = 0.6

/**
 * What is falling at you. Plain names, not acronyms — this used to read
 * sqli / xss / rce / csrf / ssrf / idor / xxe / lfi / rfi / ssti, which asks
 * the player to shoot ten things they cannot identify. Kept short: they
 * render inside small chips and a long string overflows.
 */
const KINDS = [
  'data theft',
  'fake login',
  'account steal',
  'site flood',
  'bad code',
  'password grab',
  'card skimmer',
  'file leak',
  'spy script',
  'ransom',
]

type Threat = { live: boolean; x: number; y: number; vy: number }
type Shot = { live: boolean; x: number; y: number }
type Burst = { live: boolean; x: number; y: number; t: number }

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const place = (el: HTMLElement | null, x: number, y: number) => {
  if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
}

export function AttackGame({
  armed,
  geometry,
  droneX,
  droneDrop,
  droneScale,
  onPhaseChange,
}: {
  armed: boolean
  geometry: StageGeometry
  /** the game steers the drone through these; the scroll owns the others */
  droneX: MotionValue<number>
  droneDrop: MotionValue<number>
  droneScale: MotionValue<number>
  onPhaseChange: (phase: GamePhase) => void
}) {
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [score, setScore] = useState({ contained: 0, breached: 0 })
  // You end a run mid-click. Without this the same press that fired the last
  // shot lands on RUN AGAIN and restarts before you have read your score.
  const [verdictLive, setVerdictLive] = useState(false)

  const layerRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const threatEls = useRef<Array<HTMLDivElement | null>>([])
  const shotEls = useRef<Array<HTMLDivElement | null>>([])
  const burstEls = useRef<Array<HTMLDivElement | null>>([])

  // Everything the loop touches lives in refs. Threat positions must not go
  // through React state — sixteen entities re-rendering at 60fps would spend
  // more time reconciling than moving.
  const world = useRef({
    w: 0,
    threats: Array.from({ length: MAX_THREATS }, (): Threat => ({ live: false, x: 0, y: 0, vy: 0 })),
    shots: Array.from({ length: MAX_SHOTS }, (): Shot => ({ live: false, x: 0, y: 0 })),
    bursts: Array.from({ length: MAX_BURSTS }, (): Burst => ({ live: false, x: 0, y: 0, t: 0 })),
    droneX: 0,
    lastFire: 0,
    nextSpawn: 0,
    started: 0,
    contained: 0,
    breached: 0,
    seed: 1,
  })

  // Math.random is fine here, but a tiny LCG keeps spawn patterns from
  // clumping the way Math.random does over short runs.
  const rand = useCallback(() => {
    const w = world.current
    w.seed = (w.seed * 1664525 + 1013904223) % 4294967296
    return w.seed / 4294967296
  }, [])

  const setPhaseBoth = useCallback(
    (next: GamePhase) => {
      setPhase(next)
      onPhaseChange(next)
    },
    [onPhaseChange],
  )

  // Where the drone's box sits before it is cleared — the hint and the hit
  // area hang off this. It has not dropped to the guard position yet.
  const idleBoxTop = geometry.droneTop + geometry.droneEndY

  // Shots leave the top of the hull, at the guard position. Scaling happens
  // about the drone's centre, so shrinking it lifts the visual top away from
  // the box top; without that offset the shots spawn above the rotors.
  const noseY = idleBoxTop + GUARD_DROP + (geometry.droneBox * (1 - PLAY_SCALE)) / 2

  useEffect(() => {
    if (phase !== 'over') {
      setVerdictLive(false)
      return
    }
    const id = window.setTimeout(() => setVerdictLive(true), 420)
    return () => window.clearTimeout(id)
  }, [phase])

  /* ── the loop ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'playing') return

    const w = world.current
    let frame = 0
    let last = 0
    let stopped = false

    const measure = () => {
      const el = layerRef.current
      if (el) w.w = el.clientWidth
    }
    measure()
    window.addEventListener('resize', measure)

    const tick = (now: number) => {
      if (stopped) return
      if (!last) last = now
      // clamp dt so a background tab or a slow frame cannot teleport a threat
      // straight through the drone's fire
      const dt = Math.min(48, now - last) / 1000
      last = now

      const elapsed = now - w.started
      const progress = clamp(elapsed / PLAY_MS, 0, 1)
      if (barRef.current) barRef.current.style.transform = `scaleX(${1 - progress})`

      /* spawn — the interval tightens as the run goes on */
      if (now >= w.nextSpawn) {
        const slot = w.threats.find((t) => !t.live)
        if (slot && w.w > 0) {
          slot.live = true
          slot.x = 28 + rand() * (w.w - 56)
          slot.y = -24
          slot.vy = 42 + rand() * 46 + progress * 34
          const el = threatEls.current[w.threats.indexOf(slot)]
          if (el) {
            el.textContent = KINDS[Math.floor(rand() * KINDS.length)]
            el.style.opacity = '1'
          }
        }
        w.nextSpawn = now + (880 - progress * 460)
      }

      /* threats fall */
      for (let i = 0; i < w.threats.length; i++) {
        const t = w.threats[i]
        if (!t.live) continue
        t.y += t.vy * dt
        if (t.y >= geometry.targetTop) {
          t.live = false
          w.breached += 1
          const el = threatEls.current[i]
          if (el) el.style.opacity = '0'
          setScore({ contained: w.contained, breached: w.breached })
          continue
        }
        place(threatEls.current[i], t.x, t.y)
      }

      /* shots climb */
      for (let i = 0; i < w.shots.length; i++) {
        const s = w.shots[i]
        if (!s.live) continue
        s.y -= 560 * dt
        if (s.y < -20) {
          s.live = false
          const el = shotEls.current[i]
          if (el) el.style.opacity = '0'
          continue
        }
        place(shotEls.current[i], s.x, s.y)
      }

      /* hits */
      for (let si = 0; si < w.shots.length; si++) {
        const s = w.shots[si]
        if (!s.live) continue
        for (let ti = 0; ti < w.threats.length; ti++) {
          const t = w.threats[ti]
          if (!t.live) continue
          if (Math.abs(s.x - t.x) > 22 || Math.abs(s.y - t.y) > 15) continue

          s.live = false
          t.live = false
          w.contained += 1
          const sEl = shotEls.current[si]
          const tEl = threatEls.current[ti]
          if (sEl) sEl.style.opacity = '0'
          if (tEl) tEl.style.opacity = '0'

          const burst = w.bursts.find((b) => !b.live)
          if (burst) {
            burst.live = true
            burst.x = t.x
            burst.y = t.y
            burst.t = 0
          }
          setScore({ contained: w.contained, breached: w.breached })
          break
        }
      }

      /* bursts */
      for (let i = 0; i < w.bursts.length; i++) {
        const b = w.bursts[i]
        if (!b.live) continue
        b.t += dt
        const el = burstEls.current[i]
        if (b.t > 0.34) {
          b.live = false
          if (el) el.style.opacity = '0'
          continue
        }
        const k = b.t / 0.34
        if (el) {
          el.style.opacity = String(1 - k)
          el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) translate(-50%, -50%) scale(${0.3 + k * 1.7})`
        }
      }

      if (progress >= 1 || w.breached >= MAX_BREACHES) {
        setPhaseBoth('over')
        return
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
    }
  }, [phase, geometry.targetTop, rand, setPhaseBoth])

  /* ── input ────────────────────────────────────────────────────────── */
  const fire = useCallback(() => {
    const w = world.current
    const now = performance.now()
    if (now - w.lastFire < FIRE_COOLDOWN) return
    const slot = w.shots.find((s) => !s.live)
    if (!slot) return
    w.lastFire = now
    slot.live = true
    slot.x = w.w / 2 + w.droneX
    slot.y = noseY
    const el = shotEls.current[w.shots.indexOf(slot)]
    if (el) el.style.opacity = '1'
  }, [noseY])

  const aim = useCallback(
    (clientX: number) => {
      const el = layerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const w = world.current
      w.w = rect.width
      const half = rect.width / 2
      const next = clamp(clientX - rect.left - half, -(half - 46), half - 46)
      w.droneX = next
      droneX.set(next)
    },
    [droneX],
  )

  // Space and the arrow keys scroll the page by default, which would drag the
  // sticky scene out from under the player mid-run.
  useEffect(() => {
    if (phase !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        fire()
      } else if (e.key === 'Escape') {
        setPhaseBoth('over')
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const w = world.current
        const half = w.w / 2
        const next = clamp(w.droneX + (e.key === 'ArrowLeft' ? -34 : 34), -(half - 46), half - 46)
        w.droneX = next
        droneX.set(next)
      }
    }
    window.addEventListener('keydown', onKey, { passive: false })
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, fire, droneX, setPhaseBoth])

  /* ── scroll lock ──────────────────────────────────────────────────────
     The scene is sticky inside a 200vh section, so an unlocked page would
     scroll the whole thing away under the player. Locking is safe here
     because the run is short, opt-in, and Escape always gets out. */
  useEffect(() => {
    if (phase === 'idle') return
    const { body } = document
    const prevOverflow = body.style.overflow
    const prevPad = body.style.paddingRight
    const gap = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`

    // overflow:hidden does not stop Lenis — it drives scrollTo on its own rAF
    // and would keep scrolling a locked body right out from under the player.
    window.__lenis?.stop()

    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPad
      window.__lenis?.start()
    }
  }, [phase])

  /* ── transitions ──────────────────────────────────────────────────── */

  /**
   * Empty every pool and hide every node.
   *
   * Needed at BOTH ends of a run. On the way in it stops the previous run's
   * leftovers appearing; on the way out it is what returns the stage to the
   * still frame it was before you played. Without it the rAF loop stops with
   * whatever was mid-flight still painted, and the scene keeps a scatter of
   * frozen chips hanging over it.
   */
  const clearEntities = useCallback(() => {
    const w = world.current
    w.threats.forEach((t) => (t.live = false))
    w.shots.forEach((s) => (s.live = false))
    w.bursts.forEach((b) => (b.live = false))
    threatEls.current.forEach((el) => el && (el.style.opacity = '0'))
    shotEls.current.forEach((el) => el && (el.style.opacity = '0'))
    burstEls.current.forEach((el) => el && (el.style.opacity = '0'))
  }, [])

  const start = useCallback(() => {
    const w = world.current
    clearEntities()
    w.contained = 0
    w.breached = 0
    w.droneX = 0
    w.lastFire = 0
    w.started = performance.now()
    w.nextSpawn = w.started + 500
    w.w = layerRef.current?.clientWidth ?? 0
    setScore({ contained: 0, breached: 0 })
    droneX.set(0)
    animate(droneDrop, GUARD_DROP, { duration: 0.45, ease: [0.22, 1, 0.36, 1] })
    animate(droneScale, PLAY_SCALE, { duration: 0.45, ease: [0.22, 1, 0.36, 1] })
    setPhaseBoth('playing')
  }, [clearEntities, droneX, droneDrop, droneScale, setPhaseBoth])

  const exit = useCallback(() => {
    // Clear first, then fly home — the stage has to be empty by the time the
    // drone lands or the scroll scene is left sitting under a frozen swarm.
    clearEntities()
    animate(droneX, 0, { duration: 0.4 })
    animate(droneDrop, 0, { duration: 0.45, ease: [0.22, 1, 0.36, 1] })
    animate(droneScale, 1, { duration: 0.45, ease: [0.22, 1, 0.36, 1] })
    setPhaseBoth('idle')
  }, [clearEntities, droneX, droneDrop, droneScale, setPhaseBoth])

  // Scrolling back up out of the ending un-arms the toy, so it cannot be left
  // hanging over a scene that has rewound to the middle of the run.
  useEffect(() => {
    if (!armed && phase === 'idle') droneX.set(0)
  }, [armed, phase, droneX])

  // The run can end three ways — clock, too many breaches, or Escape — and the
  // rAF loop stops the moment it does, leaving whatever was mid-flight painted
  // where it stood. Clearing on the transition covers all three at once.
  useEffect(() => {
    if (phase === 'over') clearEntities()
  }, [phase, clearEntities])

  const playing = phase === 'playing'

  return (
    <>
      {/* The play surface. Inert until the run starts, so it never eats a
          scroll or a click while the scene is still scrubbing. */}
      {/* `overflow-hidden` is the fix for threats painting outside the stage:
          they spawn above the top edge, and without a clip they render over the
          section background where the HUD's fade band cannot reach them. Safe
          here because nothing inside this layer is sticky — the sticky element
          is an ancestor, and a scroll container only breaks its descendants. */}
      <div
        ref={layerRef}
        className={`absolute inset-0 z-20 overflow-hidden rounded-[18px] ${playing ? 'cursor-crosshair' : 'pointer-events-none'}`}
        onMouseMove={playing ? (e) => aim(e.clientX) : undefined}
        onMouseDown={
          playing
            ? (e) => {
                e.preventDefault()
                fire()
              }
            : undefined
        }
      >
        {Array.from({ length: MAX_THREATS }).map((_, i) => (
          <div
            key={`t${i}`}
            ref={(el) => {
              threatEls.current[i] = el
            }}
            style={{ opacity: 0 }}
            className="absolute top-0 left-0 rounded-md border border-blood-100/55 bg-[#1a0b0c] px-1.5 py-[3px] font-mono text-[10px] whitespace-nowrap text-blood-50 shadow-[0_0_12px_rgba(255,59,59,0.35)] will-change-transform"
          />
        ))}

        {Array.from({ length: MAX_SHOTS }).map((_, i) => (
          <div
            key={`s${i}`}
            ref={(el) => {
              shotEls.current[i] = el
            }}
            style={{ opacity: 0 }}
            className="absolute top-0 left-0 h-[14px] w-[2.5px] rounded-full bg-[linear-gradient(180deg,#fff4f4,#ff3b3b)] shadow-[0_0_10px_rgba(255,59,59,0.9)] will-change-transform"
          />
        ))}

        {Array.from({ length: MAX_BURSTS }).map((_, i) => (
          <div
            key={`b${i}`}
            ref={(el) => {
              burstEls.current[i] = el
            }}
            style={{ opacity: 0 }}
            className="absolute top-0 left-0 h-[26px] w-[26px] rounded-full border border-blood-50/80 will-change-transform"
          />
        ))}
      </div>

      {/* ── the invitation ───────────────────────────────────────────────
          No button. The drone itself is the affordance: an arrow points at it
          and you click it to take over. A capsule sitting in the middle
          of the scene read as another CTA competing with the hero's, and this
          keeps the eye on the thing you are about to fly. */}
      {armed && phase === 'idle' && (
        <>
          <div
            className="animate-sheen pointer-events-none absolute z-30 flex items-center justify-end gap-1"
            // Width is measured off the centre line, so the arrow always lands
            // just short of the drone whatever the stage is doing.
            style={{ top: idleBoxTop + 16, left: 0, width: 'calc(50% - 46px)' }}
          >
            <span className="font-mono text-[10.5px] tracking-[0.06em] whitespace-nowrap text-neutral-400">
              click me
            </span>
            {/* Hand-drawn arrow, pointing right at the drone. The source art
                is a single filled path (not a stroke), so it takes the colour
                through `fill` and scales cleanly at any size. */}
            <svg
              width="44"
              height="18"
              viewBox="0 0 115.6 48"
              className="shrink-0 text-blood-50"
              aria-hidden
            >
              <path
                fill="currentColor"
                d="m99 21.6c-4.6-2.8-7.3-3.5-7.2-8.3 3.2-0.3 4.1-0.4 5.8 1 3.4 2.5 7.7 4.4 13.1 5.9l-0.3 0.2c-2.1 5-4.3 7.9-8.4 12.6-1.6 1.9-2.6 2.3-5.5 2.3-0.5-5.2 1.4-4.4 6.4-11.5-3.4 1.2-6.9 2.5-12.2 2.5-7-0.1-15.1-1.4-21.7-2.9-14.1-3.1-25.1-6.7-37.7-3.3-10.7 2.9-18.3 9.4-26.3 15.1 2.9-7.7 9-13.2 16.4-16.7 13.4-6.4 24.6-6.5 38.7-3.2 12.3 2.6 19.2 5.6 33.9 6l5 0.3z"
              />
            </svg>
          </div>

          {/* The hit area sits over the drone. A plain onClick covers the
              keyboard case too — a <button> fires it on Enter and Space. */}
          <button
            type="button"
            onClick={start}
            aria-label="Take the controls and defend the endpoint"
            className="absolute z-30 -translate-x-1/2 cursor-pointer rounded-full transition-colors duration-300 hover:bg-white/[0.04] focus-visible:bg-white/[0.05] focus-visible:outline-none"
            style={{
              top: idleBoxTop - 8,
              left: '50%',
              width: geometry.droneBox + 16,
              height: geometry.droneBox + 16,
            }}
          />
        </>
      )}

      {/* ── HUD ──────────────────────────────────────────────────────── */}
      {playing && (
        // The fade is load-bearing, not decoration: threats enter from above
        // the stage and were crossing the readout on the way in. Now they drop
        // out from behind it, which also gives them somewhere to come from.
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 bg-[linear-gradient(180deg,rgba(5,3,3,0.97)_0%,rgba(5,3,3,0.93)_55%,rgba(5,3,3,0)_100%)] px-1 pb-5">
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/[0.07]">
            <div
              ref={barRef}
              className="h-full w-full origin-left rounded-full bg-[linear-gradient(90deg,#ff3b3b,#ff9d9d)]"
            />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[10.5px] tracking-[0.1em]">
            <span className="text-neutral-400">
              CONTAINED <span className="text-white">{String(score.contained).padStart(2, '0')}</span>
            </span>
            <span className="text-neutral-600">MOVE · MOUSE&nbsp;&nbsp;FIRE · CLICK</span>
            <span className="text-neutral-400">
              BREACHED{' '}
              <span className={score.breached ? 'text-blood-50' : 'text-white'}>
                {String(score.breached).padStart(2, '0')}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* ── the verdict ──────────────────────────────────────────────── */}
      {phase === 'over' && (
        <div
          className={`absolute inset-0 z-40 flex items-center justify-center bg-[#050303]/72 backdrop-blur-[2px] transition-opacity duration-300 ${
            verdictLive ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <div className="w-[268px] rounded-[16px] border border-blood-300/35 bg-[linear-gradient(180deg,#140d0e,#080607)] p-5 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
            <p className="font-mono text-[10.5px] tracking-[0.16em] text-neutral-500">
              {score.breached >= MAX_BREACHES ? 'RUN ABORTED' : 'RUN COMPLETE'}
            </p>
            <p className="mt-3 font-mono text-[26px] leading-none text-white">
              {String(score.contained).padStart(2, '0')}
            </p>
            <p className="mt-1.5 font-mono text-[11.5px] text-neutral-500">
              contained · {score.breached} breached
            </p>

            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={start}
                className="rounded-full border border-blood-100/45 bg-[linear-gradient(180deg,#211012,#0c0708)] px-3.5 py-1.5 font-mono text-[10.5px] tracking-[0.1em] text-blood-50 transition-colors hover:border-blood-100/80 hover:text-white"
              >
                RUN AGAIN
              </button>
              <button
                type="button"
                onClick={exit}
                className="rounded-full border border-white/[0.14] px-3.5 py-1.5 font-mono text-[10.5px] tracking-[0.1em] text-neutral-400 transition-colors hover:border-white/30 hover:text-white"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
