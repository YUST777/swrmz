import { createFileRoute } from '@tanstack/react-router'

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
    <main className="relative isolate overflow-hidden bg-ink">
      <Hero />
      <FeatureBento />
      {/* next sections land here */}
    </main>
  )
}
