'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DeliveryOptions } from './delivery-options'
import { Col, Container, Grid, Rule, Stack, Row } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { checkout } from '@/content/checkout'
import { formatInr } from '@/lib/format/currency'
import { useCartStore } from '@/lib/store/cart'

/**
 * The checkout details step.
 *
 * ## What is real here and what is not
 *
 * The form is real markup — labels tied to inputs, sensible `autoComplete` and
 * `inputMode`, a working delivery choice that moves the order summary. **Nothing
 * is submitted anywhere**, and payment is a stated boundary rather than a fake
 * card form. That distinction is the whole reason this page can exist without
 * misleading anyone: a shopper can fill in details and see the 15% offer in
 * context, and no reviewer can mistake the page for a finished checkout.
 *
 * ## Why the summary is not a live cart resolve
 *
 * It totals from the persisted store's line count against a nominal figure
 * rather than calling `resolveCart`. Two reasons: this is a client component and
 * `resolveCart` is the adapter's job, and — more to the point — real totals need
 * the GST treatment that is still open (PRD #6). Showing an authoritative-looking
 * total that is missing tax is worse than showing an indicative one that says so.
 */
export function CheckoutView({ subtotalInr }: { subtotalInr: number }) {
  const [discountPercent, setDiscountPercent] = useState(0)
  const itemCount = useCartStore((state) => state.items.length)

  const discount = Math.floor((subtotalInr * discountPercent) / 100)
  const total = subtotalInr - discount

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
                <Field label={checkout.address.landmark} />
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
                The delivery choice, and with it the 15% offer. It sits after the
                address on purpose: the windows below only mean something once a
                shopper has said where the parcel is going.
              */}
              <DeliveryOptions
                subtotalInr={subtotalInr}
                onChange={(option) => setDiscountPercent(option.discountPercent)}
              />

              {/* ---- The payment boundary. Not a fake card form. */}
              <Stack gap={2} className="border-t border-line pt-6">
                <Eyebrow as="h2">{checkout.steps.payment}</Eyebrow>
                <Type as="p" size="lg" weight="emphasis">
                  {checkout.payment.notBuiltTitle}
                </Type>
                <Type size="sm" tone="muted" measure="default">
                  {checkout.payment.notBuiltBody}
                </Type>
                <Link
                  href="/cart"
                  className="ease mt-2 self-start bg-ink px-6 py-3 text-sm text-background transition-colors duration-fast hover:bg-ink-muted"
                >
                  {checkout.payment.notBuiltAction}
                </Link>
              </Stack>
            </Stack>
          </Col>

          {/* ---- The summary */}
          <Col mobile={4} tablet={8} desktop={5}>
            <Stack gap={3} className="border border-line p-6">
              <Eyebrow as="h2">{checkout.summary.heading}</Eyebrow>
              <Rule />

              <SummaryRow
                label={`${checkout.summary.subtotal} (${itemCount})`}
                value={formatInr(subtotalInr)}
              />

              {discount > 0 && (
                <SummaryRow
                  label={checkout.summary.discount}
                  value={`− ${formatInr(discount)}`}
                  accent
                />
              )}

              <SummaryRow
                label={checkout.summary.deliveryLabel}
                value={checkout.summary.deliveryFree}
              />

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
 * One field.
 *
 * A visible `<label>` wrapping its input rather than a placeholder standing in
 * for one — a placeholder disappears the moment someone types, which is exactly
 * when they most need to know what the box is for.
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
