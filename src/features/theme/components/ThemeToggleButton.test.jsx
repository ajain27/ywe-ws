import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ThemeToggleButton from './ThemeToggleButton'

describe('ThemeToggleButton', () => {
  it('shows a moon icon and "switch to dark" label in light mode', () => {
    render(<ThemeToggleButton theme="light" onToggle={() => {}} />)
    const button = screen.getByRole('button', { name: 'Switch to dark mode' })
    expect(button).toHaveTextContent('🌙')
  })

  it('shows a sun icon and "switch to light" label in dark mode', () => {
    render(<ThemeToggleButton theme="dark" onToggle={() => {}} />)
    const button = screen.getByRole('button', { name: 'Switch to light mode' })
    expect(button).toHaveTextContent('☀️')
  })

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn()
    render(<ThemeToggleButton theme="light" onToggle={onToggle} />)

    await userEvent.click(screen.getByRole('button'))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
