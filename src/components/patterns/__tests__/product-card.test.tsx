import { render, screen } from '@testing-library/react'
import { PassportMark } from '../passport-mark'
import { Price } from '../price'
import { ProductCard } from '../product-card'
import { conditionCopy } from '@/content/product'
import type { ProductImage, ProductSummary } from '@/lib/types'

const primary: ProductImage = {
  id: 'img_1',
  url: 'https://picsum.photos/seed/a/1200/1600',
  alt: 'A navy sweater, flat',
  kind: 'primary',
  aspectRatio: 0.75,
}

const detail: ProductImage = {
  id: 'img_2',
  url: 'https://picsum.photos/seed/b/1200/1600',
  alt: 'Ribbed cuff',
  kind: 'detail',
  aspectRatio: 0.75,
}

function product(overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    id: 'prd_1',
    slug: 'a-navy-sweater',
    title: 'Merino crewneck in navy',
    brand: 'Uniqlo',
    category: 'knitwear',
    condition: 'very_good',
    size: { label: 'M', system: 'IN', normalized: 'm' },
    priceInr: 69_000,
    originalRetailInr: 299_000,
    currency: 'INR',
    availability: 'available',
    passportId: 'psp_1',
    primaryImage: primary,
    ...overrides,
  }
}

describe('ProductCard', () => {
  it('links to the product and names brand, title, size and condition', () => {
    render(<ProductCard product={product()} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/a-navy-sweater')
    expect(screen.getByText('Uniqlo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Merino crewneck in navy')
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getByText(conditionCopy.very_good.label)).toBeInTheDocument()
  })

  it('shows the price with original retail struck through', () => {
    const { container } = render(<ProductCard product={product()} />)
    expect(screen.getByText('₹690')).toBeInTheDocument()
    const struck = container.querySelector('s')
    expect(struck).toHaveTextContent('₹2,990')
  })

  it('shows no strike-through when original retail is unknown', () => {
    const { container } = render(<ProductCard product={product({ originalRetailInr: null })} />)
    expect(container.querySelector('s')).toBeNull()
  })

  it('keeps a sold garment visible, desaturated, with Sold in place of the price', () => {
    const { container } = render(<ProductCard product={product({ availability: 'sold' })} />)
    // Still a link — a sold garment still has a passport worth reading.
    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(screen.getByText('Sold')).toBeInTheDocument()
    expect(screen.queryByText('₹690')).toBeNull()
    expect(container.querySelector('img')?.className).toContain('saturate-0')
  })

  it('does not mark a reserved garment on the card', () => {
    render(<ProductCard product={product({ availability: 'reserved' })} />)
    // Still purchasable if the other shopper abandons. Flagging it here would be
    // wrong within the minute, or read as a scarcity trick.
    expect(screen.queryByText(/reserved/i)).toBeNull()
    expect(screen.getByText('₹690')).toBeInTheDocument()
  })

  it('renders a second image for the hover cross-fade only when given one', () => {
    const { container: without } = render(<ProductCard product={product()} />)
    expect(without.querySelectorAll('img')).toHaveLength(1)

    const { container: withDetail } = render(
      <ProductCard product={product()} detailImage={detail} />,
    )
    expect(withDetail.querySelectorAll('img')).toHaveLength(2)
    // The hover image is decorative — the primary already describes the garment.
    expect(withDetail.querySelectorAll('img')[1]).toHaveAttribute('alt', '')
  })

  it('never adds a shadow or a lift on hover', () => {
    const { container } = render(<ProductCard product={product()} detailImage={detail} />)
    const html = container.innerHTML
    expect(html).not.toMatch(/hover:shadow/)
    expect(html).not.toMatch(/hover:-translate-y/)
    expect(html).not.toMatch(/hover:scale/)
  })
})

describe('PassportMark', () => {
  it('renders the dot and a label when there is a passport', () => {
    const { container } = render(<PassportMark hasPassport />)
    expect(container.querySelector('.bg-accent')).not.toBeNull()
  })

  it('renders absolutely nothing when there is not', () => {
    // An absence that is drawn is still a claim.
    const { container } = render(<PassportMark hasPassport={false} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('Price', () => {
  it('floors the saving and only shows it when asked', () => {
    render(
      <Price priceInr={6_700} originalRetailInr={10_000} availability="available" showSaving />,
    )
    expect(screen.getByText('33% less')).toBeInTheDocument()
  })

  it('never invents a saving without an original price', () => {
    render(<Price priceInr={6_700} originalRetailInr={null} availability="available" showSaving />)
    expect(screen.queryByText(/less/)).toBeNull()
  })

  it('replaces the whole price with Sold, not a struck-through price', () => {
    const { container } = render(
      <Price priceInr={6_700} originalRetailInr={10_000} availability="sold" />,
    )
    expect(screen.getByText('Sold')).toBeInTheDocument()
    expect(container.querySelector('s')).toBeNull()
  })
})
