import { rupees } from '@/lib/format/currency'
import type { Product, ProductImage } from '@/lib/types'

/**
 * Eight fixture garments. **All denim**, clothing and accessories.
 *
 * ---
 *
 * ## The shot list
 *
 * Every product carries the same six frames in the same order, modelled on the
 * Prada PDP the client referenced. That consistency is the point: a listing page
 * where one garment has a flat lay and the next has a cropped street shot reads
 * as a marketplace, not a store — and on resale, where every garment is a
 * one-off, consistency of presentation is the only thing making the set look
 * like one catalogue.
 *
 * | # | kind | The frame |
 * |---|---|---|
 * | 1 | `primary` | Garment alone on a light grey ground. Full bleed, no props |
 * | 2 | `worn` | Model, full length, front, plain pale ground, neutral pose |
 * | 3 | `detail` | Worn close-up — upper body, showing how it sits |
 * | 4 | `detail` | Hardware or construction crop — pocket, seam, rivet |
 * | 5 | `worn` | Model, full length, back |
 * | 6 | `label` | Macro on the collar, waistband or brand mark |
 *
 * Flaw frames are inserted after 4, since that is where a shopper is already
 * looking closely at construction.
 *
 * **The alt text is written as a photography brief.** It describes the frame we
 * want, not the placeholder that is currently there — so whoever shoots this can
 * work from the fixtures directly. See `SHOT_LIST` below.
 *
 * ## Placeholders
 *
 * `picsum.photos` images are unrelated to denim and always will be. The
 * structure, ratios and ordering are real; the pixels are not. Replacing them is
 * PRD open question #10.
 */

/** Source ratio for every frame. 4:5 crops well into the split PDP panel. */
const PORTRAIT = 4 / 5

/**
 * Garments that have real photography in `public/products/<slug>/`.
 *
 * Add a slug here and its frames resolve to local files instead of placeholders.
 * That is the entire switch — one line per garment. The file naming convention
 * is in `public/products/README.md`.
 *
 * Empty for now: every image on the site is still an unrelated `picsum`
 * placeholder. Replacing them is PRD open question #10, and it is the single
 * biggest thing between this build and a client review that shows the design
 * rather than the scaffolding.
 */
const LOCAL_PHOTOGRAPHY = new Set<string>([
  // 'levis-501-original-straight-jeans-mid-indigo',
])

/**
 * Frame filenames, matched to `SHOT_LIST` order. Flaw frames are named
 * `flaw-1`, `flaw-2`, … because their position in the sequence varies with how
 * many a garment has.
 */
function localPath(slug: string, id: string, kind: ProductImage['kind'], index: number): string {
  const name = kind === 'flaw' ? `flaw-${id.split('_').pop() ?? '1'}` : `${index + 1}-${kind}`
  return `/products/${slug}/${name}.jpg`
}

/**
 * The brief, in order. Exported so a photographer or a stylist can be handed the
 * list without reading a TypeScript file, and so the fixture set cannot drift
 * out of shape one product at a time.
 */
export const SHOT_LIST = [
  { kind: 'primary', frame: 'Garment alone, light grey ground, full bleed' },
  { kind: 'worn', frame: 'Model, full length, front, plain pale ground' },
  { kind: 'detail', frame: 'Worn close-up, upper body' },
  { kind: 'detail', frame: 'Hardware or construction crop' },
  { kind: 'worn', frame: 'Model, full length, back' },
  { kind: 'label', frame: 'Macro on collar, waistband or brand mark' },
] as const

/**
 * One frame.
 *
 * `slug` and `index` are only used to build a local path when the garment has
 * real photography; otherwise the seeded placeholder is stable so the same
 * garment always shows the same (unrelated) picture, which matters for review.
 */
function image(
  id: string,
  seed: string,
  alt: string,
  kind: ProductImage['kind'],
  slug?: string,
  index = 0,
): ProductImage {
  const local = slug !== undefined && LOCAL_PHOTOGRAPHY.has(slug)
  return {
    id,
    url: local ? localPath(slug, id, kind, index) : `https://picsum.photos/seed/${seed}/1200/1500`,
    alt,
    kind,
    aspectRatio: PORTRAIT,
  }
}

export const products: readonly Product[] = [
  // 1 — passport, pristine, outerwear. The editorial lead.
  {
    id: 'prd_bhaane_trucker_indigo',
    slug: 'bhaane-oversized-trucker-jacket-raw-indigo',
    sku: 'VP-2601-0148',
    title: 'Oversized trucker jacket in raw indigo',
    brand: 'Bhaane',
    category: 'outerwear',
    subcategory: 'Trucker jacket',
    condition: 'pristine',
    conditionNotes:
      'Unworn, tags attached. Raw selvedge that has never been washed — it will fade to whoever wears it, not to whoever owned it before.',
    flaws: [],
    measurements: { chest: 116, shoulder: 48, length: 66, sleeveLength: 61 },
    size: { label: 'M', system: 'IN', normalized: 'm' },
    priceInr: rupees(6_400),
    originalRetailInr: rupees(11_500),
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_bh_1',
        'vaapsi-denim-bh-1',
        'Raw indigo trucker jacket alone on a light grey ground, front, buttoned',
        'primary',
      ),
      image(
        'img_bh_2',
        'vaapsi-denim-bh-2',
        'Model wearing the trucker jacket open over a white tee, full length, front',
        'worn',
      ),
      image(
        'img_bh_3',
        'vaapsi-denim-bh-3',
        'Worn close-up of the chest yoke and button placket',
        'detail',
      ),
      image(
        'img_bh_4',
        'vaapsi-denim-bh-4',
        'Close crop of the copper rivet and chest pocket flap',
        'detail',
      ),
      image(
        'img_bh_5',
        'vaapsi-denim-bh-5',
        'Model wearing the trucker jacket, full length, back, showing the yoke seam',
        'worn',
      ),
      image(
        'img_bh_6',
        'vaapsi-denim-bh-6',
        'Macro of the collar and the woven brand label inside the neck',
        'label',
      ),
    ],
    passportId: 'psp_bhaane_trucker_indigo',
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-08-14T06:30:00.000Z',
  },

  // 2 — passport, good, jeans, documented flaws
  {
    id: 'prd_levis_501_indigo',
    slug: 'levis-501-original-straight-jeans-mid-indigo',
    sku: 'VP-2605-0902',
    title: '501 Original straight jeans in mid indigo',
    brand: 'Levi Strauss & Co.',
    category: 'bottoms',
    subcategory: 'Straight jeans',
    condition: 'good',
    conditionNotes:
      'Broken in properly. Even fade through the thigh and a soft hem — the wear pattern is the appeal here, not a defect.',
    flaws: [
      {
        description: 'Fraying along roughly 3 cm of the left hem where it has caught underfoot.',
        imageId: 'img_lv_flaw_1',
        location: 'Left hem',
      },
      {
        description: 'Small paint fleck, about 4 mm, on the right back pocket. Does not lift off.',
        imageId: 'img_lv_flaw_2',
        location: 'Right back pocket',
      },
    ],
    measurements: { waist: 78, hip: 100, inseam: 79, rise: 29, thigh: 30, hem: 18 },
    size: { label: '30', system: 'IN', normalized: 'w30' },
    priceInr: rupees(2_650),
    originalRetailInr: rupees(6_499),
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_lv_1',
        'vaapsi-denim-lv-1',
        '501 straight jeans laid flat on a light grey ground, front',
        'primary',
      ),
      image(
        'img_lv_2',
        'vaapsi-denim-lv-2',
        'Model wearing the 501s with a white tee, full length, front',
        'worn',
      ),
      image(
        'img_lv_3',
        'vaapsi-denim-lv-3',
        'Worn close-up of the waistband, fly and front pockets',
        'detail',
      ),
      image(
        'img_lv_4',
        'vaapsi-denim-lv-4',
        'Close crop of the fade pattern across the front thigh',
        'detail',
      ),
      image(
        'img_lv_flaw_1',
        'vaapsi-denim-lv-f1',
        'Fraying at the left hem, photographed close',
        'flaw',
      ),
      image(
        'img_lv_flaw_2',
        'vaapsi-denim-lv-f2',
        'Small paint fleck on the right back pocket, photographed close',
        'flaw',
      ),
      image('img_lv_5', 'vaapsi-denim-lv-5', 'Model wearing the 501s, full length, back', 'worn'),
      image(
        'img_lv_6',
        'vaapsi-denim-lv-6',
        'Macro of the leather waistband patch and the care label',
        'label',
      ),
    ],
    passportId: 'psp_levis_501_indigo',
    sellerId: 'sel_meher_k',
    listedAt: '2026-08-19T11:05:00.000Z',
  },

  // 3 — passport, excellent, skirt, reserved
  {
    id: 'prd_acne_denim_maxi_skirt',
    slug: 'acne-studios-denim-maxi-skirt-washed-blue',
    sku: 'VP-2604-0331',
    title: 'Denim maxi skirt in washed blue',
    brand: 'Acne Studios',
    category: 'bottoms',
    subcategory: 'Maxi skirt',
    condition: 'excellent',
    conditionNotes:
      'Worn four or five times across one summer. The wash is even, the back vent sits flat, and the zip runs clean.',
    flaws: [],
    measurements: { waist: 72, hip: 98, length: 92, hem: 68 },
    size: { label: '38', system: 'EU', normalized: 'm' },
    priceInr: rupees(9_800),
    originalRetailInr: rupees(24_990),
    currency: 'INR',
    // Someone is mid-checkout. On one-of-one inventory this is a normal state a
    // shopper will meet, not an edge case.
    availability: 'reserved',
    images: [
      image(
        'img_ac_1',
        'vaapsi-denim-ac-1',
        'Washed blue denim maxi skirt alone on a light grey ground, front',
        'primary',
      ),
      image(
        'img_ac_2',
        'vaapsi-denim-ac-2',
        'Model wearing the maxi skirt with a plain vest, full length, front',
        'worn',
      ),
      image(
        'img_ac_3',
        'vaapsi-denim-ac-3',
        'Worn close-up of the waistband and hip seam',
        'detail',
      ),
      image(
        'img_ac_4',
        'vaapsi-denim-ac-4',
        'Close crop of the topstitched back vent and hem',
        'detail',
      ),
      image(
        'img_ac_5',
        'vaapsi-denim-ac-5',
        'Model wearing the maxi skirt, full length, back',
        'worn',
      ),
      image(
        'img_ac_6',
        'vaapsi-denim-ac-6',
        'Macro of the interior waistband label and button',
        'label',
      ),
    ],
    passportId: 'psp_acne_denim_maxi_skirt',
    sellerId: 'sel_ananya_r',
    listedAt: '2026-07-30T09:15:00.000Z',
  },

  // 4 — passport, very_good, chambray dress
  {
    id: 'prd_nicobar_chambray_shirtdress',
    slug: 'nicobar-chambray-shirt-dress-indigo',
    sku: 'VP-2606-1177',
    title: 'Chambray shirt dress in indigo',
    brand: 'Nicobar',
    category: 'dresses',
    subcategory: 'Shirt dress',
    condition: 'very_good',
    conditionNotes:
      'A summer of regular wear. The chambray has softened the way it should and the colour is intact. Two spare buttons still in the pocket.',
    flaws: [
      {
        description: 'Faint shadow at the underarm, visible only inside out. Does not show worn.',
        imageId: 'img_nb_flaw_1',
        location: 'Left underarm, interior',
      },
    ],
    measurements: { chest: 100, waist: 96, hip: 104, shoulder: 42, length: 118, sleeveLength: 48 },
    size: { label: 'L', system: 'IN', normalized: 'l' },
    priceInr: rupees(2_200),
    originalRetailInr: rupees(5_800),
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_nb_1',
        'vaapsi-denim-nb-1',
        'Indigo chambray shirt dress alone on a light grey ground, front',
        'primary',
      ),
      image(
        'img_nb_2',
        'vaapsi-denim-nb-2',
        'Model wearing the shirt dress belted, full length, front',
        'worn',
      ),
      image(
        'img_nb_3',
        'vaapsi-denim-nb-3',
        'Worn close-up of the collar, placket and chest pocket',
        'detail',
      ),
      image('img_nb_4', 'vaapsi-denim-nb-4', 'Close crop of the cuff and its button', 'detail'),
      image(
        'img_nb_flaw_1',
        'vaapsi-denim-nb-f1',
        'Interior left underarm showing a faint shadow',
        'flaw',
      ),
      image(
        'img_nb_5',
        'vaapsi-denim-nb-5',
        'Model wearing the shirt dress, full length, back',
        'worn',
      ),
      image(
        'img_nb_6',
        'vaapsi-denim-nb-6',
        'Macro of the neck label and composition tag',
        'label',
      ),
    ],
    passportId: 'psp_nicobar_chambray_shirtdress',
    sellerId: 'sel_meher_k',
    listedAt: '2026-08-21T04:40:00.000Z',
  },

  // 5 — passport, well_loved, bag, repaired, sold
  {
    id: 'prd_diesel_denim_shoulder_bag',
    slug: 'diesel-denim-shoulder-bag-mid-wash',
    sku: 'VP-2602-0455',
    title: 'Denim shoulder bag with detachable sling',
    brand: 'Diesel',
    category: 'accessories',
    subcategory: 'Shoulder bag',
    condition: 'well_loved',
    conditionNotes:
      'Carried for years and it shows. One re-stitched strap anchor, done properly and visible. Priced for it. The repair is on the passport.',
    flaws: [
      {
        description: 'Re-stitched left strap anchor, in a matching thread. Sound, but visible.',
        imageId: 'img_dl_flaw_1',
        location: 'Left strap anchor',
      },
      {
        description: 'Denim rubbed pale along the bottom edge where it has sat down.',
        imageId: 'img_dl_flaw_2',
        location: 'Base edge',
      },
    ],
    // A bag has no garment measurements. `Measurements` is a partial record
    // precisely so this renders as three lines rather than nine with six blanks.
    measurements: { length: 28, hem: 15 },
    size: { label: 'One size', system: 'IN', normalized: 'one_size' },
    priceInr: rupees(3_900),
    originalRetailInr: rupees(18_500),
    currency: 'INR',
    // Sold. Kept in the fixture set because a sold garment still has a passport
    // worth reading, and the PDP has to render that state.
    availability: 'sold',
    images: [
      image(
        'img_dl_1',
        'vaapsi-denim-dl-1',
        'Mid-wash denim shoulder bag alone on a light grey ground, buckle forward',
        'primary',
      ),
      image(
        'img_dl_2',
        'vaapsi-denim-dl-2',
        'Model carrying the bag on the shoulder, full length, front',
        'worn',
      ),
      image(
        'img_dl_3',
        'vaapsi-denim-dl-3',
        'Worn close-up of the bag against the hip, sling attached',
        'detail',
      ),
      image(
        'img_dl_4',
        'vaapsi-denim-dl-4',
        'Close crop of the antique brass buckle and strap keeper',
        'detail',
      ),
      image(
        'img_dl_flaw_1',
        'vaapsi-denim-dl-f1',
        'Re-stitched left strap anchor, photographed close',
        'flaw',
      ),
      image(
        'img_dl_flaw_2',
        'vaapsi-denim-dl-f2',
        'Pale rubbed denim along the base edge, photographed close',
        'flaw',
      ),
      image(
        'img_dl_5',
        'vaapsi-denim-dl-5',
        'Model carrying the bag, full length, back, sling across the body',
        'worn',
      ),
      image(
        'img_dl_6',
        'vaapsi-denim-dl-6',
        'Macro of the embossed brand mark on the interior patch',
        'label',
      ),
    ],
    passportId: 'psp_diesel_denim_shoulder_bag',
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-05-11T07:20:00.000Z',
  },

  // 6 — NO passport, good, waistcoat
  {
    id: 'prd_zara_denim_waistcoat',
    slug: 'zara-denim-waistcoat-light-wash',
    sku: 'VP-2607-1402',
    title: 'Denim waistcoat in light wash',
    brand: 'Zara',
    category: 'tops',
    subcategory: 'Waistcoat',
    condition: 'good',
    conditionNotes:
      'Light wash, worn a season. All five buttons original, the back tie is intact, and the armholes have kept their shape.',
    flaws: [
      {
        description: 'Two small pulls in the weave near the left armhole.',
        imageId: 'img_zr_flaw_1',
        location: 'Left armhole',
      },
    ],
    measurements: { chest: 96, shoulder: 36, length: 52 },
    size: { label: 'M', system: 'EU', normalized: 'm' },
    priceInr: rupees(1_450),
    originalRetailInr: rupees(4_990),
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_zr_1',
        'vaapsi-denim-zr-1',
        'Light wash denim waistcoat alone on a light grey ground, front',
        'primary',
      ),
      image(
        'img_zr_2',
        'vaapsi-denim-zr-2',
        'Model wearing the waistcoat over wide trousers, full length, front',
        'worn',
      ),
      image(
        'img_zr_3',
        'vaapsi-denim-zr-3',
        'Worn close-up of the button front and welt pockets',
        'detail',
      ),
      image(
        'img_zr_4',
        'vaapsi-denim-zr-4',
        'Close crop of the shoulder seam and topstitching',
        'detail',
      ),
      image(
        'img_zr_flaw_1',
        'vaapsi-denim-zr-f1',
        'Two small pulls in the weave near the left armhole',
        'flaw',
      ),
      image(
        'img_zr_5',
        'vaapsi-denim-zr-5',
        'Model wearing the waistcoat, full length, back, showing the tie',
        'worn',
      ),
      image(
        'img_zr_6',
        'vaapsi-denim-zr-6',
        'Macro of the interior label and button shank',
        'label',
      ),
    ],
    // No passport. Three of the eight fixtures are like this on purpose.
    passportId: null,
    sellerId: 'sel_devika_s',
    listedAt: '2026-08-20T13:50:00.000Z',
  },

  // 7 — NO passport, excellent, jumpsuit, original retail unknown
  {
    id: 'prd_cos_denim_jumpsuit',
    slug: 'cos-denim-jumpsuit-mid-wash',
    sku: 'VP-2607-1519',
    title: 'Denim jumpsuit in mid wash',
    brand: 'COS',
    category: 'dresses',
    subcategory: 'Jumpsuit',
    condition: 'excellent',
    conditionNotes:
      'Worn twice. Utility pockets still crisp, the belt is present, and the zip runs the full length without catching.',
    flaws: [],
    measurements: { chest: 98, waist: 88, hip: 106, shoulder: 40, inseam: 74, length: 148 },
    size: { label: 'S', system: 'IN', normalized: 's' },
    priceInr: rupees(7_500),
    // Genuinely unknown. Left null rather than estimated, because a made-up
    // original price manufactures a discount that is not real.
    originalRetailInr: null,
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_cs_1',
        'vaapsi-denim-cs-1',
        'Mid-wash denim jumpsuit alone on a light grey ground, front, belted',
        'primary',
      ),
      image(
        'img_cs_2',
        'vaapsi-denim-cs-2',
        'Model wearing the jumpsuit belted, full length, front',
        'worn',
      ),
      image(
        'img_cs_3',
        'vaapsi-denim-cs-3',
        'Worn close-up of the collar, zip and chest pockets',
        'detail',
      ),
      image(
        'img_cs_4',
        'vaapsi-denim-cs-4',
        'Close crop of the utility thigh pocket and its flap',
        'detail',
      ),
      image(
        'img_cs_5',
        'vaapsi-denim-cs-5',
        'Model wearing the jumpsuit, full length, back',
        'worn',
      ),
      image('img_cs_6', 'vaapsi-denim-cs-6', 'Macro of the zip pull and interior label', 'label'),
    ],
    passportId: null,
    sellerId: 'sel_ananya_r',
    listedAt: '2026-08-22T08:10:00.000Z',
  },

  // 8 — NO passport, very_good, wide-leg jeans
  {
    id: 'prd_uniqlo_wide_leg_jeans',
    slug: 'uniqlo-wide-leg-jeans-rinse-blue',
    sku: 'VP-2608-1633',
    title: 'Wide-leg jeans in rinse blue',
    brand: 'Uniqlo',
    category: 'bottoms',
    subcategory: 'Wide-leg jeans',
    condition: 'very_good',
    conditionNotes:
      'Rinse-wash, barely faded. Hem taken up once by a tailor and finished with the original chain stitch, so it reads as factory.',
    flaws: [],
    measurements: { waist: 84, hip: 106, inseam: 76, rise: 31, thigh: 34, hem: 26 },
    size: { label: '32', system: 'IN', normalized: 'w32' },
    priceInr: rupees(1_900),
    originalRetailInr: rupees(3_990),
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_uq_1',
        'vaapsi-denim-uq-1',
        'Rinse blue wide-leg jeans laid flat on a light grey ground, front',
        'primary',
      ),
      image(
        'img_uq_2',
        'vaapsi-denim-uq-2',
        'Model wearing the wide-leg jeans with a tucked shirt, full length, front',
        'worn',
      ),
      image(
        'img_uq_3',
        'vaapsi-denim-uq-3',
        'Worn close-up of the waistband and front pleat of the leg',
        'detail',
      ),
      image('img_uq_4', 'vaapsi-denim-uq-4', 'Close crop of the chain-stitched hem', 'detail'),
      image(
        'img_uq_5',
        'vaapsi-denim-uq-5',
        'Model wearing the wide-leg jeans, full length, back',
        'worn',
      ),
      image(
        'img_uq_6',
        'vaapsi-denim-uq-6',
        'Macro of the interior composition label at the waistband',
        'label',
      ),
    ],
    passportId: null,
    sellerId: 'sel_devika_s',
    listedAt: '2026-08-22T15:25:00.000Z',
  },
]
