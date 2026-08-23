import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Stagger, StaggerItem } from '../reveal'
import { PassportMark } from '../passport-mark'
import { Price } from '../price'
import { Col, Container, Grid, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { home } from '@/content/home'
import { conditionCopy } from '@/content/product'
import { passportHighlights } from '@/lib/format/passport'
import type { Passport, Product } from '@/lib/types'

/**
 * The hero, and the thesis: this garment has a past.
 *
 * One garment, large, with its history set beside it as a short list of facts
 * pulled from the passport. Not a carousel — a carousel says "we have a lot of
 * stock", which is a retail claim and a lie on a one-of-one marketplace. Not a
 * stat block either; "12,000 garments saved" is about the company, and nobody
 * arrives caring about the company.
 *
 * The facts are the most characteristic thing in this subject's world. Where it
 * was made, how many people have owned it, when it came back. That is the
 * product, so it leads.
 *
 * Which garment appears here is a single data call (`listFeaturedProducts`), so
 * putting it on a schedule the client controls is a backend change, not a
 * redesign.
 */
export function Hero({ product, passport }: { product: Product; passport: Passport | null }) {
  const primary = product.images.find((image) => image.kind === 'primary') ?? product.images[0]
  const highlights = passport === null ? null : passportHighlights(passport)
  const condition = conditionCopy[product.condition]

  return (
    <section aria-labelledby="hero-title" className="pt-8 desktop:pt-12">
      <Container>
        <Grid gap="loose" rowGap="loose" className="items-center">
          {/* Image first in the DOM, so a screen reader and a phone both meet
              the garment before its metadata. */}
          <Col mobile={4} tablet={8} desktop={6}>
            <Link
              href={`/product/${product.slug}`}
              className="block focus-visible:outline-offset-4"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                {primary !== undefined && (
                  <Image
                    src={primary.url}
                    alt={primary.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                )}
              </div>
            </Link>
          </Col>

          <Col mobile={4} tablet={8} desktop={5} startDesktop={8}>
            <Stagger>
              <Stack gap={5}>
                <StaggerItem>
                  <Eyebrow>{home.hero.eyebrow}</Eyebrow>
                </StaggerItem>

                <StaggerItem>
                  <Type
                    as="h1"
                    id="hero-title"
                    family="display"
                    size="4xl"
                    weight="heading"
                    className="desktop:text-5xl"
                  >
                    {home.hero.thesis}
                  </Type>
                </StaggerItem>

                <StaggerItem>
                  <Type size="lg" tone="muted" measure="narrow">
                    {home.hero.lede}
                  </Type>
                </StaggerItem>

                {/* The garment itself, named plainly. */}
                <StaggerItem>
                  <Stack gap={1} className="border-t border-line pt-5">
                    <Type size="sm" weight="emphasis">
                      {product.brand}
                    </Type>
                    <Type size="sm" tone="muted">
                      {product.title}
                    </Type>
                    <Row gap={3} align="baseline" className="pt-2">
                      <Price
                        priceInr={product.priceInr}
                        originalRetailInr={product.originalRetailInr}
                        availability={product.availability}
                        size="large"
                      />
                      <PassportMark hasPassport={product.passportId !== null} />
                    </Row>
                  </Stack>
                </StaggerItem>

                {/* The history. Facts only, and only the ones we have. */}
                {highlights !== null && (
                  <StaggerItem>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5">
                      {highlights.madePlace !== null && (
                        <Fact label={home.hero.facts.made} value={highlights.madePlace} />
                      )}
                      <Fact
                        label={home.hero.facts.owners}
                        value={
                          highlights.ownersCount === 1
                            ? '1 before you'
                            : `${highlights.ownersCount} before you`
                        }
                      />
                      {highlights.cameBackWhen !== null && (
                        <Fact label={home.hero.facts.returned} value={highlights.cameBackWhen} />
                      )}
                      <Fact label={home.hero.facts.condition} value={condition.label} />
                    </dl>
                  </StaggerItem>
                )}

                <StaggerItem>
                  <Link
                    href={`/product/${product.slug}`}
                    className="group/cta ease inline-flex items-center gap-3 border-b border-line-strong pb-1 text-sm text-ink transition-colors duration-base hover:border-ink"
                  >
                    {home.hero.cta}
                    <ArrowRight
                      className="ease size-4 transition-transform duration-base group-hover/cta:translate-x-1"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </Link>
                </StaggerItem>
              </Stack>
            </Stagger>
          </Col>
        </Grid>
      </Container>
    </section>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Type as="dt" size="xs" tone="subtle" tracking="caps">
        {label}
      </Type>
      <Type as="dd" size="sm" className="mt-1">
        {value}
      </Type>
    </div>
  )
}
