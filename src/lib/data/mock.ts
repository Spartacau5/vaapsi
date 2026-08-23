import { sizeSortIndex } from '@/lib/format/size'
import { CONDITIONS } from '@/lib/types'
import type {
  Cart,
  CartLine,
  CartTotals,
  Condition,
  Page,
  Passport,
  PassportId,
  Product,
  ProductCategory,
  ProductId,
  ProductSummary,
  Seller,
  SellerId,
} from '@/lib/types'
import type {
  CartItemRef,
  DataAdapter,
  ListProductsInput,
  ProductFacets,
  ProductFilters,
  ProductSort,
} from './adapter'
import { passports } from './fixtures/passports'
import { products } from './fixtures/products'
import { sellers } from './fixtures/sellers'

/**
 * Mock implementation of `DataAdapter`, backed by local fixtures.
 *
 * Fixtures are imported **here and nowhere else** — an ESLint rule enforces it.
 * The cart is held in module scope, which is deliberately naive: it resets on
 * server restart and is shared across requests. That is fine for a storefront
 * prototype and it is exactly the thing the real adapter replaces.
 */

const EDITORIAL_ORDER: readonly ProductId[] = [
  'prd_rawmango_chanderi_kurta',
  'prd_cos_wool_coat_stone',
  'prd_anitadongre_anarkali_rose',
  'prd_levis_501_indigo',
  'prd_nicobar_poplin_shirtdress',
  'prd_massimo_pleated_trousers_black',
]

function toSummary(product: Product): ProductSummary {
  const primary = product.images.find((image) => image.kind === 'primary') ?? product.images[0]
  if (primary === undefined) {
    throw new Error(`Product ${product.id} has no images. Every garment needs at least one.`)
  }
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    brand: product.brand,
    category: product.category,
    condition: product.condition,
    size: product.size,
    priceInr: product.priceInr,
    originalRetailInr: product.originalRetailInr,
    currency: product.currency,
    availability: product.availability,
    passportId: product.passportId,
    primaryImage: primary,
  }
}

function matches(product: Product, filters: ProductFilters): boolean {
  if (filters.category !== undefined && product.category !== filters.category) return false
  if (filters.brands !== undefined && filters.brands.length > 0) {
    if (!filters.brands.includes(product.brand)) return false
  }
  if (filters.conditions !== undefined && filters.conditions.length > 0) {
    if (!filters.conditions.includes(product.condition)) return false
  }
  if (filters.sizes !== undefined && filters.sizes.length > 0) {
    if (!filters.sizes.includes(product.size.normalized)) return false
  }
  if (filters.minPriceInr !== undefined && product.priceInr < filters.minPriceInr) return false
  if (filters.maxPriceInr !== undefined && product.priceInr > filters.maxPriceInr) return false
  if (filters.hasPassport === true && product.passportId === null) return false
  if (filters.hasPassport === false && product.passportId !== null) return false
  if (filters.query !== undefined && filters.query.trim() !== '') {
    const needle = filters.query.trim().toLowerCase()
    const haystack = `${product.title} ${product.brand} ${product.subcategory} ${product.category}`
    if (!haystack.toLowerCase().includes(needle)) return false
  }
  return true
}

function sorted(list: readonly Product[], sort: ProductSort): readonly Product[] {
  const copy = [...list]
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => a.priceInr - b.priceInr)
    case 'price_desc':
      return copy.sort((a, b) => b.priceInr - a.priceInr)
    case 'alphabetical':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case 'newest':
      return copy.sort((a, b) => Date.parse(b.listedAt) - Date.parse(a.listedAt))
    case 'relevance':
    default:
      // Available first, then newest. A sold garment sinking below an available
      // one is the only relevance signal Phase 1 legitimately has.
      return copy.sort((a, b) => {
        const rank = (product: Product) => (product.availability === 'sold' ? 1 : 0)
        const byAvailability = rank(a) - rank(b)
        if (byAvailability !== 0) return byAvailability
        return Date.parse(b.listedAt) - Date.parse(a.listedAt)
      })
  }
}

function countBy<T extends string>(values: readonly T[]): readonly { value: T; count: number }[] {
  const counts = new Map<T, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)))
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

const MOCK_CART_ID = 'crt_mock_session'

/**
 * Status for a remembered garment, resolved fresh every time.
 *
 * `sold_out` is not an error state — it is the expected outcome of a slow
 * checkout on one-of-one inventory, and the cart has to show it rather than
 * silently dropping the line. A garment that vanishes from a bag is worse than
 * one that says it has gone.
 *
 * `price_changed` is never emitted here. The client stores no price, so there is
 * nothing to compare against; a real backend holding a server-side cart can
 * detect it, and the type keeps the case open for when one does.
 */
function statusFor(availability: Product['availability']): CartLine['status'] {
  switch (availability) {
    case 'available':
      return 'active'
    case 'reserved':
      return 'reserved'
    case 'sold':
      return 'sold_out'
  }
}

function totals(lines: readonly CartLine[]): CartTotals {
  // Only lines that can actually be bought count. A sold garment sitting in the
  // bag must not inflate the total the shopper is about to be charged.
  const subtotalInr = lines
    .filter((line) => line.status === 'active')
    .reduce((sum, line) => sum + line.product.priceInr, 0)

  return {
    subtotalInr,
    // Null until a PIN code is known, and null until the merchant-of-record
    // model is settled. The front end does not invent money.
    shippingInr: null,
    taxInr: null,
    discountInr: 0,
    totalInr: subtotalInr,
  }
}

// ---------------------------------------------------------------------------

export const mockAdapter: DataAdapter = {
  async listProducts(input: ListProductsInput = {}): Promise<Page<ProductSummary>> {
    const { filters = {}, sort = 'relevance', limit = 24, cursor = null } = input

    const filtered = products.filter((product) => matches(product, filters))
    const ordered = sorted(filtered, sort)

    const offset = cursor === null ? 0 : Number.parseInt(cursor, 10)
    const start = Number.isNaN(offset) ? 0 : offset
    const slice = ordered.slice(start, start + limit)
    const nextOffset = start + slice.length

    return {
      items: slice.map(toSummary),
      nextCursor: nextOffset < ordered.length ? String(nextOffset) : null,
      total: ordered.length,
    }
  },

  async getProduct(idOrSlug: ProductId | string): Promise<Product | null> {
    return products.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null
  },

  async getProductFacets(): Promise<ProductFacets> {
    const prices = products.map((p) => p.priceInr)
    const sizes = countBy(products.map((p) => p.size.normalized))
    return {
      brands: countBy(products.map((p) => p.brand)),
      categories: countBy(products.map((p) => p.category)) as readonly {
        value: ProductCategory
        count: number
      }[],
      // Fixed order, best to worst — a condition filter sorted by count reads
      // as arbitrary to a shopper.
      conditions: CONDITIONS.map((value: Condition) => ({
        value,
        count: products.filter((p) => p.condition === value).length,
      })).filter((entry) => entry.count > 0),
      sizes: [...sizes]
        .sort((a, b) => sizeSortIndex(a.value) - sizeSortIndex(b.value))
        .map((entry) => ({
          value: entry.value,
          label: products.find((p) => p.size.normalized === entry.value)?.size.label ?? entry.value,
          count: entry.count,
        })),
      priceRangeInr: { min: Math.min(...prices), max: Math.max(...prices) },
    }
  },

  async listFeaturedProducts(limit = 6): Promise<readonly ProductSummary[]> {
    const byId = new Map(products.map((product) => [product.id, product]))
    return EDITORIAL_ORDER.map((id) => byId.get(id))
      .filter((product): product is Product => product !== undefined)
      .slice(0, limit)
      .map(toSummary)
  },

  async getPassport(id: PassportId): Promise<Passport | null> {
    return passports.find((passport) => passport.id === id) ?? null
  },

  async getPassportByProduct(productId: ProductId): Promise<Passport | null> {
    return passports.find((passport) => passport.productId === productId) ?? null
  },

  async getSeller(idOrHandle: SellerId | string): Promise<Seller | null> {
    return sellers.find((s) => s.id === idOrHandle || s.handle === idOrHandle) ?? null
  },

  async resolveCart(items: readonly CartItemRef[]): Promise<Cart> {
    const byId = new Map(products.map((product) => [product.id, product]))

    const lines: CartLine[] = items
      .map((item) => {
        const product = byId.get(item.productId)
        // A garment that no longer exists at all is dropped rather than shown as
        // an error. Delisted is different from sold, and there is nothing for a
        // shopper to do about it.
        if (product === undefined) return null
        return {
          id: `crl_${product.id}`,
          product: toSummary(product),
          priceAtAddInr: product.priceInr,
          addedAt: item.addedAt,
          status: statusFor(product.availability),
        }
      })
      .filter((line): line is CartLine => line !== null)
      // Newest first. A shopper who just added something expects to see it.
      .sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt))

    return {
      id: MOCK_CART_ID,
      lines,
      totals: totals(lines),
      currency: 'INR',
      updatedAt: new Date().toISOString(),
    }
  },
}
