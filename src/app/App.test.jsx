import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../features/deals/api/deals', () => ({
  subscribeToDeals: vi.fn(() => () => {}),
  getDeal: vi.fn(() => Promise.resolve(null)),
  addDeal: vi.fn(),
  addOffer: vi.fn(),
}))

async function renderAppWith(firebaseConfigured) {
  vi.resetModules()
  vi.doMock('../lib/firebase', () => ({ firebaseConfigured }))
  const { default: App } = await import('./App')
  return render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  afterEach(() => {
    vi.doUnmock('../lib/firebase')
  })

  it('renders the header, footer, and home page', async () => {
    await renderAppWith(true)
    expect(screen.getByText('You Win Estates')).toBeInTheDocument()
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument()
    expect(screen.getByText('Available Deals to Purchase')).toBeInTheDocument()
  })

  it('shows the Firebase config banner when Firebase is not configured', async () => {
    await renderAppWith(false)
    expect(screen.getByText(/firebase is not configured yet/i)).toBeInTheDocument()
  })

  it('hides the Firebase config banner when Firebase is configured', async () => {
    await renderAppWith(true)
    expect(screen.queryByText(/firebase is not configured yet/i)).not.toBeInTheDocument()
  })

  it('switches between the Available Deals and Add a Deal tabs via the header', async () => {
    const user = userEvent.setup()
    await renderAppWith(true)

    expect(screen.getByText('Available Deals to Purchase')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '+ Add a Deal' }))
    expect(screen.getByText('Add a Deal')).toBeInTheDocument()
    expect(screen.queryByText('Available Deals to Purchase')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Available Deals' }))
    expect(screen.getByText('Available Deals to Purchase')).toBeInTheDocument()
  })
})
