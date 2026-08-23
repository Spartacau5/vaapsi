import { sourced } from '@/lib/types'
import type { CareInstruction, Passport } from '@/lib/types'

/**
 * Five fixture passports, for five of the eight fixture garments.
 *
 * They vary along every axis the UI has to survive:
 *
 * - `isVoluntary` false on exactly one (the COS coat — a European brand with a
 *   real regulatory passport). Every other one is published by choice, and the
 *   UI must say so rather than implying regulatory backing it does not have.
 * - One passport (`nicobar`) carries **no** `impact` block, because there is no
 *   defensible basis for the numbers. The UI must render a passport without it.
 * - One passport (`levis`) carries a **correction**. The original declaration is
 *   still there, wrong, alongside the fix.
 * - One passport (`nicobar`) has `authentication.method === 'none'`.
 * - Provenance is mixed throughout, including `ai_extracted` and
 *   `self_declared`, so the source badges have something honest to show.
 */

const REGISTRY = { name: 'EuFSI', url: 'https://registry.eufsi.example/lookup' }

const CARE_COTTON: readonly CareInstruction[] = [
  { code: 'wash_30', label: 'Machine wash at 30°C', icon: 'wash-30' },
  { code: 'no_bleach', label: 'Do not bleach', icon: 'no-bleach' },
  { code: 'iron_low', label: 'Iron on low heat', icon: 'iron-low' },
  { code: 'no_tumble', label: 'Do not tumble dry', icon: 'no-tumble' },
]

const CARE_SILK: readonly CareInstruction[] = [
  { code: 'dryclean_only', label: 'Dry clean only', icon: 'dryclean' },
  { code: 'no_bleach', label: 'Do not bleach', icon: 'no-bleach' },
  { code: 'iron_low', label: 'Iron on low heat, reverse side', icon: 'iron-low' },
]

const CARE_WOOL: readonly CareInstruction[] = [
  { code: 'handwash', label: 'Hand wash cold', icon: 'handwash' },
  { code: 'dry_flat', label: 'Dry flat in shade', icon: 'dry-flat' },
  { code: 'no_tumble', label: 'Do not tumble dry', icon: 'no-tumble' },
  { code: 'no_wring', label: 'Do not wring', icon: 'no-wring' },
]

export const passports: readonly Passport[] = [
  // ------------------------------------------------------------------ 1
  {
    id: 'psp_rawmango_chanderi_kurta',
    productId: 'prd_rawmango_chanderi_kurta',
    uniqueProductId: 'https://registry.eufsi.example/dpp/IN-RM-2024-0009812',
    productNo: 'RM-CH-KRT-IVY-M',
    dppVersion: '1.2',
    signedAt: '2026-08-14T06:12:00.000Z',
    issuer: 'Vaapsi',
    registry: REGISTRY,
    lastUpdated: '2026-08-14T06:12:00.000Z',

    placeOfOrigin: sourced('Chanderi, Madhya Pradesh, India', 'supplier'),
    manufacturingCountry: sourced('India', 'supplier'),
    manufacturer: sourced('Raw Mango — Chanderi weaver cluster', 'supplier'),

    materials: [
      {
        name: sourced('Silk', 'supplier'),
        percentage: sourced(70, 'supplier'),
        isRecycled: sourced(false, 'supplier'),
        provenance: sourced('Karnataka, India', 'supplier'),
      },
      {
        name: sourced('Cotton', 'supplier'),
        percentage: sourced(30, 'supplier'),
        isRecycled: sourced(false, 'supplier'),
        provenance: sourced('Madhya Pradesh, India', 'self_declared'),
      },
    ],
    careInstructions: CARE_SILK,
    endOfLife: {
      recyclerLookupUrl: 'https://vaapsi.example/recycle/silk-cotton',
      collectionPointUrl: 'https://vaapsi.example/collect',
    },

    originalDeclaration: {
      declaredAt: '2026-08-14T06:12:00.000Z',
      declaredBy: 'Vaapsi Studio, New Delhi',
      snapshot: {
        materials: [
          { name: 'Silk', percentage: 70 },
          { name: 'Cotton', percentage: 30 },
        ],
        placeOfOrigin: 'Chanderi, Madhya Pradesh, India',
        condition: 'pristine',
      },
    },
    corrections: [],
    isVoluntary: true,

    chain: [
      {
        id: 'evt_rm_1',
        type: 'made',
        date: '2024-09-02',
        actor: 'Chanderi weaver cluster, Madhya Pradesh',
        note: 'Hand-woven on a pit loom. Approximately 11 days on the loom.',
        verification: sourced('Weaver cooperative production record', 'supplier'),
      },
      {
        id: 'evt_rm_2',
        type: 'first_sold',
        date: '2024-11-18',
        actor: 'Raw Mango flagship, New Delhi',
        note: null,
        verification: sourced(
          'Original retail invoice supplied by the seller',
          'verified',
          '2026-08-13T10:04:00.000Z',
        ),
      },
      {
        id: 'evt_rm_3',
        type: 'owned',
        date: '2024-11-18',
        actor: 'First owner, New Delhi',
        note: 'Never worn. Bought for a wedding that was postponed.',
        verification: sourced('Stated by the owner at intake', 'self_declared'),
      },
      {
        id: 'evt_rm_4',
        type: 'inspected',
        date: '2026-08-13',
        actor: 'Vaapsi Studio, New Delhi',
        note: 'Original tag intact at the side seam. No wear anywhere on the garment.',
        verification: sourced(
          'In-house inspection, two-person sign-off',
          'verified',
          '2026-08-13T11:20:00.000Z',
        ),
      },
      {
        id: 'evt_rm_5',
        type: 'relisted',
        date: '2026-08-14',
        actor: 'Vaapsi',
        note: null,
        verification: sourced('Platform listing record', 'verified', '2026-08-14T06:30:00.000Z'),
      },
    ],
    ownersCount: 1,
    authentication: {
      method: 'in_house_inspection',
      verifiedBy: 'Vaapsi Studio, New Delhi',
      verifiedAt: '2026-08-13T11:20:00.000Z',
    },
    impact: {
      waterLitresSaved: 2_700,
      co2KgSaved: 6.4,
      basis:
        'Ellen MacArthur Foundation, A New Textiles Economy (2017) — silk-cotton blend garment baseline, adjusted for Indian production. Compared against manufacturing one new equivalent garment.',
    },
  },

  // ------------------------------------------------------------------ 2
  {
    id: 'psp_levis_501_indigo',
    productId: 'prd_levis_501_indigo',
    uniqueProductId: 'https://registry.eufsi.example/dpp/IN-LV-2021-0447190',
    productNo: '00501-3421-W30-L32',
    dppVersion: '1.2',
    signedAt: '2026-08-19T10:44:00.000Z',
    issuer: 'Vaapsi',
    registry: REGISTRY,
    lastUpdated: '2026-08-20T07:02:00.000Z',

    placeOfOrigin: sourced('Unknown — label removed before intake', 'self_declared'),
    manufacturingCountry: sourced('Bangladesh', 'ai_extracted'),
    manufacturer: sourced('Not recorded', 'self_declared'),

    materials: [
      {
        name: sourced('Cotton', 'ai_extracted'),
        percentage: sourced(99, 'ai_extracted'),
        isRecycled: sourced(false, 'ai_extracted'),
        provenance: sourced(null, 'ai_suggested'),
      },
      {
        name: sourced('Elastane', 'ai_extracted'),
        percentage: sourced(1, 'ai_extracted'),
        isRecycled: sourced(false, 'ai_extracted'),
        provenance: sourced(null, 'ai_suggested'),
      },
    ],
    careInstructions: CARE_COTTON,
    endOfLife: {
      recyclerLookupUrl: 'https://vaapsi.example/recycle/denim',
      collectionPointUrl: 'https://vaapsi.example/collect',
    },

    originalDeclaration: {
      declaredAt: '2026-08-19T10:44:00.000Z',
      declaredBy: 'Meher, Bengaluru',
      snapshot: {
        // Wrong at first publication. Corrected below, not overwritten — this is
        // the whole reason the original declaration is immutable.
        materials: [{ name: 'Cotton', percentage: 100 }],
        manufacturingCountry: 'India',
        condition: 'very_good',
      },
    },
    corrections: [
      {
        id: 'cor_lv_1',
        correctedAt: '2026-08-20T07:02:00.000Z',
        correctedBy: 'Vaapsi Studio, New Delhi',
        field: 'materials',
        previousValue: [{ name: 'Cotton', percentage: 100 }],
        newValue: [
          { name: 'Cotton', percentage: 99 },
          { name: 'Elastane', percentage: 1 },
        ],
        reason:
          'Composition label read at intake shows 1% elastane. The seller had declared 100% cotton from memory.',
      },
      {
        id: 'cor_lv_2',
        correctedAt: '2026-08-20T07:04:00.000Z',
        correctedBy: 'Vaapsi Studio, New Delhi',
        field: 'condition',
        previousValue: 'very_good',
        newValue: 'good',
        reason:
          'Regraded down after inspection. Hem fraying and a paint fleck are documented as flaws.',
      },
    ],
    isVoluntary: true,

    chain: [
      {
        id: 'evt_lv_1',
        type: 'made',
        date: '2021-03-01',
        actor: 'Contract manufacturer, Bangladesh',
        note: 'Month of manufacture read off the interior stamp. Day not legible.',
        verification: sourced('Interior stamp, photographed at intake', 'ai_extracted'),
      },
      {
        id: 'evt_lv_2',
        type: 'first_sold',
        date: '2021-06-12',
        actor: 'Retailer, Bengaluru',
        note: 'No invoice. Date is the owner recollection.',
        verification: sourced('Stated by the owner at intake', 'self_declared'),
      },
      {
        id: 'evt_lv_3',
        type: 'owned',
        date: '2021-06-12',
        actor: 'First owner, Bengaluru',
        note: 'Five years of regular wear. The fade is the result.',
        verification: sourced('Stated by the owner at intake', 'self_declared'),
      },
      {
        id: 'evt_lv_5',
        type: 'relisted',
        date: '2026-08-19',
        actor: 'Vaapsi',
        note: null,
        verification: sourced('Platform listing record', 'verified', '2026-08-19T11:05:00.000Z'),
      },
      {
        id: 'evt_lv_4',
        type: 'inspected',
        date: '2026-08-20',
        actor: 'Vaapsi Studio, New Delhi',
        note: 'Regraded from very good to good. Two flaws documented and photographed.',
        verification: sourced(
          'In-house inspection, two-person sign-off',
          'verified',
          '2026-08-20T07:00:00.000Z',
        ),
      },
    ],
    ownersCount: 1,
    authentication: {
      method: 'in_house_inspection',
      verifiedBy: 'Vaapsi Studio, New Delhi',
      verifiedAt: '2026-08-20T07:00:00.000Z',
    },
    impact: {
      waterLitresSaved: 3_781,
      co2KgSaved: 33.4,
      basis:
        'Levi Strauss & Co. Life Cycle Assessment of a Pair of 501 Jeans (2015), full-lifecycle figures. Compared against manufacturing one new equivalent pair.',
    },
  },

  // ------------------------------------------------------------------ 3
  {
    id: 'psp_cos_wool_coat_stone',
    productId: 'prd_cos_wool_coat_stone',
    uniqueProductId: 'https://registry.eufsi.example/dpp/SE-COS-2024-0918334',
    productNo: '1201948001-038',
    dppVersion: '1.4',
    signedAt: '2024-08-30T00:00:00.000Z',
    // Brand-issued rather than Vaapsi-issued. The storefront must be able to
    // show that the record predates Vaapsi and was not written by us.
    issuer: 'COS (H&M Group)',
    registry: REGISTRY,
    lastUpdated: '2026-07-30T09:00:00.000Z',

    placeOfOrigin: sourced('Biella, Piedmont, Italy', 'supplier'),
    manufacturingCountry: sourced('Portugal', 'supplier'),
    manufacturer: sourced('Confeccoes do Ave, Guimaraes', 'supplier'),

    materials: [
      {
        name: sourced('Virgin wool', 'supplier'),
        percentage: sourced(62, 'supplier'),
        isRecycled: sourced(false, 'supplier'),
        provenance: sourced('Biella, Italy', 'supplier'),
      },
      {
        name: sourced('Recycled polyester', 'supplier'),
        percentage: sourced(30, 'supplier'),
        isRecycled: sourced(true, 'supplier'),
        provenance: sourced('Post-consumer PET, Taiwan', 'supplier'),
      },
      {
        name: sourced('Polyamide', 'supplier'),
        percentage: sourced(8, 'supplier'),
        isRecycled: sourced(false, 'supplier'),
        provenance: sourced(null, 'supplier'),
      },
    ],
    careInstructions: CARE_WOOL,
    endOfLife: {
      recyclerLookupUrl: 'https://registry.eufsi.example/recyclers?material=wool-blend',
      collectionPointUrl: 'https://vaapsi.example/collect',
    },

    originalDeclaration: {
      declaredAt: '2024-08-30T00:00:00.000Z',
      declaredBy: 'COS (H&M Group)',
      snapshot: {
        materials: [
          { name: 'Virgin wool', percentage: 62 },
          { name: 'Recycled polyester', percentage: 30 },
          { name: 'Polyamide', percentage: 8 },
        ],
        manufacturingCountry: 'Portugal',
        placeOfOrigin: 'Biella, Piedmont, Italy',
      },
    },
    corrections: [],
    // The one non-voluntary passport in the set: issued under EU regulation by
    // the brand, not published by choice by Vaapsi.
    isVoluntary: false,

    chain: [
      {
        id: 'evt_cos_1',
        type: 'made',
        date: '2024-08-30',
        actor: 'Confeccoes do Ave, Guimaraes, Portugal',
        note: null,
        verification: sourced('Brand-issued passport at manufacture', 'supplier'),
      },
      {
        id: 'evt_cos_2',
        type: 'first_sold',
        date: '2024-11-06',
        actor: 'COS, Select Citywalk, New Delhi',
        note: null,
        verification: sourced(
          'Original retail invoice supplied by the seller',
          'verified',
          '2026-07-29T09:30:00.000Z',
        ),
      },
      {
        id: 'evt_cos_3',
        type: 'owned',
        date: '2024-11-06',
        actor: 'First owner, Mumbai',
        note: 'Worn four or five times across one winter.',
        verification: sourced('Stated by the owner at intake', 'self_declared'),
      },
      {
        id: 'evt_cos_4',
        type: 'repaired',
        date: '2026-07-24',
        actor: 'Sunshine Dry Cleaners, Bandra, Mumbai',
        note: 'Professionally dry-cleaned and pressed. No structural repair needed.',
        verification: sourced(
          'Dry cleaner receipt, photographed at intake',
          'verified',
          '2026-07-29T09:34:00.000Z',
        ),
      },
      {
        id: 'evt_cos_5',
        type: 'inspected',
        date: '2026-07-29',
        actor: 'Vaapsi Studio, New Delhi',
        note: 'No pilling, no moth damage, belt and all buttons present. Graded excellent.',
        verification: sourced(
          'In-house inspection, two-person sign-off',
          'verified',
          '2026-07-29T10:10:00.000Z',
        ),
      },
      {
        id: 'evt_cos_6',
        type: 'relisted',
        date: '2026-07-30',
        actor: 'Vaapsi',
        note: null,
        verification: sourced('Platform listing record', 'verified', '2026-07-30T09:15:00.000Z'),
      },
    ],
    ownersCount: 1,
    authentication: {
      method: 'brand_partner',
      verifiedBy: 'COS (H&M Group) — passport signature validated against registry',
      verifiedAt: '2026-07-29T09:20:00.000Z',
    },
    impact: {
      waterLitresSaved: 8_400,
      co2KgSaved: 41.2,
      basis:
        'Textile Exchange Preferred Fiber & Materials Market Report (2023) — wool-blend outerwear baseline. Compared against manufacturing one new equivalent coat.',
    },
  },

  // ------------------------------------------------------------------ 4
  {
    id: 'psp_nicobar_poplin_shirtdress',
    productId: 'prd_nicobar_poplin_shirtdress',
    uniqueProductId: 'https://registry.eufsi.example/dpp/IN-NB-2025-0221765',
    productNo: 'NB-SD-POP-IND-L',
    dppVersion: '1.2',
    signedAt: '2026-08-21T04:20:00.000Z',
    issuer: 'Vaapsi',
    registry: REGISTRY,
    lastUpdated: '2026-08-21T04:20:00.000Z',

    placeOfOrigin: sourced('Tamil Nadu, India', 'ai_suggested'),
    manufacturingCountry: sourced('India', 'ai_extracted'),
    manufacturer: sourced('Not recorded', 'self_declared'),

    materials: [
      {
        name: sourced('Cotton', 'ai_extracted'),
        percentage: sourced(100, 'ai_extracted'),
        isRecycled: sourced(false, 'ai_extracted'),
        provenance: sourced(null, 'ai_suggested'),
      },
    ],
    careInstructions: CARE_COTTON,
    endOfLife: {
      recyclerLookupUrl: 'https://vaapsi.example/recycle/cotton',
      collectionPointUrl: null,
    },

    originalDeclaration: {
      declaredAt: '2026-08-21T04:20:00.000Z',
      declaredBy: 'Meher, Bengaluru',
      snapshot: {
        materials: [{ name: 'Cotton', percentage: 100 }],
        manufacturingCountry: 'India',
        condition: 'very_good',
      },
    },
    corrections: [],
    isVoluntary: true,

    chain: [
      {
        id: 'evt_nb_1',
        type: 'first_sold',
        date: '2025-04-19',
        actor: 'Nicobar online',
        note: 'Order confirmation email supplied. Manufacture date not recorded anywhere on the garment.',
        verification: sourced('Order confirmation supplied by the seller', 'self_declared'),
      },
      {
        id: 'evt_nb_2',
        type: 'owned',
        date: '2025-04-19',
        actor: 'First owner, Bengaluru',
        note: 'One summer of regular wear.',
        verification: sourced('Stated by the owner at intake', 'self_declared'),
      },
      {
        id: 'evt_nb_3',
        type: 'relisted',
        date: '2026-08-21',
        actor: 'Vaapsi',
        note: 'Seller-listed. Not yet physically inspected by Vaapsi.',
        verification: sourced('Platform listing record', 'verified', '2026-08-21T04:40:00.000Z'),
      },
    ],
    ownersCount: 1,
    // Nobody has authenticated this one. The passport still has value — it has a
    // chain and a composition — but the UI must not imply verification.
    authentication: { method: 'none', verifiedBy: null, verifiedAt: null },
    // No `impact` block. There is no defensible basis for a cotton shirt dress
    // of unknown origin, so no number is shown at all.
  },

  // ------------------------------------------------------------------ 5
  {
    id: 'psp_uniqlo_merino_crew_navy',
    productId: 'prd_uniqlo_merino_crew_navy',
    uniqueProductId: 'https://registry.eufsi.example/dpp/JP-UQ-2020-0663201',
    productNo: '429573-69-002',
    dppVersion: '1.1',
    signedAt: '2026-05-11T06:50:00.000Z',
    issuer: 'Vaapsi',
    registry: REGISTRY,
    lastUpdated: '2026-05-11T06:50:00.000Z',

    placeOfOrigin: sourced('Inner Mongolia, China', 'ai_suggested'),
    manufacturingCountry: sourced('China', 'ai_extracted'),
    manufacturer: sourced('Not recorded', 'self_declared'),

    materials: [
      {
        name: sourced('Extra fine merino wool', 'ai_extracted'),
        percentage: sourced(100, 'ai_extracted'),
        isRecycled: sourced(false, 'ai_extracted'),
        provenance: sourced(null, 'ai_suggested'),
      },
    ],
    careInstructions: CARE_WOOL,
    endOfLife: {
      recyclerLookupUrl: 'https://vaapsi.example/recycle/wool',
      collectionPointUrl: 'https://vaapsi.example/collect',
    },

    originalDeclaration: {
      declaredAt: '2026-05-11T06:50:00.000Z',
      declaredBy: 'Vaapsi Studio, New Delhi',
      snapshot: {
        materials: [{ name: 'Extra fine merino wool', percentage: 100 }],
        condition: 'well_loved',
        repairs: 1,
      },
    },
    corrections: [],
    isVoluntary: true,

    // The longest chain in the set: two owners, a return, a repair and a
    // relist. This is the shape that makes a passport worth reading.
    chain: [
      {
        id: 'evt_uq_1',
        type: 'first_sold',
        date: '2020-10-30',
        actor: 'Uniqlo, Ambience Mall, Gurugram',
        note: null,
        verification: sourced('Stated by the first owner at intake', 'self_declared'),
      },
      {
        id: 'evt_uq_2',
        type: 'owned',
        date: '2020-10-30',
        actor: 'First owner, Gurugram',
        note: 'Four winters.',
        verification: sourced('Stated by the owner at intake', 'self_declared'),
      },
      {
        id: 'evt_uq_3',
        type: 'returned',
        date: '2025-02-08',
        actor: 'Vaapsi collection, Gurugram',
        note: 'Returned to Vaapsi for repair and resale rather than discarded.',
        verification: sourced('Collection record', 'verified', '2025-02-08T00:00:00.000Z'),
      },
      {
        id: 'evt_uq_4',
        type: 'repaired',
        date: '2025-02-21',
        actor: 'Vaapsi Studio, New Delhi',
        note: 'Right elbow darned in a close navy wool. Deliberately visible rather than hidden.',
        verification: sourced(
          'Repair log, photographed before and after',
          'verified',
          '2025-02-21T00:00:00.000Z',
        ),
      },
      {
        id: 'evt_uq_5',
        type: 'owned',
        date: '2025-03-14',
        actor: 'Second owner, Pune',
        note: 'One winter.',
        verification: sourced('Platform order record', 'verified', '2025-03-14T00:00:00.000Z'),
      },
      {
        id: 'evt_uq_6',
        type: 'returned',
        date: '2026-04-28',
        actor: 'Vaapsi collection, Pune',
        note: null,
        verification: sourced('Collection record', 'verified', '2026-04-28T00:00:00.000Z'),
      },
      {
        id: 'evt_uq_7',
        type: 'inspected',
        date: '2026-05-09',
        actor: 'Vaapsi Studio, New Delhi',
        note: 'Mend sound. Light pilling under both arms. Graded well loved and priced for it.',
        verification: sourced(
          'In-house inspection, two-person sign-off',
          'verified',
          '2026-05-09T00:00:00.000Z',
        ),
      },
      {
        id: 'evt_uq_8',
        type: 'relisted',
        date: '2026-05-11',
        actor: 'Vaapsi',
        note: null,
        verification: sourced('Platform listing record', 'verified', '2026-05-11T07:20:00.000Z'),
      },
    ],
    ownersCount: 2,
    authentication: {
      method: 'in_house_inspection',
      verifiedBy: 'Vaapsi Studio, New Delhi',
      verifiedAt: '2026-05-09T00:00:00.000Z',
    },
    impact: {
      waterLitresSaved: 1_950,
      co2KgSaved: 12.8,
      basis:
        'International Wool Textile Organisation LCA guidance (2022) — fine merino knitwear baseline, plus one repair avoided replacement. Compared against manufacturing one new equivalent sweater.',
    },
  },
]
