import { createFileRoute } from '@tanstack/react-router'

import { AttackRun } from '@/components/attack-run'
import FAQs from '@/components/faq'
import { FeatureBento } from '@/components/feature-bento'
import { Hero } from '@/components/hero'
import { Pricing } from '@/components/pricing'
import { SiteAtmosphere } from '@/components/site-atmosphere'
import { SiteFooter } from '@/components/site-footer'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    // The page owns the ink, the clip, and now the light. SiteAtmosphere is a
    // single field spanning every section — sections themselves are fully
    // transparent, so nothing paints a boundary across it.
    //
    // The clip is overflow-x-clip, not overflow-hidden, and that distinction
    // matters: `hidden` makes this element a scroll container, which silently
    // kills position:sticky anywhere inside it — and the attack run is sticky.
    // `clip` still stops the mesh's side nodes from opening a horizontal
    // scrollbar, without becoming a scrollport.
    <main className="relative isolate overflow-x-clip bg-ink">
      <SiteAtmosphere />
      <Hero />
      <FeatureBento />
      <AttackRun />
      <Pricing />
      <FAQs />
      <SiteFooter />
    </main>
  )
}
