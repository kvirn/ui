import { describe, expect, it } from 'vite-plus/test'
import { getDefaultEnv } from './env.ts'

describe('getDefaultEnv', () => {
  it('returns undefined when there is no window (server rendering)', () => {
    expect(getDefaultEnv()).toBeUndefined()
  })
})
