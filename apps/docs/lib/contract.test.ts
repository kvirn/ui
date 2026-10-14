import { describe, expect, test } from 'vite-plus/test'
import { readContract } from './contract.ts'

describe('readContract', () => {
  test('reads the RichTextEditor contract from packages/rich-text', () => {
    const contract = readContract('rich-text-editor')
    expect(contract.name).toBe('RichTextEditor')
    const rows = contract.keyboard.kind === 'keys' ? contract.keyboard.rows : []
    expect(rows.length).toBeGreaterThan(0)
  })

  test('throws for a name with no contract', () => {
    expect(() => readContract('no-such-component')).toThrow(/No accessibility contract/)
  })
})
