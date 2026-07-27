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
    // Anyone who has asked for less motion gets the browser's native scroll.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.14,
      wheelMultiplier: 1.1,
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
