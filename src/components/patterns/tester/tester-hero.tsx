'use client'

import { useEffect, useId, useRef } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { navLabels } from '@/content/navigation'
import { useUiStore } from '@/lib/store/ui'
import { OrbitRing, RING_LENGTH, type OrbitRingHandle } from './orbit-ring'
import { VaapsiWordmark } from './vaapsi-wordmark'
import styles from './tester.module.css'

/**
 * The photography, generated in Higgsfield (FLUX 3) from the campaign key art.
 * `side` is the same look with the camera moved round to her right; the hero
 * opens on it and turns to `front` as you scroll, with a small 3D rotation
 * carrying the motion between the two.
 *
 * Both are chroma-keyed cutouts (WebP with alpha) so the ring can pass
 * genuinely behind her and the wall can move independently. The original
 * full-frame JPEGs sit beside them; point at those with `cutout: false` to get
 * the feathered full-photo fallback back.
 */
const MODEL = {
  front: '/tester/model-front.webp',
  side: '/tester/model-side.webp' as string | null,
  /** width / height of the photography */
  aspect: 3 / 4,
  cutout: true,
  /** Her hip line in the front shot, as a fraction of frame width. The ring centres here. */
  hips: 0.47,
  /** Nudge so the side shot's hips land on the front shot's: 0.469 − 0.567. */
  sideShift: -0.098,
}

const COPY = {
  tagline: 'RETHINK · REFASHION · REPEAT',
  ring: [
    'CHOOSE WHAT’S GOOD',
    'RETURN TO RECYCLE',
    'BUY N’SELL PRE-LOVED',
    'REFURBISH TO REFRESH',
    'THINK FIRST, BUY LATER',
  ],
  headline: ['TURN TO STYLE', 'THAT THINKS LIKE YOU'],
  alt: 'Model in a white crop top and wide-leg indigo jeans, a denim jacket slipping off one shoulder',
} as const

/** Seconds for the copy to travel once round the ring. */
const ORBIT_PERIOD = 26

export function TesterHero() {
  const openMobileNav = useUiStore((state) => state.openMobileNav)
  const reduce = useReducedMotion()
  const id = useId().replace(/:/g, '')

  /* ---- Orbit: one clock, both layers -------------------------------- */
  const back = useRef<OrbitRingHandle>(null)
  const front = useRef<OrbitRingHandle>(null)

  useEffect(() => {
    if (reduce) {
      back.current?.setTravel(0)
      front.current?.setTravel(0)
      return
    }
    const speed = RING_LENGTH / ORBIT_PERIOD / 1000 // path units per ms
    let frame = 0
    const tick = (now: number) => {
      const travel = now * speed
      back.current?.setTravel(travel)
      front.current?.setTravel(travel)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduce])

  /* ---- Scroll: the walk and the turn -------------------------------- */
  const stage = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end end'] })
  // A light spring so trackpad and flick scrolling both land smoothly.
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 })

  // Asymmetric on purpose: she opens a little right of centre and settles just
  // left of it. Her stride is nearly a phone-width wide, so a symmetric walk
  // would crop a sneaker at one end or the other.
  const travelX = useTransform(p, [0, 1], [1, -0.4])
  // Framer owns this element's transform, so centring (-50%) is folded in here
  // rather than left to a Tailwind translate it would overwrite.
  const modelX = useTransform(travelX, (v) =>
    reduce ? '-50%' : `calc(-50% + ${v.toFixed(4)} * min(14vw, 170px))`,
  )
  // Her own drift is faster than the wall's light — that gap is the parallax.
  const modelY = useTransform(p, [0, 1], reduce ? ['0%', '0%'] : ['2%', '-2%'])
  const modelTurn = useTransform(p, [0, 1], reduce ? [0, 0] : [16, -8])
  // A short, symmetric crossfade: two half-opaque cutouts read as a turn,
  // a long one reads as a double exposure.
  const sideOpacity = useTransform(p, [0.3, 0.5], [1, 0])
  const frontOpacity = useTransform(sideOpacity, (v) => (MODEL.side ? 1 - v : 1))

  // Parallax: the light moves on its own, slower, opposing axis.
  const lightX = useTransform(p, [0, 1], reduce ? ['0%', '0%'] : ['-10%', '10%'])
  const lightY = useTransform(p, [0, 1], reduce ? ['0%', '0%'] : ['8%', '-12%'])

  const headlineOpacity = useTransform(p, [0.5, 0.78], [0, 1])
  const headlineY = useTransform(p, [0.5, 0.78], [28, 0])

  return (
    <div className={styles.root}>
      {/* ---- Masthead ---- */}
      <header className="relative px-6 pb-10 pt-16 tablet:pb-14 tablet:pt-20">
        <button
          type="button"
          onClick={openMobileNav}
          className="absolute right-5 top-5 flex h-10 w-12 flex-col items-end justify-center gap-[5px] focus-visible:outline-offset-2"
          style={{ color: 'var(--vaapsi-olive)' }}
        >
          <span className="sr-only">{navLabels.openMenu}</span>
          <span aria-hidden className="block h-[1.5px] w-9 bg-current" />
          <span aria-hidden className="block h-[1.5px] w-9 bg-current" />
        </button>

        <h1 className="mx-auto w-[86%] max-w-[560px]">
          <VaapsiWordmark tagline={COPY.tagline} className="block h-auto w-full" />
        </h1>
      </header>

      {/* ---- Hero: a tall scroll track with a pinned stage ---- */}
      <section ref={stage} aria-label="Campaign" className="relative h-[260svh]">
        <div
          className={`${styles.wall} sticky top-0 h-[100svh] overflow-hidden [perspective:1100px]`}
        >
          <motion.div
            aria-hidden
            className={`${styles.light} pointer-events-none absolute -inset-[20%]`}
            style={{ x: lightX, y: lightY }}
          />

          {/* Everything that walks with her. The ring is here so it stays
              centred on her, but outside the turn so it never tilts with her. */}
          <motion.div
            className="absolute bottom-[3%] left-1/2 h-[88%]"
            style={{ x: modelX, y: modelY, aspectRatio: MODEL.aspect }}
          >
            <OrbitRing
              ref={back}
              id={id}
              layer="back"
              phrases={COPY.ring}
              className={`${styles.ring} absolute top-[42%] w-[min(108vw,88svh)] -translate-x-1/2 -translate-y-1/2`}
              style={{ left: `${MODEL.hips * 100}%` }}
            />

            <motion.div
              className="absolute inset-0 [transform-style:preserve-3d]"
              style={{ rotateY: modelTurn }}
            >
              {/* Contact shadow: a cutout has lost the floor it stood on. */}
              <div
                aria-hidden
                className={`${styles.contact} absolute bottom-[3%] left-[16%] h-[6%] w-[68%]`}
              />

              <motion.div className="absolute inset-0" style={{ opacity: frontOpacity }}>
                <Image
                  src={MODEL.front}
                  alt={COPY.alt}
                  fill
                  priority
                  sizes="(min-width: 768px) 78svh, 180vw"
                  data-cutout={MODEL.cutout}
                  className={`${styles.photo} object-cover`}
                />
              </motion.div>
              {MODEL.side ? (
                <motion.div
                  className="absolute inset-0"
                  style={{ opacity: sideOpacity, x: `${MODEL.sideShift * 100}%` }}
                >
                  <Image
                    src={MODEL.side}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 78svh, 180vw"
                    data-cutout={MODEL.cutout}
                    className={`${styles.photo} object-cover`}
                  />
                </motion.div>
              ) : null}
            </motion.div>

            <OrbitRing
              ref={front}
              id={id}
              layer="front"
              phrases={COPY.ring}
              className={`${styles.ring} pointer-events-none absolute top-[42%] w-[min(108vw,88svh)] -translate-x-1/2 -translate-y-1/2`}
              style={{ left: `${MODEL.hips * 100}%` }}
            />
          </motion.div>

          <motion.p
            className={`${styles.headline} absolute inset-x-0 bottom-[13%] text-center text-[clamp(1.25rem,5.6vw,2rem)] font-medium leading-[1.2] tracking-[0.08em]`}
            style={{ opacity: headlineOpacity, y: headlineY }}
          >
            {COPY.headline[0]}
            <br />
            {COPY.headline[1]}
          </motion.p>
        </div>
      </section>
    </div>
  )
}
