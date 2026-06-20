import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Footer from './Footer'

describe('Footer', () => {
  it('renders the current year and brand name in the copyright line', () => {
    render(<Footer />)
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(`${year}.*You Win Estates`))).toBeInTheDocument()
  })
})
