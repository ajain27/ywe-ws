import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddDealForm from './AddDealForm'
import { addDeal } from '../api/deals'

vi.mock('../api/deals', () => ({
  addDeal: vi.fn(),
}))

async function fillRequiredFields(user) {
  await user.type(screen.getByLabelText(/property address/i), '123 Main St')
  await user.type(screen.getByLabelText(/city/i), 'Dallas')
  await user.selectOptions(screen.getByLabelText(/state/i), 'TX')
  await user.type(screen.getByLabelText(/zip/i), '75201')
  await user.type(screen.getByLabelText(/photos link/i), 'https://photos.example.com/album')
}

describe('AddDealForm', () => {
  beforeEach(() => {
    addDeal.mockReset()
  })

  it('strips non-digit characters from the zip field and caps it at 5 digits', async () => {
    const user = userEvent.setup()
    render(<AddDealForm onDone={() => {}} />)

    await user.type(screen.getByLabelText(/zip/i), 'ab123456789')

    expect(screen.getByLabelText(/zip/i)).toHaveValue('12345')
  })

  it('formats the price field as currency while typing', async () => {
    const user = userEvent.setup()
    render(<AddDealForm onDone={() => {}} />)

    await user.type(screen.getByLabelText(/asking price/i), '199900')

    expect(screen.getByLabelText(/asking price/i)).toHaveValue('$199,900')
  })

  it('clears the price field when all digits are removed', async () => {
    const user = userEvent.setup()
    render(<AddDealForm onDone={() => {}} />)

    const price = screen.getByLabelText(/asking price/i)
    await user.type(price, '150000')
    await user.clear(price)

    expect(price).toHaveValue('')
  })

  it('shows a duplicate-address error as soon as the address field is blurred', async () => {
    const user = userEvent.setup()
    render(<AddDealForm onDone={() => {}} existingAddresses={['123 main st']} />)

    await user.type(screen.getByLabelText(/property address/i), '123 Main St')
    await user.tab()

    expect(screen.getByText('A deal for this address has already been added.')).toBeInTheDocument()
  })

  it('is case- and whitespace-insensitive when matching duplicate addresses', async () => {
    const user = userEvent.setup()
    render(<AddDealForm onDone={() => {}} existingAddresses={['123 main st']} />)

    await user.type(screen.getByLabelText(/property address/i), '  123   MAIN st ')
    await user.tab()

    expect(screen.getByText('A deal for this address has already been added.')).toBeInTheDocument()
  })

  it('does not show a duplicate error for an address that is not already used', async () => {
    const user = userEvent.setup()
    render(<AddDealForm onDone={() => {}} existingAddresses={['123 main st']} />)

    await user.type(screen.getByLabelText(/property address/i), '999 Unique Ct')
    await user.tab()

    expect(
      screen.queryByText('A deal for this address has already been added.'),
    ).not.toBeInTheDocument()
  })

  it('disables the Add Deal button while a duplicate-address error is showing', async () => {
    const user = userEvent.setup()
    render(<AddDealForm onDone={() => {}} existingAddresses={['123 main st']} />)

    await user.type(screen.getByLabelText(/property address/i), '123 Main St')
    await user.tab()

    expect(screen.getByRole('button', { name: 'Add Deal' })).toBeDisabled()
  })

  it('submits the form and calls onDone on success', async () => {
    addDeal.mockResolvedValueOnce({ id: 'new-deal' })
    const onDone = vi.fn()
    const user = userEvent.setup()
    render(<AddDealForm onDone={onDone} />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Add Deal' }))

    expect(addDeal).toHaveBeenCalledTimes(1)
    expect(addDeal).toHaveBeenCalledWith(
      expect.objectContaining({
        address: '123 Main St',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
      }),
    )
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('blocks submission and shows an error if the address became a duplicate without blurring', async () => {
    const onDone = vi.fn()
    const user = userEvent.setup()
    render(<AddDealForm onDone={onDone} existingAddresses={['123 main st']} />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Add Deal' }))

    expect(addDeal).not.toHaveBeenCalled()
    expect(onDone).not.toHaveBeenCalled()
    expect(screen.getByText('A deal for this address has already been added.')).toBeInTheDocument()
  })

  it('shows an error message and keeps the form open if addDeal rejects', async () => {
    addDeal.mockRejectedValueOnce(new Error('network down'))
    const onDone = vi.fn()
    const user = userEvent.setup()
    render(<AddDealForm onDone={onDone} />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Add Deal' }))

    expect(await screen.findByText('Could not add deal: network down')).toBeInTheDocument()
    expect(onDone).not.toHaveBeenCalled()
  })

  it('calls onDone when Cancel is clicked', async () => {
    const onDone = vi.fn()
    const user = userEvent.setup()
    render(<AddDealForm onDone={onDone} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
