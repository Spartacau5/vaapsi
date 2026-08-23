import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '../product-card'
import { Reveal } from '../reveal'
import { Container, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
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
    <Reveal as="section" className="py-20 desktop:py-24">
      <section aria-labelledby="new-in-title">
        <Container>
          <Row gap={6} justify="between" align="end" className="pb-8">
            <Stack gap={2}>
              <Eyebrow>{home.newIn.eyebrow}</Eyebrow>
              <Type as="h2" id="new-in-title" family="display" size="2xl" weight="heading">
                {home.newIn.title}
              </Type>
              <Type size="sm" tone="muted" measure="narrow">
                {home.newIn.note}
              </Type>
            </Stack>

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
          </Row>
        </Container>

        {/*
          Bleeds past the container on purpose. `scroll-px` keeps the first card
          aligned to the gutter when snapped back to the start.
        */}
        <ul
          aria-label={home.newIn.railLabel}
          className="flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-4 desktop:gap-6"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              as="li"
              product={product}
              sizes="(min-width: 1024px) 22vw, (min-width: 768px) 33vw, 66vw"
              className="w-[66vw] shrink-0 snap-start tablet:w-[33vw] desktop:w-[22vw]"
            />
          ))}
        </ul>
      </section>
    </Reveal>
  )
}
