/**
 * The new Vaapsi wordmark, drawn as geometry rather than shipped as a raster.
 *
 * Coordinates are lifted from the brand guidelines lockup (page "5", 1456×816
 * artboard), so the proportions match the master: a 29-unit stroke, an 89-unit
 * outer bowl radius, and the two a's joined by the infinity swash.
 *
 * Everything fills with `currentColor`; set the colour on the parent.
 * Replace with the outlined SVG export from the brand team when it exists.
 */

const STROKE = 29
/** Centreline radius of every bowl: outer 89, inner 60. */
const R = 74.5

/** Point on a bowl's centreline. Angles in degrees, y pointing down. */
function at(cx: number, cy: number, deg: number) {
  const t = (deg * Math.PI) / 180
  return `${(cx + R * Math.cos(t)).toFixed(2)} ${(cy + R * Math.sin(t)).toFixed(2)}`
}

const A1 = { cx: 540, cy: 386 }
const A2 = { cx: 698, cy: 386 }

/**
 * The infinity: first bowl from its lower-right opening, clockwise round to its
 * upper right; a swash down into the second bowl's lower left; then
 * anticlockwise round the second bowl to its upper-left opening.
 */
const infinity = [
  `M ${at(A1.cx, A1.cy, 25)}`,
  `A ${R} ${R} 0 1 1 ${at(A1.cx, A1.cy, -30)}`,
  `C 617 371 621 401 ${at(A2.cx, A2.cy, 150)}`,
  `A ${R} ${R} 0 1 0 ${at(A2.cx, A2.cy, -145)}`,
].join(' ')

const s =
  'M 1105 340 C 1092 316 1074 311 1055 311 C 1030 311 1007 322 1007 348 ' +
  'C 1007 372 1032 380 1050 386 L 1072 392 C 1092 398 1105 408 1105 426 ' +
  'C 1105 450 1080 461 1055 461 C 1030 461 1008 451 997 428'

/** The raw geometry, for anything that draws the mark piece by piece (the splash). */
export const WORDMARK_GEOMETRY = {
  viewBox: '285 290 885 252',
  stroke: STROKE,
  r: R,
  infinity,
  s,
} as const

type Props = {
  className?: string
  /** Line set under the a's, left of the p's descender. */
  tagline?: string
  title?: string
}

export function VaapsiWordmark({ className, tagline, title = 'Vaapsi' }: Props) {
  return (
    <svg
      viewBox="285 290 885 252"
      className={className}
      role="img"
      aria-label={tagline ? `${title} — ${tagline}` : title}
      fill="currentColor"
    >
      {/* v */}
      <polygon points="290,304 323,304 375.5,437 428,304 461,304 393,473 359,473" />

      {/* aa, with the swash */}
      <path d={infinity} fill="none" stroke="currentColor" strokeWidth={STROKE} />
      <rect x="590" y="448" width="31" height="25" />
      <rect x="759" y="301" width="31" height="172" />

      {/* p */}
      <rect x="807" y="301" width="31" height="236" />
      <circle cx="897" cy="386" r={R} fill="none" stroke="currentColor" strokeWidth={STROKE} />

      {/* s */}
      <path d={s} fill="none" stroke="currentColor" strokeWidth={STROKE} />

      {/* l */}
      <rect x="1133" y="301" width="31" height="172" />

      {tagline ? (
        <text
          x="300"
          y="528"
          textLength="490"
          lengthAdjust="spacing"
          fontSize="27"
          fontWeight="500"
          style={{ fontFamily: 'var(--font-jost), system-ui, sans-serif' }}
        >
          {tagline}
        </text>
      ) : null}
    </svg>
  )
}
