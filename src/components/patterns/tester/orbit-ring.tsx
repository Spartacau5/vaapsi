'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

/**
 * A tilted ring of copy that orbits the model.
 *
 * Rendered as two layers sharing one geometry: the `back` layer draws only the
 * far half of the ellipse and sits behind the photo; the `front` layer draws
 * only the near half and sits over it. Stacked, the ring reads as passing
 * behind her shoulders and in front of her hips.
 *
 * The motion is a single number — how far along the ellipse the copy has
 * travelled — written straight to `startOffset` from one rAF loop owned by the
 * parent, so the two layers can never drift apart and React never re-renders.
 *
 * The path is the ellipse traced twice. Each phrase sits at
 * `(travel + its slot) mod L`, so it always lies inside [0, 2L): when the
 * offset wraps from L back to 0 the picture is identical, and the loop is
 * seamless.
 */

export const RING = {
  size: 440,
  rx: 205,
  ry: 66,
  /** Degrees. Negative lifts the right end, as in the campaign key art. */
  tilt: -20,
}

const C = RING.size / 2

/** Ramanujan's approximation; exact enough that the wrap is invisible. */
export function ringLength(rx: number, ry: number) {
  return Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)))
}

/** Lap length of the default ring. */
export const RING_LENGTH = ringLength(RING.rx, RING.ry)

/**
 * The ellipse traced twice. Starts at the right-hand end and runs anticlockwise
 * on screen, so the near (lower) half is traversed left to right and its copy
 * reads upright.
 */
function ringPath(rx: number, ry: number) {
  const loop = `A ${rx} ${ry} 0 1 0 ${C - rx} ${C} A ${rx} ${ry} 0 1 0 ${C + rx} ${C}`
  return `M ${C + rx} ${C} ${loop} ${loop}`
}

export type OrbitRingHandle = {
  /** Distance travelled along the ring, in path units. Any value; it wraps. */
  setTravel: (travel: number) => void
}

type Props = {
  id: string
  phrases: readonly string[]
  layer: 'back' | 'front'
  className?: string
  style?: React.CSSProperties
  /** In ring units (the 440-unit viewBox). Raise it when the ring is drawn small. */
  fontSize?: number
  /** Stroke of the ellipse itself, in screen pixels (it does not scale with the ring). */
  lineWeight?: number
  letterSpacing?: number
  /**
   * Half-height of the ellipse in ring units (default 66). Taller rings have a
   * longer lap, which is what lets the copy be set larger.
   */
  ry?: number
  /** Degrees; negative lifts the right end. Default -20. */
  tilt?: number
}

export const OrbitRing = forwardRef<OrbitRingHandle, Props>(function OrbitRing(
  {
    id,
    phrases,
    layer,
    className,
    style,
    fontSize = 11.5,
    letterSpacing = 1.6,
    lineWeight = 1.1,
    ry = RING.ry,
    tilt = RING.tilt,
  },
  ref,
) {
  const rx = RING.rx
  const length = ringLength(rx, ry)
  const paths = useRef<(SVGTextPathElement | null)[]>([])
  /** Where each phrase starts on a resting ring, spaced by its measured width. */
  const slots = useRef<number[]>(phrases.map((_, i) => (i * length) / phrases.length))

  useEffect(() => {
    const widths = paths.current.map((el) => el?.getComputedTextLength() ?? 0)
    const total = widths.reduce((sum, w) => sum + w, 0)
    if (total === 0) return
    const gap = Math.max(0, (length - total) / phrases.length)
    let cursor = 0
    slots.current = widths.map((w) => {
      const start = cursor
      cursor += w + gap
      return start
    })
  }, [phrases, length])

  useImperativeHandle(ref, () => ({
    setTravel(travel) {
      const L = length
      paths.current.forEach((el, i) => {
        if (!el) return
        const offset = (((travel + (slots.current[i] ?? 0)) % L) + L) % L
        el.setAttribute('startOffset', offset.toFixed(2))
      })
    },
  }))

  const pathId = `${id}-path-${layer}`
  const clipId = `${id}-clip-${layer}`
  const isFront = layer === 'front'

  return (
    <svg
      viewBox={`0 0 ${RING.size} ${RING.size}`}
      className={className}
      style={style}
      aria-hidden
      overflow="visible"
    >
      <defs>
        <path id={pathId} d={ringPath(rx, ry)} />
        {/* Clip in the ring's own (untilted) space: near half is below centre. */}
        <clipPath id={clipId}>
          <rect
            x={-RING.size}
            width={RING.size * 3}
            y={isFront ? C : -RING.size}
            height={RING.size * 1.5}
          />
        </clipPath>
      </defs>

      <g transform={`rotate(${tilt} ${C} ${C})`}>
        <g clipPath={`url(#${clipId})`} opacity={isFront ? 1 : 0.7}>
          <ellipse
            cx={C}
            cy={C}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="currentColor"
            strokeWidth={lineWeight}
            vectorEffect="non-scaling-stroke"
          />
          <text
            fill="currentColor"
            fontSize={fontSize}
            fontWeight={500}
            letterSpacing={letterSpacing}
            dy={-5}
            style={{ fontFamily: 'var(--font-jost), system-ui, sans-serif' }}
          >
            {phrases.map((phrase, i) => (
              <textPath
                key={phrase}
                href={`#${pathId}`}
                ref={(el) => {
                  paths.current[i] = el
                }}
                startOffset={slots.current[i]}
              >
                {phrase}
              </textPath>
            ))}
          </text>
        </g>
      </g>
    </svg>
  )
})
