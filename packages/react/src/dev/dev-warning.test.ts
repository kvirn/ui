import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { isDevelopmentBuild, resetDevWarnings, warnOnce } from './dev-warning.ts'

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('warnOnce', () => {
  it('logs once per key, with a KvirnUI prefix', () => {
    warnOnce('first', 'Something to fix.')
    warnOnce('first', 'Something to fix.')
    warnOnce('second', 'Something else.')
    expect(consoleWarn.mock.calls).toEqual([
      ['[KvirnUI] Something to fix.'],
      ['[KvirnUI] Something else.'],
    ])
  })

  it('warns in this test run, where NODE_ENV is not production', () => {
    warnOnce('test-run', 'Visible in development.')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
  })
})

describe('isDevelopmentBuild', () => {
  it('is false only for a production build', () => {
    expect(isDevelopmentBuild(() => 'production')).toBe(false)
    expect(isDevelopmentBuild(() => 'development')).toBe(true)
    expect(isDevelopmentBuild(() => 'test')).toBe(true)
    expect(isDevelopmentBuild(() => undefined)).toBe(true)
  })

  it('treats a missing `process` (ReferenceError) as development', () => {
    expect(
      isDevelopmentBuild(() => {
        throw new ReferenceError('process is not defined')
      }),
    ).toBe(true)
  })
})
