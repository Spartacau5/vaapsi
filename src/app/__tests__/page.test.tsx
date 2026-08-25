import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeroCarousel } from '@/components/patterns/home/hero-carousel'
import { home } from '@/content/home'

/**
 * The hero is editorial: it carries the page's thesis over rotating photography
 * and takes no data. So what is worth asserting is that the thesis is the page
 * heading, that every frame is described for someone who cannot see it, and that
 * the rotation is something a person can stop.
 */

/**
 * jsdom ships no `matchMedia`, so `useReducedMotion` holds its safe default and
 * every component renders its motion-off branch. This installs a stub that
 * reports motion as allowed, for the tests that need the animated path.
 */
function withMotion() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  })
}

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia')
})

const TOTAL = home.hero.slides.length

describe('HeroCarousel', () => {
  it('leads with the thesis as the page heading', () => {
    render(<HeroCarousel />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(home.hero.thesis)
  })

  it('offers one way in, and it goes to the stock', () => {
    // The pictures are not listings, so the hero cannot link to a garment. Its
    // single call to action has to reach the shop instead.
    render(<HeroCarousel />)
    const cta = screen.getByRole('link', { name: new RegExp(home.hero.cta, 'i') })
    expect(cta).toHaveAttribute('href', home.hero.ctaHref)
  })

  it('names no garment and no price', () => {
    // A caption naming a piece the photograph does not show would be a claim we
    // cannot back, and it is the failure mode this hero is shaped to avoid.
    const { container } = render(<HeroCarousel />)
    expect(container.textContent).not.toMatch(/₹/)
  })

  it('describes every frame rather than leaving alt empty', async () => {
    render(<HeroCarousel />)
    for (let i = 0; i < TOTAL; i++) {
      const slide = home.hero.slides[i]!
      expect(screen.getByAltText(slide.alt)).toBeInTheDocument()
      if (i < TOTAL - 1) {
        await userEvent.click(screen.getByRole('button', { name: home.hero.carousel.next }))
      }
    }
  })

  it('wraps backwards from the first frame rather than dead-ending', async () => {
    render(<HeroCarousel />)
    await userEvent.click(screen.getByRole('button', { name: home.hero.carousel.previous }))
    expect(screen.getByAltText(home.hero.slides.at(-1)!.alt)).toBeInTheDocument()
  })

  it('does not rotate, or offer a stop, when motion is off', () => {
    // jsdom has no matchMedia, so this is the reduced-motion path. Nothing
    // advances by itself, so there is nothing to pause - a stop control here
    // would be a button that does nothing.
    render(<HeroCarousel />)
    expect(screen.queryByRole('button', { name: home.hero.carousel.pause })).toBeNull()
    expect(screen.getByRole('button', { name: home.hero.carousel.next })).toBeInTheDocument()
  })

  it('offers a pause control once it actually rotates', async () => {
    // WCAG 2.2.2 - anything moving past five seconds needs a stop, and hover is
    // not a control a keyboard or touch user has.
    withMotion()
    render(<HeroCarousel />)
    const pause = await screen.findByRole('button', { name: home.hero.carousel.pause })
    await userEvent.click(pause)
    expect(screen.getByRole('button', { name: home.hero.carousel.play })).toBeInTheDocument()
  })

  it('is announced as a carousel, with a labelled position for every frame', () => {
    render(<HeroCarousel />)
    const region = screen.getByRole('region', { name: home.hero.carousel.label })
    expect(region).toHaveAttribute('aria-roledescription', 'carousel')
    for (let i = 0; i < TOTAL; i++) {
      expect(
        screen.getAllByLabelText(home.hero.carousel.position(i + 1, TOTAL)).length,
      ).toBeGreaterThan(0)
    }
  })
})
