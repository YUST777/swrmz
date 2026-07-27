/**
 * The page's single field of light.
 *
 * Every section used to light itself, which is why the page read as five
 * separately-lit boxes stacked in a column: each bloom pooled inside its own
 * section and decayed to nothing before the boundary, so the seams showed as
 * bands of flat black. This owns all of it instead. Sections are transparent
 * and simply sit inside it.
 *
 * Two rules make it seamless:
 *
 * 1. Every node is placed in PERCENTAGES of total page height, not pixels. The
 *    layer is `inset-0` on <main>, so it grows with the page and the nodes
 *    keep their relative spacing however tall the content gets. Pixel offsets
 *    would drift out of position the moment a section changed height — which
 *    is exactly how the old per-section blooms broke.
 *
 * 2. The nodes overlap. Each one is enormous (60-90% of viewport width) and
 *    they are spaced roughly 12-15% apart vertically, so every node's falloff
 *    is still contributing where the next one begins. Nothing switches on or
 *    off at a boundary because no boundary has a node's edge near it.
 *
 * They alternate left / centre / right down the page so the light wanders
 * rather than running as a stripe, and the whole thing sits behind a vignette
 * that keeps the middle dark enough for body copy.
 */

/** x, y (both % of the layer), width, height, colour, blur — in page order */
const NODES = [
  // hero flanks — hottest, and the only pair placed symmetrically
  { x: '-6%', y: '4%', w: '48vw', h: '52vh', c: 'rgba(255,31,31,0.30)', b: 130 },
  { x: '106%', y: '4%', w: '48vw', h: '52vh', c: 'rgba(255,31,31,0.30)', b: 130 },

  // carries out of the hero and into the feature grid
  { x: '50%', y: '13%', w: '92vw', h: '46vh', c: 'rgba(143,17,22,0.30)', b: 165 },
  { x: '14%', y: '21%', w: '62vw', h: '40vh', c: 'rgba(225,20,20,0.17)', b: 150 },
  { x: '88%', y: '29%', w: '58vw', h: '38vh', c: 'rgba(255,31,31,0.15)', b: 150 },

  // the attack run. 200vh of section with no light of its own — this is the
  // stretch that used to go dead black for two full viewports.
  { x: '20%', y: '38%', w: '70vw', h: '44vh', c: 'rgba(143,17,22,0.26)', b: 170 },
  { x: '82%', y: '46%', w: '66vw', h: '42vh', c: 'rgba(225,20,20,0.20)', b: 165 },
  { x: '38%', y: '54%', w: '72vw', h: '40vh', c: 'rgba(255,31,31,0.14)', b: 160 },

  // pricing
  { x: '50%', y: '64%', w: '96vw', h: '46vh', c: 'rgba(143,17,22,0.28)', b: 175 },
  { x: '10%', y: '72%', w: '60vw', h: '38vh', c: 'rgba(225,20,20,0.16)', b: 155 },

  // and down through the footer, so the page ends lit instead of cut off
  { x: '86%', y: '81%', w: '64vw', h: '40vh', c: 'rgba(255,31,31,0.18)', b: 160 },
  { x: '46%', y: '92%', w: '88vw', h: '44vh', c: 'rgba(143,17,22,0.30)', b: 170 },
  { x: '16%', y: '99%', w: '58vw', h: '34vh', c: 'rgba(225,20,20,0.20)', b: 150 },
]

export function SiteAtmosphere() {
  return (
    <div
      aria-hidden
      // -z-10 keeps it under every section. It is a direct child of <main> and
      // deliberately NOT inside any section's `isolate` context — from in there
      // it could never paint across a boundary.
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {NODES.map((n, i) => (
        <div
          key={i}
          className="absolute rounded-[100%]"
          style={{
            left: n.x,
            top: n.y,
            width: n.w,
            height: n.h,
            background: n.c,
            filter: `blur(${n.b}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Legibility. A soft column of ink down the middle where the copy lives,
          so the mesh stays a rim light on the flanks instead of washing out
          text. Transparent at the edges so the nodes still read. */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_50%,rgba(3,3,3,0.82)_0%,rgba(3,3,3,0.55)_45%,transparent_78%)]" />

      {/* The header sits on solid ink — it has no background of its own now. */}
      <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,#030303_0%,rgba(3,3,3,0.85)_45%,transparent_100%)]" />

      {/* A faint grid tying the whole field together. One instance for the page,
          masked to fade at top and bottom, so no section shows a texture edge —
          per-section grids were switching on at full strength at a boundary. */}
      <div className="absolute inset-0 opacity-[0.5] [background-image:linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:linear-gradient(180deg,transparent_0%,#000_14%,#000_86%,transparent_100%)]" />
    </div>
  )
}
