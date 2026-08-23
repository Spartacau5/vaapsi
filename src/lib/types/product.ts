import type {
  CurrencyCode,
  ImageId,
  IsoDateTime,
  Paise,
  PassportId,
  ProductId,
  SellerId,
} from './common'

/**
 * The five-level condition scale.
 *
 * Ordered best to worst. Each level has a short public-facing definition in
 * `content/product.ts` — the enum value is never shown to a shopper directly.
 *
 * Five levels rather than a 1–10 score on purpose: a shopper can hold five
 * categories in their head, and a resale grade is a judgement, not a
 * measurement. A 7-versus-8 distinction implies a precision that a human
 * inspecting a garment cannot actually deliver.
 *
 * (The PRD defers AI condition scoring to Phase 2. When it arrives it should
 * map onto these five, not replace them — the shopper-facing vocabulary should
 * not change because the grading method did.)
 */
export const CONDITIONS = ['pristine', 'excellent', 'very_good', 'good', 'well_loved'] as const

export type Condition = (typeof CONDITIONS)[number]

/** Position of a condition on the scale. `pristine` is 1. */
export function conditionRank(condition: Condition): number {
  return CONDITIONS.indexOf(condition) + 1
}

/** A documented imperfection. Absence of flaws is meaningful; an empty array is a claim. */
export type Flaw = {
  /** Plain language, specific. "Two small pulls on the left cuff", not "minor damage". */
  description: string
  /** The image in `Product.images` that shows this flaw. `kind` there is `'flaw'`. */
  imageId: ImageId
  /** Where on the garment, in garment terms. "Left cuff", "inner hem", "back yoke". */
  location: string
}

export type SizeSystem = 'IN' | 'UK' | 'EU' | 'US'

/**
 * What the label says, plus a system-independent handle.
 *
 * `label` is transcribed from the garment and never inferred — a garment
 * labelled `M` is stored as `M`. `normalized` is the comparison key used for
 * filtering and cross-system conversion; see `lib/format/size`.
 */
export type Size = {
  label: string
  system: SizeSystem
  /** Canonical handle, e.g. `xs`, `s`, `m`, `l`, `xl`, `w28`, `eu38`. */
  normalized: string
}

/**
 * Garment measurements in **centimetres**, taken flat.
 *
 * Deliberately a partial record rather than a fixed shape: a shirt has a
 * shoulder, a skirt does not, and forcing every key onto every garment produces
 * either lies or zeroes. Render only the keys present.
 */
export const MEASUREMENT_KEYS = [
  'chest',
  'waist',
  'hip',
  'shoulder',
  'sleeveLength',
  'length',
  'inseam',
  'rise',
  'thigh',
  'hem',
  'neck',
  'cuff',
] as const

export type MeasurementKey = (typeof MEASUREMENT_KEYS)[number]

export type Measurements = Partial<Record<MeasurementKey, number>>

/**
 * Single-unit availability. There is no quantity anywhere in this contract —
 * every garment is one-of-one, so a cart line cannot have a count and a
 * "2 left in stock" state does not exist.
 *
 * `reserved` means in someone's cart or mid-checkout. It is a real state a
 * shopper can see, and it is the reason the PDP needs an urgency treatment that
 * is honest rather than manufactured.
 */
export type Availability = 'available' | 'reserved' | 'sold'

export type ProductImageKind = 'primary' | 'detail' | 'flaw' | 'label' | 'worn'

export type ProductImage = {
  id: ImageId
  url: string
  /** Required. Describes the garment, not the photograph. */
  alt: string
  kind: ProductImageKind
  /** width / height. Lets the grid reserve space before load. */
  aspectRatio: number
}

export type ProductCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'knitwear'
  | 'ethnicwear'
  | 'suiting'
  | 'accessories'

export type Product = {
  // identity
  id: ProductId
  slug: string
  /** Vaapsi's own stock number. One per physical garment, never per style. */
  sku: string
  title: string
  brand: string
  category: ProductCategory
  subcategory: string

  // resale specifics
  condition: Condition
  /** Free text from the inspector. Sits next to the grade and qualifies it. */
  conditionNotes: string
  flaws: readonly Flaw[]
  measurements: Measurements
  size: Size

  // commerce
  /** Integer paise. See `Paise`. */
  priceInr: Paise
  /** What it cost new, in paise. Null when unknown — do not guess to show a discount. */
  originalRetailInr: Paise | null
  currency: CurrencyCode
  availability: Availability

  // media — ordered, first `primary` is the card image
  images: readonly ProductImage[]

  // relations
  /** Null for garments not yet passported. The UI must handle this, not assume it. */
  passportId: PassportId | null
  sellerId: SellerId

  listedAt: IsoDateTime
}

/** The subset a grid card needs. Lets the list endpoint stay cheap. */
export type ProductSummary = Pick<
  Product,
  | 'id'
  | 'slug'
  | 'title'
  | 'brand'
  | 'category'
  | 'condition'
  | 'size'
  | 'priceInr'
  | 'originalRetailInr'
  | 'currency'
  | 'availability'
  | 'passportId'
> & { primaryImage: ProductImage }
