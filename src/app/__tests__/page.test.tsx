import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeroCarousel } from '@/components/patterns/home/hero-carousel'
import { NewInRail } from '@/components/patterns/home/new-in-rail'
import { home } from '@/content/home'
import { listProducts } from '@/lib/data'

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

  it('keeps the thesis as the heading even though nothing renders it', () => {
    // The picture carries the hero, but the document still needs an h1 and
    // search still needs to know what this page is about.
    render(<HeroCarousel />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.className).toContain('sr-only')
  })

  it('shows no caption over the photograph', () => {
    // A white card floating mid-image was the one piece of chrome here that
    // could not be justified. Nothing visible should carry the lede or a price.
    const { container } = render(<HeroCarousel />)
    expect(container.textContent).not.toContain(home.hero.lede)
    expect(container.textContent).not.toMatch(/₹/)
  })

  it('describes every frame rather than leaving alt empty', async () => {
    render(<HeroCarousel />)
    for (let i = 0; i < TOTAL; i++) {
      const slide = home.hero.slides[i]!
      expect(screen.getByAltText(slide.alt)).toBeInTheDocument()
      if (i < TOTAL - 1) {
        await userEvent.click(
          screen.getByRole('button', { name: home.hero.carousel.position(i + 2, TOTAL) }),
        )
      }
    }
  })

  it('is steered by the position rail alone', async () => {
    // The rail is the whole control surface. It says how many frames there are,
    // which one you are on, and clicking one goes straight there — arrows and a
    // pause button beside it were three controls doing one control's work.
    withMotion()
    render(<HeroCarousel />)
    const controls = screen.getAllByRole('button')
    expect(controls).toHaveLength(TOTAL)
    await userEvent.click(controls.at(-1)!)
    expect(screen.getByAltText(home.hero.slides.at(-1)!.alt)).toBeInTheDocument()
  })

  it('marks the frame on screen as current', async () => {
    render(<HeroCarousel />)
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-current', 'true')
    await userEvent.click(screen.getAllByRole('button')[1]!)
    expect(screen.getAllByRole('button')[1]).toHaveAttribute('aria-current', 'true')
    expect(screen.getAllByRole('button')[0]).not.toHaveAttribute('aria-current')
  })

  it('keeps looping after the rail is used', async () => {
    // The rotation is meant to run indefinitely, so picking a frame jumps there
    // and lets it carry on rather than handing control over permanently.
    withMotion()
    jest.useFakeTimers({ advanceTimers: true })
    try {
      render(<HeroCarousel />)
      const rule = screen.getAllByRole('button')[1]!
      await userEvent.click(rule)
      expect(screen.getByAltText(home.hero.slides[1]!.alt)).toBeInTheDocument()
      // jsdom cannot answer `:focus-visible`, so the component takes the safe
      // branch and treats this as keyboard focus. In a browser a pointer click
      // never pauses; here we blur to reach the same state.
      await act(async () => {
        rule.blur()
      })
      await act(async () => {
        jest.advanceTimersByTime(4100)
      })
      expect(screen.getByAltText(home.hero.slides[2]!.alt)).toBeInTheDocument()
    } finally {
      jest.useRealTimers()
    }
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

describe('NewInRail', () => {
  async function recent() {
    return (await listProducts({ sort: 'newest', limit: 6 })).items
  }

  it('gives the rail arrows as well as a scrollbar', async () => {
    // Shift-scroll is not something most people know, and a scrollbar under a
    // row of images is not an inviting control.
    render(<NewInRail products={await recent()} />)
    expect(screen.getByRole('button', { name: home.newIn.previous })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: home.newIn.next })).toBeInTheDocument()
  })

  it('leaves the rail to the arrows alone', async () => {
    // No "See everything" beside them. The footer and the header both reach the
    // shop, and a third route out sitting next to the two controls that move
    // the rail made it ambiguous which one advanced it.
    render(<NewInRail products={await recent()} />)
    expect(screen.queryByRole('link', { name: new RegExp(home.newIn.cta, 'i') })).toBeNull()
  })

  it('holds the arrows against the right edge even when the header wraps', async () => {
    // `justify-between` alone puts a lone wrapped item at the start of its
    // line, which silently turns a right-aligned control into a left-aligned
    // one at exactly the widths where the heading and lede are longest.
    render(<NewInRail products={await recent()} />)
    const controls = screen.getByRole('button', { name: home.newIn.next }).parentElement!
    expect(controls.parentElement?.className).toContain('ml-auto')
  })

  it('disables back at the start rather than wrapping', async () => {
    // This is a scroll position, not a carousel. A rail that silently jumps to
    // the start loses the reader's place.
    render(<NewInRail products={await recent()} />)
    expect(screen.getByRole('button', { name: home.newIn.previous })).toBeDisabled()
  })

  it('scrolls the rail rather than reimplementing it', async () => {
    const products = await recent()
    render(<NewInRail products={products} />)
    const rail = screen.getByRole('list', { name: home.newIn.railLabel })
    const scrollBy = jest.fn()
    rail.scrollBy = scrollBy
    // jsdom lays nothing out, so clientWidth is 0 and the rail reports itself
    // fully scrolled — forcing a width is what makes the button live.
    Object.defineProperty(rail, 'clientWidth', { configurable: true, value: 800 })
    Object.defineProperty(rail, 'scrollWidth', { configurable: true, value: 3000 })
    rail.dispatchEvent(new Event('scroll', { bubbles: true }))
    await userEvent.click(screen.getByRole('button', { name: home.newIn.next }))
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))
    expect(scrollBy.mock.calls[0]![0].left).toBeGreaterThan(0)
  })

  it('renders nothing rather than an empty rail', () => {
    const { container } = render(<NewInRail products={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
