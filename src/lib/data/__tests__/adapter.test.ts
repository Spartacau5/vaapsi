import {
  DataError,
  addToCart,
  getCart,
  getProductFacets,
  listFeaturedProducts,
  listProducts,
  removeFromCart,
} from '..'
import { __resetMockCart } from '../mock'

describe('listProducts filtering', () => {
  it('filters by category', async () => {
    const page = await listProducts({ filters: { category: 'ethnicwear' } })
    expect(page.total).toBe(2)
    expect(page.items.every((item) => item.category === 'ethnicwear')).toBe(true)
  })

  it('filters by passport presence in both directions', async () => {
    expect((await listProducts({ filters: { hasPassport: true } })).total).toBe(5)
    expect((await listProducts({ filters: { hasPassport: false } })).total).toBe(3)
  })

  it('filters by condition', async () => {
    const page = await listProducts({ filters: { conditions: ['pristine', 'excellent'] } })
    expect(page.total).toBe(3)
  })

  it('filters by price range in paise', async () => {
    const page = await listProducts({ filters: { maxPriceInr: 300_000 } })
    expect(page.items.every((item) => item.priceInr <= 300_000)).toBe(true)
    expect(page.total).toBeGreaterThan(0)
  })

  it('searches title, brand and subcategory', async () => {
    expect((await listProducts({ filters: { query: 'kurta' } })).total).toBe(1)
    expect((await listProducts({ filters: { query: 'nicobar' } })).total).toBe(1)
    expect((await listProducts({ filters: { query: 'jeans' } })).total).toBe(1)
    expect((await listProducts({ filters: { query: 'zzzz' } })).total).toBe(0)
  })

  it('combines filters', async () => {
    const page = await listProducts({
      filters: { category: 'bottoms', hasPassport: false },
    })
    expect(page.total).toBe(1)
    expect(page.items[0]?.brand).toBe('Massimo Dutti')
  })
})

describe('listProducts sorting', () => {
  it('sorts price ascending and descending', async () => {
    const asc = await listProducts({ sort: 'price_asc' })
    const desc = await listProducts({ sort: 'price_desc' })
    const prices = asc.items.map((item) => item.priceInr)
    expect([...prices].sort((a, b) => a - b)).toEqual(prices)
    expect(desc.items.map((i) => i.priceInr)).toEqual([...prices].reverse())
  })

  it('sorts alphabetically by title', async () => {
    const page = await listProducts({ sort: 'alphabetical' })
    const titles = page.items.map((item) => item.title)
    expect([...titles].sort((a, b) => a.localeCompare(b))).toEqual(titles)
  })

  it('sinks sold garments below available ones under relevance', async () => {
    const page = await listProducts({ sort: 'relevance' })
    const soldIndex = page.items.findIndex((item) => item.availability === 'sold')
    expect(soldIndex).toBe(page.items.length - 1)
  })
})

describe('listProducts pagination', () => {
  it('pages through the set with an opaque cursor', async () => {
    const first = await listProducts({ limit: 3, sort: 'alphabetical' })
    expect(first.items).toHaveLength(3)
    expect(first.nextCursor).not.toBeNull()

    const second = await listProducts({ limit: 3, sort: 'alphabetical', cursor: first.nextCursor })
    expect(second.items).toHaveLength(3)
    expect(second.items[0]?.id).not.toBe(first.items[0]?.id)

    const third = await listProducts({ limit: 3, sort: 'alphabetical', cursor: second.nextCursor })
    expect(third.items).toHaveLength(2)
    expect(third.nextCursor).toBeNull()
  })
})

describe('getProductFacets', () => {
  it('counts facets against the full set', async () => {
    const facets = await getProductFacets()
    const brandTotal = facets.brands.reduce((sum, brand) => sum + brand.count, 0)
    expect(brandTotal).toBe(8)
    expect(facets.priceRangeInr.min).toBeLessThan(facets.priceRangeInr.max)
  })

  it('orders conditions best to worst, not by count', async () => {
    const facets = await getProductFacets()
    const values = facets.conditions.map((c) => c.value)
    expect(values.indexOf('pristine')).toBeLessThan(values.indexOf('well_loved'))
  })

  it('orders sizes small to large', async () => {
    const facets = await getProductFacets()
    const sizes = facets.sizes.map((size) => size.value)
    if (sizes.includes('s') && sizes.includes('l')) {
      expect(sizes.indexOf('s')).toBeLessThan(sizes.indexOf('l'))
    }
  })
})

describe('listFeaturedProducts', () => {
  it('returns a curated order, honouring the limit', async () => {
    const featured = await listFeaturedProducts(3)
    expect(featured).toHaveLength(3)
    expect(featured[0]?.id).toBe('prd_rawmango_chanderi_kurta')
  })
})

describe('cart', () => {
  beforeEach(() => {
    __resetMockCart()
  })

  it('starts empty with nothing invented for shipping or tax', async () => {
    const cart = await getCart(null)
    expect(cart.lines).toHaveLength(0)
    expect(cart.totals.subtotalInr).toBe(0)
    expect(cart.totals.shippingInr).toBeNull()
    expect(cart.totals.taxInr).toBeNull()
  })

  it('adds a garment and totals it', async () => {
    const cart = await addToCart(null, 'prd_levis_501_indigo')
    expect(cart.lines).toHaveLength(1)
    expect(cart.totals.subtotalInr).toBe(265_000)
    expect(cart.lines[0]?.status).toBe('active')
  })

  it('refuses to add the same garment twice, because there is only one', async () => {
    await addToCart(null, 'prd_levis_501_indigo')
    await expect(addToCart(null, 'prd_levis_501_indigo')).rejects.toThrow(DataError)
    await expect(addToCart(null, 'prd_levis_501_indigo')).rejects.toMatchObject({
      code: 'already_in_cart',
    })
  })

  it('refuses a reserved or sold garment', async () => {
    await expect(addToCart(null, 'prd_cos_wool_coat_stone')).rejects.toMatchObject({
      code: 'unavailable',
    })
    await expect(addToCart(null, 'prd_uniqlo_merino_crew_navy')).rejects.toMatchObject({
      code: 'unavailable',
    })
  })

  it('reports an unknown garment as not found', async () => {
    await expect(addToCart(null, 'prd_nope')).rejects.toMatchObject({ code: 'not_found' })
  })

  it('removes a line', async () => {
    const added = await addToCart(null, 'prd_levis_501_indigo')
    const lineId = added.lines[0]?.id
    expect(lineId).toBeDefined()
    const after = await removeFromCart(added.id, lineId as string)
    expect(after.lines).toHaveLength(0)
    expect(after.totals.subtotalInr).toBe(0)
  })

  it('has no quantity anywhere, because every garment is one of one', async () => {
    const cart = await addToCart(null, 'prd_levis_501_indigo')
    expect(cart.lines[0]).not.toHaveProperty('quantity')
  })
})
