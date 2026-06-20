import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to light when no data-theme attribute is set', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('picks up the data-theme attribute already set on <html> (avoids the flash-of-wrong-theme)', () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('toggleTheme flips between light and dark', () => {
    const { result } = renderHook(() => useTheme())

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
  })

  it('persists the theme to localStorage and reflects it on the html element', () => {
    const { result } = renderHook(() => useTheme())

    act(() => result.current.toggleTheme())

    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
