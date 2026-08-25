import { PASSPORT_NAME } from './passport'

/**
 * Home page copy.
 *
 * Written to plain rules: sentence case, real verbs, specific over clever, and
 * nothing that could appear on any other retailer's site. "Every piece has a
 * record of where it has been" is a claim only this business can make.
 * "Sustainable fashion for a better tomorrow" is a claim nobody can check.
 *
 * Where a number appears, it comes from the data, not from here.
 */
export const home = {
  hero: {
    eyebrow: 'One of one',
    /** Sits above the garment title. The thesis of the whole site. */
    thesis: 'This one has a past.',
    lede: 'Every piece here has been somewhere before it reached you. We keep the record, and it stays with the garment.',
    cta: 'See this piece',
    /** Labels for the provenance facts shown beside the garment. */
    facts: {
      made: 'Made',
      owners: 'Owners',
      returned: 'Came back',
      condition: 'Condition',
    },
    /** Used when the featured garment has no passport. Should not happen. */
    fallbackNote: 'Featured piece',
    /**
     * Carousel controls. Every one of these is read aloud, so they say what the
     * control does rather than which direction it points.
     */
    carousel: {
      label: 'Featured pieces',
      previous: 'Previous piece',
      next: 'Next piece',
      /** Announced as a slide arrives, and used as each dot's label. */
      position: (index: number, total: number) => `Piece ${index} of ${total}`,
      /**
       * Autoplay has to be stoppable to meet WCAG 2.2.2 — anything that moves
       * for more than five seconds needs a pause control that is not a hover.
       */
      pause: 'Pause',
      play: 'Play',
    },
  },

  newIn: {
    eyebrow: 'New in',
    title: 'Just arrived',
    /** Says out loud what one-of-one means for browsing behaviour. */
    note: 'Each of these is the only one. What is here today may not be tomorrow.',
    cta: 'See everything',
    /** Screen-reader instruction for the horizontal rail. */
    railLabel: 'Recent arrivals',
  },

  /**
   * The passport sequence. Numbered markers are right *here specifically*,
   * because this genuinely is an ordered process. Nothing else on the site is
   * numbered.
   *
   * The verbs are the real vocabulary from the data model — declared, inspected,
   * verified, relisted — so the interface and the record use the same words.
   */
  howItWorks: {
    eyebrow: 'How it works',
    title: `${PASSPORT_NAME.title}`,
    lede: 'Four steps, and you can see all of them on every garment that has one.',
    steps: [
      {
        verb: 'Declared',
        body: 'Whoever owned it tells us what they know — where it came from, what it is made of, what has happened to it. That first version is kept exactly as written, permanently.',
      },
      {
        verb: 'Inspected',
        body: 'It arrives at our studio. Two people check it against the declaration, take the measurements, photograph every flaw, and grade the condition.',
      },
      {
        verb: 'Verified',
        body: 'Anything we could confirm is marked as confirmed, and anything we could not is marked as told to us. If we got the first version wrong, the correction is added — the original stays.',
      },
      {
        verb: 'Relisted',
        body: 'It goes back up with its whole history attached. When you buy it, the record comes with it, and it is there for whoever has it after you.',
      },
    ],
    cta: `How ${PASSPORT_NAME.singular}s work`,
  },

  categories: {
    eyebrow: 'Browse',
    title: 'By category',
    /**
     * Every href points at a category that actually has stock. A dead category
     * link on the home page is worse than a shorter list — and because the
     * category route validates against the live facets, an empty one 404s.
     */
    items: [
      { label: 'Jackets', href: '/shop/outerwear', note: 'Truckers and chore coats' },
      { label: 'Jeans and skirts', href: '/shop/bottoms', note: 'Broken in already' },
      { label: 'Dresses', href: '/shop/dresses', note: 'Shirt dresses and jumpsuits' },
      { label: 'Shirts and waistcoats', href: '/shop/tops' },
      { label: 'Bags', href: '/shop/accessories' },
    ],
  },

  condition: {
    eyebrow: 'Condition',
    title: 'What the grades mean',
    /**
     * This section exists to remove the single biggest objection in resale, so
     * it gets real space rather than a line in an FAQ. The promise is the copy.
     */
    lede: 'Five grades, applied by hand at our studio, and the same five every time. We would rather you knew exactly what you are getting than be pleasantly surprised once and disappointed twice.',
    note: 'Every flaw is photographed and shown on the garment page. Nothing is left for you to find.',
    cta: 'How we grade',
  },

  editorial: {
    /** The breathing room in the page. One image, one statement. */
    statement: 'The most sustainable garment is the one that already exists.',
    attribution: 'Vaapsi, New Delhi',
    imageAlt: 'A rail of pre-loved denim in a studio, photographed in daylight',
  },
} as const
