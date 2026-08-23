import { getPassport, getPassportByProduct, getProduct, listProducts } from '..'
import { passports } from '../fixtures/passports'
import { products } from '../fixtures/products'
import { sellers } from '../fixtures/sellers'

/**
 * Referential integrity of the fixture set.
 *
 * These are not tests of the fixtures for their own sake — they are the
 * assertions the real backend will have to satisfy too. A flaw pointing at an
 * image that does not exist, or a percentage set that does not sum to 100, is a
 * broken PDP either way.
 */

describe('fixture shape', () => {
  it('has eight garments, five passported and three not', () => {
    expect(products).toHaveLength(8)
    expect(products.filter((p) => p.passportId !== null)).toHaveLength(5)
    expect(products.filter((p) => p.passportId === null)).toHaveLength(3)
    expect(passports).toHaveLength(5)
  })

  it('exercises every availability state', () => {
    const states = new Set(products.map((p) => p.availability))
    expect(states).toEqual(new Set(['available', 'reserved', 'sold']))
  })

  it('varies condition across the scale', () => {
    expect(new Set(products.map((p) => p.condition)).size).toBeGreaterThanOrEqual(4)
  })

  it('includes a garment with no known original retail price', () => {
    expect(products.some((p) => p.originalRetailInr === null)).toBe(true)
  })
})

describe('referential integrity', () => {
  it('gives every product unique id, slug and sku', () => {
    for (const key of ['id', 'slug', 'sku'] as const) {
      expect(new Set(products.map((p) => p[key])).size).toBe(products.length)
    }
  })

  it('resolves every sellerId', () => {
    const ids = new Set(sellers.map((s) => s.id))
    for (const product of products) expect(ids).toContain(product.sellerId)
  })

  it('resolves every passportId, and every passport points back', () => {
    const passportIds = new Set(passports.map((p) => p.id))
    const productIds = new Set(products.map((p) => p.id))

    for (const product of products) {
      if (product.passportId !== null) expect(passportIds).toContain(product.passportId)
    }
    for (const passport of passports) {
      expect(productIds).toContain(passport.productId)
      const product = products.find((p) => p.id === passport.productId)
      expect(product?.passportId).toBe(passport.id)
    }
  })

  it('points every flaw at an image of kind flaw on the same product', () => {
    for (const product of products) {
      for (const flaw of product.flaws) {
        const image = product.images.find((i) => i.id === flaw.imageId)
        expect(image).toBeDefined()
        expect(image?.kind).toBe('flaw')
      }
    }
  })

  it('gives every product a primary image and non-empty alt text', () => {
    for (const product of products) {
      expect(product.images.some((i) => i.kind === 'primary')).toBe(true)
      for (const image of product.images) expect(image.alt.length).toBeGreaterThan(0)
    }
  })

  it('gives every image a unique id within its product', () => {
    for (const product of products) {
      expect(new Set(product.images.map((i) => i.id)).size).toBe(product.images.length)
    }
  })

  it('stores prices as integer paise below original retail', () => {
    for (const product of products) {
      expect(Number.isInteger(product.priceInr)).toBe(true)
      expect(product.priceInr).toBeGreaterThan(0)
      if (product.originalRetailInr !== null) {
        expect(Number.isInteger(product.originalRetailInr)).toBe(true)
        expect(product.priceInr).toBeLessThan(product.originalRetailInr)
      }
    }
  })
})

describe('passport integrity', () => {
  it('sums material percentages to 100', () => {
    for (const passport of passports) {
      const total = passport.materials.reduce((sum, m) => sum + m.percentage.value, 0)
      expect(total).toBe(100)
    }
  })

  it('orders the chain oldest first', () => {
    for (const passport of passports) {
      const dates = passport.chain.map((event) => Date.parse(event.date))
      expect([...dates].sort((a, b) => a - b)).toEqual(dates)
    }
  })

  it('never shows an impact number without a basis', () => {
    for (const passport of passports) {
      if (passport.impact !== undefined) {
        expect(passport.impact.basis.trim().length).toBeGreaterThan(20)
      }
    }
  })

  it('includes a passport with no impact block at all', () => {
    expect(passports.some((p) => p.impact === undefined)).toBe(true)
  })

  it('includes a non-voluntary passport and a set of voluntary ones', () => {
    expect(passports.some((p) => !p.isVoluntary)).toBe(true)
    expect(passports.some((p) => p.isVoluntary)).toBe(true)
  })

  it('includes a passport with corrections that do not overwrite the original', () => {
    const corrected = passports.find((p) => p.corrections.length > 0)
    expect(corrected).toBeDefined()
    // The original declaration still holds the wrong value. That is the point.
    expect(corrected?.originalDeclaration.snapshot).toBeDefined()
    expect(corrected?.corrections[0]?.previousValue).not.toEqual(
      corrected?.corrections[0]?.newValue,
    )
  })

  it('includes an unauthenticated passport', () => {
    const none = passports.find((p) => p.authentication.method === 'none')
    expect(none).toBeDefined()
    expect(none?.authentication.verifiedBy).toBeNull()
    expect(none?.authentication.verifiedAt).toBeNull()
  })

  it('gives a verifiedAt to every verified provenance and to no other', () => {
    for (const passport of passports) {
      for (const event of passport.chain) {
        if (event.verification.provenance === 'verified') {
          expect(event.verification.verifiedAt).toBeDefined()
        } else {
          expect(event.verification.verifiedAt).toBeUndefined()
        }
      }
    }
  })

  it('never names an individual owner', () => {
    for (const passport of passports) {
      for (const event of passport.chain) {
        if (event.type === 'owned') {
          expect(event.actor).toMatch(/owner/i)
        }
      }
    }
  })
})

describe('adapter reads', () => {
  it('finds a product by id and by slug', async () => {
    const bySlug = await getProduct('raw-mango-chanderi-silk-kurta-ivory')
    const byId = await getProduct('prd_rawmango_chanderi_kurta')
    expect(bySlug?.id).toBe('prd_rawmango_chanderi_kurta')
    expect(byId).toEqual(bySlug)
  })

  it('returns null rather than throwing for an unknown product', async () => {
    expect(await getProduct('prd_does_not_exist')).toBeNull()
  })

  it('returns null for a garment with no passport', async () => {
    const product = await getProduct('prd_zara_linen_blazer_sand')
    expect(product?.passportId).toBeNull()
    expect(await getPassportByProduct('prd_zara_linen_blazer_sand')).toBeNull()
  })

  it('reads a passport by id and by product', async () => {
    const byId = await getPassport('psp_uniqlo_merino_crew_navy')
    const byProduct = await getPassportByProduct('prd_uniqlo_merino_crew_navy')
    expect(byId).toEqual(byProduct)
    expect(byId?.ownersCount).toBe(2)
  })

  it('lists every product with a summary carrying a primary image', async () => {
    const page = await listProducts()
    expect(page.total).toBe(8)
    expect(page.items).toHaveLength(8)
    expect(page.nextCursor).toBeNull()
    for (const item of page.items) expect(item.primaryImage.kind).toBe('primary')
  })
})
