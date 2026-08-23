import { render, screen } from '@testing-library/react'
import { common } from '@/content'
import HomePage from '../page'

describe('HomePage', () => {
  it('renders the wordmark', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(common.brand.name)
  })
})
