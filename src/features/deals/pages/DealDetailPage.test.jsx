import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import DealDetailPage from './DealDetailPage'
import { getDeal } from '../api/deals'

vi.mock('../api/deals', () => ({
  getDeal: vi.fn(),
}))

function renderAt(dealId) {
  return render(
    <MemoryRouter initialEntries={[`/deals/${dealId}`]}>
      <Routes>
        <Route path="/deals/:dealId" element={<DealDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DealDetailPage', () => {
  it('shows a loading state first', () => {
    getDeal.mockReturnValue(new Promise(() => {}))
    renderAt('abc')
    expect(screen.getByText('Loading deal…')).toBeInTheDocument()
  })

  it('renders the deal once it resolves', async () => {
    getDeal.mockResolvedValueOnce({
      id: 'abc',
      address: '123 Main St',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
      price: '$150,000',
      description: 'Needs cosmetic rehab',
      zillowLink: 'https://www.zillow.com/homedetails/123',
      photosLink: 'https://photos.example.com/album',
    })
    renderAt('abc')

    expect(await screen.findByText('123 Main St')).toBeInTheDocument()
    expect(screen.getByText('Dallas, TX 75201')).toBeInTheDocument()
    expect(screen.getByText('$150,000')).toBeInTheDocument()
    expect(screen.getByText('Needs cosmetic rehab')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View on Zillow' })).toHaveAttribute(
      'href',
      'https://www.zillow.com/homedetails/123',
    )
    expect(screen.getByRole('link', { name: 'Make Offer' })).toHaveAttribute(
      'href',
      '/deals/abc/offer',
    )
  })

  it('renders the uploaded thumbnail as a hero image when present', async () => {
    getDeal.mockResolvedValueOnce({
      id: 'abc',
      address: '123 Main St',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
      thumbnailUrl: 'https://storage.example.com/thumb.jpg',
    })
    renderAt('abc')

    expect(await screen.findByText('123 Main St')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://storage.example.com/thumb.jpg')
  })

  it('renders no hero image when there is no thumbnail', async () => {
    getDeal.mockResolvedValueOnce({
      id: 'abc',
      address: '123 Main St',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
    })
    renderAt('abc')

    expect(await screen.findByText('123 Main St')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows a not-found message when the deal does not exist', async () => {
    getDeal.mockResolvedValueOnce(null)
    renderAt('missing')

    expect(await screen.findByText(/this deal could not be found/i)).toBeInTheDocument()
  })

  it('shows an error message if fetching the deal fails', async () => {
    getDeal.mockRejectedValueOnce(new Error('network down'))
    renderAt('abc')

    expect(await screen.findByText('network down')).toBeInTheDocument()
  })
})
