import type {
  Cart,
  Page,
  Passport,
  PassportId,
  Product,
  ProductCategory,
  ProductId,
  ProductSummary,
  Seller,
  SellerId,
  Condition,
} from '@/lib/types'

/**
 * The integration seam.
 *
 * This is the whole surface the storefront uses to reach data. Swapping the
 * mock implementation for TanStack Query against real endpoints means writing
 * one more object that satisfies this interface and changing which one
 * `lib/data/index.ts` exports. Nothing else in the app moves.
 *
 * Every method is async even where the mock answers instantly, so no call site
 * needs to change when a real network hop appears behind it.
 */

export type ProductSort = 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'alphabetical'

/**
 * PLP filters. All optional; omitting one means "do not filter on this".
 *
 * Prices are in **paise**, matching the contract. Passing rupees here is the
 * single most likely integration mistake, which is why the field names carry
 * the `Inr` suffix that the rest of the contract uses for paise.
 */
export type ProductFilters = {
  category?: ProductCategory
  brands?: readonly string[]
  conditions?: readonly Condition[]
  /** `Size.normalized` values, not printed labels. */
  sizes?: readonly string[]
  minPriceInr?: number
  maxPriceInr?: number
  /** True to show only garments that have a passport. */
  hasPassport?: boolean
  /** Free-text query across title, brand and subcategory. */
  query?: string
}

export type ListProductsInput = {
  filters?: ProductFilters
  sort?: ProductSort
  /** Opaque cursor from a previous page. */
  cursor?: string | null
  limit?: number
}

/**
 * Facets for the filter panel, computed against the *unfiltered* set so counts
 * do not collapse to zero as a shopper narrows down.
 */
export type ProductFacets = {
  brands: readonly { value: string; count: number }[]
  categories: readonly { value: ProductCategory; count: number }[]
  conditions: readonly { value: Condition; count: number }[]
  sizes: readonly { value: string; label: string; count: number }[]
  priceRangeInr: { min: number; max: number }
}

export interface DataAdapter {
  // ---- catalogue
  listProducts(input?: ListProductsInput): Promise<Page<ProductSummary>>
  getProduct(idOrSlug: ProductId | string): Promise<Product | null>
  /** Facet counts for the filter panel. */
  getProductFacets(): Promise<ProductFacets>
  /**
   * Editorial selection for the home page. Curated, not algorithmic — Phase 1
   * excludes recommendations, and a home page that pretends to personalise
   * without the data behind it is worse than one that does not try.
   */
  listFeaturedProducts(limit?: number): Promise<readonly ProductSummary[]>

  /**
   * Pieces that go with this one.
   *
   * **Not personalisation, and not machine learning.** Phase 1 excludes AI
   * recommendations, and a storefront that implies personalisation it does not
   * have is making a promise the backend cannot keep. What this is: a stated
   * heuristic — other available pieces, favouring different categories so the
   * set reads as an outfit rather than as near-duplicates of what the shopper is
   * already looking at.
   *
   * When a real recommender exists it replaces the body of this method and
   * nothing above it changes. Until then the honest framing is in the copy:
   * "goes with", not "recommended for you".
   */
  listRelatedProducts(productId: ProductId, limit?: number): Promise<readonly ProductSummary[]>

  // ---- passport
  getPassport(id: PassportId): Promise<Passport | null>
  getPassportByProduct(productId: ProductId): Promise<Passport | null>

  // ---- seller
  getSeller(idOrHandle: SellerId | string): Promise<Seller | null>

  // ---- cart
  /**
   * Resolve a set of remembered garments into a priced, availability-checked
   * cart.
   *
   * The client stores **only** product IDs and when they were added. It never
   * caches a price or an availability state, because a cart that remembers a
   * price is a cart that lies after a repricing, and one that remembers
   * availability is a cart that sells a garment twice.
   *
   * So the shape here is deliberately a *resolve*, not a read-write cart: the
   * client owns membership, the adapter owns truth. Every totals figure is
   * computed here rather than in the browser, because GST treatment on a C2C
   * resale is unresolved (PRD Q6) and guessing at it client-side would be wrong
   * in a way nobody notices until an invoice is read.
   */
  resolveCart(items: readonly CartItemRef[]): Promise<Cart>
}

/** What the persisted client store holds per garment. Nothing else. */
export type CartItemRef = {
  productId: ProductId
  addedAt: string
}

/** Thrown when a mutation cannot proceed. Carries a code the UI can branch on. */
export class DataError extends Error {
  constructor(
    readonly code: 'not_found' | 'unavailable' | 'already_in_cart',
    message: string,
  ) {
    super(message)
    this.name = 'DataError'
  }
}
