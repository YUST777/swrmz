import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Eyebrow } from '../components/Eyebrow';

const testimonials = [
  {
    quote:
      'SWRMZ found and patched a critical CVE before our scanners even flagged it. The swarm just handles it.',
    name: 'James Rowe',
    role: 'Head of Security',
    accent: 'from-[#15100f] via-[#241a1d] to-[#4a161b]',
    initials: 'JR',
  },
  {
    quote:
      'It is like running a tireless red team and blue team at once. Every finding shows up with a fix attached.',
    name: 'Mina Patel',
    role: 'VP Security',
    accent: 'from-[#100b0c] via-[#2b1f22] to-[#4a161b]',
    initials: 'MP',
  },
  {
    quote:
      'Audit prep went from weeks to an afternoon. Every fix is documented and ready for our auditors.',
    name: 'Noah Chen',
    role: 'Director of SecOps',
    accent: 'from-[#100b0c] via-[#241a1d] to-[#4a161b]',
    initials: 'NC',
  },
];

export function TestimonialsSection() {
  return (
    <section className="px-6 py-16 max-[760px]:px-4 max-[760px]:py-12">
      <div className="mx-auto grid max-w-[1120px] grid-cols-[0.86fr_1.14fr] items-center gap-12 max-[920px]:grid-cols-1">
        <div>
          <Eyebrow Icon={Quote}>Testimonials</Eyebrow>
          <blockquote className="mt-7 max-w-[440px] text-[1.58rem] font-[560] leading-[1.25] tracking-[0] text-[#f2eaeb] max-[640px]:text-[1.35rem]">
            "SWRMZ found and patched a critical CVE before our scanners even
            flagged it. The swarm just handles it."
          </blockquote>
          <p className="mt-5 text-[0.82rem] font-[560] text-[#a89799]">
            James Rowe, Head of Security, Nexidian
          </p>
        </div>

        <div>
          <div className="grid grid-cols-[1fr_1fr] gap-6 max-[640px]:grid-cols-1">
            {testimonials.slice(0, 2).map((testimonial, index) => (
              <article
                className={`group relative min-h-[330px] overflow-hidden rounded-[14px] border border-[#2b1f22] bg-gradient-to-b ${testimonial.accent} shadow-[0_22px_66px_rgba(12,42,39,0.11)] ${index === 1 ? 'max-[920px]:translate-y-0 min-[920px]:translate-y-7' : ''}`}
                key={testimonial.name}
              >
                <div className="absolute inset-x-0 bottom-0 h-[52%] bg-[linear-gradient(180deg,transparent,rgba(5,17,17,0.88))]" aria-hidden="true" />
                <div className="absolute left-1/2 top-[42%] grid size-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-white/10 text-[2.6rem] font-[720] tracking-[0] text-[#f3d9db] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-[1px]">
                  {testimonial.initials}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="line-clamp-3 text-[0.82rem] leading-[1.55] text-white/84">
                    "{testimonial.quote}"
                  </p>
                  <p className="mt-4 text-[0.92rem] font-[700]">{testimonial.name}</p>
                  <p className="mt-1 text-[0.72rem] text-white/70">{testimonial.role}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button
              className="grid size-9 place-items-center rounded-[7px] border border-[#8a2c34] bg-[#77262d] text-[#f4eef0] shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#8a2c34]"
              type="button"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={17} strokeWidth={2.4} />
            </button>
            <button
              className="grid size-9 place-items-center rounded-[7px] border border-[#8a2c34] bg-[#77262d] text-[#f4eef0] shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#8a2c34]"
              type="button"
              aria-label="Next testimonial"
            >
              <ChevronRight size={17} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
