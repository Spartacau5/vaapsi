'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import { PassportMark } from '../passport-mark'
import { Price } from '../price'
import { Container } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { home } from '@/content/home'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'
import type { ProductSummary } from '@/lib/types'

/**
 * The hero: full-bleed photography, rotating.
 *
 * ## What it does and does not claim
 *
 * Every frame is a real listing and links to it. That matters on a one-of-one
 * marketplace — a carousel of styled images that go nowhere would imply depth of
 * stock this business does not have and is not trying to have. Rotating through
 * actual garments says "here is what is in today", which is true.
 *
 * ## Why the caption is a solid block, not text on the image
 *
 * Copy laid straight onto photography has no contrast guarantee: it passes on
 * one frame and fails on the next, and the usual fix is a dark gradient wash,
 * which this brand does not use. So the caption sits in an opaque block over the
 * lower-left of the image. Contrast is fixed regardless of what is behind it,
 * and it is the same device Zara and COS use, so it reads as editorial rather
 * than as a workaround.
 *
 * ## Motion
 *
 * A crossfade, not a slide. A horizontal slide draws the eye across the page and
 * competes with the caption; a fade changes the subject without announcing
 * itself. Autoplay stops on hover, on keyboard focus, when the tab is hidden,
 * and permanently on the first click of any control — once someone is steering,
 * taking the wheel back is hostile. There is also an explicit pause button,
 * because WCAG 2.2.2 requires one for anything that moves past five seconds and
 * hover is not a control a keyboard user has.
 *
 * With reduced motion on, there is no autoplay and no crossfade at all. The
 * first frame is shown and the controls still work — a carousel that advances
 * itself is precisely what that preference is asking us not to do.
 */

/** Long enough to look at a garment, short enough to see a second one. */
const INTERVAL_MS = 6000

export function HeroCarousel({ products }: { products: readonly ProductSummary[] }) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  // Autoplay is opt-out, but a single interaction ends it for the session.
  const [playing, setPlaying] = useState(true)
  const [suspended, setSuspended] = useState(false)
  const regionId = useId()
  const total = products.length

  const go = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total)
    },
    [total],
  )

  /** Any deliberate navigation ends autoplay for good. */
  const steer = useCallback(
    (next: number) => {
      setPlaying(false)
      go(next)
    },
    [go],
  )

  const active = playing && !reduced && !suspended && total > 1

  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % total), INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [active, total])

  // A carousel advancing in a tab nobody is looking at is wasted bandwidth, and
  // on return it has skipped past everything.
  useEffect(() => {
    const onVisibility = () => setSuspended(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  if (total === 0) return null
  const current = products[index]
  if (current === undefined) return null

  return (
    <section
      aria-roledescription="carousel"
      aria-label={home.hero.carousel.label}
      className="relative"
      onMouseEnter={() => setSuspended(true)}
      onMouseLeave={() => setSuspended(false)}
      onFocusCapture={() => setSuspended(true)}
      onBlurCapture={() => setSuspended(false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          steer(index + 1)
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault()
          steer(index - 1)
        }
      }}
    >
      {/*
        Tall, but never the full viewport. A 100vh hero means the first scroll
        reveals nothing but more hero, and on a phone the browser chrome makes
        100vh a lie anyway.
      */}
      <div
        id={regionId}
        // Off while it is advancing on its own — a live region narrating an
        // unattended carousel talks over everything else on the page.
        aria-live={playing && !reduced ? 'off' : 'polite'}
        className="relative h-[78vh] max-h-[860px] min-h-[520px] w-full overflow-hidden bg-surface"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={current.id}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.primaryImage.url}
              alt={current.primaryImage.alt}
              fill
              // The first frame is the largest paint on the page.
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Every slide announced to assistive tech, without duplicating the DOM. */}
        <span className="sr-only">{home.hero.carousel.position(index + 1, total)}</span>
      </div>

      {/* The caption. Absolutely placed on desktop, stacked beneath on a phone,
          where an overlay would cover most of the garment. */}
      <Container className="relative">
        <div className="pointer-events-none desktop:absolute desktop:inset-x-0 desktop:bottom-10">
          <div className="pointer-events-auto bg-background p-6 desktop:max-w-sm desktop:p-8">
            <Eyebrow>{home.hero.eyebrow}</Eyebrow>
            <Type
              as="h1"
              family="display"
              size="3xl"
              weight="heading"
              className="mt-2 desktop:text-4xl"
            >
              {home.hero.thesis}
            </Type>
            <Type size="sm" tone="muted" measure="narrow" className="mt-3">
              {home.hero.lede}
            </Type>

            <div className="mt-5 border-t border-line pt-4">
              <Type size="sm" weight="emphasis">
                {current.brand}
              </Type>
              <Type size="sm" tone="muted">
                {current.title}
              </Type>
              <div className="mt-2 flex items-baseline gap-3">
                <Price
                  priceInr={current.priceInr}
                  originalRetailInr={current.originalRetailInr}
                  availability={current.availability}
                />
                <PassportMark hasPassport={current.passportId !== null} />
              </div>
            </div>

            <Link
              href={`/product/${current.slug}`}
              className="group/cta ease mt-5 inline-flex items-center gap-3 border-b border-line-strong pb-1 text-sm text-ink transition-colors duration-base hover:border-ink"
            >
              {home.hero.cta}
              <ArrowRight
                className="ease size-4 transition-transform duration-base group-hover/cta:translate-x-1"
                strokeWidth={1.5}
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </Container>

      {total > 1 && (
        <Container>
          <div className="flex items-center justify-between gap-6 pt-4 desktop:pt-6">
            <Counter index={index} total={total} onSelect={steer} />
            <div className="flex items-center gap-1">
              {!reduced && (
                <IconButton
                  label={playing ? home.hero.carousel.pause : home.hero.carousel.play}
                  onClick={() => setPlaying((on) => !on)}
                  controls={regionId}
                >
                  {playing ? (
                    <Pause className="size-4" strokeWidth={1.5} aria-hidden />
                  ) : (
                    <Play className="size-4" strokeWidth={1.5} aria-hidden />
                  )}
                </IconButton>
              )}
              <IconButton
                label={home.hero.carousel.previous}
                onClick={() => steer(index - 1)}
                controls={regionId}
              >
                <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
              </IconButton>
              <IconButton
                label={home.hero.carousel.next}
                onClick={() => steer(index + 1)}
                controls={regionId}
              >
                <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
              </IconButton>
            </div>
          </div>
        </Container>
      )}
    </section>
  )
}

/**
 * The position rail: numbered rules rather than dots.
 *
 * Dots are ambiguous about how many there are once you pass about six, and they
 * are a small target. A rule per slide reads as an index, sits in the same
 * typographic register as everything else, and is easier to hit.
 */
function Counter({
  index,
  total,
  onSelect,
}: {
  index: number
  total: number
  onSelect: (next: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={home.hero.carousel.position(i + 1, total)}
          aria-current={i === index ? 'true' : undefined}
          // A generous hit area around a hairline: the rule is 2rem × 1px, the
          // button around it clears the 24px minimum target size.
          className="group/dot flex h-6 w-8 items-center focus-visible:outline-offset-2"
        >
          <span
            className={`ease h-px w-full transition-colors duration-base ${
              i === index ? 'bg-ink' : 'bg-line-strong group-hover/dot:bg-ink-muted'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function IconButton({
  label,
  onClick,
  controls,
  children,
}: {
  label: string
  onClick: () => void
  controls: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-controls={controls}
      className="ease flex size-9 items-center justify-center text-ink-muted transition-colors duration-base hover:text-ink focus-visible:outline-offset-2"
    >
      {children}
    </button>
  )
}
