import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders as render } from '@/test-utils'
import { ProductDrawers } from '../product/product-drawer'
import { drawers } from '@/content/drawers'
import { passports } from '@/lib/data/fixtures/passports'
import { products } from '@/lib/data/fixtures/products'
import { sellers } from '@/lib/data/fixtures/sellers'
import type { Product } from '@/lib/types'

const withPassport = products.find((p) => p.id === 'prd_levis_501_indigo') as Product
const withoutPassport = products.find((p) => p.passportId === null) as Product
const passport = passports.find((p) => p.id === 'psp_levis_501_indigo')!
const seller = sellers[0]!

describe('ProductDrawers', () => {
  it('shows both triggers and no panel content until one is clicked', () => {
    render(<ProductDrawers product={withPassport} passport={passport} seller={seller} />)

    expect(screen.getByRole('button', { name: drawers.details.trigger })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: drawers.delivery.trigger })).toBeInTheDocument()

    // Both overlays are mounted but unfocusable and hidden, which is what keeps
    // them out of the tab order before hydration as well.
    for (const dialog of screen.queryAllByRole('dialog', { hidden: true })) {
      expect(dialog.closest('[aria-hidden="true"]')).not.toBeNull()
    }
  })

  it('opens Product details and closes it on Escape', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers product={withPassport} passport={passport} seller={seller} />)

    await user.click(screen.getByRole('button', { name: drawers.details.trigger }))
    const panel = screen.getByRole('dialog', { name: drawers.details.heading })
    expect(panel.closest('[aria-hidden="false"]')).not.toBeNull()

    await user.keyboard('{Escape}')
    expect(
      screen
        .getByRole('dialog', { name: drawers.details.heading, hidden: true })
        .closest('[aria-hidden="true"]'),
    ).not.toBeNull()
  })

  it('closes on the X', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers product={withPassport} passport={passport} seller={seller} />)

    await user.click(screen.getByRole('button', { name: drawers.details.trigger }))
    const panel = screen.getByRole('dialog', { name: drawers.details.heading })
    await user.click(within(panel).getByRole('button', { name: drawers.close }))
    expect(panel.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('opens only one drawer at a time', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers product={withPassport} passport={passport} seller={seller} />)

    await user.click(screen.getByRole('button', { name: drawers.details.trigger }))
    await user.click(
      within(screen.getByRole('dialog', { name: drawers.details.heading })).getByRole('button', {
        name: drawers.close,
      }),
    )
    await user.click(screen.getByRole('button', { name: drawers.delivery.trigger }))

    expect(
      screen
        .getByRole('dialog', { name: drawers.delivery.heading })
        .closest('[aria-hidden="false"]'),
    ).not.toBeNull()
    expect(
      screen
        .getByRole('dialog', { name: drawers.details.heading, hidden: true })
        .closest('[aria-hidden="true"]'),
    ).not.toBeNull()
  })

  it('puts the measurements, product code and composition in the details drawer', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers product={withPassport} passport={passport} seller={seller} />)
    await user.click(screen.getByRole('button', { name: drawers.details.trigger }))
    const panel = screen.getByRole('dialog', { name: drawers.details.heading })

    expect(within(panel).getByText(drawers.details.sections.measurements)).toBeInTheDocument()
    expect(within(panel).getByText('78 cm')).toBeInTheDocument()
    expect(within(panel).getByText(withPassport.sku)).toBeInTheDocument()
    expect(within(panel).getByText('Cotton')).toBeInTheDocument()
    expect(within(panel).getByText('99%')).toBeInTheDocument()
  })

  it('says composition is unknown rather than showing a blank section', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers product={withoutPassport} passport={null} seller={seller} />)
    await user.click(screen.getByRole('button', { name: drawers.details.trigger }))
    const panel = screen.getByRole('dialog', { name: drawers.details.heading })

    expect(within(panel).getByText(drawers.details.materialsUnknown)).toBeInTheDocument()
    expect(within(panel).getByText(drawers.details.careUnknown)).toBeInTheDocument()
  })

  it('never puts condition or flaws in a drawer', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers product={withPassport} passport={passport} seller={seller} />)
    await user.click(screen.getByRole('button', { name: drawers.details.trigger }))
    const panel = screen.getByRole('dialog', { name: drawers.details.heading })

    // Condition is the purchase decision on resale, not reference material. It
    // stays on the page where it cannot be missed. If a future change moves the
    // flaw disclosure in here, this fails.
    for (const flaw of withPassport.flaws) {
      expect(within(panel).queryByText(flaw.description)).toBeNull()
    }
    expect(within(panel).queryByText(/What to expect/)).toBeNull()
  })

  it('keeps delivery and returns copy provisional rather than promising a courier', async () => {
    const user = userEvent.setup()
    render(<ProductDrawers product={withPassport} passport={passport} seller={seller} />)
    await user.click(screen.getByRole('button', { name: drawers.delivery.trigger }))
    const panel = screen.getByRole('dialog', { name: drawers.delivery.heading })

    expect(within(panel).getByText(drawers.delivery.deliveryBody)).toBeInTheDocument()
    expect(within(panel).getByText(drawers.delivery.returnsBody)).toBeInTheDocument()
    // Nothing here should read as a firm delivery promise.
    expect(panel.textContent).not.toMatch(/guaranteed|delivered by \w+day/i)
  })
})
