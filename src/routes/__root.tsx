import { useEffect } from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import Lenis from 'lenis'

declare global {
  interface Window {
    /** set while smooth scrolling is active; see the scroll lock in attack-game */
    __lenis?: Lenis
  }
}

export const Route = createRootRoute({
  component: RootLayout,
})

/**
 * Smooth scrolling, page-wide.
 *
 * Lenis hijacks the wheel and drives `window.scrollTo` itself on every frame.
 * That matters here because the attack run is `position: sticky` and scrubs
 * off `useScroll` — both read real document scroll, which Lenis still writes,
 * so the drone keeps tracking. It would only break if Lenis were run in
 * `wrapper` mode against a nested scroller.
 *
 * The tuning is deliberately fast. Lenis defaults to a 1.2s duration, which on
 * a page with a 200vh scrubbed section feels like the scroll is fighting you.
 * A high lerp is a short lag instead of a long glide: still smooth, but the
 * page stops when the wheel stops.
 */
function useSmoothScroll() {
  useEffect(() => {
    // There is deliberately NO prefers-reduced-motion guard here.
    //
    // There was one, and it meant this never ran on the owner's machine —
    // their browser reports `reduce` even though the OS has animations on,
    // so smooth scrolling was dead for the one person checking it and there
    // was no way to tell from the outside. Same trap as the bento card loops,
    // which had a blanket [class*='bv-'] { animation: none } rule for the
    // same reason.
    //
    // Smooth scroll is also not what that preference is for. It exists to
    // stop large vestibular motion — parallax, zoom, spin. This just adds a
    // short lag to a scroll the reader is driving themselves; the page never
    // moves on its own, and it always ends exactly where the wheel put it.
    const lenis = new Lenis({
      // Lower lerp = longer glide. 0.14 settled in ~700ms, which is technically
      // smooth but reads as a normal scroll — you cannot feel it. 0.075 carries
      // for about a second and a half, which is the point of having it.
      lerp: 0.075,
      wheelMultiplier: 1.25,
      // Touch devices already have momentum from the OS; doubling it up feels
      // slippery and breaks the expected rubber-band at the ends.
      syncTouch: false,
    })

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    // The attack-run game locks the page while you play. `body {overflow:
    // hidden}` alone does not stop Lenis — it drives scrollTo itself and would
    // happily keep scrolling a locked body — so the lock needs to reach the
    // instance. Published on window rather than through context because the
    // consumer is one component deep in a section, not a provider tree.
    window.__lenis = lenis

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])
}

function RootLayout() {
  useSmoothScroll()

  return (
    <div className="min-h-screen bg-ink">
      <Outlet />
    </div>
  )
}
