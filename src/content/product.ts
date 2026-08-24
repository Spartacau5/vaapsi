import type { Condition } from '@/lib/types'

/**
 * Product and condition copy.
 *
 * The condition definitions are the most load-bearing copy in the product.
 * A resale grade is a promise, and a shopper who feels the promise was
 * generous does not come back. They are written to describe wear plainly rather
 * than to flatter it — `well_loved` says "visible", not "characterful", because
 * the photograph is going to say "visible" either way.
 *
 * ⚠️ NEEDS CLIENT SIGN-OFF. The five levels and their wording are a proposal,
 * not a decision. Kanu owns the grading promise; the operations team has to be
 * able to apply it consistently at intake.
 */

export const conditionCopy: Record<
  Condition,
  { label: string; short: string; definition: string }
> = {
  pristine: {
    label: 'Pristine',
    short: 'Never worn',
    definition: 'Never worn. Original tags may still be attached. Indistinguishable from new.',
  },
  excellent: {
    label: 'Excellent',
    short: 'Worn a handful of times',
    definition: 'Worn a handful of times and looked after. No wear you would notice on or off.',
  },
  very_good: {
    label: 'Very good',
    short: 'Gently worn',
    definition:
      'Gently worn. Minor signs of use on close inspection, nothing visible when worn. Any marks are photographed.',
  },
  good: {
    label: 'Good',
    short: 'Visibly worn',
    definition:
      'Properly worn in. Visible signs of use — fading, softening, small marks — all documented and photographed below.',
  },
  well_loved: {
    label: 'Well loved',
    short: 'Worn, mended, priced for it',
    definition:
      'Significant wear, and often a repair. Structurally sound and priced accordingly. Every flaw is photographed. Buy this one because you like it, not because it is cheap.',
  },
}

export const productPage = {
  sections: {
    condition: 'Condition',
    conditionNote: 'Graded at intake. Every flaw below is photographed.',
    flaws: 'What to expect',
    measurements: 'Measurements',
    measurementsNote: 'Taken flat, in centimetres. Sizes vary by brand — go by these.',
    passport: 'History',
    seller: 'Listed by',
    care: 'Care',
    materials: 'Made of',
  },
  availability: {
    available: 'Available',
    reserved: 'Reserved — someone is checking out',
    sold: 'Sold',
  },
  oneOfOne: 'One of one. There is no second size, and no restock.',

  /**
   * Deliberately not "Recommended for you". There is no personalisation behind
   * it — it is a stated heuristic, and labelling a heuristic as a recommendation
   * is the kind of small overclaim this brand cannot afford when the rest of the
   * page is built on saying exactly how much we know.
   */
  goesWith: 'Goes with this',
  noPassport:
    'This garment has no passport yet. What we know about it is what the seller told us and what we could see.',
  originalRetail: 'Originally',
  originalRetailUnknown: 'Original price not known',
} as const
