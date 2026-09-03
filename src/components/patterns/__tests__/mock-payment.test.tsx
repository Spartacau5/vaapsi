import { axe, toHaveNoViolations } from 'jest-axe'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockPayment } from '../checkout/mock-payment'
import { checkout } from '@/content/checkout'

expect.extend(toHaveNoViolations)

/**
 * The demo payment step.
 *
 * These are safety tests, not feature tests. The risk this component carries is
 * that somebody types a real card number into a prototype, or that a reviewer
 * mistakes it for a working checkout — so what is asserted here is the
 * safeguards, and they should be the last things anyone weakens.
 */
describe('MockPayment', () => {
  it('says it is a demo, permanently and not as small print', () => {
    render(<MockPayment />)
    const note = screen.getByRole('note')
    expect(note).toHaveTextContent(checkout.payment.demoTitle)
    // No dismiss control: it cannot be cleared away before a screenshot.
    expect(screen.queryByRole('button', { name: /dismiss|close/i })).toBeNull()
  })

  it('refuses a real-looking card number', async () => {
    const user = userEvent.setup()
    render(<MockPayment />)
    const field = screen.getByLabelText(new RegExp(checkout.payment.card.number))

    await user.type(field, '5454545454545454')
    expect(screen.getByText(checkout.payment.card.rejected)).toBeInTheDocument()
    expect(field).toHaveAttribute('aria-invalid', 'true')
  })

  it('accepts only the published test card', async () => {
    const user = userEvent.setup()
    const onValidityChange = jest.fn()
    render(<MockPayment onValidityChange={onValidityChange} />)

    await user.type(
      screen.getByLabelText(new RegExp(checkout.payment.card.number)),
      checkout.payment.card.testNumber,
    )
    expect(screen.queryByText(checkout.payment.card.rejected)).toBeNull()
    expect(onValidityChange).toHaveBeenLastCalledWith(true)
  })

  it('does not report readiness while the card is wrong', async () => {
    const user = userEvent.setup()
    const onValidityChange = jest.fn()
    render(<MockPayment onValidityChange={onValidityChange} />)
    await user.type(
      screen.getByLabelText(new RegExp(checkout.payment.card.number)),
      '4111111111111112',
    )
    expect(onValidityChange).toHaveBeenLastCalledWith(false)
  })

  it('offers the three Indian payment methods a shopper would expect', () => {
    render(<MockPayment />)
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(screen.getByRole('radio', { name: /UPI/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Net banking/ })).toBeInTheDocument()
  })

  it('swaps the fields with the method, so no card field is left hanging', async () => {
    const user = userEvent.setup()
    render(<MockPayment />)
    await user.click(screen.getByRole('radio', { name: /UPI/ }))

    expect(screen.queryByLabelText(new RegExp(checkout.payment.card.number))).toBeNull()
    expect(screen.getByLabelText(new RegExp(checkout.payment.upi.id))).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<MockPayment />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
