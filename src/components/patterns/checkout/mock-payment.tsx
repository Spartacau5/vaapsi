'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Row, Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { checkout } from '@/content/checkout'
import { cn } from '@/lib/utils'

/**
 * The payment step — **a demo mock, and it says so on screen.**
 *
 * ## Read this before changing anything here
 *
 * This repo deliberately refused a fake payment screen for a long time: a stub
 * gets believed, and then the phase that builds the real thing stops being
 * estimated honestly. That reasoning has not changed. This exists as a scoped
 * exception for a client demo, and it is built so nobody — reviewer, client or
 * shopper — can mistake it for a live checkout.
 *
 * Four safeguards, all load-bearing:
 *
 * 1. **A permanent banner.** Not dismissible, not small print, at the top of the
 *    step, saying no payment is taken.
 * 2. **A real card cannot be entered.** The number field accepts only the test
 *    PAN `4111 1111 1111 1111` and rejects everything else with a visible
 *    message. This is the important one: it makes it structurally impossible for
 *    someone to type their actual card into a prototype.
 * 3. **Nothing leaves the browser.** No fetch, no form action, no analytics
 *    event. Values live in component state for the life of the render and are
 *    never persisted.
 * 4. **CVV and expiry are not stored at all** — they are uncontrolled inputs
 *    with no state behind them, because there is no reason for this component to
 *    hold them even in memory.
 *
 * When real payment lands, delete this file and `checkout.payment` together. Do
 * not evolve it into the integration: it is shaped to look right, not to be
 * right, and the provider's SDK will want a different structure entirely.
 */

export type PaymentMethodId = 'card' | 'upi' | 'netbanking'

export function MockPayment({
  onValidityChange,
}: {
  /** Lets the page gate its confirm button on a plausible-looking entry. */
  onValidityChange?: (valid: boolean) => void
}) {
  const [method, setMethod] = useState<PaymentMethodId>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [upiId, setUpiId] = useState('')
  const [bank, setBank] = useState<string>(checkout.payment.netbanking.banks[0]!)

  const digits = cardNumber.replace(/\D/g, '')
  const testDigits = checkout.payment.card.testNumber.replace(/\D/g, '')
  const cardAccepted = digits === testDigits
  // A wrong number is only *rejected* once it is long enough to be a real
  // attempt — flagging an error on the first keystroke is noise.
  const cardRejected = digits.length >= testDigits.length && !cardAccepted

  const valid =
    method === 'card' ? cardAccepted : method === 'upi' ? upiId.includes('@') : bank !== ''

  function update(next: Partial<{ method: PaymentMethodId; card: string; upi: string }>) {
    const nextMethod = next.method ?? method
    const nextCard = next.card ?? cardNumber
    const nextUpi = next.upi ?? upiId
    if (next.method !== undefined) setMethod(next.method)
    if (next.card !== undefined) setCardNumber(next.card)
    if (next.upi !== undefined) setUpiId(next.upi)

    const nextDigits = nextCard.replace(/\D/g, '')
    const nextValid =
      nextMethod === 'card'
        ? nextDigits === testDigits
        : nextMethod === 'upi'
          ? nextUpi.includes('@')
          : true
    onValidityChange?.(nextValid)
  }

  return (
    <Stack gap={4}>
      {/* Safeguard 1. `Row` takes no ARIA props, hence the wrapper. */}
      <div role="note" className="border border-line-strong bg-surface p-3">
        <Row gap={3} align="start" wrap={false}>
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-ink"
            strokeWidth={1.5}
            aria-hidden
          />
          <Stack gap={1}>
            <Type as="span" size="sm" weight="emphasis">
              {checkout.payment.demoTitle}
            </Type>
            <Type size="xs" tone="muted">
              {checkout.payment.demoBody}
            </Type>
          </Stack>
        </Row>
      </div>

      <fieldset>
        <legend className="mb-2">
          <Type as="span" size="xs" tone="subtle" tracking="caps">
            {checkout.payment.methodLabel}
          </Type>
        </legend>

        <Stack gap={2}>
          {checkout.payment.methods.map((entry) => (
            <label
              key={entry.id}
              className={cn(
                'ease flex cursor-pointer items-center gap-3 border p-3 transition-colors duration-fast',
                method === entry.id ? 'border-ink' : 'border-line hover:border-line-strong',
              )}
            >
              <input
                type="radio"
                name="payment-method"
                value={entry.id}
                checked={method === entry.id}
                onChange={() => update({ method: entry.id as PaymentMethodId })}
                className="h-4 w-4 shrink-0 accent-ink"
              />
              <Row gap={3} justify="between" align="baseline" wrap={false} className="flex-1">
                <Type as="span" size="sm" weight="emphasis">
                  {entry.label}
                </Type>
                <Type as="span" size="xs" tone="subtle" className="shrink-0">
                  {entry.note}
                </Type>
              </Row>
            </label>
          ))}
        </Stack>
      </fieldset>

      {method === 'card' && (
        <Stack gap={3} className="border-t border-line pt-4">
          <label className="block">
            <Type as="span" size="xs" tone="subtle" tracking="caps">
              {checkout.payment.card.number}
            </Type>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={cardNumber}
              onChange={(event) => update({ card: event.target.value })}
              placeholder={checkout.payment.card.testNumber}
              aria-invalid={cardRejected}
              className={cn(
                'ease mt-1.5 w-full border bg-background px-3 py-2.5 text-sm text-ink transition-colors duration-fast focus:outline-none',
                cardRejected ? 'border-ink' : 'border-line focus:border-ink',
              )}
            />
            {/* Safeguard 2. A real card is refused, visibly. */}
            <Type size="xs" tone={cardRejected ? 'default' : 'subtle'} className="mt-1">
              {cardRejected ? checkout.payment.card.rejected : checkout.payment.card.testHint}
            </Type>
          </label>

          {/* Safeguard 4. Uncontrolled — nothing holds these, even in memory. */}
          <Row gap={3} wrap={false}>
            <label className="block min-w-0 flex-1">
              <Type as="span" size="xs" tone="subtle" tracking="caps">
                {checkout.payment.card.expiry}
              </Type>
              <input
                type="text"
                autoComplete="off"
                placeholder={checkout.payment.card.expiryPlaceholder}
                className="ease mt-1.5 w-full border border-line bg-background px-3 py-2.5 text-sm text-ink transition-colors duration-fast focus:border-ink focus:outline-none"
              />
            </label>
            <label className="block min-w-0 flex-1">
              <Type as="span" size="xs" tone="subtle" tracking="caps">
                {checkout.payment.card.cvv}
              </Type>
              <input
                type="text"
                autoComplete="off"
                inputMode="numeric"
                maxLength={4}
                className="ease mt-1.5 w-full border border-line bg-background px-3 py-2.5 text-sm text-ink transition-colors duration-fast focus:border-ink focus:outline-none"
              />
            </label>
          </Row>
        </Stack>
      )}

      {method === 'upi' && (
        <Stack gap={1} className="border-t border-line pt-4">
          <label className="block">
            <Type as="span" size="xs" tone="subtle" tracking="caps">
              {checkout.payment.upi.id}
            </Type>
            <input
              type="text"
              autoComplete="off"
              value={upiId}
              onChange={(event) => update({ upi: event.target.value })}
              placeholder={checkout.payment.upi.placeholder}
              className="ease mt-1.5 w-full border border-line bg-background px-3 py-2.5 text-sm text-ink transition-colors duration-fast focus:border-ink focus:outline-none"
            />
          </label>
          <Type size="xs" tone="subtle">
            {checkout.payment.upi.hint}
          </Type>
        </Stack>
      )}

      {method === 'netbanking' && (
        <label className="block border-t border-line pt-4">
          <Type as="span" size="xs" tone="subtle" tracking="caps">
            {checkout.payment.netbanking.label}
          </Type>
          <select
            value={bank}
            onChange={(event) => {
              setBank(event.target.value)
              onValidityChange?.(true)
            }}
            className="ease mt-1.5 w-full border border-line bg-background px-3 py-2.5 text-sm text-ink transition-colors duration-fast focus:border-ink focus:outline-none"
          >
            {checkout.payment.netbanking.banks.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      )}

      <input type="hidden" value={valid ? 'ready' : 'incomplete'} readOnly />
    </Stack>
  )
}
