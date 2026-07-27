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
            <h2 className="text-foreground text-4xl font-semibold md:text-5xl">FAQs</h2>
            <p className="text-muted-foreground mt-4 text-lg">Your questions answered</p>
            <p className="text-muted-foreground mt-8 text-lg">
              Can't find what you're looking for? Contact our{' '}
              <a
                href="mailto:hello@swarms.tech"
                className="text-foreground font-medium hover:underline"
              >
                customer support team
              </a>
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="cursor-pointer text-lg hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-base">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
