/**
 * Checkout copy.
 *
 * ## What this route is, and what it deliberately still is not
 *
 * The details step is real: contact, address, and a delivery choice. Payment is
 * not, and the page says so at the boundary rather than rendering a card form
 * with a dead Pay button — the same reasoning that has always applied here. A
 * stubbed payment screen gets believed, and then the phase that builds it stops
 * being estimated seriously.
 *
 * So this collects nothing and submits nowhere. It exists because the delivery
 * choice below has to live somewhere a shopper actually meets it.
 */
export const checkout = {
  title: 'Checkout',
  eyebrow: 'Almost there',

  steps: {
    contact: 'Contact',
    address: 'Delivery address',
    delivery: 'How it gets to you',
    payment: 'Payment',
  },

  contact: {
    email: 'Email',
    emailHelp: 'For the order confirmation and the tracking link.',
    phone: 'Phone',
    phoneHelp: 'The courier will use this. Ten digits.',
  },

  address: {
    name: 'Full name',
    line1: 'Flat, house number, building',
    line2: 'Street, area',
    landmark: 'Landmark (optional)',
    city: 'City',
    state: 'State',
    pin: 'PIN code',
  },

  /**
   * ============================================================================
   * THE SLOWER-DELIVERY DISCOUNT
   * ============================================================================
   *
   * Three delivery options, and the slowest one carries 15% off.
   *
   * ## Why the discount sits on the slow option rather than a promo box
   *
   * Consolidated, unhurried shipping genuinely costs less and emits less: it
   * lets parcels travel full rather than half-empty, and on ground rather than
   * air. So the saving is real and it can be passed on. That makes this the one
   * discount on the site that is not a margin giveaway — it is the shopper being
   * paid for the flexibility they just gave us, which is also the only framing
   * that fits a business built on keeping clothes in use.
   *
   * ## Why it is phrased as a question
   *
   * "Would you like 15% off?" invites a choice. "SAVE 15%" in a coloured flash
   * is a nudge, and a nudge toward the slow option is exactly the kind of thing
   * a shopper resents once the parcel is late. The tag names the trade in the
   * same breath: cheaper, and it takes longer.
   *
   * ⚠️ **NEEDS SIGN-OFF ON TWO NUMBERS.** The 15% and the 8–11 day window are
   * both placeholders until the courier contract is settled (PRD open question
   * #8). A discount is a commercial commitment, not a design detail — if the
   * consolidation saving turns out to be under 15%, this is a loss on every
   * order that takes it. Do not ship the number without finance agreeing it.
   */
  delivery: {
    heading: 'How it gets to you',
    /** The tag on the slow option. Phrased as an offer, not a nudge. */
    discountTag: 'Would you like 15% off?',
    discountBody:
      'Choosing the slower window lets us send your order with others going the same way, on the ground rather than by air. That costs us less, so it costs you less.',
    /** Shown once the slow option is chosen. Confirms, without congratulating. */
    discountApplied: '15% off applied',
    discountPercent: 15,
    isProvisional: true,
    provisionalNote: 'Rates and windows are provisional until the courier is confirmed.',

    options: [
      {
        id: 'standard',
        label: 'Standard',
        window: '4–6 working days',
        note: 'Our usual service.',
        discountPercent: 0,
      },
      {
        id: 'express',
        label: 'Express',
        window: '1–2 working days',
        note: 'Air freight, dispatched the same day where possible.',
        discountPercent: 0,
      },
      {
        id: 'consolidated',
        label: 'Unhurried',
        window: '8–11 working days',
        note: 'Ground freight, sent with other orders heading your way.',
        discountPercent: 15,
      },
    ],
  },

  /** The payment boundary. See the note at the top of this file. */
  payment: {
    notBuiltTitle: 'Payment is the next phase',
    notBuiltBody:
      'Everything above is a working form and nothing on this page is sent anywhere. Card, UPI and net banking are wired up in the phase after this one, which is why there is deliberately no payment screen here pretending otherwise.',
    notBuiltAction: 'Back to your bag',
  },

  summary: {
    heading: 'Your order',
    subtotal: 'Subtotal',
    discount: 'Slower delivery discount',
    deliveryLabel: 'Delivery',
    deliveryFree: 'Included',
    total: 'Total',
    /** Stated, not hidden: the total is indicative while tax is unresolved. */
    taxNote: 'Tax shown at payment. GST treatment on resale is being finalised.',
  },
} as const

export type DeliveryOptionId = (typeof checkout.delivery.options)[number]['id']
