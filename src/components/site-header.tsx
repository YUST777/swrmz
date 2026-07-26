import { useState } from 'react'
import { Menu, User, X } from 'lucide-react'

import { TextLogo } from '@/components/brand-logo'

const NAV = [
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Terms', href: '#terms' },
  { label: 'Privacy', href: '#privacy' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-30 border-b border-white/[0.07] bg-[#0b0a0a]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[54px] max-w-[1400px] items-center justify-between px-6">
        <a
          href="/"
          aria-label="Swrmz home"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <TextLogo className="h-[22px] w-auto" />
        </a>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-[18px] md:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[10.5px] font-medium tracking-[0.1em] text-neutral-400 uppercase transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Account"
            className="flex h-[30px] w-[38px] items-center justify-center rounded-lg border border-white/10 bg-neutral-800/70 transition-colors hover:bg-neutral-700/70"
          >
            <User className="h-4 w-4 text-neutral-200" strokeWidth={2} />
          </button>

          {/* the centred nav is hidden below md, so small screens need a way in */}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="flex h-[30px] w-[38px] items-center justify-center rounded-lg border border-white/10 bg-neutral-800/70 transition-colors hover:bg-neutral-700/70 md:hidden"
          >
            {open ? (
              <X className="h-4 w-4 text-neutral-200" strokeWidth={2} />
            ) : (
              <Menu className="h-4 w-4 text-neutral-200" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-white/[0.07] bg-[#0b0a0a]/95 px-6 py-3 backdrop-blur-xl md:hidden"
        >
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-[11px] font-medium tracking-[0.1em] text-neutral-400 uppercase transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
