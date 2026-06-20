import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import DealsHeaderTabs from './DealsHeaderTabs'

describe('DealsHeaderTabs', () => {
  it('marks the active tab with the "active" class', () => {
    render(<DealsHeaderTabs activeTab="deals" onChangeTab={() => {}} />)

    expect(screen.getByRole('button', { name: 'Available Deals' })).toHaveClass('active')
    expect(screen.getByRole('button', { name: '+ Add a Deal' })).not.toHaveClass('active')
  })

  it('calls onChangeTab with "add" when the Add a Deal tab is clicked', async () => {
    const onChangeTab = vi.fn()
    render(<DealsHeaderTabs activeTab="deals" onChangeTab={onChangeTab} />)

    await userEvent.click(screen.getByRole('button', { name: '+ Add a Deal' }))

    expect(onChangeTab).toHaveBeenCalledWith('add')
  })

  it('calls onChangeTab with "deals" when the Available Deals tab is clicked', async () => {
    const onChangeTab = vi.fn()
    render(<DealsHeaderTabs activeTab="add" onChangeTab={onChangeTab} />)

    await userEvent.click(screen.getByRole('button', { name: 'Available Deals' }))

    expect(onChangeTab).toHaveBeenCalledWith('deals')
  })
})
