'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ConfirmOrder } from './confirm-order'
import { DeliveryOptions } from './delivery-options'
import { MockPayment } from './mock-payment'
import { useCart } from '../cart/use-cart'
import { Col, Container, Grid, Row, Rule, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { checkout } from '@/content/checkout'
import type { DeliveryOption } from '@/content/checkout'
import { formatInr } from '@/lib/format/currency'
import { useCartStore } from '@/lib/store/cart'

/**
 * The checkout page.
 *
 * ## What is real and what is a mock
 *
 * The form, the delivery choice and the totals are real. **Payment is a demo
 * mock, labelled as one on screen** — see `MockPayment`, which documents the
 * four safeguards that keep it impossible to mistake for a live checkout.
 * Nothing on this page is sent anywhere; there is no network call in the flow
 * except the one that resolves the bag.
 *
 * ## The summary shows the garments
 *
 * It used to show a subtotal and a count, which meant a shopper reached the last
 * step of a purchase without ever seeing what they were buying. It now lists
 * every line with its photograph, the chosen colour and size, and its price —
 * resolved live through `useCart`, so a garment that sells while someone fills
 * in their address is caught here rather than after payment.
 *
 * ## The arithmetic
 *
 * Subtotal comes from the resolved lines. A delivery fee adds; a delivery
 * discount subtracts and is floored, so a saving is never quoted larger than it
 * is. Tax is absent and the summary says so — the GST treatment on resale is
 * unresolved (PRD #6), and an authoritative-looking total missing tax is worse
 * than an indicative one that admits it.
 */
export function CheckoutView() {
  const { cart, isLoading } = useCart()
  const clear = useCartStore((state) => state.clear)

  const [delivery, setDelivery] = useState<DeliveryOption>(checkout.delivery.options[0]!)
  const [paymentReady, setPaymentReady] = useState(false)
  const [placed, setPlaced] = useState<string | null>(null)

  const lines = cart?.lines ?? []
  const subtotalInr = lines
    .filter((line) => line.status === 'active')
    .reduce((sum, line) => sum + line.priceAtAddInr, 0)

  const discount = Math.floor((subtotalInr * delivery.discountPercent) / 100)
  const total = subtotalInr - discount + delivery.feeInr

  if (placed !== null) return <Placed reference={placed} />

  if (!isLoading && lines.length === 0) return <EmptyBag />

  return (
    <Container>
      <Stack gap={6} className="py-section-tight">
        <Stack gap={2}>
          <Eyebrow>{checkout.eyebrow}</Eyebrow>
          <Type as="h1" family="display" size="3xl" weight="heading">
            {checkout.title}
          </Type>
        </Stack>

        <Grid gap="loose" rowGap="default">
          {/* ---- The form */}
          <Col mobile={4} tablet={8} desktop={7}>
            <Stack gap={8}>
              <Fieldset legend={checkout.steps.contact}>
                <Field
                  label={checkout.contact.email}
                  help={checkout.contact.emailHelp}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                />
                <Field
                  label={checkout.contact.phone}
                  help={checkout.contact.phoneHelp}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </Fieldset>

              <Fieldset legend={checkout.steps.address}>
                <Field label={checkout.address.name} autoComplete="name" />
                <Field label={checkout.address.line1} autoComplete="address-line1" />
                <Field label={checkout.address.line2} autoComplete="address-line2" />
                <Row gap={3} wrap>
                  <div className="min-w-0 flex-1">
                    <Field label={checkout.address.city} autoComplete="address-level2" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Field label={checkout.address.state} autoComplete="address-level1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Field
                      label={checkout.address.pin}
                      autoComplete="postal-code"
                      inputMode="numeric"
                    />
                  </div>
                </Row>
              </Fieldset>

              {/*
                Delivery after the address: the windows below only mean anything
                once a shopper has said where the parcel is going.
              */}
              <Stack gap={3}>
                <Eyebrow as="h2">{checkout.delivery.heading}</Eyebrow>
                <DeliveryOptions
                  subtotalInr={subtotalInr}
                  selected={delivery.id}
                  onChange={setDelivery}
                />
              </Stack>

              <Stack gap={3} className="border-t border-line pt-6">
                <Eyebrow as="h2">{checkout.payment.heading}</Eyebrow>
                <MockPayment onValidityChange={setPaymentReady} />
              </Stack>

              <div className="border-t border-line pt-6">
                <ConfirmOrder
                  lines={lines.filter((line) => line.status === 'active')}
                  totalInr={total}
                  deliveryWindow={delivery.window}
                  disabled={!paymentReady || lines.length === 0}
                  onPlaced={() => {
                    setPlaced(reference())
                    clear()
                  }}
                />
              </div>
            </Stack>
          </Col>

          {/* ---- The summary, with the actual garments in it */}
          <Col mobile={4} tablet={8} desktop={5}>
            <Stack gap={4} className="border border-line p-6 desktop:sticky desktop:top-6">
              <Row gap={3} justify="between" align="baseline">
                <Eyebrow as="h2">{checkout.summary.heading}</Eyebrow>
                <Type as="span" size="xs" tone="subtle" numeric>
                  {checkout.summary.itemsHeading(lines.length)}
                </Type>
              </Row>
              <Rule />

              <Stack gap={4} as="ul">
                {lines.map((line) => (
                  <li key={line.id}>
                    <Row gap={3} align="start" wrap={false}>
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-surface">
                        <Image
                          src={line.product.primaryImage.url}
                          alt={line.product.primaryImage.alt}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      <Stack gap={0} className="min-w-0 flex-1">
                        <Type as="span" size="sm" weight="emphasis" truncate>
                          {line.product.title}
                        </Type>
                        {/* What is actually being charged for: the variant. */}
                        <Type as="span" size="xs" tone="muted" truncate>
                          {line.selection !== null
                            ? `${line.selection.colorName} · ${line.selection.sizeLabel}`
                            : `${line.product.color.name} · ${line.product.size.label}`}
                        </Type>
                        <Type as="span" size="xs" tone="subtle" truncate>
                          {line.product.composition}
                        </Type>
                      </Stack>

                      <Type as="span" size="sm" numeric className="shrink-0">
                        {formatInr(line.priceAtAddInr)}
                      </Type>
                    </Row>
                  </li>
                ))}
              </Stack>

              <Rule />

              <Stack gap={2}>
                <SummaryRow label={checkout.summary.subtotal} value={formatInr(subtotalInr)} />

                {discount > 0 && (
                  <SummaryRow
                    label={`${checkout.summary.discount} (${delivery.discountPercent}%)`}
                    value={`− ${formatInr(discount)}`}
                    accent
                  />
                )}

                <SummaryRow
                  label={`${checkout.summary.deliveryLabel} · ${delivery.label}`}
                  value={
                    delivery.feeInr > 0 ? formatInr(delivery.feeInr) : checkout.summary.deliveryFree
                  }
                />
              </Stack>

              <Rule />
              <SummaryRow label={checkout.summary.total} value={formatInr(total)} strong />

              <Type size="xs" tone="subtle">
                {checkout.summary.taxNote}
              </Type>
            </Stack>
          </Col>
        </Grid>
      </Stack>
    </Container>
  )
}

/** A demo order reference. Not an order number — there is no order. */
function reference(): string {
  return `VP-DEMO-${Math.floor(Math.random() * 9000 + 1000)}`
}

function Placed({ reference }: { reference: string }) {
  return (
    <Container>
      <Stack gap={4} className="max-w-measure py-section">
        <Eyebrow>{checkout.placed.eyebrow}</Eyebrow>
        <Type as="h1" family="display" size="3xl" weight="heading">
          {checkout.placed.title}
        </Type>
        <Type size="lg" tone="muted">
          {checkout.placed.body}
        </Type>
        <Row gap={2} align="baseline">
          <Type as="span" size="sm" tone="subtle">
            {checkout.placed.reference}
          </Type>
          <Type as="span" size="sm" numeric weight="emphasis">
            {reference}
          </Type>
        </Row>
        <Link
          href="/shop"
          className="ease mt-4 self-start bg-ink px-6 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
        >
          {checkout.placed.continueAction}
        </Link>
      </Stack>
    </Container>
  )
}

function EmptyBag() {
  return (
    <Container>
      <Stack gap={4} className="max-w-measure py-section">
        <Type as="h1" family="display" size="2xl" weight="heading">
          {checkout.summary.empty}
        </Type>
        <Link
          href="/shop"
          className="ease self-start bg-ink px-6 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
        >
          {checkout.summary.emptyAction}
        </Link>
      </Stack>
    </Container>
  )
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3">
        <Eyebrow as="span">{legend}</Eyebrow>
      </legend>
      <Stack gap={4}>{children}</Stack>
    </fieldset>
  )
}

/**
 * One field. A visible `<label>` wrapping its input rather than a placeholder
 * standing in for one — a placeholder disappears the moment someone types, which
 * is exactly when they most need to know what the box is for.
 */
function Field({
  label,
  help,
  type = 'text',
  autoComplete,
  inputMode,
}: {
  label: string
  help?: string
  type?: string
  autoComplete?: string
  inputMode?: 'text' | 'email' | 'tel' | 'numeric'
}) {
  return (
    <label className="block">
      <Type as="span" size="xs" tone="subtle" tracking="caps">
        {label}
      </Type>
      <input
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="ease mt-1.5 w-full border border-line bg-background px-3 py-2.5 text-sm text-ink transition-colors duration-fast focus:border-ink focus:outline-none"
      />
      {help !== undefined && (
        <Type size="xs" tone="subtle" className="mt-1">
          {help}
        </Type>
      )}
    </label>
  )
}

function SummaryRow({
  label,
  value,
  strong = false,
  accent = false,
}: {
  label: string
  value: string
  strong?: boolean
  accent?: boolean
}) {
  return (
    <Row gap={3} justify="between" align="baseline" wrap={false}>
      <Type as="span" size="sm" tone={accent ? 'accent' : 'muted'}>
        {label}
      </Type>
      <Type
        as="span"
        size={strong ? 'lg' : 'sm'}
        weight={strong ? 'heading' : 'regular'}
        tone={accent ? 'accent' : 'default'}
        numeric
      >
        {value}
      </Type>
    </Row>
  )
}
