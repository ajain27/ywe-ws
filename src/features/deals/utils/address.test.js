import { describe, expect, it } from 'vitest'
import { normalizeAddress } from './address'

describe('normalizeAddress', () => {
  it('trims leading and trailing whitespace', () => {
    expect(normalizeAddress('  123 Main St  ')).toBe('123 main st')
  })

  it('lowercases the address', () => {
    expect(normalizeAddress('123 MAIN ST')).toBe('123 main st')
  })

  it('collapses repeated internal whitespace to a single space', () => {
    expect(normalizeAddress('123   Main\t St')).toBe('123 main st')
  })

  it('treats differently-cased and differently-spaced duplicates as equal', () => {
    expect(normalizeAddress('123 Main St')).toBe(normalizeAddress('  123   MAIN st  '))
  })

  it('returns an empty string for blank input', () => {
    expect(normalizeAddress('   ')).toBe('')
  })
})
