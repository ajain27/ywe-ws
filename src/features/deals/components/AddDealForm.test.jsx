import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddDealForm from './AddDealForm'
import { addDeal } from '../api/deals'
import { resizeImageToDataUrl } from '../utils/image'

vi.mock('../api/deals', () => ({
  addDeal: vi.fn(),
}))

vi.mock('../utils/image', () => ({
  resizeImageToDataUrl: vi.fn(),
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
    resizeImageToDataUrl.mockReset()
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

  it('rejects a non-image thumbnail file without attempting to resize it', async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(<AddDealForm onDone={() => {}} />)

    const file = new File(['not an image'], 'doc.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText(/thumbnail image/i), file)

    expect(screen.getByText('Thumbnail must be an image file.')).toBeInTheDocument()
    expect(resizeImageToDataUrl).not.toHaveBeenCalled()
    expect(screen.queryByAltText('Thumbnail preview')).not.toBeInTheDocument()
  })

  it('shows a preview after a valid image is resized, and clears it on Remove', async () => {
    resizeImageToDataUrl.mockResolvedValueOnce('data:image/jpeg;base64,abc')
    const user = userEvent.setup()
    render(<AddDealForm onDone={() => {}} />)

    const file = new File(['fake-bytes'], 'house.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText(/thumbnail image/i), file)

    const preview = await screen.findByAltText('Thumbnail preview')
    expect(preview).toHaveAttribute('src', 'data:image/jpeg;base64,abc')
    expect(screen.queryByLabelText(/thumbnail image/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove' }))

    expect(screen.queryByAltText('Thumbnail preview')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/thumbnail image/i)).toBeInTheDocument()
  })

  it('shows an error if the resized image is still too large', async () => {
    resizeImageToDataUrl.mockResolvedValueOnce(`data:image/jpeg;base64,${'a'.repeat(800 * 1024)}`)
    const user = userEvent.setup()
    render(<AddDealForm onDone={() => {}} />)

    const file = new File(['fake-bytes'], 'house.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText(/thumbnail image/i), file)

    expect(
      await screen.findByText('Image is too large even after compression. Try a smaller photo.'),
    ).toBeInTheDocument()
    expect(screen.queryByAltText('Thumbnail preview')).not.toBeInTheDocument()
  })

  it('shows an error if resizing the image fails', async () => {
    resizeImageToDataUrl.mockRejectedValueOnce(new Error('boom'))
    const user = userEvent.setup()
    render(<AddDealForm onDone={() => {}} />)

    const file = new File(['fake-bytes'], 'house.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText(/thumbnail image/i), file)

    expect(
      await screen.findByText('Could not process that image. Try a different file.'),
    ).toBeInTheDocument()
  })

  it('includes the resized thumbnail data URL when submitting', async () => {
    resizeImageToDataUrl.mockResolvedValueOnce('data:image/jpeg;base64,abc')
    addDeal.mockResolvedValueOnce({ id: 'new-deal' })
    const user = userEvent.setup()
    render(<AddDealForm onDone={() => {}} />)

    const file = new File(['fake-bytes'], 'house.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText(/thumbnail image/i), file)
    await screen.findByAltText('Thumbnail preview')
    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Add Deal' }))

    expect(addDeal).toHaveBeenCalledWith(
      expect.objectContaining({ thumbnailUrl: 'data:image/jpeg;base64,abc' }),
    )
  })

  it('submits with an empty thumbnailUrl when no image was selected', async () => {
    addDeal.mockResolvedValueOnce({ id: 'new-deal' })
    const user = userEvent.setup()
    render(<AddDealForm onDone={() => {}} />)

    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Add Deal' }))

    expect(addDeal).toHaveBeenCalledWith(expect.objectContaining({ thumbnailUrl: '' }))
  })
})
