'use client'

import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { ColorSwatch } from './color-swatch'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { delivery } from '@/content/delivery'
import { productCard } from '@/content/product'
import { useCartStore } from '@/lib/store/cart'
import type { Availability, ColorVariant } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * The add-to-bag control on a grid card, and — where the product has colourways
 * — the colour and size choice that has to happen before it.
 *
 * ## Why the choice is on the card
 *
 * It used to say "Choose options" and send you to the product page, because the
 * cart could not record which colour and size you meant. The cart can now
 * (`CartItemRef` carries the choice), so the card asks for it directly and the
 * button adds. A grid where every card is a two-step trip to another page is a
 * grid nobody buys from.
 *
 * ## Why it is always visible
 *
 * The obvious version reveals on hover, which hides the control from every touch
 * device — most of the traffic — and hover-revealed buttons are also why people
 * mis-tap cards. It sits in the card's bottom-right corner permanently, opposite
 * the price, and is small enough not to compete with the photograph.
 *
 * ## Why it is not inside the card's link
 *
 * A button nested in an anchor is invalid HTML and behaves unpredictably — the
 * browser has to guess which activation you meant. The card link is instead a
 * stretched overlay pinned behind these controls (`z-0` against `z-10`), so the
 * whole card is clickable, this corner is not, and there is no nesting. If you
 * change either z-index, check that both still work.
 *
 * ## States
 *
 * - **One-of-one, addable** — a plus. One tap; there is nothing to configure.
 * - **Colourways** — swatches and sizes inline, and the button stays inert until
 *   both are chosen. It is **not** disabled-and-silent: the label says what is
 *   missing, because a dead button with no explanation is the single most common
 *   way a card like this wastes someone's time.
 * - **In the bag** — a tick, inert. Not a remove button: a control that quietly
 *   becomes destructive on second tap is a trap on a grid.
 *
 * Reserved and sold garments get no control — the card already says "Sold" in
 * place of the price, and a disabled button would only repeat it.
 */
export function CardBagButton({
  productId,
  availability,
  /** Colourways, when the product has them. Empty for one-of-one stock. */
  variants = [],
  className,
}: {
  productId: string
  availability: Availability
  variants?: readonly ColorVariant[]
  className?: string
}) {
  const add = useCartStore((state) => state.add)
  const items = useCartStore((state) => state.items)

  const selectable = variants.filter((variant) => variant.availability !== 'sold')
  const [colorSlug, setColorSlug] = useState<string | null>(null)
  const [sizeNormalized, setSizeNormalized] = useState<string | null>(null)

  const selectedVariant =
    colorSlug === null ? null : (variants.find((v) => v.color.slug === colorSlug) ?? null)

  const inBag = items.some(
    (item) =>
      item.productId === productId &&
      (item.colorSlug ?? null) === colorSlug &&
      (item.sizeNormalized ?? null) === sizeNormalized,
  )

  if (availability !== 'available') return null

  const hasChoice = variants.length > 0

  // ---- one-of-one: nothing to configure, just the button ----
  if (!hasChoice) {
    return (
      <BagButton inBag={inBag} onAdd={() => add(productId)} className={cn('self-end', className)} />
    )
  }

  const ready = colorSlug !== null && sizeNormalized !== null

  function pickColor(variant: ColorVariant) {
    setColorSlug(variant.color.slug)
    // Drop a size this colourway does not carry, rather than leaving an
    // impossible pair selected. Same rule as the product page's picker.
    setSizeNormalized((current) =>
      current !== null && variant.sizes.some((size) => size.normalized === current)
        ? current
        : null,
    )
  }

  return (
    <Stack gap={2} className={cn('relative z-10', className)}>
      <Row gap={2} align="center" wrap>
        {selectable.map((variant) => {
          const isSelected = variant.color.slug === colorSlug
          return (
            <button
              key={variant.color.slug}
              type="button"
              onClick={() => pickColor(variant)}
              aria-pressed={isSelected}
              aria-label={variant.color.name}
              className={cn(
                'ease inline-flex h-6 w-6 items-center justify-center rounded-full transition-shadow duration-fast',
                isSelected
                  ? 'ring-1 ring-ink ring-offset-2'
                  : 'hover:ring-1 hover:ring-line-strong',
              )}
            >
              <ColorSwatch color={variant.color} />
            </button>
          )
        })}
      </Row>

      {selectedVariant !== null && (
        <Row gap={1} align="center" wrap>
          {selectedVariant.sizes.map((size) => {
            const isSelected = size.normalized === sizeNormalized
            return (
              <button
                key={size.normalized}
                type="button"
                onClick={() => setSizeNormalized(size.normalized)}
                aria-pressed={isSelected}
                className={cn(
                  'ease min-w-[2.25rem] border px-1.5 py-1 text-xs transition-colors duration-fast',
                  isSelected
                    ? 'border-ink bg-ink text-background'
                    : 'border-line-strong text-ink hover:bg-surface',
                )}
              >
                {size.label}
              </button>
            )
          })}
        </Row>
      )}

      <button
        type="button"
        onClick={() => {
          if (!ready || colorSlug === null || sizeNormalized === null) return
          add(productId, { colorSlug, sizeNormalized })
        }}
        // Not `disabled`: the label below explains what is missing, and a
        // disabled control is skipped by some assistive tech entirely.
        aria-disabled={!ready || inBag}
        className={cn(
          'ease w-full border px-3 py-2 text-xs transition-colors duration-fast',
          inBag
            ? 'cursor-default border-line-strong text-ink-muted'
            : ready
              ? 'border-ink bg-ink text-background hover:bg-ink-muted'
              : 'cursor-default border-line text-ink-subtle',
        )}
      >
        {inBag
          ? delivery.bag.added
          : ready
            ? productCard.addToCart
            : colorSlug === null
              ? productCard.pickColorFirst
              : productCard.pickSizeFirst}
      </button>
    </Stack>
  )
}

/** The bare icon button, for stock with nothing to configure. */
function BagButton({
  inBag,
  onAdd,
  className,
}: {
  inBag: boolean
  onAdd: () => void
  className?: string
}) {
  const base =
    'ease relative z-10 inline-flex h-9 w-9 items-center justify-center border transition-colors duration-fast focus-visible:outline-offset-2'

  if (inBag) {
    return (
      <span
        className={cn(base, 'cursor-default border-line-strong text-ink-muted', className)}
        // Not a button: there is nothing to activate. Announced, not clickable.
        role="img"
        aria-label={delivery.bag.added}
      >
        <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className={cn(base, 'border-ink bg-ink text-background hover:bg-ink-muted', className)}
      aria-label={delivery.bag.add}
    >
      <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
    </button>
  )
}

/** Screen-reader text naming what a card's inline controls belong to. */
export function CardChoiceLabel({ title }: { title: string }) {
  return <Type className="sr-only">{productCard.choiceGroup(title)}</Type>
}
