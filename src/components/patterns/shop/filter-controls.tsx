'use client'

import { Check } from 'lucide-react'
import { Row, Stack } from '@/components/primitives/layout'
import { Eyebrow, Type } from '@/components/primitives/type'
import { shop } from '@/content/shop'
import { conditionCopy } from '@/content/product'
import { convertSize } from '@/lib/format/size'
import { formatInr } from '@/lib/format/currency'
import type { ProductFacets } from '@/lib/data'
import type { PlpState } from '@/lib/plp/search-params'
import { SIZE_SYSTEMS } from '@/lib/plp/search-params'
import type { Condition, SizeSystem } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * The filter controls themselves, shared by the desktop rail and the mobile
 * sheet.
 *
 * Both surfaces render exactly these components against exactly the same state
 * shape. The only difference between them is the container and when the state is
 * committed — desktop navigates on every change, mobile holds a pending draft
 * and commits on "Show N". Building them as one set of controls is what stops
 * the two from drifting, which is the usual failure here.
 *
 * Checkboxes are native inputs, restyled. A div with `role="checkbox"` would
 * need keyboard handling, indeterminate state and form semantics reimplemented,
 * and it would be worse at all three.
 */

export type FilterDraft = Pick<
  PlpState,
  'brands' | 'conditions' | 'sizes' | 'minRupees' | 'maxRupees' | 'hasPassport' | 'sizeSystem'
>

export type FilterControlsProps = {
  facets: ProductFacets
  draft: FilterDraft
  onChange: (next: FilterDraft) => void
}

function toggle<T>(list: readonly T[], value: T): readonly T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function FilterControls({ facets, draft, onChange }: FilterControlsProps) {
  return (
    <Stack gap={8}>
      {/* Passport first. It is the one filter unique to this business, and the
          one most likely to be what a shopper actually came for. */}
      <FilterGroup label={shop.filters.groups.passport}>
        <CheckboxRow
          label={shop.filters.passportToggle}
          checked={draft.hasPassport}
          onChange={() => onChange({ ...draft, hasPassport: !draft.hasPassport })}
        />
      </FilterGroup>

      <FilterGroup label={shop.filters.groups.condition}>
        <Stack gap={2}>
          {facets.conditions.map((facet) => (
            <CheckboxRow
              key={facet.value}
              label={conditionCopy[facet.value as Condition].label}
              hint={conditionCopy[facet.value as Condition].short}
              count={facet.count}
              checked={draft.conditions.includes(facet.value)}
              onChange={() =>
                onChange({
                  ...draft,
                  conditions: toggle(draft.conditions, facet.value) as readonly Condition[],
                })
              }
            />
          ))}
        </Stack>
      </FilterGroup>

      <FilterGroup label={shop.filters.groups.size}>
        {/* The IN/UK/EU toggle. A display preference, not a filter — it changes
            how sizes are labelled, never which garments match. */}
        <Row gap={1} className="pb-3">
          <Type as="span" size="xs" tone="subtle" className="pr-1">
            {shop.filters.sizeSystem}
          </Type>
          {SIZE_SYSTEMS.map((system) => (
            <button
              key={system}
              type="button"
              onClick={() => onChange({ ...draft, sizeSystem: system as SizeSystem })}
              aria-pressed={draft.sizeSystem === system}
              className={cn(
                'ease border px-2 py-0.5 text-xs transition-colors duration-fast',
                draft.sizeSystem === system
                  ? 'border-ink text-ink'
                  : 'border-line text-ink-subtle hover:border-line-strong',
              )}
            >
              {system}
            </button>
          ))}
        </Row>

        <Stack gap={2}>
          {facets.sizes.map((facet) => {
            const converted = convertSize(
              { label: facet.label, system: 'IN', normalized: facet.value },
              draft.sizeSystem,
            )
            return (
              <CheckboxRow
                key={facet.value}
                label={converted ?? facet.label}
                // When a conversion exists, show what the label actually says
                // as the hint. The printed label is the fact; the conversion is
                // the convenience, and a shopper checking the garment will find
                // the printed one.
                hint={converted === null ? undefined : `labelled ${facet.label}`}
                count={facet.count}
                checked={draft.sizes.includes(facet.value)}
                onChange={() => onChange({ ...draft, sizes: toggle(draft.sizes, facet.value) })}
              />
            )
          })}
        </Stack>
      </FilterGroup>

      <FilterGroup label={shop.filters.groups.brand}>
        <Stack gap={2}>
          {facets.brands.map((facet) => (
            <CheckboxRow
              key={facet.value}
              label={facet.value}
              count={facet.count}
              checked={draft.brands.includes(facet.value)}
              onChange={() => onChange({ ...draft, brands: toggle(draft.brands, facet.value) })}
            />
          ))}
        </Stack>
      </FilterGroup>

      <FilterGroup
        label={shop.filters.groups.price}
        hint={`${formatInr(facets.priceRangeInr.min, { paise: 'never' })} – ${formatInr(
          facets.priceRangeInr.max,
          { paise: 'never' },
        )}`}
      >
        <Row gap={3} wrap={false}>
          <PriceInput
            label={shop.filters.priceMin}
            value={draft.minRupees}
            onChange={(minRupees) => onChange({ ...draft, minRupees })}
          />
          <PriceInput
            label={shop.filters.priceMax}
            value={draft.maxRupees}
            onChange={(maxRupees) => onChange({ ...draft, maxRupees })}
          />
        </Row>
      </FilterGroup>
    </Stack>
  )
}

function FilterGroup({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <fieldset>
      <legend className="w-full">
        <Row gap={2} justify="between" className="pb-3">
          <Eyebrow as="span">{label}</Eyebrow>
          {hint !== undefined && (
            <Type as="span" size="xs" tone="subtle" numeric>
              {hint}
            </Type>
          )}
        </Row>
      </legend>
      {children}
    </fieldset>
  )
}

function CheckboxRow({
  label,
  hint,
  count,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="group/check flex cursor-pointer items-center gap-3">
      <span className="relative flex size-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer absolute size-4 cursor-pointer appearance-none border border-line checked:border-ink checked:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent group-hover/check:border-line-strong"
        />
        <Check
          className="pointer-events-none relative size-3 text-background opacity-0 peer-checked:opacity-100"
          strokeWidth={2.5}
          aria-hidden
        />
      </span>

      <Type as="span" size="sm" tone={checked ? 'default' : 'muted'} truncate>
        {label}
      </Type>

      {hint !== undefined && (
        <Type as="span" size="xs" tone="subtle" truncate>
          {hint}
        </Type>
      )}

      {count !== undefined && (
        <Type as="span" size="xs" tone="subtle" numeric className="ml-auto shrink-0">
          {count}
        </Type>
      )}
    </label>
  )
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (value: number | null) => void
}) {
  return (
    <label className="min-w-0 flex-1">
      <Type as="span" size="xs" tone="subtle" className="block pb-1">
        {label}
      </Type>
      <span className="flex items-center gap-1 border border-line px-2 py-1.5 focus-within:border-ink">
        <Type as="span" size="sm" tone="subtle">
          {shop.filters.priceUnit}
        </Type>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value ?? ''}
          onChange={(event) => {
            const raw = event.target.value
            if (raw === '') {
              onChange(null)
              return
            }
            const parsed = Number.parseInt(raw, 10)
            onChange(Number.isFinite(parsed) && parsed >= 0 ? parsed : null)
          }}
          className="w-full min-w-0 bg-transparent text-sm tabular-nums outline-none"
        />
      </span>
    </label>
  )
}
