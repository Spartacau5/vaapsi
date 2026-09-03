'use client'

import { Check } from 'lucide-react'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { checkout } from '@/content/checkout'
import type { DeliveryOption, DeliveryOptionId } from '@/content/checkout'
import { formatInr } from '@/lib/format/currency'
import { cn } from '@/lib/utils'

/**
 * The delivery choice, in two bands.
 *
 * ## Two groups, not four rows
 *
 * **Get it soon** holds Standard and Express. **Wait longer, pay less** holds
 * the two discount tiers. Four flat radios would ask a shopper to compare four
 * things at once; two bands ask one question — soon, or cheap — and then a
 * smaller one inside the answer.
 *
 * The discount tiers sit inside a single tinted panel so they read as one dial
 * with two positions rather than as two separate offers competing with
 * Standard. That grouping is the point of the layout.
 *
 * ## Express states the difference, not its price
 *
 * "+₹250", not "₹250". The number a shopper is deciding on is the extra, and
 * making them subtract two totals is work the interface should have done.
 * Standard shows "Included" for the same reason — it is the absence of a
 * charge, and "₹0" invites a second look.
 *
 * ## The saving is in rupees
 *
 * "10% off" is the label; "You save ₹390" is what makes it a decision. Both are
 * shown, and the amount is floored so nobody is quoted a saving larger than they
 * receive.
 *
 * ## Real radios
 *
 * Two `<fieldset>`s with legends, native `<input type="radio">` sharing one
 * `name`, so arrow keys move across both bands as a single group and each option
 * is announced with its window and its price effect rather than as bare text
 * sitting nearby.
 */
export function DeliveryOptions({
  subtotalInr,
  selected,
  onChange,
}: {
  subtotalInr: number
  selected: DeliveryOptionId
  onChange: (option: DeliveryOption) => void
}) {
  const soon = checkout.delivery.options.filter((option) => option.group === 'soon')
  const wait = checkout.delivery.options.filter((option) => option.group === 'wait')

  return (
    <Stack gap={4}>
      <fieldset>
        <legend className="mb-2">
          <Type as="span" size="xs" tone="subtle" tracking="caps">
            {checkout.delivery.soonHeading}
          </Type>
        </legend>
        <Stack gap={2}>
          {soon.map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              subtotalInr={subtotalInr}
              selected={selected === option.id}
              onSelect={() => onChange(option)}
            />
          ))}
        </Stack>
      </fieldset>

      {/*
        The discount band. One tinted panel around both tiers, so they read as a
        single choice with a dial rather than two more options in a flat list.
      */}
      <fieldset className="border border-line bg-surface p-4">
        <legend className="px-1">
          <Type as="span" size="xs" tone="subtle" tracking="caps">
            {checkout.delivery.waitHeading}
          </Type>
        </legend>

        <Type size="xs" tone="muted" className="mb-3">
          {checkout.delivery.waitNote}
        </Type>

        <Stack gap={2}>
          {wait.map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              subtotalInr={subtotalInr}
              selected={selected === option.id}
              onSelect={() => onChange(option)}
              tinted
            />
          ))}
        </Stack>
      </fieldset>

      {checkout.delivery.isProvisional && (
        <Type size="xs" tone="subtle">
          {checkout.delivery.provisionalNote}
        </Type>
      )}
    </Stack>
  )
}

function OptionRow({
  option,
  subtotalInr,
  selected,
  onSelect,
  tinted = false,
}: {
  option: DeliveryOption
  subtotalInr: number
  selected: boolean
  onSelect: () => void
  /** Inside the discount band, which already has a fill of its own. */
  tinted?: boolean
}) {
  // Integer paise. Floored, so a saving is never quoted larger than it is.
  const saving = Math.floor((subtotalInr * option.discountPercent) / 100)

  return (
    <label
      className={cn(
        'ease flex cursor-pointer items-center gap-3 border p-3 transition-colors duration-fast',
        tinted ? 'bg-background' : '',
        selected ? 'border-ink' : 'border-line hover:border-line-strong',
      )}
    >
      <input
        type="radio"
        name="delivery-option"
        value={option.id}
        checked={selected}
        onChange={onSelect}
        className="h-4 w-4 shrink-0 accent-ink"
      />

      <Stack gap={0} className="min-w-0 flex-1">
        <Row gap={3} justify="between" align="baseline" wrap={false}>
          <Type as="span" size="sm" weight="emphasis">
            {option.label}
          </Type>

          <Type as="span" size="sm" tone="muted" numeric className="shrink-0">
            {option.feeInr > 0
              ? checkout.delivery.extra(formatInr(option.feeInr))
              : option.discountPercent > 0
                ? checkout.delivery.saves(formatInr(saving))
                : checkout.summary.deliveryFree}
          </Type>
        </Row>

        <Row gap={2} align="baseline" wrap={false}>
          <Type as="span" size="xs" tone="subtle" numeric>
            {option.window}
          </Type>
          {selected && option.discountPercent > 0 && (
            <Row gap={1} align="center" wrap={false}>
              <Check className="h-3 w-3 text-ink-muted" strokeWidth={2} aria-hidden />
              <Type as="span" size="xs" tone="muted">
                {checkout.delivery.applied}
              </Type>
            </Row>
          )}
        </Row>
      </Stack>
    </label>
  )
}
