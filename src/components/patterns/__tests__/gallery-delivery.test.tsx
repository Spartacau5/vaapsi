import { axe, toHaveNoViolations } from 'jest-axe'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeliveryOptions } from '../checkout/delivery-options'
import { Gallery } from '../product/gallery'
import { checkout } from '@/content/checkout'
import { productPage } from '@/content/product'
import type { ProductImage } from '@/lib/types'
import { useWishlistStore } from '@/lib/store/wishlist'

expect.extend(toHaveNoViolations)

const images: readonly ProductImage[] = Array.from({ length: 5 }, (_, i) => ({
  id: `img_${i + 1}`,
  url: `/products/x/${i + 1}.jpg`,
  alt: `Frame ${i + 1}`,
  kind: i === 0 ? 'primary' : 'detail',
  aspectRatio: 0.8,
}))

beforeEach(() => {
  useWishlistStore.setState({ items: [] })
})

/**
 * The gallery.
 *
 * The point of the rewrite was reducing scroll, so what is worth asserting is
 * that every frame is reachable without one: three thumbnails onto frames other
 * than the hero, arrows that wrap, and a stated position.
 */
describe('Gallery', () => {
  it('shows three thumbnails, and none of them is the current hero', () => {
    render(<Gallery images={images} sold={false} productId="p" />)
    const thumbs = screen.getByRole('list', { name: productPage.gallery.thumbnails })
    const buttons = within(thumbs).getAllByRole('button')
    expect(buttons).toHaveLength(3)
    // Hero is frame 1, so the tiles are 2, 3 and 4.
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      productPage.gallery.frame(2, 5),
      productPage.gallery.frame(3, 5),
      productPage.gallery.frame(4, 5),
    ])
  })

  it('states which frame is showing', () => {
    render(<Gallery images={images} sold={false} productId="p" />)
    expect(screen.getByText(productPage.gallery.position(1, 5))).toBeInTheDocument()
  })

  it('brings a clicked thumbnail into the hero, and rolls the row on', async () => {
    const user = userEvent.setup()
    render(<Gallery images={images} sold={false} productId="p" />)

    const thumbs = screen.getByRole('list', { name: productPage.gallery.thumbnails })
    await user.click(within(thumbs).getByRole('button', { name: productPage.gallery.frame(3, 5) }))

    expect(screen.getByText(productPage.gallery.position(3, 5))).toBeInTheDocument()
    // The row now offers frames 4, 5 and 1 — never the one in the hero.
    const after = screen.getByRole('list', { name: productPage.gallery.thumbnails })
    expect(
      within(after).queryByRole('button', { name: productPage.gallery.frame(3, 5) }),
    ).toBeNull()
  })

  it('steps forward and wraps at the end', async () => {
    const user = userEvent.setup()
    render(<Gallery images={images} sold={false} productId="p" />)
    const next = screen.getByRole('button', { name: productPage.gallery.next })

    for (let i = 0; i < 4; i++) await user.click(next)
    expect(screen.getByText(productPage.gallery.position(5, 5))).toBeInTheDocument()

    // Wraps rather than dead-ending.
    await user.click(next)
    expect(screen.getByText(productPage.gallery.position(1, 5))).toBeInTheDocument()
  })

  it('steps backward from the first frame to the last', async () => {
    const user = userEvent.setup()
    render(<Gallery images={images} sold={false} productId="p" />)
    await user.click(screen.getByRole('button', { name: productPage.gallery.previous }))
    expect(screen.getByText(productPage.gallery.position(5, 5))).toBeInTheDocument()
  })

  it('hides the arrows when there is only one frame to step through', () => {
    render(<Gallery images={[images[0]!]} sold={false} productId="p" />)
    expect(screen.queryByRole('button', { name: productPage.gallery.next })).toBeNull()
  })

  it('announces the frame that came into view', async () => {
    const user = userEvent.setup()
    const { container } = render(<Gallery images={images} sold={false} productId="p" />)
    await user.click(screen.getByRole('button', { name: productPage.gallery.next }))
    const live = container.querySelector('[aria-live="polite"]')
    expect(live).toHaveTextContent('Frame 2')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <main>
        <Gallery images={images} sold={false} productId="p" />
      </main>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/**
 * The slower-delivery discount.
 *
 * The saving is a commercial commitment, so the arithmetic is asserted rather
 * than eyeballed — and it must round in the shopper's favour, never against.
 */
describe('DeliveryOptions', () => {
  const SUBTOTAL = 400_000 // ₹4,000

  it('offers the discount as a question until it is taken', () => {
    render(<DeliveryOptions subtotalInr={SUBTOTAL} />)
    expect(screen.getByText(checkout.delivery.discountTag)).toBeInTheDocument()
    expect(screen.queryByText(checkout.delivery.discountApplied)).toBeNull()
  })

  it('puts the discount only on the slowest option', () => {
    render(<DeliveryOptions subtotalInr={SUBTOTAL} />)
    // One offer on the page, not one per option.
    expect(screen.getAllByText(checkout.delivery.discountTag)).toHaveLength(1)
    expect(screen.getByText('Unhurried')).toBeInTheDocument()
  })

  it('shows the saving in rupees, not only as a percentage', () => {
    render(<DeliveryOptions subtotalInr={SUBTOTAL} />)
    // 15% of ₹4,000.
    expect(screen.getByText('− ₹600')).toBeInTheDocument()
  })

  it('confirms rather than keeps asking once chosen', async () => {
    const user = userEvent.setup()
    render(<DeliveryOptions subtotalInr={SUBTOTAL} />)
    await user.click(screen.getByRole('radio', { name: /Unhurried/ }))

    expect(screen.getByText(checkout.delivery.discountApplied)).toBeInTheDocument()
    expect(screen.queryByText(checkout.delivery.discountTag)).toBeNull()
  })

  it('starts on standard, so the discount is opted into and never assumed', () => {
    render(<DeliveryOptions subtotalInr={SUBTOTAL} />)
    expect(screen.getByRole('radio', { name: /Standard/ })).toBeChecked()
  })

  it('reports the chosen option upward', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<DeliveryOptions subtotalInr={SUBTOTAL} onChange={onChange} />)
    await user.click(screen.getByRole('radio', { name: /Unhurried/ }))
    expect(onChange).toHaveBeenLastCalledWith({ id: 'consolidated', discountPercent: 15 })
  })

  it('floors the saving, so rounding never favours us over the shopper', () => {
    // 15% of 999 paise is 149.85. Floored to 149 paise — ₹1.49. Flooring the
    // *saving* is the conservative direction for us and the honest one for the
    // shopper: they are never shown a discount larger than they will receive.
    render(<DeliveryOptions subtotalInr={999} />)
    expect(screen.getByText('− ₹1.49')).toBeInTheDocument()
  })

  it('is a real radio group with a legend', () => {
    render(<DeliveryOptions subtotalInr={SUBTOTAL} />)
    const group = screen.getByRole('group', { name: checkout.delivery.heading })
    expect(within(group).getAllByRole('radio')).toHaveLength(3)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<DeliveryOptions subtotalInr={SUBTOTAL} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
