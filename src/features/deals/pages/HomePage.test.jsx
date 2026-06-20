import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage'
import { subscribeToDeals } from '../api/deals'

vi.mock('../../../lib/firebase', () => ({ firebaseConfigured: true }))

vi.mock('../api/deals', () => ({
  subscribeToDeals: vi.fn(),
}))

vi.mock('../components/AddDealForm', () => ({
  default: ({ existingAddresses }) => (
    <div data-testid="add-deal-form">{JSON.stringify(existingAddresses)}</div>
  ),
}))

const sampleDeals = [
  { id: '1', address: '123 Main St', city: 'Dallas', state: 'TX', zip: '75201', price: '$150,000' },
  {
    id: '2',
    address: '456 Oak Ave',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    price: '$300,000',
  },
]

function renderWithDeals(deals = sampleDeals, props = {}) {
  subscribeToDeals.mockImplementation((callback) => {
    callback(deals)
    return () => {}
  })
  return render(
    <MemoryRouter>
      <HomePage activeTab="deals" onShowDealsTab={() => {}} {...props} />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  it('shows a loading state before deals arrive', () => {
    subscribeToDeals.mockImplementation(() => () => {})
    render(
      <MemoryRouter>
        <HomePage activeTab="deals" onShowDealsTab={() => {}} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Loading deals…')).toBeInTheDocument()
  })

  it('renders a deal card for every subscribed deal', () => {
    renderWithDeals()
    expect(screen.getByText('123 Main St')).toBeInTheDocument()
    expect(screen.getByText('456 Oak Ave')).toBeInTheDocument()
  })

  it('shows the "no deals posted yet" message when there are none at all', () => {
    renderWithDeals([])
    expect(screen.getByText('No deals posted yet. Check back soon.')).toBeInTheDocument()
  })

  it('filters the deals grid by the selected state', async () => {
    const user = userEvent.setup()
    renderWithDeals()

    await user.selectOptions(screen.getByLabelText(/filter by state/i), 'WA')

    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument()
    expect(screen.getByText('456 Oak Ave')).toBeInTheDocument()
  })

  it('shows a filter-specific empty message when a state filter excludes every deal', async () => {
    const user = userEvent.setup()
    renderWithDeals()

    await user.selectOptions(screen.getByLabelText(/filter by state/i), 'NY')

    expect(screen.getByText('No deals match this filter.')).toBeInTheDocument()
    expect(screen.queryByText('No deals posted yet. Check back soon.')).not.toBeInTheDocument()
  })

  it('does not render the state filter on the Add a Deal tab', () => {
    subscribeToDeals.mockImplementation((callback) => {
      callback(sampleDeals)
      return () => {}
    })
    render(
      <MemoryRouter>
        <HomePage activeTab="add" onShowDealsTab={() => {}} />
      </MemoryRouter>,
    )
    expect(screen.queryByLabelText(/filter by state/i)).not.toBeInTheDocument()
    expect(screen.getByTestId('add-deal-form')).toBeInTheDocument()
  })

  it('passes normalized existing addresses down to the Add Deal form', () => {
    subscribeToDeals.mockImplementation((callback) => {
      callback(sampleDeals)
      return () => {}
    })
    render(
      <MemoryRouter>
        <HomePage activeTab="add" onShowDealsTab={() => {}} />
      </MemoryRouter>,
    )
    const passed = JSON.parse(screen.getByTestId('add-deal-form').textContent)
    expect(passed).toEqual(['123 main st', '456 oak ave'])
  })
})
