import { FinalCta } from './sections/FinalCta';
import { HeroSection } from './sections/HeroSection';
import { PlatformSection } from './sections/PlatformSection';
import { PricingSection } from './sections/PricingSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { WorkflowSection } from './sections/WorkflowSection';

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0e0a0b] font-['Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#f2eaeb] antialiased">
      <HeroSection />
      <PlatformSection />
      <WorkflowSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCta />
    </main>
  );
}
