'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Row } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import type { ProductImage } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Product gallery.
 *
 * Desktop: a two-up grid with the primary image spanning both columns. No
 * lightbox, no thumbnail strip, no zoom-on-hover — on resale the photographs
 * *are* the product description, and making a shopper click through them one at
 * a time to check for flaws is hostile. But a single stacked column of five 3:4
 * images put the condition block five screens down, and that block is what
 * decides the purchase.
 *
 * Mobile: a swipeable, snapping track with a position indicator. Native scroll
 * again rather than a carousel library, so momentum, rubber-banding and the
 * scrollbar all behave the way the platform does.
 *
 * Image order is set by the caller and is deliberate: primary → worn → detail →
 * flaw → label. Worn comes second because "what does it look like on a person"
 * is the first question; flaws come before the label because someone scrolling
 * to the end should hit the honest part, not the paperwork.
 */
export function Gallery({ images, sold }: { images: readonly ProductImage[]; sold: boolean }) {
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLUListElement>(null)

  if (images.length === 0) return null

  const onScroll = () => {
    const track = trackRef.current
    if (track === null) return
    const width = track.clientWidth
    if (width === 0) return
    setIndex(Math.round(track.scrollLeft / width))
  }

  return (
    <>
      {/* ---- Mobile and tablet: swipeable */}
      <div className="desktop:hidden">
        <ul
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto"
          aria-label="Product photographs"
        >
          {images.map((image, position) => (
            <li key={image.id} className="w-full shrink-0 snap-start">
              <div className="relative aspect-[3/4] bg-surface">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="100vw"
                  priority={position === 0}
                  className={cn('object-cover', sold && 'saturate-0')}
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Position indicator. Dots, in the house mark. */}
        <Row gap={2} justify="center" className="pt-3">
          {images.map((image, position) => (
            <span
              key={image.id}
              aria-hidden
              className={cn(
                'ease size-1.5 rounded-full transition-colors duration-fast',
                position === index ? 'bg-accent' : 'bg-line-strong',
              )}
            />
          ))}
          <Type as="span" size="xs" tone="subtle" numeric className="sr-only">
            {index + 1} of {images.length}
          </Type>
        </Row>
      </div>

      {/* ---- Desktop: two-up grid */}
      {/*
        Two across, not one. A single column of five 3:4 images is roughly five
        viewport heights before a shopper reaches the condition block — and the
        condition block is the thing that decides the purchase. Pairing them
        halves that without losing any detail: at half-column width on a 1440
        screen each image is still ~430px wide, which is more than enough to
        read a fabric or spot a mark, and clicking through to a lightbox for more
        is a choice the shopper can make.

        The primary image spans both columns. It is the establishing shot and it
        earns the width; everything after it is supporting detail and does not.
      */}
      <ul className="hidden gap-2 desktop:grid desktop:grid-cols-2">
        {images.map((image, position) => (
          <li key={image.id} className={position === 0 ? 'desktop:col-span-2' : undefined}>
            <figure>
              <div
                className={cn(
                  'relative bg-surface',
                  // The lead image is wider, so a 4:5 crop keeps it from being
                  // absurdly tall at full column width.
                  position === 0 ? 'aspect-[4/5]' : 'aspect-[3/4]',
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes={
                    position === 0
                      ? '(min-width: 1024px) 55vw, 100vw'
                      : '(min-width: 1024px) 28vw, 50vw'
                  }
                  priority={position === 0}
                  className={cn('object-cover', sold && 'saturate-0')}
                />
              </div>
              {/*
                Flaw photographs are captioned. Every other kind is not — a
                caption on a styling shot is noise, but an unlabelled close-up of
                a mark leaves a shopper guessing whether it is damage or texture.
              */}
              {image.kind === 'flaw' && (
                <figcaption className="pt-2">
                  <Type size="xs" tone="subtle">
                    {image.alt}
                  </Type>
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </>
  )
}
