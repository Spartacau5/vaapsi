'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Overlay } from '@/components/primitives/overlay'
import { Row, Rule, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { checkout } from '@/content/checkout'
import { formatInr } from '@/lib/format/currency'
import type { CartLine } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * "Are you sure you want to buy?" — the gate between a filled-in form and a
 * placed order.
 *
 * ## Why this exists at all
 *
 * A bare Pay button is the most consequential control on the site with the least
 * ceremony around it. This restates the three things somebody actually regrets
 * getting wrong — what they are buying, what it costs, when it arrives — and
 * asks for a second, deliberate action.
 *
 * On a one-of-one marketplace it earns its place twice over: confirming takes a
 * pre-loved garment out of the catalogue permanently, and the copy says so
 * rather than leaving it as a surprise.
 *
 * ## Why a dialog and not an inline expander
 *
 * It should interrupt. Everything else on the checkout page can be skimmed past;
 * this is the one step that should not be skimmable, and a modal is the only
 * pattern that reliably stops a scroll.
 *
 * ## Not a dark pattern in reverse, either
 *
 * "Not yet" is a real, equally-weighted way out — not a greyed link tucked under
 * the primary button. A confirmation step that makes cancelling hard is worse
 * than no confirmation step, because it adds friction without adding a choice.
 */
export function ConfirmOrder({
  lines,
  totalInr,
  deliveryWindow,
  disabled,
  onPlaced,
}: {
  lines: readonly CartLine[]
  totalInr: number
  deliveryWindow: string
  /** True until the form and mock payment look complete. */
  disabled: boolean
  onPlaced: () => void
}) {
  const [open, setOpen] = useState(false)
  const [placing, setPlacing] = useState(false)

  function place() {
    setPlacing(true)
    // A beat, so the state change is legible rather than instant. There is no
    // request behind this — see MockPayment.
    window.setTimeout(() => {
      setPlacing(false)
      setOpen(false)
      onPlaced()
    }, 700)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-disabled={disabled}
        onClickCapture={(event) => {
          if (disabled) event.stopPropagation()
        }}
        className={cn(
          'ease w-full px-6 py-3.5 text-sm transition-colors duration-fast',
          disabled
            ? 'cursor-default border border-line text-ink-subtle'
            : 'bg-ink text-background hover:bg-ink-muted',
        )}
      >
        {checkout.confirm.trigger}
      </button>

      <Overlay open={open} onClose={() => setOpen(false)} label={checkout.confirm.title}>
        <Stack gap={5} className="p-6 tablet:p-8">
          <Row gap={4} justify="between" align="start">
            <Type as="h2" family="display" size="xl" weight="heading">
              {checkout.confirm.title}
            </Type>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="ease -m-2 p-2 text-ink-muted transition-colors duration-fast hover:text-ink"
            >
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </button>
          </Row>

          <Type size="sm" tone="muted" measure="default">
            {checkout.confirm.body}
          </Type>

          <Stack gap={2}>
            <Eyebrow as="h3">{checkout.confirm.itemsLabel}</Eyebrow>
            <Rule />
            <Stack gap={2} as="ul">
              {lines.map((line) => (
                <li key={line.id}>
                  <Row gap={3} justify="between" align="baseline" wrap={false}>
                    <Type as="span" size="sm" truncate>
                      {line.product.title}
                      {line.selection !== null && (
                        <Type as="span" size="sm" tone="muted">
                          {' '}
                          — {line.selection.colorName}, {line.selection.sizeLabel}
                        </Type>
                      )}
                    </Type>
                    <Type as="span" size="sm" tone="muted" numeric className="shrink-0">
                      {formatInr(line.priceAtAddInr)}
                    </Type>
                  </Row>
                </li>
              ))}
            </Stack>
          </Stack>

          <Stack gap={2} className="border-t border-line pt-4">
            <Row gap={3} justify="between" align="baseline">
              <Type as="span" size="sm" tone="muted">
                {checkout.confirm.deliveryLabel}
              </Type>
              <Type as="span" size="sm" numeric>
                {deliveryWindow}
              </Type>
            </Row>
            <Row gap={3} justify="between" align="baseline">
              <Type as="span" size="sm" tone="muted">
                {checkout.confirm.totalLabel}
              </Type>
              <Type as="span" size="2xl" family="display" weight="heading" numeric>
                {formatInr(totalInr)}
              </Type>
            </Row>
          </Stack>

          {/* Both ways out, weighted the same. See the note above. */}
          <Row gap={3} wrap={false} className="pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ease flex-1 border border-line-strong px-5 py-3 text-sm text-ink transition-colors duration-fast hover:bg-surface"
            >
              {checkout.confirm.cancel}
            </button>
            <button
              type="button"
              onClick={place}
              disabled={placing}
              className="ease flex-1 bg-ink px-5 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted disabled:opacity-70"
            >
              {placing ? checkout.confirm.placing : checkout.confirm.confirm}
            </button>
          </Row>
        </Stack>
      </Overlay>
    </>
  )
}
