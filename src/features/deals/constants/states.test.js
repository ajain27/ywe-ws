import { describe, expect, it } from 'vitest'
import { US_STATES } from './states'

describe('US_STATES', () => {
  it('contains the 50 states plus the District of Columbia', () => {
    expect(US_STATES).toHaveLength(51)
  })

  it('every entry has a 2-letter uppercase code and a non-empty name', () => {
    US_STATES.forEach((state) => {
      expect(state.code).toMatch(/^[A-Z]{2}$/)
      expect(state.name.length).toBeGreaterThan(0)
    })
  })

  it('has no duplicate codes', () => {
    const codes = US_STATES.map((s) => s.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('includes Texas and the District of Columbia', () => {
    expect(US_STATES).toEqual(
      expect.arrayContaining([
        { code: 'TX', name: 'Texas' },
        { code: 'DC', name: 'District of Columbia' },
      ]),
    )
  })
})
