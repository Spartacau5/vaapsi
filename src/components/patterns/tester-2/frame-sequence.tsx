'use client'

import { useEffect, useRef } from 'react'
import type { MotionValue } from 'framer-motion'

/**
 * Scroll-scrubbed image sequence, drawn to one canvas.
 *
 * The earlier version stacked every angle as its own full-size layer and
 * faded them — several large composited layers repainting on every scroll
 * tick, which is where the lag came from. This draws exactly one bitmap per
 * frame, and only when the frame index actually changes.
 *
 * Loading: frame 0 is shown immediately as an <img> poster (so there is a
 * figure before any JS runs), then the rest decode in a coarse-to-fine order —
 * every 16th, every 8th, every 4th … — so an early scroll always finds a
 * nearby frame ready instead of a gap.
 */

type Props = {
  /** Frame `i` → its URL. Must be stable (module-level), or loading restarts. */
  src: (i: number) => string
  count: number
  /** 0 … 1 */
  progress: MotionValue<number>
  alt: string
  className?: string
}

/** Coarse-to-fine load order: 0, 16, 32 …, then 8, 24 …, then 4, 12 … */
function loadOrder(count: number) {
  const seen = new Set<number>()
  const order: number[] = []
  for (let step = 16; step >= 1; step /= 2) {
    for (let i = 0; i < count; i += step) {
      if (!seen.has(i)) {
        seen.add(i)
        order.push(i)
      }
    }
  }
  if (!seen.has(count - 1)) order.splice(1, 0, count - 1)
  return order
}

export function FrameSequence({ src, count, progress, alt, className }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const poster = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return

    const frames: (HTMLImageElement | null)[] = Array.from({ length: count }, () => null)
    let wanted = 0
    let drawn = -1
    let raf = 0
    let cancelled = false

    /** Nearest decoded frame to `i`, searching outward. */
    const nearest = (i: number) => {
      for (let d = 0; d < count; d++) {
        if (frames[i - d]) return i - d
        if (frames[i + d]) return i + d
      }
      return -1
    }

    const draw = () => {
      raf = 0
      const i = nearest(wanted)
      if (i < 0 || i === drawn) return
      const img = frames[i]!
      ctx.clearRect(0, 0, el.width, el.height)
      ctx.drawImage(img, 0, 0, el.width, el.height)
      drawn = i
      if (poster.current) poster.current.style.visibility = 'hidden'
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }

    // Size the backing store to the element, capped at 2× for memory.
    const resize = () => {
      const rect = el.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      el.width = Math.round(rect.width * dpr)
      el.height = Math.round(rect.height * dpr)
      drawn = -1
      schedule()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const unsubscribe = progress.on('change', (v) => {
      wanted = Math.round(Math.min(1, Math.max(0, v)) * (count - 1))
      schedule()
    })
    wanted = Math.round(progress.get() * (count - 1))

    // Decode a few at a time so the first frames aren't starved.
    const queue = loadOrder(count)
    const pump = async () => {
      while (queue.length && !cancelled) {
        const i = queue.shift()!
        const img = new Image()
        img.decoding = 'async'
        img.src = src(i)
        try {
          await img.decode()
        } catch {
          continue
        }
        if (cancelled) return
        frames[i] = img
        // A newly arrived frame may be closer to where the reader is; draw()
        // is a no-op if the nearest frame hasn't changed.
        schedule()
      }
    }
    void Promise.all([pump(), pump(), pump(), pump()])

    return () => {
      cancelled = true
      unsubscribe()
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [src, count, progress])

  return (
    <div className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element -- first-paint poster for the canvas; must be the exact frame-0 file, not a resized variant */}
      <img
        ref={poster}
        src={src(0)}
        alt={alt}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-contain"
      />
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
    </div>
  )
}
