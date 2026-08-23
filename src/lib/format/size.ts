import type { Size, SizeSystem } from '@/lib/types'

/**
 * Size conversion across IN / UK / EU / US.
 *
 * Table-driven and exported so it can be replaced without touching call sites.
 * `Size.normalized` is the join key — that field exists precisely so conversion
 * never has to parse a label.
 *
 * ASSUMPTION FLAGGED FOR MERCHANDISING SIGN-OFF. These tables are the
 * conventional womenswear and denim mappings. They are close enough to be
 * useful and not close enough to be authoritative: real sizing varies by brand,
 * and menswear tops are labelled by chest inches in a way this table does not
 * yet model. `Product` has no gender field, which is the underlying gap.
 * Do not put a conversion in front of a shopper as fact until this is signed
 * off — `convertSize` returning null is the safe path, and the UI should handle
 * it by showing the label exactly as printed on the garment.
 */

export type SizeScale = 'alpha' | 'waist'

type SizeRow = {
  normalized: string
  scale: SizeScale
  labels: Record<SizeSystem, string>
}

/** Alpha-anchored apparel scale (tops, dresses, knitwear, outerwear). */
const ALPHA_ROWS: readonly SizeRow[] = [
  { normalized: 'xxs', scale: 'alpha', labels: { IN: 'XXS', UK: '4', EU: '32', US: '0' } },
  { normalized: 'xs', scale: 'alpha', labels: { IN: 'XS', UK: '6', EU: '34', US: '2' } },
  { normalized: 's', scale: 'alpha', labels: { IN: 'S', UK: '8', EU: '36', US: '4' } },
  { normalized: 'm', scale: 'alpha', labels: { IN: 'M', UK: '10', EU: '38', US: '6' } },
  { normalized: 'l', scale: 'alpha', labels: { IN: 'L', UK: '12', EU: '40', US: '8' } },
  { normalized: 'xl', scale: 'alpha', labels: { IN: 'XL', UK: '14', EU: '42', US: '10' } },
  { normalized: 'xxl', scale: 'alpha', labels: { IN: 'XXL', UK: '16', EU: '44', US: '12' } },
  { normalized: 'xxxl', scale: 'alpha', labels: { IN: 'XXXL', UK: '18', EU: '46', US: '14' } },
]

/** Waist-inch scale (trousers, jeans, tailored bottoms). Inches read the same everywhere. */
const WAIST_ROWS: readonly SizeRow[] = [26, 28, 30, 32, 34, 36, 38, 40, 42].map((inches) => ({
  normalized: `w${inches}`,
  scale: 'waist' as const,
  labels: {
    IN: String(inches),
    UK: String(inches),
    EU: String(inches + 16),
    US: String(inches),
  },
}))

export const SIZE_TABLE: readonly SizeRow[] = [...ALPHA_ROWS, ...WAIST_ROWS]

const BY_NORMALIZED = new Map(SIZE_TABLE.map((row) => [row.normalized, row]))

/** One-size garments — scarves, most accessories. */
export const ONE_SIZE = 'one_size'

/**
 * Convert a size into another system.
 * Returns null when the size is unknown to the table, one-size, or already in
 * the target system — the caller then shows the printed label instead.
 */
export function convertSize(size: Size, to: SizeSystem): string | null {
  if (size.normalized === ONE_SIZE) return null
  if (size.system === to) return null
  const row = BY_NORMALIZED.get(size.normalized)
  return row ? row.labels[to] : null
}

/** Every known equivalent of a size, keyed by system. Empty for unknown sizes. */
export function sizeEquivalents(size: Size): Partial<Record<SizeSystem, string>> {
  const row = BY_NORMALIZED.get(size.normalized)
  return row ? { ...row.labels } : {}
}

/** `M (UK 10)` — the printed label first, the conversion in support of it. */
export function formatSizeWithConversion(size: Size, to: SizeSystem): string {
  const converted = convertSize(size, to)
  return converted === null ? size.label : `${size.label} (${to} ${converted})`
}

/** Sort key so xs comes before m in a filter list. -1 for unknown. */
export function sizeSortIndex(normalized: string): number {
  return SIZE_TABLE.findIndex((row) => row.normalized === normalized)
}
