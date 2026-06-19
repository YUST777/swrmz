import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote:
      'SWRMZ found and patched a critical CVE before our scanners even flagged it. The swarm just handles it.',
    name: 'James Rowe',
    role: 'Head of Security, Nexidian',
    image: '/test_1.webp',
  },
  {
    quote:
      'It is like running a tireless red team and blue team at once. Every finding shows up with a fix attached.',
    name: 'Mina Patel',
    role: 'VP Security, Arcwell',
    image: '/test_2.webp',
  },
  {
    quote:
      'Audit prep went from weeks to an afternoon. Every fix is documented and ready for our auditors.',
    name: 'Noah Chen',
    role: 'Director of SecOps, Lumen',
    image: '/test_3.webp',
  },
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const t = testimonials[active];
  const go = (dir: number) =>
    setActive((a) => (a + dir + testimonials.length) % testimonials.length);

  return (
    <section className="px-6 py-16 max-[760px]:px-4 max-[760px]:py-12">
      <div className="mx-auto grid max-w-[1120px] grid-cols-[0.86fr_1.14fr] items-center gap-12 max-[920px]:grid-cols-1">
        <div>
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
              className="max-w-[440px] text-[1.58rem] font-[560] leading-[1.25] tracking-[0] text-[#f2eaeb] max-[640px]:text-[1.35rem]"
            >
              "{t.quote}"
            </motion.blockquote>
          </AnimatePresence>
          <p className="mt-5 text-[0.82rem] font-[560] text-[#a89799]">
            {t.name}, {t.role}
          </p>
          <div className="mt-7 flex gap-2">
            <button
              onClick={() => go(-1)}
              className="grid size-9 cursor-pointer place-items-center rounded-[7px] border border-[#8a2c34] bg-[#77262d] text-[#f4eef0] transition-colors duration-200 hover:bg-[#8a2c34]"
              type="button"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={17} strokeWidth={2.4} />
            </button>
            <button
              onClick={() => go(1)}
              className="grid size-9 cursor-pointer place-items-center rounded-[7px] border border-[#8a2c34] bg-[#77262d] text-[#f4eef0] transition-colors duration-200 hover:bg-[#8a2c34]"
              type="button"
              aria-label="Next testimonial"
            >
              <ChevronRight size={17} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div className="relative min-h-[400px] overflow-hidden rounded-[16px] border border-[#2b1f22]">
          <AnimatePresence>
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${t.image})` }}
              aria-hidden="true"
            />
          </AnimatePresence>
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(8,5,6,0.86))]"
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-[0.95rem] font-[700]">{t.name}</p>
            <p className="mt-1 text-[0.74rem] text-white/65">{t.role}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
