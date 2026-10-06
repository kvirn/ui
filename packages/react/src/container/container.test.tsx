import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, expectTypeOf, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Button } from '../button/button.tsx'
import { Link } from '../link/link.tsx'
import { Container } from './container.tsx'
import type { ContainerElementProps, ContainerProps, ContainerState } from './container.tsx'
import { useContainer } from './use-container.ts'
import type {
  UseContainerOptions,
  ContainerPartProps,
  UseContainerResult,
} from './use-container.ts'

// Contract: container.a11y.md.

const choices = [
  [{}, 'kv-container'],
  [{ size: 'page' }, 'kv-container'],
  [{ size: 'reading' }, 'kv-container kv-container--reading'],
  [{ size: 'form' }, 'kv-container kv-container--form'],
] as const

const propChoices = [
  [{ size: 'reading' }, 'kv-container kv-container--reading'],
  [{ size: 'form' }, 'kv-container kv-container--form'],
] as const

describe('rendering', () => {
  test('renders one <div> with the base class and the children', async () => {
    const { container } = await render(<Container data-testid="layout">Innehåll</Container>)
    const layout = page.getByTestId('layout')
    expect(layout.element().tagName).toBe('DIV')
    expect(layout.element().className).toBe('kv-container')
    await expect.element(layout).toHaveTextContent('Innehåll')
    expect(container.children).toHaveLength(1)
  })

  test.each(propChoices)('Container %j adds only its modifier class', async (props, className) => {
    await render(<Container {...props} data-testid="layout" />)
    expect(page.getByTestId('layout').element().className).toBe(className)
  })

  test('adds no role, ARIA, tabindex, inert or data attribute', async () => {
    await render(<Container data-testid="layout" {...propChoices[0][0]} />)
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
      <Container
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
    await render(<Container data-testid="layout" className="annat" />)
    await expect.element(page.getByTestId('layout')).toHaveClass('kv-container', 'annat')
  })

  test('keeps its own class when a render element sets another one', async () => {
    await render(
      <Container
        className="fran-prop"
        render={<section className="annat" data-testid="layout" />}
      />,
    )
    await expect
      .element(page.getByTestId('layout'))
      .toHaveClass('kv-container', 'fran-prop', 'annat')
  })

  test('keeps its own class when a render element’s className is empty', async () => {
    await render(<Container render={<section className="" data-testid="layout" />} />)
    expect(page.getByTestId('layout').element().className).toBe('kv-container')
  })

  test('is server safe: renderToString gives the element with its class and children', () => {
    const html = renderToString(
      <Container id="server">
        <p>Text</p>
      </Container>,
    )
    expect(html).toBe('<div id="server" class="kv-container"><p>Text</p></div>')
  })
})

describe('render and ref', () => {
  test('an element changes the element and keeps the children', async () => {
    const { container } = await render(
      <main>
        <Container render={<section aria-label="Tjänster" />}>
          <h1>Kvirnby kommun</h1>
        </Container>
      </main>,
    )
    await expect.element(page.getByRole('region', { name: 'Tjänster' })).toBeVisible()
    await expect
      .element(page.getByRole('heading', { name: 'Kvirnby kommun', level: 1 }))
      .toBeVisible()
    await expectNoA11yViolations(container)
  })
  test('a function receives the part props with the class and the ref, and an empty state', async () => {
    const seenStates: ContainerState[] = []
    const ref = createRef<HTMLElement>()
    await render(
      <Container
        ref={ref}
        render={(layoutProps, state) => {
          seenStates.push(state)
          return <aside {...layoutProps} data-testid="layout" />
        }}
      />,
    )
    const layout = page.getByTestId('layout')
    await expect.element(layout).toHaveClass('kv-container')
    expect(ref.current).toBe(layout.element())
    expect(ref.current?.tagName).toBe('ASIDE')
    expect(seenStates.at(-1)).toEqual({})
  })

  test('forwards its ref to the element', async () => {
    const ref = createRef<HTMLElement>()
    await render(<Container ref={ref} data-testid="layout" />)
    expect(ref.current).toBe(page.getByTestId('layout').element())
  })

  test('both refs get the element when a render element has its own', async () => {
    const partRef = createRef<HTMLElement>()
    const elementRef = createRef<HTMLElement>()
    await render(
      <Container ref={partRef} render={<section ref={elementRef} data-testid="layout" />} />,
    )
    const layout = page.getByTestId('layout').element()
    expect(partRef.current).toBe(layout)
    expect(elementRef.current).toBe(layout)
  })
})

describe('keyboard', () => {
  function Controls() {
    return (
      <Container>
        <Link.Root href="#forst">Första</Link.Root>
        <Button>Andra</Button>
        <Link.Root href="#tredje">Tredje</Link.Root>
      </Container>
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

describe('useContainer', () => {
  test.each(choices)('%j gives the class "%s"', (options, className) => {
    expect(useContainer(options).containerProps.className).toBe(className)
  })

  test('returns the same frozen objects every time', () => {
    const first = useContainer()
    expect(useContainer()).toBe(first)
    expect(Object.isFrozen(first)).toBe(true)
    expect(Object.isFrozen(first.containerProps)).toBe(true)
  })

  test('spreads on the consumer’s element', async () => {
    function HookLayout() {
      const layout = useContainer()
      return <nav {...layout.containerProps} aria-label="Egen" data-testid="layout" />
    }
    await render(<HookLayout />)
    const layout = page.getByTestId('layout')
    await expect.element(layout).toHaveClass('kv-container')
    await expect.element(page.getByRole('navigation', { name: 'Egen' })).toBeInTheDocument()
  })
})

describe('types', () => {
  test('the exported option, props and result types fit together', () => {
    expectTypeOf<ContainerProps>().toExtend<UseContainerOptions>()
    expectTypeOf<ContainerElementProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<ReturnType<typeof useContainer>>().toEqualTypeOf<UseContainerResult>()
    expectTypeOf<UseContainerResult['containerProps']>().toEqualTypeOf<ContainerPartProps>()
  })
})

describe('accessibility', () => {
  test('has no axe violations around real content', async () => {
    const { container } = await render(
      <main>
        <Container>
          <h1>Kvirnby kommun</h1>
          <p>Vi svarar vardagar 9–16.</p>
          <Link.Root href="#kontakt">Kontakta oss</Link.Root>
        </Container>
      </main>,
    )
    await expect.element(page.getByRole('main')).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('RTL: the children stay in DOM order', async () => {
    await render(
      <div dir="rtl" lang="ar">
        <Container data-testid="layout">
          <p data-testid="first">أول</p>
          <p data-testid="second">ثان</p>
        </Container>
      </div>,
    )
    const [first, second] = page.getByTestId('layout').element().children
    expect(first).toBe(page.getByTestId('first').element())
    expect(second).toBe(page.getByTestId('second').element())
  })
})
