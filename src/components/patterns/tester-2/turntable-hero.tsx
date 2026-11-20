'use client'

import { useEffect, useId, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { navLabels } from '@/content/navigation'
import { useUiStore } from '@/lib/store/ui'
import { OrbitRing, RING_LENGTH, type OrbitRingHandle } from '../tester/orbit-ring'
import { VaapsiWordmark } from '../tester/vaapsi-wordmark'
import styles from '../tester/tester.module.css'
import { FrameSequence } from './frame-sequence'

/**
 * Tester v2 — the turntable.
 *
 * She never moves. Neither does the ring. The whole first screen (masthead and
 * stage) is pinned from the moment the page loads, and scrolling only turns
 * her. The ring keeps its own steady orbit throughout, independent of scroll.
 *
 * The turn is a 97-frame sequence in public/tester-2/seq, scrubbed by scroll
 * on one canvas. It is built by optical-flow morphing (48 in-betweens per pair)
 * from the three right-facing AI keyframes, turn-1 → turn-2 → turn-3, which are
 * aligned: hips on the centreline, shoes on one baseline. She never flips
 * direction. turn-4 and turn-5 face the other way and are deliberately unused.
 */
const FRAME_COUNT = 97
const frameSrc = (i: number) => `/tester-2/seq/f${String(i).padStart(3, '0')}.webp`

const COPY = {
  ring: [
    'CHOOSE WHAT’S GOOD',
    'RETURN TO RECYCLE',
    'BUY N’SELL PRE-LOVED',
    'REFURBISH TO REFRESH',
    'THINK FIRST, BUY LATER',
  ],
  headline: ['TURN TO STYLE', 'THAT THINKS LIKE YOU'],
  alt: 'Model in a white crop top and wide-leg indigo jeans, a denim jacket slipping off one shoulder, turning to look back over her shoulder',
} as const

/**
 * The ring is drawn at 74% of the frame's width — round her hips — so its
 * copy is set larger in ring units to stay readable. Five phrases at this size
 * just fit one lap; go bigger and they collide.
 */
const RING_TYPE = { size: 14.5, tracking: 0.5, line: 2.4 }

/** Seconds for the copy to travel once round the ring. */
const ORBIT_PERIOD = 26
/** width / height of every frame */
const ASPECT = 3 / 4

export function TurntableHero() {
  const openMobileNav = useUiStore((state) => state.openMobileNav)
  const reduce = useReducedMotion()
  const id = useId().replace(/:/g, '')

  /* ---- Orbit: one clock, both layers, never tied to scroll ---------- */
  const back = useRef<OrbitRingHandle>(null)
  const front = useRef<OrbitRingHandle>(null)

  useEffect(() => {
    if (reduce) {
      back.current?.setTravel(0)
      front.current?.setTravel(0)
      return
    }
    const speed = RING_LENGTH / ORBIT_PERIOD / 1000
    let frame = 0
    const tick = (now: number) => {
      back.current?.setTravel(now * speed)
      front.current?.setTravel(now * speed)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduce])

  /* ---- Scroll: which angle ------------------------------------------ */
  const track = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  // A light spring so a flick glides through the frames instead of jumping;
  // reduced motion pins her to frame 0.
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 34, mass: 0.25 })
  const turn = useTransform(p, (v) => (reduce ? 0 : v))

  // The window light drifts a touch as she turns — the only thing that does.
  const lightX = useTransform(p, [0, 1], reduce ? ['0%', '0%'] : ['-4%', '4%'])

  return (
    <section ref={track} aria-label="Campaign" className={`${styles.root} relative h-[200svh]`}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* ---- Masthead, pinned with the stage ---- */}
        <header className="relative shrink-0 px-6 pb-4 pt-5 tablet:pb-5 tablet:pt-6">
          <button
            type="button"
            onClick={openMobileNav}
            className="absolute right-4 top-1/2 flex h-10 w-12 -translate-y-1/2 flex-col items-end justify-center gap-[5px] focus-visible:outline-offset-2"
            style={{ color: 'var(--vaapsi-olive)' }}
          >
            <span className="sr-only">{navLabels.openMenu}</span>
            <span aria-hidden className="block h-[1.5px] w-9 bg-current" />
            <span aria-hidden className="block h-[1.5px] w-9 bg-current" />
          </button>
          <h1 className="mx-auto w-[54%] max-w-[300px]">
            {/* No tagline at this size: it would set at ~5px on a phone. */}
            <VaapsiWordmark className="block h-auto w-full" />
          </h1>
        </header>

        {/* ---- Stage ---- */}
        <div className={`${styles.wall} relative min-h-0 flex-1 overflow-hidden`}>
          <motion.div
            aria-hidden
            className={`${styles.light} pointer-events-none absolute -inset-[20%]`}
            style={{ x: lightX }}
          />

          <div
            className="absolute bottom-0 left-1/2 h-[106%] -translate-x-1/2"
            style={{ aspectRatio: ASPECT }}
          >
            <OrbitRing
              ref={back}
              id={id}
              layer="back"
              phrases={COPY.ring}
              className={`${styles.ring} absolute left-1/2 top-[45%] w-[74%] -translate-x-1/2 -translate-y-1/2`}
              fontSize={RING_TYPE.size}
              letterSpacing={RING_TYPE.tracking}
              lineWeight={RING_TYPE.line}
            />

            <div
              aria-hidden
              className={`${styles.contact} absolute bottom-[2%] left-[18%] h-[6%] w-[64%]`}
            />

            <FrameSequence
              src={frameSrc}
              count={FRAME_COUNT}
              progress={turn}
              alt={COPY.alt}
              className="absolute inset-0"
            />

            <OrbitRing
              ref={front}
              id={id}
              layer="front"
              phrases={COPY.ring}
              className={`${styles.ring} pointer-events-none absolute left-1/2 top-[45%] w-[74%] -translate-x-1/2 -translate-y-1/2`}
              fontSize={RING_TYPE.size}
              letterSpacing={RING_TYPE.tracking}
              lineWeight={RING_TYPE.line}
            />
          </div>

          <p
            className={`${styles.headline} absolute inset-x-0 bottom-[9%] text-center text-[clamp(1.15rem,5.2vw,1.9rem)] font-medium leading-[1.2] tracking-[0.08em]`}
          >
            {COPY.headline[0]}
            <br />
            {COPY.headline[1]}
          </p>
        </div>
      </div>
    </section>
  )
}
