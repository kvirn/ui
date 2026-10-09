import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Kbd } from './kbd.tsx'
import { useKbd } from './use-kbd.ts'

// Contract: kbd.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const warnings = () => consoleWarn.mock.calls.map(([message]) => String(message))

describe('Kbd', () => {
  test('renders a kbd, no role or ARIA, and passes attributes and the ref through', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <p>
        Tryck på{' '}
        <Kbd id="tab" lang="en" ref={ref} data-testid="key">
          Tab
        </Kbd>
        .
      </p>,
    )
    const element = page.getByTestId('key').element()
    expect(element.tagName).toBe('KBD')
    expect(element.textContent).toBe('Tab')
    expect(element.getAttributeNames().sort()).toEqual(['class', 'data-testid', 'id', 'lang'])
    expect(ref.current).toBe(element)
  })

  test("the part class kv-kbd joins a consumer's", async () => {
    await render(
      <Kbd className="annan" data-testid="key">
        Esc
      </Kbd>,
    )
    expect(page.getByTestId('key').element().className).toBe('annan kv-kbd')
  })

  test('keys nest to show a combination', async () => {
    await render(
      <Kbd data-testid="combination">
        <Kbd>Ctrl</Kbd>+<Kbd>C</Kbd>
      </Kbd>,
    )
    const combination = page.getByTestId('combination').element()
    expect(combination.querySelectorAll('kbd')).toHaveLength(2)
    expect(combination.textContent).toBe('Ctrl+C')
  })

  test('useKbd gives the element', () => {
    expect(useKbd().element).toBe('kbd')
  })

  test('as changes the element to samp', async () => {
    await render(
      <Kbd as="samp" data-testid="element">
        Tab
      </Kbd>,
    )
    expect(page.getByTestId('element').element().tagName).toBe('SAMP')
  })

  test('an element outside the allowed list warns once and renders a kbd', async () => {
    const notAllowed = 'strong' as 'kbd'
    await render(
      <Kbd as={notAllowed} data-testid="key">
        Tab
      </Kbd>,
    )
    expect(page.getByTestId('key').element().tagName).toBe('KBD')
    expect(warnings().filter((message) => message.includes('Kbd as="strong"'))).toHaveLength(1)
  })

  test('the ref and className still apply to the chosen element', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Kbd as="samp" ref={ref} className="annan" data-testid="key">
        Tab
      </Kbd>,
    )
    expect(ref.current).toBe(page.getByTestId('key').element())
    expect(ref.current?.className).toBe('annan kv-kbd')
  })

  test('is not a Tab stop', async () => {
    await render(<Kbd data-testid="key">Tab</Kbd>)
    const element = page.getByTestId('key').element()
    expect(element.hasAttribute('tabindex')).toBe(false)
    expect(element.tabIndex).toBe(-1)
  })

  test('has no axe violations', async () => {
    const { container } = await render(
      <main>
        <p>
          Du kan flytta mellan fälten i formuläret med <Kbd lang="en">Tab</Kbd>.
        </p>
      </main>,
    )
    await expect.element(page.getByText('Tab')).toBeVisible()
    await expectNoA11yViolations(container)
  })
})
