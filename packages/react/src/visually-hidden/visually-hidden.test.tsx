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
        Sökträffar
        <VisuallyHidden id="count" lang="sv" ref={ref} data-testid="hidden">
          , 3 resultat
        </VisuallyHidden>
      </p>,
    )
    const element = page.getByTestId('hidden').element()
    expect(element.tagName).toBe('SPAN')
    expect(element.getAttributeNames().sort()).toEqual(['class', 'data-testid', 'id', 'lang'])
    expect(element.className).toBe('kv-visually-hidden')
    expect(element.tabIndex).toBe(-1)
    expect(ref.current).toBe(element)
  })

  test("the part class joins a consumer's", async () => {
    await render(
      <VisuallyHidden className="annan" data-testid="hidden">
        text
      </VisuallyHidden>,
    )
    expect(page.getByTestId('hidden').element().className).toBe('annan kv-visually-hidden')
  })

  test('its text stays in the accessibility tree', async () => {
    await render(
      <p>
        Avgift<VisuallyHidden> i kronor</VisuallyHidden>
      </p>,
    )
    await expect.element(page.getByText('i kronor')).toBeInTheDocument()
  })

  test('as changes the element: a hidden heading and a div', async () => {
    await render(
      <>
        <VisuallyHidden as="h2" data-testid="heading">
          Meny
        </VisuallyHidden>
        <VisuallyHidden as="div" data-testid="div">
          Sök
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
      <VisuallyHidden as="p" ref={ref} className="annan" data-testid="hidden">
        text
      </VisuallyHidden>,
    )
    expect(ref.current).toBe(page.getByTestId('hidden').element())
    expect(ref.current?.className).toBe('annan kv-visually-hidden')
  })

  test('useVisuallyHidden gives the class', () => {
    expect(useVisuallyHidden().visuallyHiddenProps).toEqual({ className: 'kv-visually-hidden' })
  })

  test('has no axe violations', async () => {
    const { container } = await render(
      <main>
        <h1>Sök</h1>
        <p>
          Hittade 3<VisuallyHidden> resultat</VisuallyHidden>
        </p>
      </main>,
    )
    await expect.element(page.getByText('resultat')).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
