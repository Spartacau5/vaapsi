import type { ProductFilters, ProductSort } from '@/lib/data'
import { CONDITIONS } from '@/lib/types'
import type { Condition, ProductCategory, SizeSystem } from '@/lib/types'

/**
 * The listing page's entire state, encoded in the URL.
 *
 * **No filter state lives in Zustand.** Everything a shopper has chosen is in
 * `searchParams`, which buys four things for free: the page is shareable, the
 * back button is correct, the server can render the filtered result, and a
 * refresh does not silently drop what someone spent a minute selecting.
 *
 * Two deliberate choices about the shape of the URL:
 *
 * 1. **Prices are in rupees here, not paise.** Everywhere else in the contract
 *    money is integer paise, and that is right for arithmetic — but `?min=2000`
 *    is a URL a human can read and edit, and `?min=200000` is one they will
 *    misread by a factor of a hundred. The conversion happens in this file and
 *    nowhere else.
 *
 * 2. **Multi-value filters are comma-separated, not repeated keys.**
 *    `?brand=COS,Zara` rather than `?brand=COS&brand=Zara`. Shorter, and Next's
 *    `searchParams` gives a repeated key as `string[]` and a single one as
 *    `string`, which is a union every call site would otherwise have to narrow.
 */

export const PLP_PARAMS = {
  brand: 'brand',
  condition: 'condition',
  size: 'size',
  min: 'min',
  max: 'max',
  passport: 'passport',
  sort: 'sort',
  page: 'page',
  sizeSystem: 'sizes',
  query: 'q',
} as const

/** What Next hands a page as `searchParams`. */
export type RawSearchParams = Record<string, string | string[] | undefined>

export const SORTS = ['newest', 'price_asc', 'price_desc'] as const
export type PlpSort = (typeof SORTS)[number]

/**
 * Newest is the default. In resale, recency *is* the product — a returning
 * shopper is asking "what is new since I last looked", and relevance ranking
 * over eight hundred one-of-one garments is noise.
 */
export const DEFAULT_SORT: PlpSort = 'newest'

export const PAGE_SIZE = 12

export const SIZE_SYSTEMS = ['IN', 'UK', 'EU'] as const
export const DEFAULT_SIZE_SYSTEM: SizeSystem = 'IN'

export type PlpState = {
  brands: readonly string[]
  conditions: readonly Condition[]
  sizes: readonly string[]
  /** Rupees, as they appear in the URL. Null means unbounded. */
  minRupees: number | null
  maxRupees: number | null
  hasPassport: boolean
  sort: PlpSort
  /** 1-based. `page=3` means the first three pages are shown, not just the third. */
  page: number
  sizeSystem: SizeSystem
  query: string | null
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

function readOne(params: RawSearchParams, key: string): string | null {
  const value = params[key]
  if (value === undefined) return null
  const first = Array.isArray(value) ? value[0] : value
  return first === undefined || first === '' ? null : first
}

function readList(params: RawSearchParams, key: string): readonly string[] {
  const raw = readOne(params, key)
  if (raw === null) return []
  return [
    ...new Set(
      raw
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part !== ''),
    ),
  ]
}

function readPositiveInt(params: RawSearchParams, key: string): number | null {
  const raw = readOne(params, key)
  if (raw === null) return null
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

/**
 * Parse, forgivingly. A hand-edited or truncated URL never throws and never
 * 500s — an unrecognised value is dropped and the rest of the state still
 * applies. Someone sharing a filtered link over WhatsApp will have it mangled,
 * and losing one filter is a much better outcome than an error page.
 */
export function parsePlpParams(params: RawSearchParams): PlpState {
  const sortRaw = readOne(params, PLP_PARAMS.sort)
  const systemRaw = readOne(params, PLP_PARAMS.sizeSystem)
  const page = readPositiveInt(params, PLP_PARAMS.page)

  return {
    brands: readList(params, PLP_PARAMS.brand),
    conditions: readList(params, PLP_PARAMS.condition).filter((value): value is Condition =>
      (CONDITIONS as readonly string[]).includes(value),
    ),
    sizes: readList(params, PLP_PARAMS.size),
    minRupees: readPositiveInt(params, PLP_PARAMS.min),
    maxRupees: readPositiveInt(params, PLP_PARAMS.max),
    hasPassport: readOne(params, PLP_PARAMS.passport) === '1',
    sort: (SORTS as readonly string[]).includes(sortRaw ?? '')
      ? (sortRaw as PlpSort)
      : DEFAULT_SORT,
    page: page === null || page < 1 ? 1 : page,
    sizeSystem: (SIZE_SYSTEMS as readonly string[]).includes(systemRaw ?? '')
      ? (systemRaw as SizeSystem)
      : DEFAULT_SIZE_SYSTEM,
    query: readOne(params, PLP_PARAMS.query),
  }
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

/**
 * Serialise back to a query string, omitting anything at its default.
 *
 * Omitting defaults is not cosmetic. `?sort=newest&page=1&sizes=IN` on a page
 * where nothing has been chosen makes a shared link look like a filtered result,
 * and it makes "has this shopper filtered anything?" impossible to answer by
 * looking at the URL.
 */
export function serialisePlpState(state: PlpState): string {
  const params = new URLSearchParams()

  if (state.brands.length > 0) params.set(PLP_PARAMS.brand, [...state.brands].sort().join(','))
  if (state.conditions.length > 0) {
    // Kept in scale order rather than selection order, so two shoppers who pick
    // the same grades get the same URL.
    const ordered = CONDITIONS.filter((c) => state.conditions.includes(c))
    params.set(PLP_PARAMS.condition, ordered.join(','))
  }
  if (state.sizes.length > 0) params.set(PLP_PARAMS.size, [...state.sizes].join(','))
  if (state.minRupees !== null) params.set(PLP_PARAMS.min, String(state.minRupees))
  if (state.maxRupees !== null) params.set(PLP_PARAMS.max, String(state.maxRupees))
  if (state.hasPassport) params.set(PLP_PARAMS.passport, '1')
  if (state.sort !== DEFAULT_SORT) params.set(PLP_PARAMS.sort, state.sort)
  if (state.page > 1) params.set(PLP_PARAMS.page, String(state.page))
  if (state.sizeSystem !== DEFAULT_SIZE_SYSTEM) params.set(PLP_PARAMS.sizeSystem, state.sizeSystem)
  if (state.query !== null && state.query !== '') params.set(PLP_PARAMS.query, state.query)

  const encoded = params.toString()
  return encoded === '' ? '' : `?${encoded}`
}

/** State with nothing selected. */
export function emptyPlpState(): PlpState {
  return {
    brands: [],
    conditions: [],
    sizes: [],
    minRupees: null,
    maxRupees: null,
    hasPassport: false,
    sort: DEFAULT_SORT,
    page: 1,
    sizeSystem: DEFAULT_SIZE_SYSTEM,
    query: null,
  }
}

// ---------------------------------------------------------------------------
// Bridging to the data layer
// ---------------------------------------------------------------------------

/** Which filters are actually narrowing the result. Drives the empty state. */
export const FILTER_KEYS = ['brands', 'conditions', 'sizes', 'price', 'passport', 'query'] as const
export type FilterKey = (typeof FILTER_KEYS)[number]

export function activeFilters(state: PlpState): readonly FilterKey[] {
  const active: FilterKey[] = []
  if (state.brands.length > 0) active.push('brands')
  if (state.conditions.length > 0) active.push('conditions')
  if (state.sizes.length > 0) active.push('sizes')
  if (state.minRupees !== null || state.maxRupees !== null) active.push('price')
  if (state.hasPassport) active.push('passport')
  if (state.query !== null && state.query !== '') active.push('query')
  return active
}

export function activeFilterCount(state: PlpState): number {
  return (
    state.brands.length +
    state.conditions.length +
    state.sizes.length +
    (state.minRupees !== null || state.maxRupees !== null ? 1 : 0) +
    (state.hasPassport ? 1 : 0)
  )
}

/** Clear one filter, leaving the rest. What the empty state offers. */
export function clearFilter(state: PlpState, key: FilterKey): PlpState {
  const next = { ...state, page: 1 }
  switch (key) {
    case 'brands':
      return { ...next, brands: [] }
    case 'conditions':
      return { ...next, conditions: [] }
    case 'sizes':
      return { ...next, sizes: [] }
    case 'price':
      return { ...next, minRupees: null, maxRupees: null }
    case 'passport':
      return { ...next, hasPassport: false }
    case 'query':
      return { ...next, query: null }
  }
}

/** Translate to the adapter's filter shape. Rupees become paise here. */
export function toProductFilters(state: PlpState, category?: ProductCategory): ProductFilters {
  const filters: ProductFilters = {
    ...(category !== undefined ? { category } : {}),
    ...(state.brands.length > 0 ? { brands: state.brands } : {}),
    ...(state.conditions.length > 0 ? { conditions: state.conditions } : {}),
    ...(state.sizes.length > 0 ? { sizes: state.sizes } : {}),
    ...(state.minRupees !== null ? { minPriceInr: state.minRupees * 100 } : {}),
    ...(state.maxRupees !== null ? { maxPriceInr: state.maxRupees * 100 } : {}),
    ...(state.hasPassport ? { hasPassport: true } : {}),
    ...(state.query !== null && state.query !== '' ? { query: state.query } : {}),
  }
  return filters
}

/** The PLP's sorts are a subset of the adapter's. */
export function toProductSort(sort: PlpSort): ProductSort {
  return sort
}
