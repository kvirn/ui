import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { describe, expect, test } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Kbd } from './kbd.tsx'
import { useKbd } from './use-kbd.ts'

// Contract: kbd.a11y.md.

describe('Kbd', () => {
  test('renders a kbd with its class, no role or ARIA, and passes attributes and the ref through', async () => {
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
    expect(element.className).toBe('kv-kbd')
    expect(ref.current).toBe(element)
  })

  test("the class joins a consumer's", async () => {
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

  test('useKbd gives the element and the class', () => {
    expect(useKbd()).toEqual({ element: 'kbd', rootProps: { className: 'kv-kbd' } })
  })

  test('render changes the element', async () => {
    await render(
      <>
        <Kbd render={<samp data-testid="element" />}>Tab</Kbd>
        <Kbd render={(props) => <samp {...props} data-testid="function" />}>Tab</Kbd>
      </>,
    )
    expect(page.getByTestId('element').element().tagName).toBe('SAMP')
    expect(page.getByTestId('element').element().className).toBe('kv-kbd')
    expect(page.getByTestId('function').element().tagName).toBe('SAMP')
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
