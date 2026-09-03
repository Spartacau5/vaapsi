/**
 * Checkout copy.
 *
 * ## What this route is, and what it deliberately still is not
 *
 * The details step is real: contact, address, a delivery choice, and — as of the
 * demo build — a **mock payment step that is labelled as a mock on every screen
 * it appears on**. See the long note on `payment` below for exactly how it is
 * kept impossible to mistake for a live checkout, and why that exception was
 * made deliberately rather than by drift.
 *
 * Nothing here is submitted anywhere. There is no network call in the whole
 * flow, no card is accepted except one test number, and no field is persisted.
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
   * DELIVERY
   * ============================================================================
   *
   * Two groups, and the split is the whole design.
   *
   * **Get it soon** — Standard, and Express for a few rupees more. Express shows
   * the *difference* rather than its own total price ("+₹250"), because that is
   * the number the decision actually turns on. A shopper comparing two totals
   * has to do the subtraction themselves.
   *
   * **Wait, and pay less** — two tiers of the same trade, banded together so
   * they read as one choice with a dial rather than as two unrelated options
   * competing with Standard. 10% for 30 days, 15% for 40.
   *
   * ## Why the discount tiers are grouped
   *
   * Four flat radio rows make a shopper compare four things. Two groups of two
   * make them answer one question first — do I want it soon, or cheap — and then
   * pick within that. It is the same information arranged so the decision is
   * smaller.
   *
   * ## What the copy does not do
   *
   * It does not call the slow option "unhurried" or dress the wait up as a
   * lifestyle. The offer is plain: wait this long, pay this much less. A shopper
   * choosing a 40-day window is making a real sacrifice and the interface should
   * treat it as a transaction, not a virtue.
   *
   * ⚠️ **NEEDS SIGN-OFF, AND THE WINDOWS ARE THE RISK.** 30 and 40 days are very
   * long for apparel — long enough that cancellations and "where is my order"
   * contacts become the dominant cost, which can exceed the margin the discount
   * was meant to buy. The percentages and the windows both need finance and the
   * courier contract behind them (PRD open question #8) before this is live.
   */
  delivery: {
    heading: 'Delivery',
    soonHeading: 'Get it soon',
    waitHeading: 'Wait longer, pay less',
    /** Sits under the discount group and states the trade in one line. */
    waitNote: 'We hold your order and send it with others going the same way.',

    /** Shown on the selected discount tier. */
    applied: 'Applied',
    /** The Express differential, e.g. "+₹250". */
    extra: (amount: string) => `+${amount}`,
    /** The saving on a discount tier, in rupees. */
    saves: (amount: string) => `You save ${amount}`,

    isProvisional: true,
    provisionalNote: 'Windows and rates are provisional until the courier is confirmed.',

    options: [
      {
        id: 'standard',
        group: 'soon',
        label: 'Standard',
        window: '4–6 working days',
        /** Integer paise added to the order. */
        feeInr: 0,
        discountPercent: 0,
      },
      {
        id: 'express',
        group: 'soon',
        label: 'Express',
        window: '1–2 working days',
        feeInr: 25_000,
        discountPercent: 0,
      },
      {
        id: 'save10',
        group: 'wait',
        label: '10% off',
        window: 'Arrives in about 30 days',
        feeInr: 0,
        discountPercent: 10,
      },
      {
        id: 'save15',
        group: 'wait',
        label: '15% off',
        window: 'Arrives in about 40 days',
        feeInr: 0,
        discountPercent: 15,
      },
    ],
  },

  /**
   * ============================================================================
   * PAYMENT — A DEMO MOCK, LABELLED AS ONE
   * ============================================================================
   *
   * This repo held the line for a long time that `/checkout` must not contain a
   * fake payment screen, on the grounds that a stub gets believed and the phase
   * that builds it stops being estimated honestly. That reasoning still stands,
   * and this is a deliberate, scoped exception for a demo — not a reversal.
   *
   * So the mock is built to be **impossible to mistake for the real thing**:
   *
   * - A persistent banner on the payment step saying it is a demo and that no
   *   payment is taken. It is not dismissible and it is not small print.
   * - **No real card capture.** The card field accepts only the one test number
   *   below and rejects anything else, so a real card cannot be typed in even by
   *   accident. Nothing is transmitted; there is no network call at all.
   * - No card details are persisted, logged, or put in component state beyond
   *   the render that shows them.
   * - The route stays `noindex`.
   *
   * When real payment lands, this whole object and `MockPayment` are deleted
   * together. Do not evolve this into the real integration — start again against
   * the provider's SDK, because the shape below is designed to look right rather
   * than to be right.
   */
  payment: {
    heading: 'Payment',
    /** The banner. Deliberately blunt. */
    demoTitle: 'Demo only — no payment is taken',
    demoBody:
      'This is a prototype for review. Nothing on this page is sent anywhere, no real card is accepted, and no money moves.',

    methodLabel: 'How you would like to pay',
    methods: [
      { id: 'card', label: 'Card', note: 'Visa, Mastercard, RuPay' },
      { id: 'upi', label: 'UPI', note: 'GPay, PhonePe, Paytm' },
      { id: 'netbanking', label: 'Net banking', note: 'All major banks' },
    ],

    card: {
      number: 'Card number',
      /** The only value the field accepts. A real card cannot be entered. */
      testNumber: '4111 1111 1111 1111',
      testHint: 'Use the demo card 4111 1111 1111 1111',
      rejected: 'Only the demo card number is accepted here.',
      expiry: 'Expiry',
      expiryPlaceholder: 'MM/YY',
      cvv: 'CVV',
      name: 'Name on card',
    },

    upi: {
      id: 'UPI ID',
      placeholder: 'yourname@bank',
      hint: 'Nothing is sent. Any value is fine in the demo.',
    },

    netbanking: {
      label: 'Bank',
      banks: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra'],
    },
  },

  /**
   * The confirmation gate.
   *
   * The last thing between a filled-in form and a placed order, and it exists
   * because "Pay" as a bare button is the most consequential control on the site
   * with the least ceremony around it. It restates what is being bought, what it
   * costs, and when it arrives — the three things someone regrets getting wrong
   * — and requires a second, explicit action.
   *
   * It is a dialog rather than an inline expander on purpose: it should
   * interrupt. Everything else on this page can be skimmed; this cannot.
   */
  confirm: {
    trigger: 'Review and pay',
    title: 'Are you sure you want to buy?',
    body: 'Check the order below. Once confirmed, a pre-loved garment is gone from the catalogue — there is only one of each.',
    itemsLabel: 'What you are buying',
    totalLabel: 'You will pay',
    deliveryLabel: 'Arriving',
    cancel: 'Not yet',
    confirm: 'Yes, place the order',
    /** Shown while the mock "processes". */
    placing: 'Placing your order…',
  },

  /** The result. A demo order, and it says so. */
  placed: {
    eyebrow: 'Order placed',
    title: 'Thank you',
    body: 'This is a demo order, so nothing has actually been charged or dispatched.',
    reference: 'Reference',
    continueAction: 'Keep shopping',
  },

  summary: {
    heading: 'Your order',
    /** The line items. A checkout that does not show what is being bought is
        asking for a card number on trust. */
    itemsHeading: (count: number) => `${count} ${count === 1 ? 'item' : 'items'}`,
    empty: 'Your bag is empty.',
    emptyAction: 'Back to the shop',
    subtotal: 'Subtotal',
    discount: 'Delivery discount',
    deliveryLabel: 'Delivery',
    deliveryFree: 'Included',
    total: 'Total',
    /** Stated, not hidden: the total is indicative while tax is unresolved. */
    taxNote: 'Tax shown at payment. GST treatment on resale is being finalised.',
  },
} as const

export type DeliveryOptionId = (typeof checkout.delivery.options)[number]['id']
export type DeliveryOption = (typeof checkout.delivery.options)[number]
