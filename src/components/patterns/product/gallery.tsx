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
 * Desktop: a plain scrolling column. Every image at full width, one after
 * another, and the detail column beside it stays put. No lightbox, no thumbnail
 * strip, no zoom-on-hover — on resale, the photographs *are* the product
 * description, and making a shopper click through them one at a time to check
 * for flaws is hostile.
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

      {/* ---- Desktop: scrolling column */}
      <ul className="hidden desktop:block">
        {images.map((image, position) => (
          <li key={image.id} className="mb-2">
            <figure>
              <div className="relative aspect-[3/4] bg-surface">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  priority={position === 0}
                  className={cn('object-cover', sold && 'saturate-0')}
                />
              </div>
              {/*
                Flaw photographs are captioned. Every other kind is not — a
                caption on a styling shot is noise, but an unlabelled close-up
                of a mark leaves a shopper guessing whether it is damage or
                texture.
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
