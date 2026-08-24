'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Overlay } from '@/components/primitives/overlay'
import { Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { drawers } from '@/content/drawers'
import { formatDate } from '@/lib/format/date'
import { MEASUREMENT_KEYS } from '@/lib/types'
import type { MeasurementKey, Passport, Product, Seller } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * The product-page drawers.
 *
 * Two triggers — **Product details** and **Delivery and returns** — each opening
 * a panel that slides in over the right-hand detail column and dims the
 * photograph behind it. This is the pattern from the reference the client sent,
 * and it earns its place for a specific reason: a resale PDP has a lot of
 * genuine reference material (nine measurements, a composition, care codes, a
 * product number) and stacking all of it under the buy button pushes the
 * passport — the thing that actually differentiates this site — below three
 * screens of specification.
 *
 * A drawer is the right container for reference material a shopper *consults*.
 *
 * **Condition and flaws are not in here.** That was a real decision, not an
 * omission: on resale, condition is not reference material, it is the purchase
 * decision. It stays on the page where it cannot be missed. Putting it behind a
 * link would undo the reason the rest of the page is believable.
 *
 * Behaviour comes from the shared `Overlay`, so the trap, the Escape handler and
 * the unfocusable-while-closed behaviour are identical to the nav drawer, the
 * filter sheet and the bag.
 */

type Which = 'details' | 'delivery' | null

export function ProductDrawers({
  product,
  passport,
  seller,
}: {
  product: Product
  passport: Passport | null
  seller: Seller | null
}) {
  const [open, setOpen] = useState<Which>(null)

  return (
    <>
      {/*
        The triggers. Set as a quiet list of underlined links rather than
        buttons-that-look-like-buttons — they open reference material, they are
        not actions, and the one filled control in this column should stay the
        one that adds to the bag.
      */}
      <Stack gap={3} as="ul">
        <li>
          <DrawerTrigger onClick={() => setOpen('details')}>
            {drawers.details.trigger}
          </DrawerTrigger>
        </li>
        <li>
          <DrawerTrigger onClick={() => setOpen('delivery')}>
            {drawers.delivery.trigger}
          </DrawerTrigger>
        </li>
      </Stack>

      <Overlay
        open={open === 'details'}
        onClose={() => setOpen(null)}
        label={drawers.details.heading}
        side="right"
        className="desktop:max-w-[46rem]"
      >
        <DrawerShell heading={drawers.details.heading} onClose={() => setOpen(null)}>
          <DetailsBody product={product} passport={passport} seller={seller} />
        </DrawerShell>
      </Overlay>

      <Overlay
        open={open === 'delivery'}
        onClose={() => setOpen(null)}
        label={drawers.delivery.heading}
        side="right"
        className="desktop:max-w-[46rem]"
      >
        <DrawerShell heading={drawers.delivery.heading} onClose={() => setOpen(null)}>
          <DeliveryBody />
        </DrawerShell>
      </Overlay>
    </>
  )
}

function DrawerTrigger({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ease text-left text-sm text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-fast hover:decoration-ink"
    >
      {children}
    </button>
  )
}

/**
 * The panel chrome. The close control is top-right, matching the reference and
 * matching where a reader's hand already is after opening it.
 */
function DrawerShell({
  heading,
  onClose,
  children,
}: {
  heading: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <>
      <Row
        gap={4}
        justify="between"
        align="start"
        className="shrink-0 border-b border-line px-gutter py-5"
      >
        <Type as="h2" family="display" size="xl" weight="heading">
          {heading}
        </Type>
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 -mt-1 p-2 text-ink-muted transition-colors hover:text-ink"
        >
          <span className="sr-only">{drawers.close}</span>
          <X className="size-5" strokeWidth={1.5} aria-hidden />
        </button>
      </Row>

      <div className="flex-1 overflow-y-auto px-gutter py-8">{children}</div>
    </>
  )
}

// ---------------------------------------------------------------------------

const MEASUREMENT_LABEL: Record<MeasurementKey, string> = {
  chest: 'Chest',
  waist: 'Waist',
  hip: 'Hip',
  shoulder: 'Shoulder',
  sleeveLength: 'Sleeve',
  length: 'Length',
  inseam: 'Inseam',
  rise: 'Rise',
  thigh: 'Thigh',
  hem: 'Hem',
  neck: 'Neck',
  cuff: 'Cuff',
}

function DetailsBody({
  product,
  passport,
  seller,
}: {
  product: Product
  passport: Passport | null
  seller: Seller | null
}) {
  const present = MEASUREMENT_KEYS.filter((key) => product.measurements[key] !== undefined)

  return (
    <Stack gap={10}>
      <section>
        <Eyebrow as="h3">{drawers.details.sections.about}</Eyebrow>
        <Type size="base" measure="default" className="mt-3">
          {product.conditionNotes}
        </Type>
      </section>

      <section>
        <Eyebrow as="h3">{drawers.details.sections.specification}</Eyebrow>
        <Spec label="Brand" value={product.brand} className="mt-3" />
        <Spec label="Type" value={product.subcategory} />
        <Spec label="Size as labelled" value={`${product.size.label} (${product.size.system})`} />
        <Spec label={drawers.details.productCode} value={product.sku} />
        <Spec label={drawers.details.listed} value={formatDate(product.listedAt)} />
        {seller !== null && <Spec label={drawers.details.seller} value={seller.displayName} />}
      </section>

      {present.length > 0 && (
        <section>
          <Eyebrow as="h3">{drawers.details.sections.measurements}</Eyebrow>
          <Type size="xs" tone="subtle" className="mt-2">
            {drawers.details.measurementsNote}
          </Type>
          <dl className="mt-3">
            {present.map((key) => (
              <div key={key} className="flex justify-between gap-4 border-b border-line py-2.5">
                <Type as="dt" size="sm" tone="muted">
                  {MEASUREMENT_LABEL[key]}
                </Type>
                <Type as="dd" size="sm" numeric>
                  {product.measurements[key]} cm
                </Type>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section>
        <Eyebrow as="h3">{drawers.details.sections.materials}</Eyebrow>
        {passport === null ? (
          // No passport, no composition. Stated rather than left as an empty
          // heading, because a blank section reads as "not filled in".
          <Type size="sm" tone="muted" measure="default" className="mt-3">
            {drawers.details.materialsUnknown}
          </Type>
        ) : (
          <dl className="mt-3">
            {passport.materials.map((material) => (
              <div
                key={material.name.value}
                className="flex justify-between gap-4 border-b border-line py-2.5"
              >
                <Type as="dt" size="sm" tone="muted">
                  {material.name.value}
                  {material.isRecycled.value && (
                    <Type as="span" size="xs" tone="subtle" className="pl-2">
                      recycled
                    </Type>
                  )}
                </Type>
                <Type as="dd" size="sm" numeric>
                  {material.percentage.value}%
                </Type>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section>
        <Eyebrow as="h3">{drawers.details.sections.care}</Eyebrow>
        {passport === null ? (
          <Type size="sm" tone="muted" className="mt-3">
            {drawers.details.careUnknown}
          </Type>
        ) : (
          <Stack gap={2} as="ul" className="mt-3">
            {passport.careInstructions.map((instruction) => (
              <Row key={instruction.code} gap={3} align="center" as="li" wrap={false}>
                <span
                  aria-hidden
                  className="size-6 shrink-0 border border-line"
                  data-icon={instruction.icon}
                />
                <Type as="span" size="sm" tone="muted">
                  {instruction.label}
                </Type>
              </Row>
            ))}
          </Stack>
        )}
      </section>
    </Stack>
  )
}

function DeliveryBody() {
  return (
    <Stack gap={10}>
      <section>
        <Eyebrow as="h3">{drawers.delivery.sections.delivery}</Eyebrow>
        <Type size="base" measure="default" className="mt-3">
          {drawers.delivery.deliveryBody}
        </Type>
      </section>
      <section>
        <Eyebrow as="h3">{drawers.delivery.sections.returns}</Eyebrow>
        <Type size="base" measure="default" className="mt-3">
          {drawers.delivery.returnsBody}
        </Type>
      </section>
      <section>
        <Eyebrow as="h3">{drawers.delivery.sections.oneOfOne}</Eyebrow>
        <Type size="base" measure="default" className="mt-3">
          {drawers.delivery.oneOfOneBody}
        </Type>
      </section>
    </Stack>
  )
}

function Spec({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex justify-between gap-4 border-b border-line py-2.5', className)}>
      <Type as="span" size="sm" tone="muted">
        {label}
      </Type>
      <Type as="span" size="sm" className="text-right">
        {value}
      </Type>
    </div>
  )
}
