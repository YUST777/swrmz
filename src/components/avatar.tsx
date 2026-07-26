import { cn } from '@/lib/utils'

/**
 * Initial-based avatar rendered entirely in the DOM.
 *
 * The mockup pulled faces from i.pravatar.cc, which meant a third-party request
 * on every page load and a broken hero the moment that service is slow, blocked
 * or offline. Hashing the name to a fixed palette keeps each person visually
 * stable across renders without leaving the page.
 */
const PALETTES = [
  ['#7c2d33', '#2a1113'],
  ['#3b3556', '#171426'],
  ['#1f4d47', '#0c1f1d'],
  ['#5a3a1c', '#231609'],
  ['#43305c', '#191024'],
  ['#1e3c5a', '#0b1824'],
] as const

function hash(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const [from, to] = PALETTES[hash(name) % PALETTES.length]

  return (
    <div
      aria-hidden
      style={{ backgroundImage: `linear-gradient(140deg, ${from}, ${to})` }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full leading-none font-semibold text-white/90 select-none',
        className,
      )}
    >
      {initials(name)}
    </div>
  )
}
