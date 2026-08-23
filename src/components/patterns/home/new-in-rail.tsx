import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '../product-card'
import { Reveal } from '../reveal'
import { Section } from '@/components/primitives/section'
import { home } from '@/content/home'
import type { ProductSummary } from '@/lib/types'

/**
 * Horizontally scrolling rail of recent arrivals.
 *
 * Native scroll with snap points rather than a JS carousel: it works with a
 * trackpad, a touchscreen, a scrollbar and the keyboard for free, and there are
 * no next/previous buttons to get wrong. The overflow bleeds to the viewport
 * edge on mobile so a partially visible card signals that there is more —
 * a rail that ends flush at the gutter looks like a grid that ran out.
 *
 * The note under the heading does real work: it says out loud that these are
 * one-of-one, which is what makes a rail of resale stock feel like rotating
 * inventory rather than a catalogue.
 */
export function NewInRail({ products }: { products: readonly ProductSummary[] }) {
  if (products.length === 0) return null

  return (
    <Reveal>
      <Section
        eyebrow={home.newIn.eyebrow}
        heading={home.newIn.title}
        lede={home.newIn.note}
        action={
          <Link
            href="/shop?sort=newest"
            className="group/cta ease inline-flex shrink-0 items-center gap-2 text-sm text-ink-muted transition-colors duration-base hover:text-ink"
          >
            {home.newIn.cta}
            <ArrowRight
              className="ease size-4 transition-transform duration-base group-hover/cta:translate-x-1"
              strokeWidth={1.5}
              aria-hidden
            />
          </Link>
        }
      >
        {/*
          `-mx-gutter px-gutter` lets just the rail escape the container while the
          heading above stays aligned to the grid. A partially visible card at
          the viewport edge signals there is more, where a rail ending flush at
          the gutter looks like a grid that ran out. `scroll-px` keeps the first
          card aligned when snapped back to the start.
        */}
        <ul
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
