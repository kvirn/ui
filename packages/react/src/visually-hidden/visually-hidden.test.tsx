import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { VisuallyHidden } from './visually-hidden.tsx'
import { useVisuallyHidden } from './use-visually-hidden.ts'

// Contract: visually-hidden.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const warnings = () => consoleWarn.mock.calls.map(([message]) => String(message))

describe('VisuallyHidden', () => {
  test('is not a Tab stop and adds only its class', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <p>
        Search results
        <VisuallyHidden id="count" ref={ref} data-testid="hidden">
          , 3 results
        </VisuallyHidden>
      </p>,
    )
    const element = page.getByTestId('hidden').element()
    expect(element.tagName).toBe('SPAN')
    expect(element.getAttributeNames().sort()).toEqual(['class', 'data-testid', 'id'])
    expect(element.className).toBe('kv-visually-hidden')
    expect(element.tabIndex).toBe(-1)
    expect(ref.current).toBe(element)
  })

  test("the part class joins a consumer's", async () => {
    await render(
      <VisuallyHidden className="other" data-testid="hidden">
        text
      </VisuallyHidden>,
    )
    expect(page.getByTestId('hidden').element().className).toBe('other kv-visually-hidden')
  })

  test('its text stays in the accessibility tree', async () => {
    await render(
      <p>
        Fee<VisuallyHidden> in kronor</VisuallyHidden>
      </p>,
    )
    await expect.element(page.getByText('in kronor')).toBeInTheDocument()
  })

  test('hidden text inside a control becomes part of the control’s name', async () => {
    await render(
      <button type="button">
        Remove<VisuallyHidden> attachment Certificate.pdf</VisuallyHidden>
      </button>,
    )
    await expect
      .element(page.getByRole('button', { name: 'Remove attachment Certificate.pdf', exact: true }))
      .toBeInTheDocument()
  })

  test('as changes the element: a hidden heading and a div', async () => {
    await render(
      <>
        <VisuallyHidden as="h2" data-testid="heading">
          Meny
        </VisuallyHidden>
        <VisuallyHidden as="div" data-testid="div">
          Search
        </VisuallyHidden>
      </>,
    )
    expect(page.getByTestId('heading').element().tagName).toBe('H2')
    expect(page.getByTestId('div').element().tagName).toBe('DIV')
    await expect.element(page.getByRole('heading', { name: 'Meny', level: 2 })).toBeInTheDocument()
  })

  test('an element outside the allowed list warns once and renders a span', async () => {
    const notAllowed = 'h1' as 'span'
    await render(
      <VisuallyHidden as={notAllowed} data-testid="hidden">
        Meny
      </VisuallyHidden>,
    )
    expect(page.getByTestId('hidden').element().tagName).toBe('SPAN')
    expect(warnings().filter((message) => message.includes('VisuallyHidden as="h1"'))).toHaveLength(
      1,
    )
  })

  test('the ref and className still apply to the chosen element', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <VisuallyHidden as="p" ref={ref} className="other" data-testid="hidden">
        text
      </VisuallyHidden>,
    )
    expect(ref.current).toBe(page.getByTestId('hidden').element())
    expect(ref.current?.className).toBe('other kv-visually-hidden')
  })

  test('useVisuallyHidden gives the class', () => {
    expect(useVisuallyHidden().visuallyHiddenProps).toEqual({ className: 'kv-visually-hidden' })
  })

  test('has no axe violations', async () => {
    const { container } = await render(
      <main>
        <h1>Search</h1>
        <p>
          Found 3<VisuallyHidden> results</VisuallyHidden>
        </p>
      </main>,
    )
    await expect.element(page.getByText('results')).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
