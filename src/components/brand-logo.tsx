import { cn } from '@/lib/utils'

/**
 * The drone mark from src/public/logo.svg, authored on a 150×150 canvas.
 *
 * Exported as a bare <g> rather than a whole <svg> so it can be dropped
 * straight into another drawing — the bento's swarm visual uses it as the
 * objective every agent converges on. Colour comes from the caller via
 * `fill`; the source file's `.cls-0` rule is dropped deliberately, since
 * that class name collides with text_logo.svg's.
 */
const DRONE_PATHS = [
  'm97 51-21.8-8.2-21.8 8.3s9 18.2 10.2 20.9h0.1l-8.9-5.8 0.6 26.3 19.5 22.2h0.2l19.4-22.2 0.7-26.4c-0.1-0.1-9 5.9-9 5.9l10.1-21zm-12.2 34.7-9.7 11.2-10-11.5-0.1-9.5c0.1-0.2 10 9.2 10.1 9.2l9.6-9.1 0.1-0.1v9.8z',
  'm93.8 43.3 31.6-14.9 0.8-0.2 6.2-0.4-2.8 6-0.5 0.6c-1.7 1.7-28.8 21.9-29.4 22.3-0.5 0.2 4.8-12 4.6-12.3h-2l-8.5-1v-0.1z',
  'm56.3 43.4c0.7 0.2-0.3 0.3-0.3 0.3l-10.5 0.9 4.9 12.1h-0.1c-0.2-0.2-29.3-21.7-29.7-22.7s-3-6.1-3-6.2c0-0.2 6.2 0.4 6.7 0.5 0.4 0 31.2 14.7 32 15.1z',
  'm17.1 47.2c0.4 0.2-0.1 0.4-2.1 4.5-2.9-0.8-11.9-5.4-13.7-16.6-2-12.3 6.1-22 13.4-25.5 2.6-1.1 5.4-2.1 9-2.1 14-0.1 20.3 12.3 20.4 12.8l-4.4 1.9c-1.8-3.4-6.9-9.7-15.2-9.9-2.6 0-4.7 0.1-7.5 1.3-6.4 2.7-11.4 9.7-11.4 16.9-0.1 5 1.8 8.8 4.3 12 2.1 2.5 4.9 4 6.9 4.9l0.3-0.2z',
  'm135.3 9.4c-2.7-1.2-5.7-1.9-9-1.9-14 0-19.9 12.2-20.5 12.8l4.6 2c0.7 0.2 3.5-8.3 13.2-9.9 1.4-0.2 2.6-0.2 4.6-0.1 8.1 0.8 16.3 8.3 16.3 18.4 0 4.2-1.5 7.7-3.3 10.4-2.8 4-6.6 5.4-8 6.1-0.2 0.2 0.1 0.1 2.1 4.6 5.7-1.9 12.4-7.8 13.8-16.9 0.1-1 0.1-2.3 0.1-3.7 0-9.9-6.2-18.2-13.9-21.8z',
  'm134.4 98.7-0.9-0.3-1.4 2.8c-0.2 0.5-0.5 1 0 1.3 1.9 1 10.9 5.1 11.7 15.9 0.4 6-2.4 12-7.4 15.7-2.4 1.8-6.1 3.5-10.4 3.6-5.8 0.3-12.9-3.4-15.3-9.8l-4.3 2c0 0.4 1.1 2.3 2.3 4 2.2 2.9 7.6 8.2 16.9 8.4 10.8 0.2 21.1-6.7 22.8-18.9 0.2-2.1 0.2-3.4-0.1-6.4-0.7-5-4.4-13.7-13.9-18.3z',
  'm129.4 115.7 0.2 0.3 3.1 6.4c-0.3 0.3-4.2-0.7-6.4-0.8l-0.9-0.3-32.4-18.1-0.1-0.2-0.1-0.3c1 0 9.5 0 10.8 0.2l-1.7-4.5-2.2-6.4v-0.3l29.7 23.8v0.2z',
  'm43.5 129.6c-2.1-0.5-3.7-1.9-4.1-1.7-3 6.1-10.4 9.8-16 9.8-11.2 0.2-17.4-8.8-17.5-16.8-0.2-6.9 3.6-12.8 8.6-15.9l3.2-2-2.1-4.1-0.6 0.1c-5.1 2.4-7.4 5-9.6 7.7-1.9 2.9-4.7 7.7-4 15.7 1 8.7 8.2 19.2 20.6 19.9h3c7.1-0.3 14-3.9 17.6-9.6l0.8-1.3s0.4-0.9 0.1-1v-0.8z',
  'm46.3 103c-0.3 0.5 2.2-0.3 11-0.3l-0.1 0.3-33 18.3c-0.6 0.3-6.1 0.9-6.8 1.1l3.1-6.7 0.3-0.2 29.6-23.6 0.1-0.2c0.7-0.5-0.5 2.2-4.2 11.3z',
]

/** the mark, centred on (x, y) and scaled so `size` is its full width */
export function DroneGlyph({
  x,
  y,
  size,
  fill,
  opacity,
}: {
  x: number
  y: number
  size: number
  fill: string
  opacity?: number
}) {
  const scale = size / 150

  return (
    <g
      transform={`translate(${x - size / 2} ${y - size / 2}) scale(${scale})`}
      fill={fill}
      opacity={opacity}
    >
      {DRONE_PATHS.map((d) => (
        <path key={d.slice(0, 12)} d={d} />
      ))}
    </g>
  )
}

/**
 * The SWRMZ wordmark, inlined from src/public/text_logo.svg.
 *
 * It is inlined rather than dropped in with <img> for two reasons. The
 * artwork ships the wordmark in #272626, which is invisible on this header,
 * and an <img> gives no way to recolour it. And the file's own <style> block
 * uses class names as generic as `.cls-0` / `.cls-1` — logo.svg uses `.cls-0`
 * too, for a different colour — so injecting the markup as-is would leak two
 * clashing global rules.
 *
 * The paths are verbatim. Only the fills differ: the glyph takes the site's
 * brand red instead of the artwork's darker #8B151C, which goes muddy against
 * #0b0a0a, and the lettering is set in currentColor so the caller owns it.
 */
export function TextLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="11.7 9.5 244.6 88"
      role="img"
      aria-label="Swrmz"
      className={cn('text-white', className)}
    >
      <g fill="var(--color-blood-100)">
        <path d="m54.9 52.9 4.2-9.9-9-3.3c-0.6-0.4-0.1-0.5-1.1-0.1l-9.8 3.6 4.3 9.8-3.9-3v12.6l9.2 10.4 9.3-10.4v-12.2l-3.2 2.5zm-1.2 6.7-4.7 5.4-4.2-5.3v-4.7l4.2 4.3 4.6-4.3 0.1 4.6z" />
        <path d="m21.6 40.9c-2.6-1.1-5.2-3.8-5.2-7.9s3.5-8.4 8.4-8.5c2.4-0.1 5.2 1.4 7.1 4.2l2.1-0.9c-1.7-3-5.2-5.8-9.5-5.7-6.5 0-10.5 5.1-10.6 10.7 0 4.5 2.5 8.5 6.4 10.4l0.9-2.3h0.4z" />
        <path d="m32.1 77.9c-1.7 2.4-4.1 4.2-7.4 4.3-4.1 0.1-8.3-3.2-8.4-8.2 0-3.2 1.6-6.2 4.7-8l-0.7-2.1c-3.9 1.5-6.5 5.6-6.4 9.9 0.2 5.8 4.9 10.3 10.6 10.3h0.3c4.1 0.1 7.8-1.9 9.6-5.3l-2.3-0.9z" />
        <path d="m78.8 43.2-0.8-2.3c2.7-1.2 5-4.2 5.1-7.9s-2.8-8.5-8.4-8.6c-3.4 0-6.2 1.5-7.8 4.3l-2.1-0.9c1.7-3.2 5.3-5.7 9.5-5.7 6.4-0.1 11.2 4.5 11.2 10.8 0 4.3-2.3 8.5-6.5 10.3" />
        <path d="m74 84.2c-4.2 0.1-8.1-1.8-10-5.3l2.1-1.1c1.1 2.1 4 4.2 7.4 4.2 5.7 0 8.9-4.2 9.1-8.2-0.2-3.6-2-6.4-4.9-7.8l1-2.1c3.4 1.5 6.3 5.2 6.3 9.8 0 4.9-4 10.4-11 10.5z" />
        <polygon points="36.5 39.9 40 39.4 25.2 31.8 22.6 31.7 23.3 34.1 36.9 44.7" />
        <polygon points="62.9 39.9 58.7 39.4 73.5 31.8 76.1 31.7 75.4 34.1 61.6 45" />
        <polygon points="35.5 67.1 36.8 62.8 23.6 73 22.6 75.4 25.5 75.3 39.1 68" />
        <polygon points="63.1 67.1 61.5 62.8 75 72.9 75.8 75.3 73.3 75.3 58.9 68" />
      </g>

      <g fill="currentColor">
        <path d="m97.1 65.7v-4.1h20c1 0 1.3-4.6-1.3-4.5h-13.2c-2.2 0-3.9-0.8-5-3-0.6-1.1-0.7-5.7 0.2-7 1.2-2.1 2.6-2.9 5.5-2.9h19.1v4.1h-19.7c-1.8-0.1-2.2 0.1-2.2 2.3-0.1 2.2 1.8 2.4 3.2 2.4h13.1c5.2 0 5.8 3.7 5.8 5.6v1.3c0 1.8-1.6 5.7-5.7 5.7l-19.8 0.1z" />
        <path d="m152.1 65.6h-4l-3.7-7.9-4 7.9h-3.9l-10.6-21.3h4.5l7.9 15.6 3.6-6.9-3.9-8.7h4.5l1.9 4.2 1.9-4.2h4.7l-4.1 8.7 3.8 7 7.9-15.3 0.5-0.5h4.2l-10.6 21.3z" />
        <path d="m185.1 57.6h1.9c2.8 0.1 5.7-1.7 5.7-5.8 0-1.7 0.4-7.4-5.8-7.5h-19.5l-0.5 0.1v4.1h19c2.8-0.3 2.3 5.1-0.5 5h-16.4l1.6 4.1h9.3l6.6 7.9h5.5l-6.9-7.9z" />
        <path d="m220.4 65.6-0.1-14.4-9.5 9-9.2-8.8-0.3 0.1-0.1 14.1h-3.9l-0.1-21.2 0.1-0.2h2.7l10.8 10.3 10.7-10.2 0.6-0.1h2.4l0.2 0.3v21.1h-4.3z" />
        <path d="m229 65.6c-0.4 0 0-2.7 0-2.7l16-14.3-16-0.1c-0.3 0 0-4.2 0-4.2h24.6c0.3 0 0 2.7 0 2.7l-16.4 14 16.5 0.3v4.2l-24.7 0.1z" />
      </g>
    </svg>
  )
}
