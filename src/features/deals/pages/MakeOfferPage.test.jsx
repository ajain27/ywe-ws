import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MakeOfferPage from './MakeOfferPage'
import { addOffer, getDeal } from '../api/deals'

vi.mock('../api/deals', () => ({
  getDeal: vi.fn(),
  addOffer: vi.fn(),
}))

const deal = { id: 'abc', address: '123 Main St', city: 'Dallas', state: 'TX', zip: '75201' }

function renderAt(dealId = 'abc') {
  return render(
    <MemoryRouter initialEntries={[`/deals/${dealId}/offer`]}>
      <Routes>
        <Route path="/deals/:dealId/offer" element={<MakeOfferPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MakeOfferPage', () => {
  beforeEach(() => {
    getDeal.mockResolvedValue(deal)
    addOffer.mockReset()
  })

  it('shows the deal address once loaded', async () => {
    renderAt()
    expect(await screen.findByText('123 Main St, Dallas, TX 75201')).toBeInTheDocument()
  })

  it('submits an offer with the deal context and shows a success message', async () => {
    addOffer.mockResolvedValueOnce({ id: 'offer-1' })
    const user = userEvent.setup()
    renderAt()

    await screen.findByText('123 Main St, Dallas, TX 75201')
    await user.type(screen.getByLabelText(/your name/i), 'Jane Buyer')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/phone/i), '555-555-5555')
    await user.type(screen.getByLabelText(/offer amount/i), '$140,000')
    await user.click(screen.getByRole('button', { name: 'Submit Offer' }))

    expect(
      await screen.findByText("Offer submitted! We'll be in touch shortly."),
    ).toBeInTheDocument()
    expect(addOffer).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId: 'abc',
        dealAddress: '123 Main St, Dallas, TX 75201',
        buyerName: 'Jane Buyer',
        buyerEmail: 'jane@example.com',
        buyerPhone: '555-555-5555',
        offerAmount: '$140,000',
      }),
    )
  })

  it('shows an error message if submitting the offer fails', async () => {
    addOffer.mockRejectedValueOnce(new Error('network down'))
    const user = userEvent.setup()
    renderAt()

    await screen.findByText('123 Main St, Dallas, TX 75201')
    await user.type(screen.getByLabelText(/your name/i), 'Jane Buyer')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/phone/i), '555-555-5555')
    await user.type(screen.getByLabelText(/offer amount/i), '$140,000')
    await user.click(screen.getByRole('button', { name: 'Submit Offer' }))

    expect(await screen.findByText('Could not submit offer: network down')).toBeInTheDocument()
  })
})
