import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, expectTypeOf, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Button } from '../button/button.tsx'
import { Link } from '../link/link.tsx'
import { Columns } from './columns.tsx'
import type { ColumnsElementProps, ColumnsProps, ColumnsState } from './columns.tsx'
import { useColumns } from './use-columns.ts'
import type { UseColumnsOptions, ColumnsPartProps, UseColumnsResult } from './use-columns.ts'

// Contract: columns.a11y.md.

const choices = [
  [{}, 'kv-columns'],
  [{ minColumnWidth: 'md', gap: '6' }, 'kv-columns'],
  [{ minColumnWidth: 'sm' }, 'kv-columns kv-columns--min-sm'],
  [{ minColumnWidth: 'lg' }, 'kv-columns kv-columns--min-lg'],
  [{ gap: '4' }, 'kv-columns kv-columns--gap-4'],
  [{ gap: '8' }, 'kv-columns kv-columns--gap-8'],
  [{ minColumnWidth: 'lg', gap: '4' }, 'kv-columns kv-columns--min-lg kv-columns--gap-4'],
] as const

const propChoices = [
  [{ minColumnWidth: 'sm' }, 'kv-columns kv-columns--min-sm'],
  [{ minColumnWidth: 'lg' }, 'kv-columns kv-columns--min-lg'],
  [{ gap: '4' }, 'kv-columns kv-columns--gap-4'],
  [{ gap: '8' }, 'kv-columns kv-columns--gap-8'],
  [{ minColumnWidth: 'lg', gap: '4' }, 'kv-columns kv-columns--min-lg kv-columns--gap-4'],
] as const

describe('rendering', () => {
  test('renders one <div> with the base class and the children', async () => {
    const { container } = await render(<Columns data-testid="layout">Innehåll</Columns>)
    const layout = page.getByTestId('layout')
    expect(layout.element().tagName).toBe('DIV')
    expect(layout.element().className).toBe('kv-columns')
    await expect.element(layout).toHaveTextContent('Innehåll')
    expect(container.children).toHaveLength(1)
  })

  test.each(propChoices)('Columns %j adds only its modifier class', async (props, className) => {
    await render(<Columns {...props} data-testid="layout" />)
    expect(page.getByTestId('layout').element().className).toBe(className)
  })

  test('adds no role, ARIA, tabindex, inert or data attribute', async () => {
    await render(<Columns data-testid="layout" {...propChoices[0][0]} />)
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
      <Columns
        data-testid="layout"
        id="innehall"
        lang="fi"
        aria-label="Kokoelma"
        title="Otsikko"
      />,
    )
    const layout = page.getByTestId('layout')
    await expect.element(layout).toHaveAttribute('id', 'innehall')
    await expect.element(layout).toHaveAttribute('lang', 'fi')
    await expect.element(layout).toHaveAttribute('aria-label', 'Kokoelma')
    await expect.element(layout).toHaveAttribute('title', 'Otsikko')
  })

  test('keeps its own class: a consumer className joins it instead of replacing it', async () => {
    await render(<Columns data-testid="layout" className="annat" />)
    await expect.element(page.getByTestId('layout')).toHaveClass('kv-columns', 'annat')
  })

  test('keeps its own class when a render element sets another one', async () => {
    await render(
      <Columns className="fran-prop" render={<section className="annat" data-testid="layout" />} />,
    )
    await expect.element(page.getByTestId('layout')).toHaveClass('kv-columns', 'fran-prop', 'annat')
  })

  test('keeps its own class when a render element’s className is empty', async () => {
    await render(<Columns render={<section className="" data-testid="layout" />} />)
    expect(page.getByTestId('layout').element().className).toBe('kv-columns')
  })

  test('is server safe: renderToString gives the element with its class and children', () => {
    const html = renderToString(
      <Columns id="server">
        <p>Text</p>
      </Columns>,
    )
    expect(html).toBe('<div id="server" class="kv-columns"><p>Text</p></div>')
  })
})

describe('render and ref', () => {
  test('an element changes the element and keeps the children', async () => {
    const { container } = await render(
      <main>
        <Columns render={<section aria-label="Tjänster" />}>
          <h1>Kvirnby kommun</h1>
        </Columns>
      </main>,
    )
    await expect.element(page.getByRole('region', { name: 'Tjänster' })).toBeVisible()
    await expect
      .element(page.getByRole('heading', { name: 'Kvirnby kommun', level: 1 }))
      .toBeVisible()
    await expectNoA11yViolations(container)
  })
  test('render={<ul />} with <li> children makes a list with an announced count', async () => {
    const { container } = await render(
      <Columns render={<ul />}>
        <li>Sophämtning</li>
        <li>Vinterväghållning</li>
        <li>Föreningsbidrag</li>
      </Columns>,
    )
    expect(page.getByRole('list').elements()).toHaveLength(1)
    expect(page.getByRole('listitem').elements()).toHaveLength(3)
    await expectNoA11yViolations(container)
  })

  test('a function receives the part props with the class and the ref, and an empty state', async () => {
    const seenStates: ColumnsState[] = []
    const ref = createRef<HTMLElement>()
    await render(
      <Columns
        ref={ref}
        render={(layoutProps, state) => {
          seenStates.push(state)
          return <aside {...layoutProps} data-testid="layout" />
        }}
      />,
    )
    const layout = page.getByTestId('layout')
    await expect.element(layout).toHaveClass('kv-columns')
    expect(ref.current).toBe(layout.element())
    expect(ref.current?.tagName).toBe('ASIDE')
    expect(seenStates.at(-1)).toEqual({})
  })

  test('forwards its ref to the element', async () => {
    const ref = createRef<HTMLElement>()
    await render(<Columns ref={ref} data-testid="layout" />)
    expect(ref.current).toBe(page.getByTestId('layout').element())
  })

  test('both refs get the element when a render element has its own', async () => {
    const partRef = createRef<HTMLElement>()
    const elementRef = createRef<HTMLElement>()
    await render(
      <Columns ref={partRef} render={<section ref={elementRef} data-testid="layout" />} />,
    )
    const layout = page.getByTestId('layout').element()
    expect(partRef.current).toBe(layout)
    expect(elementRef.current).toBe(layout)
  })
})

describe('keyboard', () => {
  function Controls() {
    return (
      <Columns>
        <Link.Root href="#forst">Första</Link.Root>
        <Button>Andra</Button>
        <Link.Root href="#tredje">Tredje</Link.Root>
      </Columns>
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

describe('useColumns', () => {
  test.each(choices)('%j gives the class "%s"', (options, className) => {
    expect(useColumns(options).columnsProps.className).toBe(className)
  })

  test('returns the same frozen objects every time', () => {
    const first = useColumns()
    expect(useColumns()).toBe(first)
    expect(Object.isFrozen(first)).toBe(true)
    expect(Object.isFrozen(first.columnsProps)).toBe(true)
  })

  test('spreads on the consumer’s element', async () => {
    function HookLayout() {
      const layout = useColumns()
      return <nav {...layout.columnsProps} aria-label="Egen" data-testid="layout" />
    }
    await render(<HookLayout />)
    const layout = page.getByTestId('layout')
    await expect.element(layout).toHaveClass('kv-columns')
    await expect.element(page.getByRole('navigation', { name: 'Egen' })).toBeInTheDocument()
  })
})

describe('types', () => {
  test('the exported option, props and result types fit together', () => {
    expectTypeOf<ColumnsProps>().toExtend<UseColumnsOptions>()
    expectTypeOf<ColumnsElementProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<ReturnType<typeof useColumns>>().toEqualTypeOf<UseColumnsResult>()
    expectTypeOf<UseColumnsResult['columnsProps']>().toEqualTypeOf<ColumnsPartProps>()
  })
})

describe('accessibility', () => {
  test('has no axe violations around real content', async () => {
    const { container } = await render(
      <main>
        <Columns>
          <h1>Kvirnby kommun</h1>
          <p>Vi svarar vardagar 9–16.</p>
          <Link.Root href="#kontakt">Kontakta oss</Link.Root>
        </Columns>
      </main>,
    )
    await expect.element(page.getByRole('main')).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('RTL: the children stay in DOM order', async () => {
    await render(
      <div dir="rtl" lang="ar">
        <Columns data-testid="layout">
          <p data-testid="first">أول</p>
          <p data-testid="second">ثان</p>
        </Columns>
      </div>,
    )
    const [first, second] = page.getByTestId('layout').element().children
    expect(first).toBe(page.getByTestId('first').element())
    expect(second).toBe(page.getByTestId('second').element())
  })
})
