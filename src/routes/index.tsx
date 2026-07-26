import { createFileRoute } from '@tanstack/react-router'

import { AttackRun } from '@/components/attack-run'
import { FeatureBento } from '@/components/feature-bento'
import { Hero } from '@/components/hero'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    // The page owns the ink and the clip. Sections are transparent and let
    // their decor bleed across each other, so the background reads as one
    // continuous field rather than a stack of separately-lit boxes.
    //
    // The clip is overflow-x-clip, not overflow-hidden, and that distinction
    // matters: `hidden` makes this element a scroll container, which silently
    // kills position:sticky anywhere inside it — and the attack run is sticky.
    // `clip` still stops the hero's side blooms from opening a horizontal
    // scrollbar, without becoming a scrollport.
    <main className="relative isolate overflow-x-clip bg-ink">
      <Hero />
      <FeatureBento />
      <AttackRun />
      {/* next sections land here */}
    </main>
  )
}
