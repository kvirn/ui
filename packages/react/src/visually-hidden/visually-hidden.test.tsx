import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { VisuallyHidden } from './visually-hidden.tsx'
import { useVisuallyHidden } from './use-visually-hidden.ts'

// Contract: visually-hidden.a11y.md.

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

  test('render changes the element', async () => {
    await render(
      <>
        <VisuallyHidden render={<strong data-testid="element" />}>Meny</VisuallyHidden>
        <VisuallyHidden render={(props) => <em {...props} data-testid="function" />}>
          Sök
        </VisuallyHidden>
      </>,
    )
    expect(page.getByTestId('element').element().tagName).toBe('STRONG')
    expect(page.getByTestId('function').element().className).toBe('kv-visually-hidden')
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
