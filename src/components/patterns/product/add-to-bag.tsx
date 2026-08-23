'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { delivery } from '@/content/delivery'
import { useUiStore } from '@/lib/store/ui'
import type { Availability } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Add to bag.
 *
 * **No quantity stepper.** There is nothing to increment. Every garment is
 * one-of-one, so the control is a single button, and a stepper here would be an
 * interface promising something the inventory cannot deliver.
 *
 * The three availability states get three different treatments, and none of them
 * is a disabled button with no explanation:
 *
 * - `available` — the action.
 * - `reserved` — someone is mid-checkout. Stated plainly, with the reason.
 *   It may come back, and saying so is more useful than a greyed-out button.
 * - `sold` — gone, and the page says the record stays. A sold garment still has
 *   a passport worth reading, which is why this page remains worth being on.
 *
 * The actual cart write lands in Phase 6. This wires the button to the UI store
 * so the header count is real, and the optimistic state below is where the
 * mutation goes.
 */
export function AddToBag({
  productId,
  availability,
}: {
  productId: string
  availability: Availability
}) {
  const cartCount = useUiStore((state) => state.cartCount)
  const setCartCount = useUiStore((state) => state.setCartCount)
  const [added, setAdded] = useState(false)

  if (availability === 'sold') {
    return (
      <Stack gap={2}>
        <div className="w-full border border-line py-3.5 text-center">
          <Type as="span" size="sm" tone="subtle">
            {delivery.bag.sold}
          </Type>
        </div>
        <Type size="xs" tone="subtle">
          {delivery.bag.soldHelp}
        </Type>
      </Stack>
    )
  }

  if (availability === 'reserved') {
    return (
      <Stack gap={2}>
        <div className="w-full border border-line-strong py-3.5 text-center">
          <Type as="span" size="sm" tone="muted">
            {delivery.bag.reserved}
          </Type>
        </div>
        <Type size="xs" tone="subtle">
          {delivery.bag.reservedHelp}
        </Type>
      </Stack>
    )
  }

  return (
    <Stack gap={2}>
      <button
        type="button"
        // Phase 6 replaces this with the adapter mutation. The optimistic count
        // update is already the right shape for it.
        onClick={() => {
          if (added) return
          setCartCount(cartCount + 1)
          setAdded(true)
        }}
        data-product-id={productId}
        className={cn(
          'ease w-full py-3.5 text-sm transition-colors duration-fast',
          added
            ? 'border border-line-strong text-ink-muted'
            : 'bg-ink text-background hover:bg-ink-muted',
        )}
      >
        {added ? delivery.bag.added : delivery.bag.add}
      </button>

      {added ? (
        <Link
          href="/cart"
          className="self-start text-xs text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
        >
          {delivery.bag.viewBag}
        </Link>
      ) : (
        <Type size="xs" tone="subtle">
          {delivery.bag.oneOfOne}
        </Type>
      )}
    </Stack>
  )
}
