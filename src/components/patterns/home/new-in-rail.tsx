'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ProductCard } from '../product-card'
import { Reveal } from '../reveal'
import { Section } from '@/components/primitives/section'
import { home } from '@/content/home'
import type { ProductSummary } from '@/lib/types'

/**
 * Horizontally scrolling rail of recent arrivals.
 *
 * Native scroll with snap points underneath, so a trackpad, a touchscreen and a
 * scrollbar all work without us writing a single line for them. The arrows sit
 * on top of that rather than replacing it: they call `scrollBy`, the browser
 * animates it and the snap points catch the result. Nothing here reimplements
 * scrolling, which is what makes a carousel feel wrong on a laptop.
 *
 * The arrows exist because on a desktop with no touchscreen a horizontal rail is
 * genuinely awkward — shift-scroll is not something most people know, and a
 * scrollbar under a row of images is not an inviting control. They disable at
 * each end rather than wrapping: this is a scroll position, not a carousel, and
 * a rail that silently jumps back to the start loses the reader's place.
 *
 * The overflow bleeds to the viewport edge so a partially visible card signals
 * that there is more — a rail that ends flush at the gutter looks like a grid
 * that ran out.
 *
 * The note under the heading does real work: it says out loud that these are
 * one-of-one, which is what makes a rail of resale stock feel like rotating
 * inventory rather than a catalogue.
 *
 * A client component, for the ref and the scroll position. `ProductCard` renders
 * inside it happily — it is markup and links, with no server-only work.
 */

/** How far one press moves the rail, as a share of what is on screen. */
const STEP = 0.8

export function NewInRail({ products }: { products: readonly ProductSummary[] }) {
  const railRef = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const rail = railRef.current
    if (rail === null) return
    // A pixel of tolerance: sub-pixel layout means scrollLeft rarely lands
    // exactly on the maximum, and a next button that never quite enables is
    // worse than one that enables a pixel early.
    setAtStart(rail.scrollLeft <= 1)
    setAtEnd(rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1)
  }, [])

  useEffect(() => {
    sync()
    // Also on resize: a wider viewport can fit the whole rail, at which point
    // both arrows should be dead rather than scrolling nowhere.
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [sync, products])

  const step = (direction: -1 | 1) => {
    const rail = railRef.current
    if (rail === null) return
    rail.scrollBy({ left: direction * rail.clientWidth * STEP, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <Reveal>
      <Section
        eyebrow={home.newIn.eyebrow}
        heading={home.newIn.title}
        lede={home.newIn.note}
        action={
          <div className="flex items-center gap-1">
            <RailButton label={home.newIn.previous} disabled={atStart} onClick={() => step(-1)}>
              <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
            </RailButton>
            <RailButton label={home.newIn.next} disabled={atEnd} onClick={() => step(1)}>
              <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
            </RailButton>
            <Link
              href="/shop?sort=newest"
              className="group/cta ease ml-3 inline-flex shrink-0 items-center gap-2 text-sm text-ink-muted transition-colors duration-base hover:text-ink"
            >
              {home.newIn.cta}
              <ArrowRight
                className="ease size-4 transition-transform duration-base group-hover/cta:translate-x-1"
                strokeWidth={1.5}
                aria-hidden
              />
            </Link>
          </div>
        }
      >
        {/*
          `-mx-gutter px-gutter` lets just the rail escape the container while the
          heading above stays aligned to the grid. `scroll-px` keeps the first
          card aligned when snapped back to the start.
        */}
        <ul
          ref={railRef}
          onScroll={sync}
          aria-label={home.newIn.railLabel}
          className="-mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-2 desktop:gap-6"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              as="li"
              product={product}
              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, 58vw"
              className="w-[58vw] shrink-0 snap-start tablet:w-[30vw] desktop:w-[20vw]"
            />
          ))}
        </ul>
      </Section>
    </Reveal>
  )
}

function RailButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      // Dimmed rather than hidden at the ends. A control that disappears takes
      // the layout with it and moves everything beside it.
      className="ease flex size-9 items-center justify-center text-ink-muted transition-colors duration-base hover:text-ink focus-visible:outline-offset-2 disabled:pointer-events-none disabled:text-ink-subtle disabled:opacity-40"
    >
      {children}
    </button>
  )
}
