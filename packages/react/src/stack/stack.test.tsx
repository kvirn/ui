import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Button } from '../button/button.tsx'
import { Link } from '../link/link.tsx'
import { Stack } from './stack.tsx'
import type { StackProps } from './stack.tsx'
import { useStack } from './use-stack.ts'
import type { StackPartProps, UseStackResult } from './use-stack.ts'

// Contract: stack.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const warnings = () => consoleWarn.mock.calls.map(([message]) => String(message))

describe('rendering', () => {
  test('renders one <div> with the base class and the children', async () => {
    const { container } = await render(<Stack data-testid="layout">Innehåll</Stack>)
    const layout = page.getByTestId('layout')
    expect(layout.element().tagName).toBe('DIV')
    expect(layout.element().className).toBe('kv-stack')
    await expect.element(layout).toHaveTextContent('Innehåll')
    expect(container.children).toHaveLength(1)
  })

  test('adds role="list" to a ul and an ol, and no role to a div', async () => {
    await render(
      <>
        <Stack as="ul" data-testid="unordered" />
        <Stack as="ol" data-testid="ordered" />
        <Stack as="div" data-testid="plain" />
      </>,
    )
    expect(page.getByTestId('unordered').element().getAttribute('role')).toBe('list')
    expect(page.getByTestId('ordered').element().getAttribute('role')).toBe('list')
    expect(page.getByTestId('plain').element().hasAttribute('role')).toBe(false)
  })

  test('a consumer role wins over the list role on a ul', async () => {
    await render(<Stack as="ul" role="presentation" data-testid="root" />)
    expect(page.getByTestId('root').element().getAttribute('role')).toBe('presentation')
  })

  test('a div adds no ARIA, tabindex, inert or data attribute', async () => {
    await render(<Stack data-testid="layout" />)
    const attributeNames = page.getByTestId('layout').element().getAttributeNames()
    expect(
      attributeNames.filter(
        (name) => name === 'role' || name.startsWith('aria-') || name.startsWith('data-kv'),
      ),
    ).toEqual([])
    expect(attributeNames).not.toContain('tabindex')
    expect(attributeNames).not.toContain('inert')
  })

  test('passes attributes through: id, lang, aria-label and title', async () => {
    await render(
      <Stack data-testid="layout" id="innehall" lang="fi" aria-label="Kokoelma" title="Otsikko" />,
    )
    const layout = page.getByTestId('layout')
    await expect.element(layout).toHaveAttribute('id', 'innehall')
    await expect.element(layout).toHaveAttribute('lang', 'fi')
    await expect.element(layout).toHaveAttribute('aria-label', 'Kokoelma')
    await expect.element(layout).toHaveAttribute('title', 'Otsikko')
  })

  test('keeps its own class: a consumer className joins it instead of replacing it', async () => {
    await render(<Stack data-testid="layout" className="annat" />)
    await expect.element(page.getByTestId('layout')).toHaveClass('kv-stack', 'annat')
  })

  test('is server safe: renderToString gives the element with its class and children', () => {
    const html = renderToString(
      <Stack id="server">
        <p>Text</p>
      </Stack>,
    )
    expect(html).toBe('<div id="server" class="kv-stack"><p>Text</p></div>')
  })
})

describe('as and ref', () => {
  test('an element changes the element and keeps the children', async () => {
    const { container } = await render(
      <main>
        <Stack as="section" aria-label="Tjänster">
          <h1>Kvirnby kommun</h1>
        </Stack>
      </main>,
    )
    await expect.element(page.getByRole('region', { name: 'Tjänster' })).toBeVisible()
    await expect
      .element(page.getByRole('heading', { name: 'Kvirnby kommun', level: 1 }))
      .toBeVisible()
    await expectNoA11yViolations(container)
  })
  test('as="ul" with <li> children makes a list with an announced count', async () => {
    const { container } = await render(
      <Stack as="ul">
        <li>Sophämtning</li>
        <li>Vinterväghållning</li>
        <li>Föreningsbidrag</li>
      </Stack>,
    )
    expect(page.getByRole('list').elements()).toHaveLength(1)
    expect(page.getByRole('listitem').elements()).toHaveLength(3)
    await expectNoA11yViolations(container)
  })

  test('ul, ol and a div render their element and keep the class', async () => {
    await render(
      <>
        <Stack as="ul" data-testid="first" />
        <Stack as="ol" data-testid="second" />
        <Stack as="div" data-testid="third" />
      </>,
    )
    expect(page.getByTestId('first').element().tagName).toBe('UL')
    expect(page.getByTestId('second').element().tagName).toBe('OL')
    expect(page.getByTestId('third').element().tagName).toBe('DIV')
    await expect.element(page.getByTestId('first')).toHaveClass('kv-stack')
  })

  test('an element outside the allowed list warns once and renders a div', async () => {
    const notAllowed = 'nav' as 'div'
    await render(<Stack as={notAllowed} data-testid="layout" />)
    expect(page.getByTestId('layout').element().tagName).toBe('DIV')
    expect(warnings().filter((message) => message.includes('Stack as="nav"'))).toHaveLength(1)
  })

  test('forwards its ref to the element', async () => {
    const ref = createRef<HTMLElement>()
    await render(<Stack ref={ref} data-testid="layout" />)
    expect(ref.current).toBe(page.getByTestId('layout').element())
  })

  test('the ref and className still apply to the chosen element', async () => {
    const ref = createRef<HTMLElement>()
    await render(<Stack as="form" ref={ref} className="annat" data-testid="layout" />)
    const layout = page.getByTestId('layout')
    expect(ref.current).toBe(layout.element())
    await expect.element(layout).toHaveClass('kv-stack', 'annat')
  })
})

describe('keyboard', () => {
  function Controls() {
    return (
      <Stack>
        <Link.Root href="#forst">Första</Link.Root>
        <Button>Andra</Button>
        <Link.Root href="#tredje">Tredje</Link.Root>
      </Stack>
    )
  }

  test('is not a Tab stop and keeps the children in DOM order', async () => {
    await render(<Controls />)
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Första' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Andra' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Tredje' })).toHaveFocus()
  })

  test('Shift+Tab walks the children in reverse DOM order', async () => {
    await render(<Controls />)
    page.getByRole('link', { name: 'Tredje' }).element().focus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Andra' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('link', { name: 'Första' })).toHaveFocus()
  })
})

describe('useStack', () => {
  test('returns the same frozen objects every time', () => {
    const first = useStack()
    expect(useStack()).toBe(first)
    expect(Object.isFrozen(first)).toBe(true)
    expect(Object.isFrozen(first.stackProps)).toBe(true)
  })

  test('spreads on the consumer’s element', async () => {
    function HookLayout() {
      const layout = useStack()
      return <nav {...layout.stackProps} aria-label="Egen" data-testid="layout" />
    }
    await render(<HookLayout />)
    const layout = page.getByTestId('layout')
    await expect.element(layout).toHaveClass('kv-stack')
    await expect.element(page.getByRole('navigation', { name: 'Egen' })).toBeInTheDocument()
  })
})

describe('types', () => {
  test('the exported props and result types fit together', () => {
    expectTypeOf<StackProps>().toHaveProperty('as')
    expectTypeOf<ReturnType<typeof useStack>>().toEqualTypeOf<UseStackResult>()
    expectTypeOf<UseStackResult['stackProps']>().toEqualTypeOf<StackPartProps>()
  })
})

describe('accessibility', () => {
  test('has no axe violations around real content', async () => {
    const { container } = await render(
      <main>
        <Stack>
          <h1>Kvirnby kommun</h1>
          <p>Vi svarar vardagar 9–16.</p>
          <Link.Root href="#kontakt">Kontakta oss</Link.Root>
        </Stack>
      </main>,
    )
    await expect.element(page.getByRole('main')).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('RTL: the children stay in DOM order', async () => {
    await render(
      <div dir="rtl" lang="ar">
        <Stack data-testid="layout">
          <p data-testid="first">أول</p>
          <p data-testid="second">ثان</p>
        </Stack>
      </div>,
    )
    const [first, second] = page.getByTestId('layout').element().children
    expect(first).toBe(page.getByTestId('first').element())
    expect(second).toBe(page.getByTestId('second').element())
  })
})
