import { rupees } from '@/lib/format/currency'
import type { Product, ProductImage } from '@/lib/types'

/**
 * Eight fixture garments. Clothing and apparel only — no home textiles.
 *
 * Five carry a passport, three do not, so every surface is forced to handle the
 * absent case rather than assuming it away. Condition, brand, price and
 * category all vary, and one garment is `reserved` while another is `sold` so
 * the single-unit availability states get exercised too.
 *
 * Copy is deliberately specific. Placeholder text makes a client see
 * placeholder design.
 */

const PORTRAIT = 3 / 4

function image(id: string, seed: string, alt: string, kind: ProductImage['kind']): ProductImage {
  return {
    id,
    url: `https://picsum.photos/seed/${seed}/1200/1600`,
    alt,
    kind,
    aspectRatio: PORTRAIT,
  }
}

export const products: readonly Product[] = [
  // 1 — passport, pristine, ethnicwear, Vaapsi-held
  {
    id: 'prd_rawmango_chanderi_kurta',
    slug: 'raw-mango-chanderi-silk-kurta-ivory',
    sku: 'VP-2601-0148',
    title: 'Chanderi silk kurta in ivory',
    brand: 'Raw Mango',
    category: 'ethnicwear',
    subcategory: 'Kurta',
    condition: 'pristine',
    conditionNotes:
      'Unworn, with the original tag still attached at the side seam. Bought for a wedding that was postponed.',
    flaws: [],
    measurements: { chest: 52, shoulder: 40, length: 104, sleeveLength: 58 },
    size: { label: 'M', system: 'IN', normalized: 'm' },
    priceInr: rupees(11_400),
    originalRetailInr: rupees(18_500),
    currency: 'INR',
    availability: 'available',
    images: [
      image('img_rm_1', 'vaapsi-rm-kurta-a', 'Ivory Chanderi silk kurta on a hanger', 'primary'),
      image('img_rm_2', 'vaapsi-rm-kurta-b', 'Zari border detail at the hem', 'detail'),
      image('img_rm_3', 'vaapsi-rm-kurta-c', 'Original brand tag at the side seam', 'label'),
      image('img_rm_4', 'vaapsi-rm-kurta-d', 'Kurta worn with straight trousers', 'worn'),
    ],
    passportId: 'psp_rawmango_chanderi_kurta',
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-08-14T06:30:00.000Z',
  },

  // 2 — passport, good, denim, documented flaws
  {
    id: 'prd_levis_501_indigo',
    slug: 'levis-501-original-straight-jeans-mid-indigo',
    sku: 'VP-2605-0902',
    title: '501 Original straight jeans in mid indigo',
    brand: 'Levi Strauss & Co.',
    category: 'bottoms',
    subcategory: 'Jeans',
    condition: 'good',
    conditionNotes:
      'Broken in properly. Even fade through the thigh and a soft hem — the wear pattern is the appeal here, not a defect.',
    flaws: [
      {
        description: 'Fraying along roughly 3 cm of the left hem where it has caught underfoot.',
        imageId: 'img_lv_3',
        location: 'Left hem',
      },
      {
        description: 'Small paint fleck, about 4 mm, on the right back pocket. Does not lift off.',
        imageId: 'img_lv_4',
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
      image('img_lv_1', 'vaapsi-levis-a', '501 straight jeans laid flat, mid indigo', 'primary'),
      image('img_lv_2', 'vaapsi-levis-b', 'Fade pattern across the front thigh', 'detail'),
      image('img_lv_3', 'vaapsi-levis-c', 'Fraying at the left hem', 'flaw'),
      image('img_lv_4', 'vaapsi-levis-d', 'Paint fleck on the right back pocket', 'flaw'),
      image('img_lv_5', 'vaapsi-levis-e', 'Waistband patch and care label', 'label'),
    ],
    passportId: 'psp_levis_501_indigo',
    sellerId: 'sel_meher_k',
    listedAt: '2026-08-19T11:05:00.000Z',
  },

  // 3 — passport, excellent, outerwear, reserved
  {
    id: 'prd_cos_wool_coat_stone',
    slug: 'cos-wool-blend-belted-coat-stone',
    sku: 'VP-2604-0331',
    title: 'Wool-blend belted coat in stone',
    brand: 'COS',
    category: 'outerwear',
    subcategory: 'Coat',
    condition: 'excellent',
    conditionNotes:
      'Worn through one Delhi winter, four or five times. Dry-cleaned before listing, and the cleaner is recorded on the passport.',
    flaws: [],
    measurements: { chest: 108, shoulder: 46, length: 112, sleeveLength: 62 },
    size: { label: '38', system: 'EU', normalized: 'm' },
    priceInr: rupees(9_800),
    originalRetailInr: rupees(24_990),
    currency: 'INR',
    // Someone is mid-checkout. On one-of-one inventory this is a normal state a
    // shopper will meet, not an edge case.
    availability: 'reserved',
    images: [
      image('img_cos_1', 'vaapsi-cos-coat-a', 'Stone wool-blend belted coat, front', 'primary'),
      image('img_cos_2', 'vaapsi-cos-coat-b', 'Belt tied at the waist', 'detail'),
      image(
        'img_cos_3',
        'vaapsi-cos-coat-c',
        'Composition and care label inside the collar',
        'label',
      ),
      image('img_cos_4', 'vaapsi-cos-coat-d', 'Coat worn open over knitwear', 'worn'),
    ],
    passportId: 'psp_cos_wool_coat_stone',
    sellerId: 'sel_ananya_r',
    listedAt: '2026-07-30T09:15:00.000Z',
  },

  // 4 — passport, very_good, dresses
  {
    id: 'prd_nicobar_poplin_shirtdress',
    slug: 'nicobar-cotton-poplin-shirt-dress-indigo-stripe',
    sku: 'VP-2606-1177',
    title: 'Cotton poplin shirt dress, indigo stripe',
    brand: 'Nicobar',
    category: 'dresses',
    subcategory: 'Shirt dress',
    condition: 'very_good',
    conditionNotes:
      'A summer of regular wear. The fabric has softened, the colour is intact. Two spare buttons are still in the pocket.',
    flaws: [
      {
        description: 'Faint shadow at the underarm, visible only inside out. Does not show worn.',
        imageId: 'img_nb_3',
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
      image('img_nb_1', 'vaapsi-nicobar-a', 'Indigo striped cotton shirt dress, front', 'primary'),
      image('img_nb_2', 'vaapsi-nicobar-b', 'Collar and placket detail', 'detail'),
      image('img_nb_3', 'vaapsi-nicobar-c', 'Interior underarm showing a faint shadow', 'flaw'),
      image('img_nb_4', 'vaapsi-nicobar-d', 'Dress worn belted', 'worn'),
    ],
    passportId: 'psp_nicobar_poplin_shirtdress',
    sellerId: 'sel_meher_k',
    listedAt: '2026-08-21T04:40:00.000Z',
  },

  // 5 — passport, well_loved, knitwear, repaired, sold
  {
    id: 'prd_uniqlo_merino_crew_navy',
    slug: 'uniqlo-extra-fine-merino-crewneck-navy',
    sku: 'VP-2602-0455',
    title: 'Extra Fine Merino crewneck in navy',
    brand: 'Uniqlo',
    category: 'knitwear',
    subcategory: 'Sweater',
    condition: 'well_loved',
    conditionNotes:
      'Five winters of wear and one visible mend at the right elbow, darned in a close navy. Priced for it. The mend is on the passport as a repair event.',
    flaws: [
      {
        description: 'Darned patch, roughly 2 cm, at the right elbow. Sound, but visible up close.',
        imageId: 'img_uq_3',
        location: 'Right elbow',
      },
      {
        description: 'Light pilling under both arms from bag straps.',
        imageId: 'img_uq_4',
        location: 'Underarms',
      },
    ],
    measurements: { chest: 98, shoulder: 43, length: 66, sleeveLength: 61 },
    size: { label: 'S', system: 'IN', normalized: 's' },
    priceInr: rupees(690),
    originalRetailInr: rupees(2_990),
    currency: 'INR',
    // Sold. Kept in the fixture set because a sold garment still has a passport
    // worth reading, and the PDP has to render that state.
    availability: 'sold',
    images: [
      image('img_uq_1', 'vaapsi-uniqlo-a', 'Navy merino crewneck sweater, flat', 'primary'),
      image('img_uq_2', 'vaapsi-uniqlo-b', 'Ribbed cuff and hem', 'detail'),
      image('img_uq_3', 'vaapsi-uniqlo-c', 'Darned mend at the right elbow', 'flaw'),
      image('img_uq_4', 'vaapsi-uniqlo-d', 'Light pilling under the arm', 'flaw'),
    ],
    passportId: 'psp_uniqlo_merino_crew_navy',
    sellerId: 'sel_vaapsi_studio',
    listedAt: '2026-05-11T07:20:00.000Z',
  },

  // 6 — NO passport, good, suiting
  {
    id: 'prd_zara_linen_blazer_sand',
    slug: 'zara-linen-blend-single-breasted-blazer-sand',
    sku: 'VP-2607-1402',
    title: 'Linen-blend single-breasted blazer in sand',
    brand: 'Zara',
    category: 'suiting',
    subcategory: 'Blazer',
    condition: 'good',
    conditionNotes: 'Creases as linen does. The lining is sound and all four buttons are original.',
    flaws: [
      {
        description: 'Two small pulls on the left sleeve, near the cuff.',
        imageId: 'img_zr_3',
        location: 'Left sleeve, near cuff',
      },
    ],
    measurements: { chest: 104, shoulder: 44, length: 72, sleeveLength: 60, cuff: 14 },
    size: { label: 'M', system: 'EU', normalized: 'm' },
    priceInr: rupees(1_450),
    originalRetailInr: rupees(4_990),
    currency: 'INR',
    availability: 'available',
    images: [
      image('img_zr_1', 'vaapsi-zara-a', 'Sand linen-blend blazer, front', 'primary'),
      image('img_zr_2', 'vaapsi-zara-b', 'Notch lapel and chest pocket', 'detail'),
      image('img_zr_3', 'vaapsi-zara-c', 'Two pulls on the left sleeve', 'flaw'),
    ],
    // No passport. Three of the eight fixtures are like this on purpose.
    passportId: null,
    sellerId: 'sel_devika_s',
    listedAt: '2026-08-20T13:50:00.000Z',
  },

  // 7 — NO passport, excellent, ethnicwear, original retail unknown
  {
    id: 'prd_anitadongre_anarkali_rose',
    slug: 'anita-dongre-silk-cotton-anarkali-dusty-rose',
    sku: 'VP-2607-1519',
    title: 'Silk-cotton anarkali in dusty rose',
    brand: 'Anita Dongre',
    category: 'ethnicwear',
    subcategory: 'Anarkali',
    condition: 'excellent',
    conditionNotes:
      'Worn once, to a mehndi. The hand-block print is crisp throughout. Comes with the matching dupatta.',
    flaws: [],
    measurements: { chest: 92, waist: 84, length: 138, shoulder: 38, sleeveLength: 46 },
    size: { label: 'S', system: 'IN', normalized: 's' },
    priceInr: rupees(14_500),
    // Genuinely unknown. Left null rather than estimated, because a made-up
    // original price manufactures a discount that is not real.
    originalRetailInr: null,
    currency: 'INR',
    availability: 'available',
    images: [
      image(
        'img_ad_1',
        'vaapsi-dongre-a',
        'Dusty rose silk-cotton anarkali, full length',
        'primary',
      ),
      image('img_ad_2', 'vaapsi-dongre-b', 'Hand-block print detail at the bodice', 'detail'),
      image('img_ad_3', 'vaapsi-dongre-c', 'Matching dupatta folded', 'detail'),
      image('img_ad_4', 'vaapsi-dongre-d', 'Anarkali worn with the dupatta draped', 'worn'),
    ],
    passportId: null,
    sellerId: 'sel_ananya_r',
    listedAt: '2026-08-22T08:10:00.000Z',
  },

  // 8 — NO passport, very_good, bottoms
  {
    id: 'prd_massimo_pleated_trousers_black',
    slug: 'massimo-dutti-pleated-tailored-trousers-black',
    sku: 'VP-2608-1633',
    title: 'Pleated tailored trousers in black',
    brand: 'Massimo Dutti',
    category: 'bottoms',
    subcategory: 'Trousers',
    condition: 'very_good',
    conditionNotes:
      'Office wear, looked after. The pleats hold and there is no shine at the seat. The hem was let down once by a tailor and sits clean.',
    flaws: [],
    measurements: { waist: 84, hip: 106, inseam: 76, rise: 31, thigh: 32, hem: 21 },
    size: { label: '32', system: 'IN', normalized: 'w32' },
    priceInr: rupees(3_100),
    originalRetailInr: rupees(9_990),
    currency: 'INR',
    availability: 'available',
    images: [
      image('img_md_1', 'vaapsi-massimo-a', 'Black pleated tailored trousers, flat', 'primary'),
      image('img_md_2', 'vaapsi-massimo-b', 'Front pleat and waistband detail', 'detail'),
      image('img_md_3', 'vaapsi-massimo-c', 'Interior composition label', 'label'),
    ],
    passportId: null,
    sellerId: 'sel_devika_s',
    listedAt: '2026-08-22T15:25:00.000Z',
  },
]
