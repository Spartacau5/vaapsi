# Data contract

**This is the most important document in the repo.** It is what the backend team
maps Prisma models onto. Source of truth is `src/lib/types/` — if the two ever
disagree, the code wins and this file is stale.

Legend: **required** unless marked _nullable_ or _optional_.

---

## Scalars and conventions

| Type                                     | Runtime  | Notes                                                                    |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `IsoDateTime`                            | `string` | ISO-8601 instant, always UTC. `2026-03-14T09:12:00.000Z`                 |
| `IsoDate`                                | `string` | ISO-8601 calendar date, no time. `2026-03-14`                            |
| `Paise`                                  | `number` | **Integer paise.** ₹1,299 is `129900`. Never a float                     |
| `Url`                                    | `string` | Absolute or root-relative. Not validated at the type level               |
| `ProductId`, `PassportId`, `SellerId`, … | `string` | Branded aliases. Plain strings at runtime; map to whatever your `@id` is |

**Money.** Every monetary field is integer paise. There is no float anywhere in
the contract, and `formatInr` throws if handed one. Formatting to a rupee string
happens at the very edge, in the component that renders it.

**IDs.** The branded aliases exist so a `PassportId` cannot be passed where a
`ProductId` is expected. Nothing in the front end parses an ID — cuid, uuid,
bigint-as-string are all fine.

---

## `Provenance` and `Sourced<T>`

```ts
type Provenance = 'verified' | 'supplier' | 'self_declared' | 'ai_extracted' | 'ai_suggested'
type Sourced<T> = { value: T; provenance: Provenance; verifiedAt?: string }
```

| Value           | Means                                                   |
| --------------- | ------------------------------------------------------- |
| `verified`      | Vaapsi or a named third party physically checked it     |
| `supplier`      | Supplied by the brand or manufacturer, in their records |
| `self_declared` | Stated by the seller. Unchecked                         |
| `ai_extracted`  | Read by a model off a label, invoice or photo           |
| `ai_suggested`  | Inferred by a model. Not read off anything              |

`verifiedAt` is present **only** when `provenance` is `verified`. A test enforces
this against the fixtures; enforce it in your mapper too.

**Do not make `provenance` optional.** See `decisions.md` §5.

---

## `Product`

Describes one physical garment. Every garment is one-of-one.

### Identity

| Field         | Type              | Notes                                                                                         |
| ------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| `id`          | `ProductId`       |                                                                                               |
| `slug`        | `string`          | URL segment. Unique. Used for `/product/[slug]`                                               |
| `sku`         | `string`          | Vaapsi stock number. **One per physical garment, never per style**                            |
| `title`       | `string`          | Garment name. No brand prefix — brand is its own field                                        |
| `brand`       | `string`          | Free text today. A `Brand` relation would be a contract change                                |
| `category`    | `ProductCategory` | `tops \| bottoms \| dresses \| outerwear \| knitwear \| ethnicwear \| suiting \| accessories` |
| `subcategory` | `string`          | Free text. "Kurta", "Shirt dress", "Jeans"                                                    |

### Resale specifics

| Field            | Type           | Notes                                                                     |
| ---------------- | -------------- | ------------------------------------------------------------------------- |
| `condition`      | `Condition`    | `pristine \| excellent \| very_good \| good \| well_loved`. Best to worst |
| `conditionNotes` | `string`       | Free prose from the inspector. Rendered as prose, not small print         |
| `flaws`          | `Flaw[]`       | Empty array is meaningful — it is a claim that there are none             |
| `measurements`   | `Measurements` | Partial record, **centimetres**, taken flat                               |
| `size`           | `Size`         | `{ label, system, normalized }`                                           |

**`Flaw`** — `{ description: string; imageId: ImageId; location: string }`

`imageId` must reference an image on the same product whose `kind` is `'flaw'`.
Enforced by test. `location` is in garment terms: "Left cuff", "Back yoke".

**`Measurements`** — `Partial<Record<MeasurementKey, number>>` where
`MeasurementKey` is `chest | waist | hip | shoulder | sleeveLength | length |
inseam | rise | thigh | hem | neck | cuff`.

Deliberately partial: a skirt has no shoulder. Only present keys are rendered —
do not send zeroes.

**`Size`** — `{ label: string; system: 'IN'|'UK'|'EU'|'US'; normalized: string }`

`label` is transcribed from the garment and **never inferred**. `normalized` is
the comparison key used for filtering and conversion (`xs`, `m`, `w30`,
`one_size`). Conversion never parses `label`.

### Commerce

| Field               | Type                                  | Notes                                                                                          |
| ------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `priceInr`          | `Paise`                               | Integer paise                                                                                  |
| `originalRetailInr` | `Paise` _nullable_                    | **Null when unknown.** Do not estimate — the UI shows no discount rather than a fabricated one |
| `currency`          | `'INR'`                               |                                                                                                |
| `availability`      | `'available' \| 'reserved' \| 'sold'` | Single-unit. `reserved` = in someone's cart or mid-checkout                                    |

**There is no quantity or stock count.** See `decisions.md` §2.

### Media

`images: ProductImage[]` — ordered.

| Field         | Type                                                   | Notes                                                              |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| `id`          | `ImageId`                                              | Unique within the product                                          |
| `url`         | `string`                                               |                                                                    |
| `alt`         | `string`                                               | **Required, non-empty.** Describes the garment, not the photograph |
| `kind`        | `'primary' \| 'detail' \| 'flaw' \| 'label' \| 'worn'` | At least one `primary` required                                    |
| `aspectRatio` | `number`                                               | width / height. Lets the grid reserve space                        |

Gallery display order is `primary → worn → detail → flaw → label`, applied by
`lib/format/images`, not by the API.

### Relations

| Field        | Type                    | Notes                                                         |
| ------------ | ----------------------- | ------------------------------------------------------------- |
| `passportId` | `PassportId` _nullable_ | **Null is normal.** The UI renders nothing at all when absent |
| `sellerId`   | `SellerId`              |                                                               |
| `listedAt`   | `IsoDateTime`           | Drives the default `newest` sort                              |

### `ProductSummary`

The subset a grid card needs, so the list endpoint can stay cheap: `id`, `slug`,
`title`, `brand`, `category`, `condition`, `size`, `priceInr`,
`originalRetailInr`, `currency`, `availability`, `passportId`, plus
`primaryImage: ProductImage`.

---

## `Passport`

Mirrors the EuFSI structure, then extends it. Fields typed `Sourced<T>` are the
ones EuFSI renders with a source badge — keep them sourced.

### Mirrored from EuFSI

| Field                  | Type                                                              | Notes                                                      |
| ---------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `id`                   | `PassportId`                                                      |                                                            |
| `productId`            | `ProductId`                                                       | Must point back at a product whose `passportId` is this    |
| `uniqueProductId`      | `Url`                                                             | Resolvable URL form. **This is what the QR encodes**       |
| `productNo`            | `string`                                                          | Issuer's own reference                                     |
| `dppVersion`           | `string`                                                          |                                                            |
| `signedAt`             | `IsoDateTime`                                                     |                                                            |
| `issuer`               | `string`                                                          | `"Vaapsi"` for self-issued, a brand name for brand-issued  |
| `registry`             | `{ name: string; url: Url }`                                      |                                                            |
| `lastUpdated`          | `IsoDateTime`                                                     |                                                            |
| `placeOfOrigin`        | `Sourced<string>`                                                 |                                                            |
| `manufacturingCountry` | `Sourced<string>`                                                 |                                                            |
| `manufacturer`         | `Sourced<string>`                                                 |                                                            |
| `materials`            | `Material[]`                                                      | Should sum to 100. UI states the shortfall if not          |
| `careInstructions`     | `CareInstruction[]`                                               | `{ code, label, icon }`. GINETEX codes                     |
| `endOfLife`            | `{ recyclerLookupUrl: Url\|null; collectionPointUrl: Url\|null }` |                                                            |
| `originalDeclaration`  | `OriginalDeclaration`                                             | **Immutable.** Never edited                                |
| `corrections`          | `Correction[]`                                                    | **Append-only.** Never overwrites the declaration          |
| `isVoluntary`          | `boolean`                                                         | True = published by choice, not issued under EU regulation |

**`Material`** — every field sourced:
`{ name: Sourced<string>; percentage: Sourced<number>; isRecycled: Sourced<boolean>; provenance: Sourced<string|null> }`

**`OriginalDeclaration`** —
`{ declaredAt: IsoDateTime; declaredBy: string; snapshot: Readonly<Record<string, unknown>> }`

`snapshot` is intentionally untyped: it is a frozen copy of whatever the passport
looked like at first publication, and its shape changes as the contract does. The
UI renders it defensively — an old snapshot must never be able to break the page
displaying it.

**`Correction`** —
`{ id; correctedAt; correctedBy; field; previousValue: unknown; newValue: unknown; reason: string }`

`field` is a dot path (`materials.0.percentage`). Both values are shown, old
struck through, beside the still-wrong original. That is the point.

### Vaapsi extension

This is what EuFSI does not have, and the reason a passport is worth showing a
shopper.

| Field            | Type                | Notes                                                                 |
| ---------------- | ------------------- | --------------------------------------------------------------------- |
| `chain`          | `ChainEvent[]`      | **Ordered oldest first.** Enforced by test                            |
| `ownersCount`    | `number`            | Distinct owners, excluding Vaapsi's own custody                       |
| `authentication` | `Authentication`    | `{ method, verifiedBy: string\|null, verifiedAt: IsoDateTime\|null }` |
| `impact`         | `Impact` _optional_ | **Omit entirely** when there is no defensible basis                   |

**`ChainEvent`** —
`{ id; type: ChainEventType; date: IsoDate; actor: string; note: string|null; verification: Sourced<string> }`

`type` is `made | first_sold | owned | returned | inspected | repaired |
relisted`. A garment can loop `owned → returned → inspected → repaired →
relisted` any number of times — that is the business.

`actor` **never names an individual.** "Second owner, Bengaluru", not a customer
name. Enforced by test for `owned` events.

**`Authentication.method`** — `in_house_inspection | brand_partner |
third_party_authenticator | none`. `none` means nothing was authenticated;
`verifiedBy` and `verifiedAt` are then both null and the UI shows no seal.

**`Impact`** — `{ waterLitresSaved: number; co2KgSaved: number; basis: string }`

**`basis` is required and always rendered.** A number without a stated source is
marketing, and one shopper catching one unsupported figure costs more than every
figure earns. If there is no defensible basis, omit `impact` — the UI handles a
passport without it.

---

## `Seller`

The **public** projection. No email, no phone, no address — those live on your
account model and are not part of this contract.

| Field           | Type                      | Notes                                                             |
| --------------- | ------------------------- | ----------------------------------------------------------------- |
| `id`            | `SellerId`                |                                                                   |
| `handle`        | `string`                  | Public, unique, URL-safe                                          |
| `displayName`   | `string`                  | May be a first name, shop name or pseudonym                       |
| `location`      | `{ city; state } \| null` | **Coarse only.** Never a precise address                          |
| `avatarUrl`     | `Url` _nullable_          |                                                                   |
| `isVerified`    | `boolean`                 | Vaapsi has confirmed identity                                     |
| `memberSince`   | `IsoDateTime`             |                                                                   |
| `listingsCount` | `number`                  |                                                                   |
| `isVaapsi`      | `boolean`                 | First-party/consigned rather than C2C. Changes merchant of record |

Buyer and seller are one account type, not two (PRD §3, §9.1).

---

## `Cart`

| Field       | Type          | Notes                                                         |
| ----------- | ------------- | ------------------------------------------------------------- |
| `id`        | `CartId`      |                                                               |
| `lines`     | `CartLine[]`  |                                                               |
| `totals`    | `CartTotals`  | **Computed server-side.** The client does no money arithmetic |
| `currency`  | `'INR'`       |                                                               |
| `updatedAt` | `IsoDateTime` |                                                               |

**`CartLine`** —
`{ id; product: ProductSummary; priceAtAddInr: Paise; addedAt: IsoDateTime; status }`

`status` is `active | reserved | sold_out | price_changed`.

**There is no quantity.** A line _is_ a garment.

`sold_out` is not an error state — it is the expected outcome of a slow checkout
on one-of-one inventory. Such a line stays visible and is excluded from totals.

**`CartTotals`** —
`{ subtotalInr; shippingInr: Paise|null; taxInr: Paise|null; discountInr; totalInr }`

`shippingInr` is null until a PIN code is known. `taxInr` is null until the
merchant-of-record model is settled (PRD Q6). Only `active` lines count toward
`subtotalInr`.

---

## Open questions affecting this contract

| #      | Question                                           | Affects                                                          |
| ------ | -------------------------------------------------- | ---------------------------------------------------------------- |
| PRD Q2 | Which DPP provider, and what does their QR encode? | `uniqueProductId`, `registry`                                    |
| PRD Q6 | Merchant of record / GST / invoicing               | `CartTotals.taxInr`, `Seller.isVaapsi`                           |
| PRD Q7 | C2C returns policy                                 | Copy only, no type impact                                        |
| PRD Q8 | Parcel provider                                    | `CartTotals.shippingInr`                                         |
| —      | **`Product` has no gender field.**                 | Blocks accurate size conversion and `/shop/women` \| `/shop/men` |

The last one is ours, not the PRD's, and it is the one most likely to need a type
change. Size conversion tables in `lib/format/size.ts` are womenswear and denim;
menswear tops are labelled by chest inches and that cannot be modelled without
knowing which a garment is.
