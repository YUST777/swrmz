import { useEffect } from 'react';
import { FinalCta } from './sections/FinalCta';
import { HeroSection } from './sections/HeroSection';
import { PlatformSection } from './sections/PlatformSection';
import { PricingSection } from './sections/PricingSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { WorkflowSection } from './sections/WorkflowSection';
import { FaqSection } from './sections/FaqSection';
import { cameFromAuth, supabase } from './lib/supabase';

export function LandingPage() {
  // If an OAuth/email sign-in redirected back here instead of /soon, forward it.
  useEffect(() => {
    if (!cameFromAuth) return;
    let done = false;
    const go = () => {
      if (!done) {
        done = true;
        window.location.replace('/waitlist');
      }
    };
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go();
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) go();
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0e0a0b] font-['Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#f2eaeb] antialiased">
      <HeroSection />
      <PlatformSection />
      <WorkflowSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </main>
  );
}
