import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Stack } from '../stack/stack.tsx'
import type { StackProps } from '../stack/stack.tsx'

// Contract: every part with an allowed-elements table. Stack stands for them, since each part
// resolves its `as` through resolveAsTag. JS callers can pass any string, so the cast below is
// what a plain-JavaScript consumer does.
const disallowed = { as: 'article' } as unknown as StackProps

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('as outside the allowed list', () => {
  test('renders the default element and warns once in development', async () => {
    const { container } = await render(
      <>
        <Stack {...disallowed} data-testid="first" />
        <Stack {...disallowed} data-testid="second" />
      </>,
    )
    expect(container.querySelector('[data-testid="first"]')?.tagName).toBe('DIV')
    expect(container.querySelector('[data-testid="second"]')?.tagName).toBe('DIV')
    expect(container.querySelector('article')).toBeNull()
    const warnings = consoleWarn.mock.calls.map(([message]) => String(message))
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('<Stack as="article"> is not an allowed element')
  })

  test('an allowed element renders as asked and does not warn', async () => {
    const { container } = await render(<Stack as="section" aria-label="Contact" />)
    expect(container.querySelector('section')).not.toBeNull()
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})
