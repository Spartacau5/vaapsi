import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PassportBack } from '@/components/patterns/passport/back'
import { PassportFront } from '@/components/patterns/passport/front'
import { PassportDocument } from '@/components/patterns/passport/passport-document'
import { AddToBag } from '@/components/patterns/product/add-to-bag'
import { ConditionBlock } from '@/components/patterns/product/condition-block'
import { Gallery } from '@/components/patterns/product/gallery'
import { SizeAndMeasurements } from '@/components/patterns/product/measurements'
import { PincodeCheck } from '@/components/patterns/product/pincode-check'
import { PassportMark } from '@/components/patterns/passport-mark'
import { Price } from '@/components/patterns/price'
import { Col, Container, Grid, Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { delivery } from '@/content/delivery'
import { PASSPORT_NAME, passportCopy } from '@/content/passport'
import { productPage } from '@/content/product'
import { getPassportByProduct, getProduct, getSeller, listProducts } from '@/lib/data'
import { formatMonthYear } from '@/lib/format/date'
import { orderGalleryImages } from '@/lib/format/images'
import { productJsonLd, productMetadata } from '@/lib/seo'

type Params = { slug: string }

/**
 * Prerender every garment currently listed.
 *
 * A storefront's product pages should be static — they are the pages that get
 * shared, indexed and hit first, and there is nothing per-request about them.
 * `dynamicParams` stays at its default of `true`, so a garment listed after the
 * last build still renders on demand rather than 404ing.
 *
 * Known limitation, worth knowing before someone files it as a bug: for a slug
 * that genuinely does not exist, `notFound()` renders the 404 page but the HTTP
 * status is 200, because Next has already streamed the shell by the time the
 * lookup fails. Next injects `<meta name="robots" content="noindex">` on that
 * response, so it does not get indexed — but it is a soft 404. Fixing it
 * properly needs either `dynamicParams = false` (which would 404 every new
 * listing until the next deploy) or a non-streaming render, and neither trade is
 * worth it here.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const page = await listProducts({ limit: 500 })
  return page.items.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (product === null) return { title: 'Not found' }
  return productMetadata(product)
}

/**
 * Product detail.
 *
 * Desktop: a scrolling image column with a sticky detail column beside it. The
 * detail column is sticky rather than the images, because the decision (price,
 * size, condition, add to bag) should stay reachable while a shopper works
 * through eight photographs looking for the flaw.
 *
 * Mobile: swipeable gallery, then details stacked.
 *
 * Below the fold, in order: condition and flaws, then the passport. Condition
 * first because it is the objection that stops a purchase; the passport second
 * because it is what closes one.
 */
export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProduct(params.slug)
  if (product === null) notFound()

  const [passport, seller] = await Promise.all([
    getPassportByProduct(product.id),
    getSeller(product.sellerId),
  ])

  const images = orderGalleryImages(product.images)
  const sold = product.availability === 'sold'
  const passportUrl =
    passport === null
      ? null
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vaapsi.example'}/passport/${passport.id}`

  return (
    <Container>
      {/*
        Product structured data. Availability and condition are the fields that
        matter here — a sold one-of-one garment marked InStock is both a Merchant
        Center violation and a shopper sent to a page that cannot sell them
        anything.
      */}
      <script
        type="application/ld+json"
        // Serialised from our own typed data; no user input reaches it.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd({ product, passport, seller })),
        }}
      />

      <Grid gap="loose" className="pt-6 desktop:pt-8">
        {/* ---- Gallery */}
        <Col mobile={4} tablet={8} desktop={7}>
          <Gallery images={images} sold={sold} />
        </Col>

        {/* ---- Detail column, sticky on desktop */}
        <Col mobile={4} tablet={8} desktop={4} startDesktop={9}>
          <div className="desktop:sticky desktop:top-24">
            <Stack gap={6} className="pt-6 desktop:pt-0">
              <Stack gap={2}>
                <Row gap={3} justify="between" align="start">
                  <Eyebrow>{product.brand}</Eyebrow>
                  <PassportMark hasPassport={passport !== null} />
                </Row>
                <Type as="h1" family="display" size="2xl" weight="heading">
                  {product.title}
                </Type>
                <Price
                  priceInr={product.priceInr}
                  originalRetailInr={product.originalRetailInr}
                  availability={product.availability}
                  size="large"
                  showSaving
                />
                {product.originalRetailInr === null && !sold && (
                  <Type size="xs" tone="subtle">
                    {productPage.originalRetailUnknown}
                  </Type>
                )}
              </Stack>

              <div className="border-t border-line pt-6">
                <SizeAndMeasurements size={product.size} measurements={product.measurements} />
              </div>

              <div className="border-t border-line pt-6">
                <AddToBag productId={product.id} availability={product.availability} />
              </div>

              {/* Seller */}
              {seller !== null && (
                <div className="border-t border-line pt-6">
                  <Eyebrow as="h2">{delivery.seller.heading}</Eyebrow>
                  <Stack gap={1} className="pt-3">
                    <Type size="sm" weight="emphasis">
                      {seller.displayName}
                    </Type>
                    <Type size="xs" tone="muted">
                      {seller.isVaapsi ? delivery.seller.vaapsi : delivery.seller.individual}
                    </Type>
                    <Row gap={3} className="pt-1">
                      <Type as="span" size="xs" tone="subtle">
                        {seller.isVerified ? delivery.seller.verified : delivery.seller.unverified}
                      </Type>
                      <Type as="span" size="xs" tone="subtle" numeric>
                        {delivery.seller.memberSince(formatMonthYear(seller.memberSince))}
                      </Type>
                    </Row>
                  </Stack>
                </div>
              )}

              {/* Delivery */}
              <div className="border-t border-line pt-6">
                <PincodeCheck />
              </div>

              {/* Returns */}
              <div className="border-t border-line pt-6">
                <Eyebrow as="h2">{delivery.returns.heading}</Eyebrow>
                <Type size="xs" tone="muted" className="pt-2">
                  {delivery.returns.body}
                </Type>
              </div>
            </Stack>
          </div>
        </Col>
      </Grid>

      {/* ---- Condition, with real weight */}
      <div className="mt-20 border-t border-line pt-16 desktop:mt-24">
        <Grid gap="loose">
          <Col mobile={4} tablet={8} desktop={7}>
            <ConditionBlock product={product} />
          </Col>
        </Grid>
      </div>

      {/*
        ---- The passport, inline.

        A garment without one renders **nothing here at all** — no placeholder,
        no "passport pending". Drawing an absence is still a claim, and it tells
        a shopper something is missing on a garment where nothing was promised.
      */}
      {passport !== null && passportUrl !== null && (
        <section
          aria-labelledby="passport-heading"
          className="mt-20 border-t border-line pt-16 desktop:mt-24"
        >
          <Row gap={4} justify="between" align="end" className="pb-10">
            <Stack gap={2}>
              <Eyebrow>{PASSPORT_NAME.title}</Eyebrow>
              <Type as="h2" id="passport-heading" family="display" size="3xl" weight="heading">
                {passportCopy.oneLiner}
              </Type>
            </Stack>
            <Link
              href={`/passport/${passport.id}`}
              className="shrink-0 border-b border-line pb-0.5 text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              Open on its own
            </Link>
          </Row>

          <PassportDocument
            front={<PassportFront passport={passport} />}
            back={<PassportBack passport={passport} shareUrl={passportUrl} />}
          />
        </section>
      )}

      <div className="pb-24" />
    </Container>
  )
}
