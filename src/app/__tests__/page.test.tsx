import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeroCarousel } from '@/components/patterns/home/hero-carousel'
import { home } from '@/content/home'
import { listFeaturedProducts } from '@/lib/data'

/**
 * The hero carries the page's thesis and rotates through real listings, so what
 * is worth asserting is that every frame is a genuine garment you can reach, and
 * that the rotation is something a person can stop.
 */
async function featured(count = 3) {
  return (await listFeaturedProducts(count)).slice(0, count)
}

/**
 * jsdom ships no `matchMedia`, so `useReducedMotion` holds its safe default and
 * every component renders its motion-off branch. This installs a stub that
 * reports motion as allowed, for the tests that need the animated path.
 */
function withMotion() {
  const listeners = new Set<() => void>()
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    }),
  })
}

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia')
})

describe('HeroCarousel', () => {
  it('leads with the thesis as the page heading', async () => {
    render(<HeroCarousel products={await featured()} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(home.hero.thesis)
  })

  it('names the garment on show and links into it', async () => {
    const products = await featured()
    render(<HeroCarousel products={products} />)
    expect(screen.getByText(products[0]!.brand)).toBeInTheDocument()
    expect(
      screen
        .getAllByRole('link')
        .some((link) => link.getAttribute('href') === `/product/${products[0]!.slug}`),
    ).toBe(true)
  })

  it('advances to the next real listing when steered', async () => {
    const products = await featured()
    render(<HeroCarousel products={products} />)
    await userEvent.click(screen.getByRole('button', { name: home.hero.carousel.next }))
    expect(
      screen
        .getAllByRole('link')
        .some((link) => link.getAttribute('href') === `/product/${products[1]!.slug}`),
    ).toBe(true)
  })

  it('wraps backwards from the first frame rather than dead-ending', async () => {
    const products = await featured()
    render(<HeroCarousel products={products} />)
    await userEvent.click(screen.getByRole('button', { name: home.hero.carousel.previous }))
    expect(
      screen
        .getAllByRole('link')
        .some((link) => link.getAttribute('href') === `/product/${products.at(-1)!.slug}`),
    ).toBe(true)
  })

  it('does not rotate, or offer a stop, when motion is off', async () => {
    // jsdom has no matchMedia, so the hook holds its safe default and this is
    // the reduced-motion path. Nothing advances by itself, so there is nothing
    // to pause — a stop control here would be a button that does nothing.
    render(<HeroCarousel products={await featured()} />)
    expect(screen.queryByRole('button', { name: home.hero.carousel.pause })).toBeNull()
    expect(screen.getByRole('button', { name: home.hero.carousel.next })).toBeInTheDocument()
  })

  it('offers a pause control once it actually rotates', async () => {
    // WCAG 2.2.2 — anything moving past five seconds needs a stop, and hover is
    // not a control a keyboard or touch user has.
    withMotion()
    render(<HeroCarousel products={await featured()} />)
    const pause = await screen.findByRole('button', { name: home.hero.carousel.pause })
    await userEvent.click(pause)
    expect(screen.getByRole('button', { name: home.hero.carousel.play })).toBeInTheDocument()
  })

  it('is announced as a carousel, with a labelled position for every frame', async () => {
    const products = await featured()
    render(<HeroCarousel products={products} />)
    const region = screen.getByRole('region', { name: home.hero.carousel.label })
    expect(region).toHaveAttribute('aria-roledescription', 'carousel')
    for (let i = 0; i < products.length; i++) {
      expect(
        screen.getAllByLabelText(home.hero.carousel.position(i + 1, products.length)).length,
      ).toBeGreaterThan(0)
    }
  })

  it('renders nothing rather than an empty frame when there is no stock', () => {
    const { container } = render(<HeroCarousel products={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('drops the controls entirely for a single garment', async () => {
    render(<HeroCarousel products={await featured(1)} />)
    expect(screen.queryByRole('button', { name: home.hero.carousel.next })).toBeNull()
  })
})
