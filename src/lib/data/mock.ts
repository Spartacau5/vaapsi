import { sizeSortIndex } from '@/lib/format/size'
import { CONDITIONS } from '@/lib/types'
import type {
  Cart,
  CartId,
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
import { DataError } from './adapter'
import type {
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
// Cart — module-scoped, intentionally naive. Replaced by the real adapter.
// ---------------------------------------------------------------------------

const MOCK_CART_ID = 'crt_mock_session'

let cartLines: CartLine[] = []

function totals(lines: readonly CartLine[]): CartTotals {
  const subtotalInr = lines
    .filter((line) => line.status === 'active')
    .reduce((sum, line) => sum + line.priceAtAddInr, 0)
  return {
    subtotalInr,
    // Null until a PIN code is known and until the merchant-of-record model is
    // settled. The front end does not invent money.
    shippingInr: null,
    taxInr: null,
    discountInr: 0,
    totalInr: subtotalInr,
  }
}

function snapshotCart(): Cart {
  return {
    id: MOCK_CART_ID,
    lines: [...cartLines],
    totals: totals(cartLines),
    currency: 'INR',
    updatedAt: new Date().toISOString(),
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

  async getCart(): Promise<Cart> {
    return snapshotCart()
  },

  async addToCart(_cartId: CartId | null, productId: ProductId): Promise<Cart> {
    const product = products.find((p) => p.id === productId)
    if (product === undefined) {
      throw new DataError('not_found', `No garment with id ${productId}.`)
    }
    if (product.availability !== 'available') {
      throw new DataError(
        'unavailable',
        `${product.title} is ${product.availability}. Every garment here is one of one.`,
      )
    }
    if (cartLines.some((line) => line.product.id === productId)) {
      // Not an error the shopper caused, and not one they can fix by trying
      // again — there is only ever one of these.
      throw new DataError('already_in_cart', `${product.title} is already in your bag.`)
    }

    cartLines = [
      ...cartLines,
      {
        id: `crl_${productId}`,
        product: toSummary(product),
        priceAtAddInr: product.priceInr,
        addedAt: new Date().toISOString(),
        status: 'active',
      },
    ]
    return snapshotCart()
  },

  async removeFromCart(_cartId: CartId, lineId: string): Promise<Cart> {
    cartLines = cartLines.filter((line) => line.id !== lineId)
    return snapshotCart()
  },
}

/** Test helper. Not part of `DataAdapter` — do not call from app code. */
export function __resetMockCart(): void {
  cartLines = []
}
