import { createContext, useContext, useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * A minimal stand-in for shadcn/ui's accordion, same public API.
 *
 * This project is Vite + TanStack Router with no Radix installed, so the real
 * package is not available — but the call site is written against shadcn's
 * interface, and matching it exactly means that code needs no changes.
 * Supports type="single" + collapsible, which is what the call site uses.
 */

type Ctx = { open: string | null; toggle: (v: string) => void }
const AccordionCtx = createContext<Ctx>({ open: null, toggle: () => {} })

const ItemCtx = createContext<{ value: string; id: string }>({ value: '', id: '' })

export function Accordion({
  children,
  className,
  defaultValue = null,
}: {
  type?: 'single'
  collapsible?: boolean
  defaultValue?: string | null
  className?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState<string | null>(defaultValue)
  const toggle = (v: string) => setOpen((cur) => (cur === v ? null : v))

  return (
    <AccordionCtx.Provider value={{ open, toggle }}>
      <div className={className}>{children}</div>
    </AccordionCtx.Provider>
  )
}

export function AccordionItem({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  const id = useId()
  return (
    <ItemCtx.Provider value={{ value, id }}>
      {/* divider under every row, including the last — matches the reference */}
      <div className={cn('border-b border-white/[0.1]', className)}>{children}</div>
    </ItemCtx.Provider>
  )
}

export function AccordionTrigger({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { open, toggle } = useContext(AccordionCtx)
  const { value, id } = useContext(ItemCtx)
  const isOpen = open === value

  return (
    <h3>
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
        onClick={() => toggle(value)}
        className={cn(
          'text-foreground font-display flex w-full items-center justify-between gap-4 py-5 text-left font-medium transition-colors',
          className,
        )}
      >
        {children}
        <ChevronDown
          className={cn(
            'text-muted-foreground h-5 w-5 shrink-0 transition-transform duration-300',
            isOpen && 'rotate-180',
          )}
          strokeWidth={1.5}
        />
      </button>
    </h3>
  )
}

export function AccordionContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { open } = useContext(AccordionCtx)
  const { value, id } = useContext(ItemCtx)
  const isOpen = open === value

  // grid 0fr -> 1fr animates to the content's real height without measuring it,
  // so a long answer is never clipped by a fixed max-height
  return (
    <div
      id={`${id}-content`}
      role="region"
      aria-labelledby={`${id}-trigger`}
      className={cn(
        'grid transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <div className="overflow-hidden">
        <div className={cn('text-muted-foreground font-sans pb-5 leading-[1.7]', className)}>{children}</div>
      </div>
    </div>
  )
}
