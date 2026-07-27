import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default function FAQs() {
  const faqItems = [
    {
      id: 'item-1',
      question: 'What does Swrmz actually do?',
      answer:
        'It runs a group of AI agents over your site and your code, all working toward one goal: find the ways someone could break in. It looks for the holes an attacker would use to read your customer data, take over an account, or slip in through code you trusted from someone else. When it finds one, it shows you exactly how it got in.',
    },
    {
      id: 'item-2',
      question: 'What are Idle Mode and Defense Mode?',
      answer:
        'Two ways to run it. Idle Mode is the sweep — point it at what your team is building and it checks the code for holes before anyone else finds them. Defense Mode is the night shift: when everyone has gone home, it stays up watching your live site, and if someone starts hammering it, Swrmz holds the line and messages you.',
    },
    {
      id: 'item-3',
      question: 'Can it break something in my product?',
      answer:
        'No — not without you saying so first. Anything that could damage, delete, or change your data stops and waits for your approval. Safe checks run on their own; the harmful half never moves until you press go. That pause is the whole design, not a setting you have to remember to turn on.',
    },
    {
      id: 'item-4',
      question: 'What do I need to install?',
      answer:
        'Nothing. You open swarms.tech and it runs. There is no download, no agent to host, and no repo plumbing to wire up before you get an answer.',
    },
    {
      id: 'item-5',
      question: 'How do I hear about it when something happens?',
      answer:
        'Email, or a Telegram bot if you would rather get it on your phone. You get told what happened and what Swrmz did about it — not a wall of alerts you have to triage yourself.',
    },
    {
      id: 'item-6',
      question: 'We are small and we have no security person. Is this for us?',
      answer:
        'That is who we built it for. You do not need to know any of this to use it. Swrmz explains what it found in plain language and what to do about it, so a team with no security hire still knows where they stand.',
    },
  ]

  return (
    <section id="faq" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)] md:gap-16">
          <div>
            {/* Same heading treatment as every other section: the top-lit
                gradient ramp, font-light, -0.02em, and the 14px/1.65 lede. */}
            <h2 className="bg-[linear-gradient(100deg,#5f5f5f_0%,#ffffff_52%,#c9c9c9_100%)] bg-clip-text text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.1] pb-[0.14em] font-light tracking-[-0.02em] text-transparent">
              FAQs
            </h2>
            <p className="mt-5 max-w-[38ch] text-[14px] leading-[1.65] text-neutral-500">
              Your questions answered
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="cursor-pointer text-[14.5px] hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="max-w-[62ch] text-[13px] leading-[1.7] text-neutral-400">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
