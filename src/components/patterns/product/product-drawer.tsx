'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { CareSymbols } from '../data/care-symbol'
import { MaterialRing } from '../data/material-ring'
import { SourcedValue } from '../passport/provenance-dot'
import { Overlay } from '@/components/primitives/overlay'
import { ChipPair, ChipRow } from '@/components/primitives/chip'
import { Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { drawers } from '@/content/drawers'
import { formatDate } from '@/lib/format/date'
import { MEASUREMENT_KEYS } from '@/lib/types'
import type { MeasurementKey, Passport, Product, Seller } from '@/lib/types'

/**
 * The product-page drawers.
 *
 * **Product details** is now the single home for specification: measurements,
 * composition, care, origin, product code. Composition and care used to render
 * both here *and* on the passport story, and the inspector's prose rendered both
 * here and in the condition block — three facts printed twice each, which was
 * most of why the page below the photographs ran to four screens.
 *
 * One home each. Specification is reference material a shopper *consults*, so it
 * lives behind a click. Condition and the journey are what a shopper *decides
 * on*, so they stay on the page.
 *
 * Density comes from three visual pieces rather than from cutting information:
 * the composition is a ring, care is a row of symbols instead of five labelled
 * empty boxes, and the header facts are chips.
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
        className="desktop:max-w-[40rem]"
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
        className="desktop:max-w-[40rem]"
      >
        <DrawerShell heading={drawers.delivery.heading} onClose={() => setOpen(null)}>
          <DeliveryBody />
        </DrawerShell>
      </Overlay>
    </>
  )
}

export function DrawerTrigger({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
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

/** The panel chrome. Close control top-right, where a reader's hand already is. */
export function DrawerShell({
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
    <Stack gap={8}>
      {/*
        The facts that were a six-row key-value table. Brand, type, size, code
        and date are all single attributes, which is what a chip is for.
      */}
      <ChipRow>
        <ChipPair label="Brand" value={product.brand} tone="emphasis" />
        <ChipPair label="Type" value={product.subcategory} />
        <ChipPair label="Size" value={`${product.size.label} · ${product.size.system}`} />
        <ChipPair label="Code" value={product.sku} />
        <ChipPair label={drawers.details.listed} value={formatDate(product.listedAt)} />
        {seller !== null && <ChipPair label="Seller" value={seller.displayName} />}
      </ChipRow>

      {/* ---- Composition, as a ring */}
      <section className="border-t border-line pt-6">
        <Eyebrow as="h3">{drawers.details.sections.materials}</Eyebrow>
        {passport === null ? (
          <Type size="sm" tone="muted" measure="default" className="pt-3">
            {drawers.details.materialsUnknown}
          </Type>
        ) : (
          <MaterialRing materials={passport.materials} className="pt-4" />
        )}
      </section>

      {/* ---- Care, as symbols */}
      <section className="border-t border-line pt-6">
        <Eyebrow as="h3">{drawers.details.sections.care}</Eyebrow>
        {passport === null ? (
          <Type size="sm" tone="muted" className="pt-3">
            {drawers.details.careUnknown}
          </Type>
        ) : (
          <CareSymbols instructions={passport.careInstructions} className="pt-4" />
        )}
      </section>

      {/* ---- Measurements, two columns. */}
      {present.length > 0 && (
        <section className="border-t border-line pt-6">
          <Row gap={4} justify="between" align="baseline">
            <Eyebrow as="h3">{drawers.details.sections.measurements}</Eyebrow>
            <Type as="span" size="xs" tone="subtle">
              centimetres, taken flat
            </Type>
          </Row>
          {/*
            Two columns, so nine measurements are five rows rather than nine. The
            note above replaces the sentence that used to sit here.
          */}
          <dl className="grid grid-cols-2 gap-x-8 pt-3">
            {present.map((key) => (
              <div key={key} className="flex justify-between gap-4 border-b border-line py-2">
                <Type as="dt" size="sm" tone="muted">
                  {MEASUREMENT_LABEL[key]}
                </Type>
                <Type as="dd" size="sm" numeric>
                  {product.measurements[key]}
                </Type>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* ---- Origin. Moved here from the passport story, where it was one of
              three duplicated blocks. */}
      {passport !== null && (
        <section className="border-t border-line pt-6">
          <Eyebrow as="h3">{drawers.details.sections.origin}</Eyebrow>
          <dl className="grid grid-cols-1 gap-3 pt-3 tablet:grid-cols-3">
            <OriginField label="Place of origin" sourced={passport.placeOfOrigin} />
            <OriginField label="Made in" sourced={passport.manufacturingCountry} />
            <OriginField label="Manufacturer" sourced={passport.manufacturer} />
          </dl>
        </section>
      )}
    </Stack>
  )
}

function OriginField({ label, sourced }: { label: string; sourced: Passport['placeOfOrigin'] }) {
  return (
    <div>
      <Type as="dt" size="xs" tone="subtle" tracking="caps">
        {label}
      </Type>
      <dd className="pt-1">
        <SourcedValue value={sourced.value} provenance={sourced.provenance} />
      </dd>
    </div>
  )
}

function DeliveryBody() {
  return (
    <Stack gap={6}>
      <section>
        <Eyebrow as="h3">{drawers.delivery.sections.delivery}</Eyebrow>
        <Type size="base" measure="default" className="pt-3">
          {drawers.delivery.deliveryBody}
        </Type>
      </section>
      <section className="border-t border-line pt-6">
        <Eyebrow as="h3">{drawers.delivery.sections.returns}</Eyebrow>
        <Type size="base" measure="default" className="pt-3">
          {drawers.delivery.returnsBody}
        </Type>
      </section>
      <section className="border-t border-line pt-6">
        <Eyebrow as="h3">{drawers.delivery.sections.oneOfOne}</Eyebrow>
        <Type size="base" measure="default" className="pt-3">
          {drawers.delivery.oneOfOneBody}
        </Type>
      </section>
    </Stack>
  )
}
