'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Type } from '@/components/primitives/type'
import { home } from '@/content/home'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

/**
 * The hero: full-bleed photography, rotating.
 *
 * ## Editorial, not catalogue
 *
 * The frames are pictures of denim being worn, hung, dried and remade — not
 * listings. That is a deliberate split from the rail below, which is the newest
 * stock and links garment by garment. A hero that showed four specific garments
 * on a one-of-one marketplace would be advertising four things that can each
 * sell once; showing what the business is about instead survives the inventory
 * turning over.
 *
 * ## No caption
 *
 * The picture carries the page on its own. The thesis is still the `h1` — the
 * document needs a heading and search needs to know what this page is about —
 * but it is `sr-only`, because a white card floating over the middle of a
 * photograph was the one piece of chrome on this page that could not be
 * justified. The copy it held has not been deleted; it lives in `content/home`
 * and can come back the moment there is a place for it.
 *
 * ## The position rail sits on the image
 *
 * Four hairlines, centred at the bottom of the frame, and nothing else. No
 * arrows and no pause button: the rail already does both jobs — it says how many
 * frames there are, which one you are on, and clicking one goes straight there
 * rather than stepping. Two arrows plus a pause plus four dots was three
 * controls doing one control's work.
 *
 * The rules are painted with `mix-blend-mode: difference`. Photography gives no
 * contrast guarantee — the fourth frame is a bag on a white wall, so white rules
 * vanish, and the first is a dark interior, so black ones do. Difference
 * blending inverts against whatever is actually behind each rule, so they stay
 * visible on every frame without a scrim, a gradient or a shadow to prop them up.
 *
 * ## Motion
 *
 * A crossfade, not a slide. A horizontal slide draws the eye across the page and
 * competes with everything below it; a fade changes the subject without
 * announcing itself. Four seconds a frame, looping indefinitely. Picking a frame
 * from the rail jumps there and lets the rotation carry on — it restarts the
 * clock rather than stopping it, so a click halfway through a beat does not get
 * two seconds and then a move nobody asked for.
 *
 * It pauses while the pointer is over it, while anything inside has keyboard
 * focus, and while the tab is hidden.
 *
 * **Known gap.** WCAG 2.2.2 wants a labelled stop for anything that moves past
 * five seconds. There is no longer any mechanism that halts the loop for good —
 * this is a deliberate product decision, recorded here rather than hidden.
 * Restoring a pause control, or stopping automatically after one full pass,
 * would both close it.
 *
 * With reduced motion on, there is no autoplay and no crossfade at all. The
 * first frame is shown and the rail still works — a carousel that advances
 * itself is precisely what that preference is asking us not to do.
 */

/** Long enough to look at a picture, short enough to see a second one. */
const INTERVAL_MS = 4000

/**
 * Whether focus landed here from the keyboard rather than a pointer.
 *
 * Wrapped because `:focus-visible` is not universally supported by
 * `matches()` — jsdom among others. Where it is not, the safe answer is yes:
 * pausing a carousel we did not need to pause costs a reader nothing, and
 * failing to pause one a keyboard user is working through costs them the page.
 */
function isKeyboardFocus(target: EventTarget): boolean {
  if (!(target instanceof Element)) return true
  try {
    return target.matches(':focus-visible')
  } catch {
    return true
  }
}

export function HeroCarousel() {
  const slides = home.hero.slides
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [suspended, setSuspended] = useState(false)
  const regionId = useId()
  const total = slides.length

  /**
   * Jump to a frame and let the rotation carry on from there. Deliberately not
   * a full stop: the loop is meant to keep running, so the timer restarts from
   * the frame you picked rather than the one it was heading for.
   */
  const steer = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total)
    },
    [total],
  )

  const active = !reduced && !suspended && total > 1

  useEffect(() => {
    if (!active) return
    // `index` in the dependencies is what restarts the clock after a manual
    // jump. Without it, picking a frame halfway through a beat gives you two
    // seconds on it and then a move you did not ask for.
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % total), INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [active, total, index])

  // A carousel advancing in a tab nobody is looking at is wasted bandwidth, and
  // on return it has skipped past everything.
  useEffect(() => {
    const onVisibility = () => setSuspended(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const current = slides[index]
  if (current === undefined) return null

  return (
    <section
      aria-roledescription="carousel"
      aria-label={home.hero.carousel.label}
      className="relative"
      onMouseEnter={() => setSuspended(true)}
      onMouseLeave={() => setSuspended(false)}
      onFocusCapture={(event) => {
        // Keyboard focus only. A mouse click on a rail rule also focuses the
        // button, and pausing there would mean picking a frame quietly stops
        // the rotation until you click somewhere else — the opposite of what
        // the rail is for. `:focus-visible` is exactly the distinction the
        // browser already draws.
        if (isKeyboardFocus(event.target)) setSuspended(true)
      }}
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
        // unattended carousel talks over everything else on the page. It only
        // announces when motion is off, where the rail is the only thing moving
        // it and every change is something the reader asked for.
        aria-live={reduced ? 'polite' : 'off'}
        className="relative h-[78vh] max-h-[860px] min-h-[520px] w-full overflow-hidden bg-surface"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={current.src}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              // Only the first frame. Preloading all four would compete with
              // the fonts and the stylesheet for the initial render.
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Position announced to assistive tech without duplicating the DOM. */}
        <span className="sr-only">{home.hero.carousel.position(index + 1, total)}</span>
      </div>

      {/*
        The page heading, for the document outline and for search. Not rendered:
        see the note above.
      */}
      <Type as="h1" className="sr-only">
        {home.hero.thesis}
      </Type>

      {total > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center desktop:bottom-10">
          <div className="pointer-events-auto">
            <Counter index={index} total={total} onSelect={steer} />
          </div>
        </div>
      )}
    </section>
  )
}

/**
 * The position rail: hairlines rather than dots.
 *
 * Dots are ambiguous about how many there are once you pass about six, and they
 * are a small target. A rule per frame reads as an index, sits in the same
 * typographic register as everything else, and is easier to hit.
 *
 * `mix-blend-difference` is what keeps them legible over arbitrary photography
 * without adding a scrim. The rules are painted in the background token and the
 * blend inverts them against whatever is behind — light on the dark frames, dark
 * on the white-wall one.
 *
 * Two pixels, not one. A hairline is right for a rule between blocks of text on
 * a flat ground; over a photograph, at the bottom of a full-bleed image, it
 * disappears into the grain.
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
    <div className="flex items-center gap-2 mix-blend-difference">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={home.hero.carousel.position(i + 1, total)}
          aria-current={i === index ? 'true' : undefined}
          // A generous hit area around a hairline: the rule is 2.5rem tall
          // enough to clear the 24px minimum target size.
          className="group/dot flex h-6 w-10 items-center focus-visible:outline-offset-2"
        >
          <span
            className={`ease h-0.5 w-full bg-background transition-opacity duration-base ${
              i === index ? 'opacity-100' : 'opacity-40 group-hover/dot:opacity-70'
            }`}
          />
        </button>
      ))}
    </div>
  )
}
