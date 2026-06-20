import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Header from './Header'

function renderHeader({ path = '/', ...props } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header
        activeTab="deals"
        onChangeTab={() => {}}
        theme="light"
        onToggleTheme={() => {}}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('Header', () => {
  it('renders the brand name and tagline', () => {
    renderHeader()
    expect(screen.getByText('You Win Estates')).toBeInTheDocument()
    expect(screen.getByText(/off-market wholesale deals/i)).toBeInTheDocument()
  })

  it('shows the deal tabs on the home route', () => {
    renderHeader({ path: '/' })
    expect(screen.getByRole('button', { name: 'Available Deals' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add a Deal' })).toBeInTheDocument()
  })

  it('hides the deal tabs on other routes', () => {
    renderHeader({ path: '/deals/abc123' })
    expect(screen.queryByRole('button', { name: 'Available Deals' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ Add a Deal' })).not.toBeInTheDocument()
  })

  it('always shows the theme toggle button, regardless of route', () => {
    renderHeader({ path: '/deals/abc123' })
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
  })
})
