import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import DealCard from './DealCard'

const deal = {
  id: 'deal-1',
  address: '123 Main St',
  city: 'Dallas',
  state: 'TX',
  zip: '75201',
  price: '$150,000',
  photosLink: 'https://photos.example.com/album',
}

function renderCard(overrides = {}) {
  return render(
    <MemoryRouter>
      <DealCard deal={{ ...deal, ...overrides }} />
    </MemoryRouter>,
  )
}

describe('DealCard', () => {
  it('renders the address, location, and price', () => {
    renderCard()
    expect(screen.getByText('123 Main St')).toBeInTheDocument()
    expect(screen.getByText('Dallas, TX 75201')).toBeInTheDocument()
    expect(screen.getByText('$150,000')).toBeInTheDocument()
  })

  it('links to the deal detail page', () => {
    renderCard()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/deals/deal-1')
  })

  it('omits the price line when the deal has no price', () => {
    renderCard({ price: '' })
    expect(screen.queryByText('$150,000')).not.toBeInTheDocument()
  })

  it('shows the photo when it loads successfully', () => {
    renderCard()
    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.queryByText('View Photos')).not.toBeInTheDocument()
  })

  it('falls back to a "View Photos" placeholder if the image fails to load', () => {
    renderCard()
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByText('View Photos')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('prefers the uploaded thumbnail over the photos link', () => {
    renderCard({ thumbnailUrl: 'https://storage.example.com/thumb.jpg' })
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://storage.example.com/thumb.jpg')
  })

  it('falls back to the photos link when there is no thumbnail', () => {
    renderCard({ thumbnailUrl: undefined })
    expect(screen.getByRole('img')).toHaveAttribute('src', deal.photosLink)
  })
})
