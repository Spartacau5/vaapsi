import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/patterns/home/hero'
import { home } from '@/content/home'
import { passports } from '@/lib/data/fixtures/passports'
import { products } from '@/lib/data/fixtures/products'

/**
 * The hero carries the page's thesis, so that is what is worth asserting: the
 * garment, its history, and the fact that a garment without a passport still
 * renders a complete hero.
 */
const withPassport = products.find((p) => p.id === 'prd_bhaane_trucker_indigo')
const withoutPassport = products.find((p) => p.id === 'prd_zara_denim_waistcoat')
const passport = passports.find((p) => p.id === 'psp_bhaane_trucker_indigo')

describe('Hero', () => {
  it('leads with the thesis as the page heading', () => {
    render(<Hero product={withPassport!} passport={passport!} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(home.hero.thesis)
  })

  it('names the garment and links into it', () => {
    render(<Hero product={withPassport!} passport={passport!} />)
    expect(screen.getByText(withPassport!.brand)).toBeInTheDocument()
    expect(
      screen
        .getAllByRole('link')
        .some((link) => link.getAttribute('href') === `/product/${withPassport!.slug}`),
    ).toBe(true)
  })

  it('surfaces the provenance facts, which is the whole point of the hero', () => {
    render(<Hero product={withPassport!} passport={passport!} />)
    expect(screen.getByText(home.hero.facts.owners)).toBeInTheDocument()
    expect(screen.getByText('1 before you')).toBeInTheDocument()
  })

  it('omits a fact rather than printing an unknown value', () => {
    // The Levi's passport records its origin as unknown. A hero that prints
    // "Made: Unknown — label removed before intake" is worse than one that
    // simply does not show the field.
    const levis = products.find((p) => p.id === 'prd_levis_501_indigo')
    const levisPassport = passports.find((p) => p.id === 'psp_levis_501_indigo')
    render(<Hero product={levis!} passport={levisPassport!} />)
    expect(screen.queryByText(/label removed/)).toBeNull()
  })

  it('still renders a complete hero for a garment with no passport', () => {
    render(<Hero product={withoutPassport!} passport={null} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(home.hero.thesis)
    expect(screen.getByText(withoutPassport!.brand)).toBeInTheDocument()
    expect(screen.queryByText(home.hero.facts.owners)).toBeNull()
  })
})
