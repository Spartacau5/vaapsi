import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PassportRecord } from '@/components/patterns/passport/record'
import { PassportRecordDrawer } from '@/components/patterns/passport/record-drawer'
import { PassportStory } from '@/components/patterns/passport/story'
import { PassportMark } from '@/components/patterns/passport-mark'
import { Price } from '@/components/patterns/price'
import { AddToBag } from '@/components/patterns/product/add-to-bag'
import { ConditionBlock } from '@/components/patterns/product/condition-block'
import { Gallery } from '@/components/patterns/product/gallery'
import { PincodeCheck } from '@/components/patterns/product/pincode-check'
import { ProductDrawers } from '@/components/patterns/product/product-drawer'
import { Col, Container, Grid, Row, Stack } from '@/components/primitives/layout'
import { Section } from '@/components/primitives/section'
import { Eyebrow, Type } from '@/components/primitives/type'
import { conditionCopy, productPage } from '@/content/product'
import { PASSPORT_NAME, passportCopy } from '@/content/passport'
import { getPassportByProduct, getProduct, getSeller, listProducts } from '@/lib/data'
import { formatMonthYear } from '@/lib/format/date'
import { orderGalleryImages } from '@/lib/format/images'
import { productJsonLd, productMetadata } from '@/lib/seo'

type Params = { slug: string }

/**
 * Prerender every garment currently listed.
 *
 * Known limitation, documented so nobody files it twice: for a slug that does
 * not exist, `notFound()` renders the 404 page but the HTTP status is 200,
 * because Next has already streamed the shell by the time the lookup fails. Next
 * injects `noindex` on that response so it is not indexed, but it is a soft 404.
 * Fixing it needs `dynamicParams = false` (which would 404 every new listing
 * until the next deploy) or a non-streaming render. Neither trade is worth it.
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
 * ## The layout
 *
 * A **full-bleed split**: photographs own the left half of the viewport
 * edge-to-edge, the buying decision owns the right half and does not move. Both
 * escape the site container, because a gutter around a product photograph makes
 * it a picture of a garment rather than the garment.
 *
 * The right panel is deliberately sparse — brand, title, price, condition, size,
 * one filled button, and three quiet links. Everything a shopper *consults*
 * rather than *decides on* (measurements, composition, care, delivery) lives in
 * a drawer behind those links.
 *
 * ## What is not in a drawer
 *
 * **Condition and flaws**, and the **passport**. Both stay on the page below the
 * split.
 *
 * That is the one place this deviates from the reference, and it is deliberate.
 * A luxury retailer selling new stock can put everything behind "Product
 * details" because there is nothing to disclose. Here, the flaw photographs are
 * the reason the listing is believable and the passport is the reason the site
 * exists — hiding either behind a link would be copying the form of the
 * reference while discarding the point of this business.
 *
 * The result is still a much shorter page than before: the split is one screen,
 * then condition, then the passport. The specification that used to stack
 * underneath is now a click away instead of three screens down.
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
  const condition = conditionCopy[product.condition]
  const passportUrl =
    passport === null
      ? null
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vaapsi.example'}/passport/${passport.id}`

  return (
    <>
      {/*
        Product structured data. Availability and condition are the fields that
        matter here — a sold one-of-one marked InStock is both a Merchant Center
        violation and a shopper sent to a page that cannot sell them anything.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd({ product, passport, seller })),
        }}
      />

      {/* ---------------------------------------------------------- the split */}
      <div className="desktop:grid desktop:grid-cols-2 desktop:items-start">
        <Gallery images={images} sold={sold} productId={product.id} />

        {/*
          Sticky and vertically centred, so the decision sits at eye level and
          stays there while the photographs scroll past it.
        */}
        <div className="desktop:sticky desktop:top-0 desktop:flex desktop:h-svh desktop:min-h-[40rem] desktop:items-center">
          <div className="w-full px-gutter py-10 desktop:max-w-[30rem] desktop:py-0">
            <Stack gap={5}>
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

              {/*
                Condition, in the buying column. Not the full disclosure — that
                is below with the photographs — but the grade and its one-line
                definition, because a shopper should never have to scroll or
                click to find out what they are being promised.
              */}
              <Stack gap={1} className="border-t border-line pt-4">
                <Row gap={2} align="baseline">
                  <Type as="span" size="xs" tone="subtle" tracking="caps">
                    {productPage.sections.condition}
                  </Type>
                  <Type as="span" size="sm" weight="emphasis">
                    {condition.label}
                  </Type>
                </Row>
                <Type size="xs" tone="muted">
                  {condition.short}
                </Type>
              </Stack>

              <Stack gap={1} className="border-t border-line pt-4">
                <Row gap={2} align="baseline">
                  <Type as="span" size="xs" tone="subtle" tracking="caps">
                    Size
                  </Type>
                  <Type as="span" size="sm" weight="emphasis">
                    {product.size.label}
                  </Type>
                  <Type as="span" size="xs" tone="subtle">
                    as labelled ({product.size.system})
                  </Type>
                </Row>
                <Type size="xs" tone="muted">
                  {productPage.oneOfOne}
                </Type>
              </Stack>

              <AddToBag productId={product.id} availability={product.availability} />

              {/* The drawers. Reference material, a click away. */}
              <div className="border-t border-line pt-5">
                <ProductDrawers product={product} passport={passport} seller={seller} />
              </div>

              <div className="border-t border-line pt-5">
                <PincodeCheck />
              </div>

              {seller !== null && (
                <Row gap={2} align="baseline" className="border-t border-line pt-4">
                  <Type as="span" size="xs" tone="subtle">
                    Listed by {seller.displayName},
                  </Type>
                  <Type as="span" size="xs" tone="subtle" numeric>
                    on Vaapsi since {formatMonthYear(seller.memberSince)}
                  </Type>
                </Row>
              )}
            </Stack>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------- condition, in full */}
      <Section divider heading={condition.label} eyebrow={productPage.sections.condition}>
        <Grid>
          <Col mobile={4} tablet={8} desktop={7}>
            <ConditionBlock product={product} headless />
          </Col>
        </Grid>
      </Section>

      {/*
        ---- The passport, inline.

        A garment without one renders **nothing here at all** — no placeholder, no
        "passport pending". Drawing an absence is still a claim, and it tells a
        shopper something is missing on a garment where nothing was promised.
      */}
      {passport !== null && passportUrl !== null && (
        <Section
          divider
          eyebrow={PASSPORT_NAME.title}
          heading={passportCopy.oneLiner}
          headingSize="3xl"
          action={
            <Row gap={5} wrap={false} className="shrink-0">
              {/*
                The record, behind a click. Clerical material — signatures,
                identifiers, the frozen declaration, the QR — that a shopper
                checks rather than reads. Same distinction the Product details
                drawer makes.
              */}
              <PassportRecordDrawer>
                <PassportRecord passport={passport} shareUrl={passportUrl} />
              </PassportRecordDrawer>
              <Link
                href={`/passport/${passport.id}`}
                className="border-b border-line pb-0.5 text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink"
              >
                Open on its own
              </Link>
            </Row>
          }
        >
          <PassportStory passport={passport} />
        </Section>
      )}

      <Container>
        <div className="pb-section" />
      </Container>
    </>
  )
}
