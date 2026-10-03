import { describe, expect, it } from 'vite-plus/test'
import { renderTemplate } from './render-template.ts'

describe('renderTemplate', () => {
  it('returns a string template as it is', () => {
    expect(renderTemplate('Name', { column: 'name' })).toBe('Name')
  })

  it('calls a function template with the context', () => {
    const context = { value: 12 }
    expect(renderTemplate((received: typeof context) => `${received.value} kr`, context)).toBe(
      '12 kr',
    )
  })

  it('returns null for a missing template', () => {
    expect(renderTemplate(undefined, {})).toBeNull()
    expect(renderTemplate(null, {})).toBeNull()
  })

  it('returns what the function returns, even when it is not text', () => {
    const marker = { rendered: true }
    expect(renderTemplate(() => marker, {})).toBe(marker)
  })
})
