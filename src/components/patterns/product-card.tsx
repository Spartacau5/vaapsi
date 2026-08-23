import Image from 'next/image'
import Link from 'next/link'
import { PassportMark } from './passport-mark'
import { Price } from './price'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { conditionCopy, productPage } from '@/content/product'
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
  className?: string
  as?: 'div' | 'li'
}

export function ProductCard({
  product,
  detailImage,
  priority = false,
  sizes = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw',
  className,
  as: Component = 'div',
}: ProductCardProps) {
  const sold = product.availability === 'sold'
  const condition = conditionCopy[product.condition]

  return (
    <Component className={cn('group/card relative', className)}>
      <Link
        href={`/product/${product.slug}`}
        className="block focus-visible:outline-offset-4"
        // The link is labelled by the visible text below, which reads
        // "Brand, Title, Size M, Very good". Nothing extra needed.
      >
        {/* 3:4, always. The grid reserves the space before the image loads. */}
        <div
          className={cn('relative aspect-[3/4] overflow-hidden bg-surface', sold && 'opacity-60')}
        >
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
            <Type as="p" size="sm" weight="emphasis" truncate tone={sold ? 'muted' : 'default'}>
              {product.brand}
            </Type>
            <PassportMark hasPassport={product.passportId !== null} className="shrink-0" />
          </Row>

          <Type as="h3" size="sm" tone="muted" truncate>
            {product.title}
          </Type>

          <Row gap={2} align="baseline" className="text-ink-subtle">
            <Type as="span" size="xs" tone="inherit">
              {product.size.label}
            </Type>
            <span aria-hidden>·</span>
            <Type as="span" size="xs" tone="inherit">
              {condition.label}
            </Type>
          </Row>

          <Price
            priceInr={product.priceInr}
            originalRetailInr={product.originalRetailInr}
            availability={product.availability}
            className="pt-1"
          />
        </Stack>
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
        <div className="h-4 w-4/5 animate-pulse bg-surface" />
        <div className="h-3 w-1/4 animate-pulse bg-surface" />
        <div className="mt-1 h-5 w-1/3 animate-pulse bg-surface" />
      </Stack>
    </Component>
  )
}

/** Screen-reader-only availability note, for contexts that need it spoken. */
export function AvailabilityNote({ product }: { product: ProductSummary }) {
  if (product.availability === 'available') return null
  return <span className="sr-only">{productPage.availability[product.availability]}</span>
}
