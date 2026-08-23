import { render, screen, within } from '@testing-library/react'
import { PassportFront } from '../passport/front'
import { JourneyLine } from '../passport/journey-line'
import { ProvenanceDot, ProvenanceLegend, SourcedValue } from '../passport/provenance-dot'
import { Seal } from '../passport/seal'
import { passportCopy } from '@/content/passport'
import { passports } from '@/lib/data/fixtures/passports'
import type { Provenance } from '@/lib/types'

const ALL: Provenance[] = ['verified', 'supplier', 'self_declared', 'ai_extracted', 'ai_suggested']

const levis = passports.find((p) => p.id === 'psp_levis_501_indigo')
const nicobar = passports.find((p) => p.id === 'psp_nicobar_poplin_shirtdress')
const cos = passports.find((p) => p.id === 'psp_cos_wool_coat_stone')

describe('ProvenanceDot', () => {
  it('gives every provenance a distinct mark', () => {
    const shapes = ALL.map((provenance) => {
      const { container } = render(<ProvenanceDot provenance={provenance} />)
      return container.querySelector('svg')?.innerHTML ?? ''
    })
    expect(new Set(shapes).size).toBe(ALL.length)
  })

  it('encodes by fill and stroke only — never by colour', () => {
    for (const provenance of ALL) {
      const { container } = render(<ProvenanceDot provenance={provenance} />)
      const svg = container.querySelector('svg')
      // Everything paints with currentColor, so the mark survives greyscale,
      // the inverse theme, and being photocopied onto a care label.
      expect(svg?.innerHTML).not.toMatch(/#[0-9a-f]{3,6}/i)
      expect(svg?.innerHTML).not.toMatch(/rgb|hsl/i)
      expect(svg?.innerHTML).toContain('currentColor')
    }
  })

  it('distinguishes the two AI marks from each other and from self-declared', () => {
    const html = (provenance: Provenance) =>
      render(<ProvenanceDot provenance={provenance} />).container.innerHTML

    expect(html('ai_extracted')).toContain('stroke-dasharray')
    expect(html('ai_suggested')).toContain('stroke-dasharray')
    expect(html('ai_extracted')).not.toBe(html('ai_suggested'))
    expect(html('self_declared')).not.toContain('stroke-dasharray')
  })

  it('is labelled for a screen reader', () => {
    render(<ProvenanceDot provenance="verified" />)
    expect(screen.getByRole('img', { name: passportCopy.provenance.verified })).toBeInTheDocument()
  })
})

describe('SourcedValue', () => {
  it('puts the value before the mark, so the fact reads first', () => {
    const { container } = render(<SourcedValue value="India" provenance="supplier" />)
    const text = container.textContent ?? ''
    expect(text.startsWith('India')).toBe(true)
    expect(container.querySelector('svg')).not.toBeNull()
  })
})

describe('ProvenanceLegend', () => {
  it('explains all five marks', () => {
    render(<ProvenanceLegend />)
    for (const provenance of ALL) {
      expect(screen.getByText(passportCopy.provenance[provenance])).toBeInTheDocument()
    }
  })
})

describe('Seal', () => {
  it('is present with no animation when motion is reduced', () => {
    // useReducedMotion starts at true, so the first render is the settled state.
    const { container } = render(<Seal label="Verified by Vaapsi Studio" />)
    expect(screen.getByText('Verified by Vaapsi Studio')).toBeInTheDocument()
    expect(container.querySelector('.bg-accent')).not.toBeNull()
  })
})

describe('JourneyLine', () => {
  it('renders every event, in order, in both layouts', () => {
    expect(levis).toBeDefined()
    const { container } = render(<JourneyLine chain={levis!.chain} />)
    // Two lists: the vertical mobile one and the horizontal desktop one.
    const lists = container.querySelectorAll('ol')
    expect(lists).toHaveLength(2)
    for (const list of Array.from(lists)) {
      expect(list.querySelectorAll('li')).toHaveLength(levis!.chain.length)
    }
  })

  it('shows how each event is known, never leaving it unattributed', () => {
    render(<JourneyLine chain={levis!.chain} />)
    for (const event of levis!.chain) {
      expect(screen.getAllByText(event.verification.value).length).toBeGreaterThan(0)
    }
  })

  it('renders nothing for an empty chain', () => {
    const { container } = render(<JourneyLine chain={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('PassportFront', () => {
  it('leads with the journey', () => {
    render(<PassportFront passport={levis!} />)
    expect(screen.getByRole('heading', { name: /owner/i })).toBeInTheDocument()
  })

  it('never shows an impact number without its basis', () => {
    render(<PassportFront passport={levis!} />)
    expect(screen.getByText(levis!.impact!.basis)).toBeInTheDocument()
  })

  it('renders a passport with no impact block at all, without a gap', () => {
    expect(nicobar?.impact).toBeUndefined()
    render(<PassportFront passport={nicobar!} />)
    expect(screen.queryByText(/litres of water/)).toBeNull()
    expect(screen.queryByText(/kg of CO/)).toBeNull()
  })

  it('omits the seal when nothing has been authenticated', () => {
    expect(nicobar?.authentication.method).toBe('none')
    render(<PassportFront passport={nicobar!} />)
    expect(screen.queryByText(/Verified by/)).toBeNull()
  })

  it('shows the seal when a named party authenticated it', () => {
    render(<PassportFront passport={cos!} />)
    expect(screen.getByText(/Verified by/)).toBeInTheDocument()
  })

  it('marks recycled content', () => {
    render(<PassportFront passport={cos!} />)
    expect(screen.getByText('recycled')).toBeInTheDocument()
  })

  it('states the shortfall when a declared composition does not sum to 100', () => {
    const short = {
      ...nicobar!,
      materials: [
        {
          ...nicobar!.materials[0]!,
          percentage: { value: 97, provenance: 'self_declared' as const },
        },
      ],
    }
    render(<PassportFront passport={short} />)
    expect(screen.getByText(/totals 97%/)).toBeInTheDocument()
  })

  it('labels care instructions in words, not just symbols', () => {
    render(<PassportFront passport={cos!} />)
    const care = cos!.careInstructions[0]
    expect(within(document.body).getByText(care!.label)).toBeInTheDocument()
  })
})
