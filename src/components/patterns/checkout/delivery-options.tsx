'use client'

import { useState } from 'react'
import { Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { checkout } from '@/content/checkout'
import type { DeliveryOptionId } from '@/content/checkout'
import { formatInr } from '@/lib/format/currency'
import { cn } from '@/lib/utils'

/**
 * The delivery choice, and the discount that hangs off it.
 *
 * ## The offer
 *
 * The slowest option carries 15% off, and it is announced as a question —
 * "Would you like 15% off?" — because it is a trade being offered, not a deal
 * being pushed. The reason is stated in the same block: slower means
 * consolidated ground freight, which costs less to run, so the saving is real
 * rather than a margin giveaway. See the long note in `content/checkout.ts`,
 * including the two numbers that still need finance to sign them off.
 *
 * ## Why the tag is on the option and not at the top of the page
 *
 * A banner offering a discount before a shopper knows what they are choosing
 * between is an interruption. Sitting the offer on the option it belongs to
 * means it is read at the exact moment the decision is being made, and it
 * disappears from the conversation once another option is picked.
 *
 * ## The saving is shown in rupees, not only as a percentage
 *
 * "15% off" is an abstraction; "₹585 off" is the thing a shopper is actually
 * choosing. Both are shown, because the percentage is what makes it feel like an
 * offer and the amount is what makes it a decision.
 *
 * ## Radios, not cards-that-happen-to-be-clickable
 *
 * Real `<input type="radio">` in a real `<fieldset>` with a `<legend>`. Arrow
 * keys move between options, the group is announced as a group, and a screen
 * reader hears the discount as part of the option's label rather than as an
 * orphaned bit of text nearby.
 */
export function DeliveryOptions({
  subtotalInr,
  onChange,
}: {
  subtotalInr: number
  /** Lets the order summary reflect the choice. */
  onChange?: (option: { id: DeliveryOptionId; discountPercent: number }) => void
}) {
  const [selected, setSelected] = useState<DeliveryOptionId>('standard')

  function pick(id: DeliveryOptionId, discountPercent: number) {
    setSelected(id)
    onChange?.({ id, discountPercent })
  }

  return (
    <fieldset>
      <legend className="mb-3">
        <Eyebrow as="span">{checkout.delivery.heading}</Eyebrow>
      </legend>

      <Stack gap={2}>
        {checkout.delivery.options.map((option) => {
          const isSelected = option.id === selected
          const discounted = option.discountPercent > 0
          // Integer paise throughout. Money is never a float here — see
          // lib/types/common — so the saving is floored rather than rounded up,
          // which errs toward the shopper being charged less, not more.
          const saving = Math.floor((subtotalInr * option.discountPercent) / 100)

          return (
            <label
              key={option.id}
              className={cn(
                'ease flex cursor-pointer gap-3 border p-4 transition-colors duration-fast',
                isSelected ? 'border-ink' : 'border-line hover:border-line-strong',
              )}
            >
              <input
                type="radio"
                name="delivery-option"
                value={option.id}
                checked={isSelected}
                onChange={() => pick(option.id, option.discountPercent)}
                className="mt-1 h-4 w-4 shrink-0 accent-ink"
              />

              <Stack gap={1} className="min-w-0 flex-1">
                <Row gap={3} justify="between" align="baseline" wrap={false}>
                  <Type as="span" size="sm" weight="emphasis">
                    {option.label}
                  </Type>
                  <Type as="span" size="sm" tone="muted" numeric className="shrink-0">
                    {option.window}
                  </Type>
                </Row>

                <Type size="xs" tone="muted">
                  {option.note}
                </Type>

                {discounted && (
                  <Stack gap={1} className="mt-2 border-t border-line pt-3">
                    <Row gap={2} align="baseline" wrap>
                      {/*
                        The offer. Selected, it becomes a statement of fact
                        rather than staying a question — a question that persists
                        after you have said yes reads as though it did not
                        register.
                      */}
                      <Type as="span" size="sm" weight="emphasis" tone="accent">
                        {isSelected
                          ? checkout.delivery.discountApplied
                          : checkout.delivery.discountTag}
                      </Type>
                      {saving > 0 && (
                        <Type as="span" size="sm" tone="muted" numeric>
                          − {formatInr(saving)}
                        </Type>
                      )}
                    </Row>
                    <Type size="xs" tone="muted">
                      {checkout.delivery.discountBody}
                    </Type>
                  </Stack>
                )}
              </Stack>
            </label>
          )
        })}
      </Stack>

      {checkout.delivery.isProvisional && (
        <Type size="xs" tone="subtle" className="mt-3">
          {checkout.delivery.provisionalNote}
        </Type>
      )}
    </fieldset>
  )
}
