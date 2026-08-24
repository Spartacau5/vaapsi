'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { Type } from '@/components/primitives/type'
import { useWishlistStore } from '@/lib/store/wishlist'
import type { ProductImage } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * The product gallery, as a full-bleed column beside the detail panel.
 *
 * Modelled on the reference the client sent, and the structure is the whole
 * idea: the photograph occupies its own half of the viewport edge-to-edge with
 * no gutter and no container, and the buying decision sits in the other half
 * where it does not move.
 *
 * **One frame per viewport, scrolled.** That is more scrolling through images
 * than a grid, and it is the right trade here — the specification that used to
 * sit under the buy button has moved into drawers, so the page below the fold is
 * now short. A shopper who wants the pictures scrolls the pictures; a shopper who
 * wants to buy never leaves the first screen.
 *
 * Mobile keeps a horizontal swipe, because a full-height vertical stack on a
 * phone means eight screens to get past the images.
 *
 * The dot rail and the wishlist heart sit on the photograph, both from the
 * reference. The dots are the house mark again — filled for the current frame.
 */
export function Gallery({
  images,
  sold,
  productId,
}: {
  images: readonly ProductImage[]
  sold: boolean
  productId: string
}) {
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLUListElement>(null)

  if (images.length === 0) return null

  /** Mobile: which frame is snapped. */
  const onTrackScroll = () => {
    const track = trackRef.current
    if (track === null) return
    const width = track.clientWidth
    if (width === 0) return
    setIndex(Math.round(track.scrollLeft / width))
  }

  return (
    <div className="relative bg-surface">
      <WishlistButton productId={productId} />

      {/* ---- Mobile and tablet: horizontal swipe */}
      <div className="desktop:hidden">
        <ul
          ref={trackRef}
          onScroll={onTrackScroll}
          className="flex snap-x snap-mandatory overflow-x-auto"
          aria-label="Product photographs"
        >
          {images.map((image, position) => (
            <li key={image.id} className="w-full shrink-0 snap-start">
              <div className="relative aspect-[4/5] bg-surface">
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
        <DotRail count={images.length} active={index} orientation="horizontal" className="py-3" />
      </div>

      {/* ---- Desktop: one frame per viewport, scrolled */}
      <DesktopFrames images={images} sold={sold} onActiveChange={setIndex} />
      <DotRail
        count={images.length}
        active={index}
        orientation="vertical"
        className="pointer-events-none absolute bottom-8 left-6 hidden desktop:flex"
      />
    </div>
  )
}

/**
 * The desktop stack. Each frame fills the viewport height, and an
 * IntersectionObserver reports which one is centred so the dot rail can track
 * it — cheaper and smoother than a scroll handler doing arithmetic every frame.
 */
function DesktopFrames({
  images,
  sold,
  onActiveChange,
}: {
  images: readonly ProductImage[]
  sold: boolean
  onActiveChange: (index: number) => void
}) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (list === null) return
    // Absent in jsdom and in older webviews. Without it the dots simply stay on
    // the first frame, which is a degraded indicator rather than a broken page.
    if (typeof IntersectionObserver !== 'function') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const position = Number((entry.target as HTMLElement).dataset.position)
          if (Number.isFinite(position)) onActiveChange(position)
        }
      },
      // A band through the middle of the viewport, so the active frame is the
      // one being looked at rather than whichever is topmost.
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    for (const item of Array.from(list.children)) observer.observe(item)
    return () => observer.disconnect()
  }, [images, onActiveChange])

  return (
    <ul ref={listRef} className="hidden desktop:block">
      {images.map((image, position) => (
        <li key={image.id} data-position={position} className="relative h-svh min-h-[40rem]">
          <figure className="h-full">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority={position === 0}
              className={cn('object-cover', sold && 'saturate-0')}
            />
            {/*
              Flaw frames are captioned, and only flaw frames. A caption on a
              styling shot is noise; an unlabelled close-up of a mark leaves a
              shopper guessing whether it is damage or texture.
            */}
            {image.kind === 'flaw' && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-background/85 px-6 py-3">
                <Type size="xs" tone="muted">
                  {image.alt}
                </Type>
              </figcaption>
            )}
          </figure>
        </li>
      ))}
    </ul>
  )
}

function DotRail({
  count,
  active,
  orientation,
  className,
}: {
  count: number
  active: number
  orientation: 'horizontal' | 'vertical'
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex items-center justify-center gap-1.5',
        orientation === 'vertical' && 'flex-col',
        className,
      )}
    >
      {Array.from({ length: count }, (_, position) => (
        <span
          key={position}
          className={cn(
            'ease size-1.5 rounded-full transition-colors duration-fast',
            position === active ? 'bg-ink' : 'bg-ink/25',
          )}
        />
      ))}
    </div>
  )
}

/** Wishlist heart, top-right of the photograph. */
function WishlistButton({ productId }: { productId: string }) {
  const saved = useWishlistStore((state) => state.items.includes(productId))
  const toggle = useWishlistStore((state) => state.toggle)

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={saved}
      className="absolute right-4 top-4 z-10 p-2 text-ink transition-colors hover:text-accent desktop:right-6 desktop:top-6"
    >
      <span className="sr-only">{saved ? 'Remove from wishlist' : 'Save to wishlist'}</span>
      <Heart
        className={cn('size-5', saved && 'fill-accent text-accent')}
        strokeWidth={1.5}
        aria-hidden
      />
    </button>
  )
}
