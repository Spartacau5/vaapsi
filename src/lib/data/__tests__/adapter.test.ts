import { getProductFacets, listFeaturedProducts, listProducts, resolveCart } from '..'

describe('listProducts filtering', () => {
  it('filters by category', async () => {
    // Four pieces are bottoms: the 501s, the maxi skirt, the pre-loved
    // straight-legs and the new Vaapsi straight jeans.
    const page = await listProducts({ filters: { category: 'bottoms' } })
    expect(page.total).toBe(4)
    expect(page.items.every((item) => item.category === 'bottoms')).toBe(true)
  })

  it('filters by passport presence in both directions', async () => {
    expect((await listProducts({ filters: { hasPassport: true } })).total).toBe(5)
    // Three unpassported pre-loved pieces plus the three new ones.
    expect((await listProducts({ filters: { hasPassport: false } })).total).toBe(6)
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
    // Two trucker jackets: the pre-loved Chenab and the new Kaveri.
    expect((await listProducts({ filters: { query: 'trucker' } })).total).toBe(2)
    // Search covers the product's own name, which is now what identifies it —
    // every listing shares one brand.
    expect((await listProducts({ filters: { query: 'sutlej' } })).total).toBe(1)
    // "Jean" hits the three trousers: Ravi, Tapti and the new Indus.
    expect((await listProducts({ filters: { query: 'jean' } })).total).toBe(3)
    expect((await listProducts({ filters: { query: 'zzzz' } })).total).toBe(0)
  })

  it('combines filters', async () => {
    const page = await listProducts({
      filters: { category: 'bottoms', hasPassport: false },
    })
    // The pre-loved Tapti straight-legs and the new Indus straight jean.
    expect(page.total).toBe(2)
    expect(page.items.map((item) => item.title).sort()).toEqual([
      'Indus Straight Jean',
      'Tapti Straight-Leg Jean',
    ])
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

    // Walked to the end rather than asserting which page is last: the count of
    // fixtures is not the thing under test, and hardcoding it means every new
    // fixture breaks this.
    let cursor = second.nextCursor
    let seen = first.items.length + second.items.length
    let pages = 2
    while (cursor !== null) {
      const next = await listProducts({ limit: 3, sort: 'alphabetical', cursor })
      expect(next.items.length).toBeGreaterThan(0)
      expect(next.items.length).toBeLessThanOrEqual(3)
      seen += next.items.length
      cursor = next.nextCursor
      pages += 1
      // A cursor that never exhausts is the failure this guards against.
      expect(pages).toBeLessThan(20)
    }
    expect(seen).toBe(first.total)
  })
})

describe('getProductFacets', () => {
  it('counts facets against the full set', async () => {
    const facets = await getProductFacets()
    const brandTotal = facets.brands.reduce((sum, brand) => sum + brand.count, 0)
    expect(brandTotal).toBe(11)
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
    expect(featured[0]?.id).toBe('prd_bhaane_trucker_indigo')
  })
})

describe('resolveCart', () => {
  const at = '2026-08-22T10:00:00.000Z'

  it('returns an empty cart with nothing invented for shipping or tax', async () => {
    const cart = await resolveCart([])
    expect(cart.lines).toHaveLength(0)
    expect(cart.totals.subtotalInr).toBe(0)
    expect(cart.totals.shippingInr).toBeNull()
    expect(cart.totals.taxInr).toBeNull()
  })

  it('resolves a remembered id into a priced line', async () => {
    const cart = await resolveCart([{ productId: 'prd_levis_501_indigo', addedAt: at }])
    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0]?.status).toBe('active')
    expect(cart.totals.subtotalInr).toBe(265_000)
  })

  it('has no quantity anywhere, because every garment is one of one', async () => {
    const cart = await resolveCart([{ productId: 'prd_levis_501_indigo', addedAt: at }])
    expect(cart.lines[0]).not.toHaveProperty('quantity')
  })

  it('keeps a sold line visible but out of the total', async () => {
    const cart = await resolveCart([
      { productId: 'prd_levis_501_indigo', addedAt: at },
      { productId: 'prd_diesel_denim_shoulder_bag', addedAt: at },
    ])
    expect(cart.lines).toHaveLength(2)
    const sold = cart.lines.find((line) => line.product.id === 'prd_diesel_denim_shoulder_bag')
    expect(sold?.status).toBe('sold_out')
    // Only the available garment counts. A sold line must not inflate the total.
    expect(cart.totals.subtotalInr).toBe(265_000)
  })

  it('marks a reserved line and excludes it from the total too', async () => {
    const cart = await resolveCart([{ productId: 'prd_acne_denim_maxi_skirt', addedAt: at }])
    expect(cart.lines[0]?.status).toBe('reserved')
    expect(cart.totals.subtotalInr).toBe(0)
  })

  it('drops a garment that no longer exists rather than erroring', async () => {
    const cart = await resolveCart([
      { productId: 'prd_gone_forever', addedAt: at },
      { productId: 'prd_levis_501_indigo', addedAt: at },
    ])
    expect(cart.lines).toHaveLength(1)
  })

  it('orders newest first', async () => {
    const cart = await resolveCart([
      { productId: 'prd_levis_501_indigo', addedAt: '2026-08-01T00:00:00.000Z' },
      { productId: 'prd_nicobar_chambray_shirtdress', addedAt: '2026-08-20T00:00:00.000Z' },
    ])
    expect(cart.lines[0]?.product.id).toBe('prd_nicobar_chambray_shirtdress')
  })

  it('never caches a price — the line price is resolved from the product', async () => {
    const cart = await resolveCart([{ productId: 'prd_levis_501_indigo', addedAt: at }])
    expect(cart.lines[0]?.priceAtAddInr).toBe(cart.lines[0]?.product.priceInr)
  })
})
