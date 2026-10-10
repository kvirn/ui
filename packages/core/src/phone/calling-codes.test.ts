import { describe, expect, it } from 'vite-plus/test'
import { callingCodeCountries, callingCodeFor } from './calling-codes.ts'

describe('callingCodeFor', () => {
  it('has a calling code for every country the country masks know', () => {
    for (const country of ['SE', 'FI', 'NO']) {
      expect(callingCodeFor(country)).toMatch(/^\d{1,3}$/)
    }
    expect(callingCodeFor('SE')).toBe('46')
    expect(callingCodeFor('fi')).toBe('358')
  })

  it('has one digits-only code for every two-letter upper-case country', () => {
    for (const country of callingCodeCountries) {
      expect(country).toMatch(/^[A-Z]{2}$/)
      expect(callingCodeFor(country)).toMatch(/^\d{1,3}$/)
    }
  })

  it('returns undefined for a code that is not a country', () => {
    expect(callingCodeFor('ZZ')).toBeUndefined()
  })
})
