import Image from 'next/image'
import Link from 'next/link'
import { CardBagButton, CardChoiceLabel } from './card-bag-button'
import { ColorSwatch } from './color-swatch'
import { PassportMark } from './passport-mark'
import { Price } from './price'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { conditionCopy, productCard, productPage } from '@/content/product'
import type { ProductImage, ProductSummary } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * The most reused component on the site.
 *
 * Interaction, deliberately restrained: hovering cross-fades to the first
 * `detail` image. No zoom, no lift, no shadow, no border appearing. The image
 * changing *is* the affordance, and it also does something useful — it shows
 * you the fabric.
 *
 * ## What a card states
 *
 * Four facts, in a fixed place on every card: **price, size, colour and what it
 * is made of**. They
 * are what a shopper is actually choosing between, and before this they were
 * either buried in a subtitle or absent — colour was not on the card at all, so
 * a grid of denim gave no way to tell a raw indigo from an ecru except by
 * squinting at thumbnails.
 *
 * **The garment's own name leads, and it is the only name shown.** Every listing
 * is a Vaapsi piece, so the brand distinguished nothing — eleven identical
 * headings. `subcategory` is gone from the card too, for the same reason in
 * miniature: under "Ravi Straight Jean" it read "Straight jeans", which is the
 * name again with a word removed. The name already says what the garment is.
 *
 * What replaced it is composition, which is a fact a shopper cannot infer and
 * genuinely chooses on.
 *
 * **Condition appears on pre-loved cards only.** New stock has no grade: it has
 * not been worn, so there is nothing to grade, and `condition` is null on those
 * products precisely so this cannot be faked. See `ListingType`.
 *
 * ## The link is a stretched overlay
 *
 * The card carries a button now, and a button inside an anchor is invalid. So
 * the anchor is an absolutely positioned overlay across the whole card at `z-0`,
 * the bag button sits at `z-10`, and neither is nested in the other. The anchor
 * has no visible text, so it takes its spoken name from `productCard.linkLabel`.
 *
 * **Sold garments stay visible and look spent.** Image desaturated, "Sold" in
 * place of the price, the whole card at reduced contrast. On a one-of-one
 * marketplace, seeing sold stock is proof of liquidity — it tells a shopper that
 * things here actually move, and that hesitating has a cost. Hiding it throws
 * that away. The card stays a link, because a sold garment still has a passport
 * worth reading.
 *
 * A `reserved` garment is not marked on the card. It is still available if the
 * other shopper abandons checkout, and flagging it here would either be wrong
 * within the minute or read as a scarcity trick.
 */

export type ProductCardProps = {
  product: ProductSummary
  /**
   * The `detail` image, for the hover cross-fade. Optional — `ProductSummary`
   * only carries the primary, so a caller with the full product passes it and a
   * caller working from a list summary does not. Without it the card simply
   * does not cross-fade.
   */
  detailImage?: ProductImage
  /** Priority-load the image. Use for the first row of a grid, nothing else. */
  priority?: boolean
  /** Responsive `sizes` for the image. Set per layout by the parent. */
  sizes?: string
  /**
   * Show the condition grade. Defaults to following the listing type, which is
   * what every grid wants. Pass `false` to suppress it somewhere that has
   * already stated it.
   */
  showCondition?: boolean
  /** Hide the bag button, for contexts where adding is not the action. */
  showBagButton?: boolean
  className?: string
  as?: 'div' | 'li'
}

export function ProductCard({
  product,
  detailImage,
  priority = false,
  sizes = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw',
  showCondition,
  showBagButton = true,
  className,
  as: Component = 'div',
}: ProductCardProps) {
  const sold = product.availability === 'sold'

  // Pre-loved carries a grade; new stock has none to carry. The null check is
  // not defensive — `condition` is genuinely null on new products.
  const condition = product.condition === null ? null : (conditionCopy[product.condition] ?? null)
  const withCondition = (showCondition ?? product.listingType === 'pre_loved') && condition !== null

  return (
    <Component className={cn('group/card relative', className)}>
      {/* 3:4, always. The grid reserves the space before the image loads. */}
      <div className={cn('relative aspect-[3/4] overflow-hidden bg-surface', sold && 'opacity-60')}>
        <Image
          src={product.primaryImage.url}
          alt={product.primaryImage.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            'ease object-cover transition-opacity duration-slow',
            sold && 'saturate-0',
            detailImage !== undefined && 'group-hover/card:opacity-0',
          )}
        />

        {detailImage !== undefined && (
          <Image
            src={detailImage.url}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            className={cn(
              'ease object-cover opacity-0 transition-opacity duration-slow group-hover/card:opacity-100',
              sold && 'saturate-0',
            )}
          />
        )}
      </div>

      <Stack gap={1} className="pt-3">
        <Row gap={2} justify="between" align="start" wrap={false}>
          <Type as="h3" size="sm" weight="emphasis" truncate tone={sold ? 'muted' : 'default'}>
            {product.title}
          </Type>
          <PassportMark hasPassport={product.passportId !== null} className="shrink-0" />
        </Row>

        {/*
          The three facts. Size and colour on one line, price and the bag button
          on the next, so the price always lands in the same place down a column
          however long a colour name runs.
        */}
        <Row gap={2} align="center" className="pt-0.5 text-ink-subtle">
          <Type as="span" size="xs" tone="inherit">
            <span className="sr-only">{productCard.sizeLabel} </span>
            {product.size.label}
          </Type>
          <span aria-hidden>·</span>
          <Row gap={1} align="center" wrap={false} className="min-w-0">
            <ColorSwatch color={product.color} />
            <Type as="span" size="xs" tone="inherit" truncate>
              <span className="sr-only">{productCard.colorLabel} </span>
              {product.color.name}
            </Type>
          </Row>
          {withCondition && (
            <>
              <span aria-hidden>·</span>
              <Type as="span" size="xs" tone="inherit">
                {condition.label}
              </Type>
            </>
          )}
        </Row>

        {/*
          Composition, on its own line and unlabelled. "100% cotton" needs no
          prefix — nobody reads it as anything else — and on a denim catalogue
          it is a real differentiator, since the elastane content is the
          difference between a jean that holds its shape and one that gives.
        */}
        <Type as="p" size="xs" tone="subtle" truncate>
          {product.composition}
        </Type>

        {/*
          Price left, the bag control right. With colourways the control grows a
          swatch row and a size row above the button, so this becomes a column on
          narrow cards rather than squeezing both into one line.
        */}
        <div className="flex flex-col gap-3 pt-1 tablet:flex-row tablet:items-end tablet:justify-between">
          <Price
            priceInr={product.priceInr}
            originalRetailInr={product.originalRetailInr}
            availability={product.availability}
          />
          {showBagButton && (
            <div className="relative z-10 tablet:max-w-[9.5rem]">
              {product.colorVariants.length > 0 && <CardChoiceLabel title={product.title} />}
              <CardBagButton
                productId={product.id}
                availability={product.availability}
                variants={product.colorVariants}
              />
            </div>
          )}
        </div>
      </Stack>

      {/*
        The card link. Stretched across everything above at z-0, so the bag
        button at z-10 stays clickable and nothing is nested. See the component
        note.
      */}
      <Link
        href={`/product/${product.slug}`}
        className="absolute inset-0 z-0 focus-visible:outline-offset-4"
      >
        <span className="sr-only">
          {productCard.linkLabel({
            name: product.title,
            garment: product.subcategory,
            size: product.size.label,
            color: product.color.name,
          })}
        </span>
      </Link>
    </Component>
  )
}

/**
 * Skeleton matching the card's exact dimensions, so a grid does not reflow when
 * the real thing arrives. The proportions below have to stay in step with the
 * card above — if you change the card's spacing, change this.
 */
export function ProductCardSkeleton({ as: Component = 'div' }: { as?: 'div' | 'li' }) {
  return (
    <Component aria-hidden>
      <div className="aspect-[3/4] animate-pulse bg-surface" />
      <Stack gap={1} className="pt-3">
        <div className="h-4 w-2/5 animate-pulse bg-surface" />
        <div className="h-4 w-3/5 animate-pulse bg-surface" />
        <div className="h-3 w-1/2 animate-pulse bg-surface" />
        <div className="mt-1 flex items-end justify-between">
          <div className="h-5 w-1/3 animate-pulse bg-surface" />
          <div className="h-9 w-9 animate-pulse bg-surface" />
        </div>
      </Stack>
    </Component>
  )
}

/** Screen-reader-only availability note, for contexts that need it spoken. */
export function AvailabilityNote({ product }: { product: ProductSummary }) {
  if (product.availability === 'available') return null
  return <span className="sr-only">{productPage.availability[product.availability]}</span>
}
