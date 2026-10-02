import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useId } from 'react'
import { describe, expect, expectTypeOf, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { Card } from '../card/card.tsx'
import { Link } from '../link/link.tsx'
import { Panel, PanelRoot } from './panel.tsx'
import type { PanelElementProps, PanelRootProps, PanelState } from './panel.tsx'
import { usePanel } from './use-panel.ts'
import type { PanelPartProps, UsePanelResult } from './use-panel.ts'

// Contract: panel.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/panel/panel.e2e.ts.

/** Example A from the design spec, in Swedish: a sidebar text block as a named aside. */
function ContactPanel() {
  const headingId = useId()
  return (
    <Panel render={<aside aria-labelledby={headingId} />} className="kv-panel--padding-lg">
      <h2 id={headingId}>Kontakta oss</h2>
      <p>Ring kundcenter på 0123-45 67 89.</p>
      <p>
        <Link href="#epost">Mejla kundcenter</Link>
      </p>
    </Panel>
  )
}

describe('rendering', () => {
  test('renders one <div> with its class and its children', async () => {
    const { container } = await render(<Panel data-testid="panel">Innehåll</Panel>)
    const panel = page.getByTestId('panel')
    expect(panel.element().tagName).toBe('DIV')
    expect(panel.element().className).toBe('kv-panel')
    await expect.element(panel).not.toHaveAttribute('data-kv')
    await expect.element(panel).toHaveTextContent('Innehåll')
    expect(container.children).toHaveLength(1)
    expect(container.firstElementChild).toBe(panel.element())
  })

  test('adds no role, ARIA or tabindex', async () => {
    await render(
      <main>
        <Panel data-testid="panel">
          <h2>Nyheter</h2>
        </Panel>
        <ContactPanel />
      </main>,
    )
    const panels = [...document.querySelectorAll('.kv-panel')]
    expect(panels).toHaveLength(2)
    // The default panel has nothing. The aside has only the name the consumer gave it.
    const attributeNames = panels[0]?.getAttributeNames() ?? []
    expect(attributeNames.filter((name) => name === 'role' || name.startsWith('aria-'))).toEqual([])
    for (const panel of panels) {
      expect(panel.getAttributeNames()).not.toContain('tabindex')
      expect(panel.getAttributeNames()).not.toContain('inert')
      expect(panel.getAttribute('role')).toBeNull()
    }
    expect(panels[1]?.getAttributeNames().filter((name) => name.startsWith('aria-'))).toEqual([
      'aria-labelledby',
    ])
  })

  test('a default panel is no landmark', async () => {
    await render(
      <main>
        <Panel>
          <h2>Nyheter</h2>
        </Panel>
      </main>,
    )
    expect(page.getByRole('complementary').elements()).toHaveLength(0)
    expect(page.getByRole('region').elements()).toHaveLength(0)
    expect(page.getByRole('navigation').elements()).toHaveLength(0)
  })

  test('renders no text of its own: children are exactly what the consumer passes', async () => {
    await render(<Panel data-testid="panel" />)
    const panel = page.getByTestId('panel')
    await expect.element(panel).toHaveTextContent('')
    expect(panel.element().childNodes).toHaveLength(0)
  })

  test('the panel is skipped by Tab: focus goes through its children in DOM order', async () => {
    await render(
      <Panel>
        <Link href="#forsta">Första länken</Link>
        <Link href="#andra">Andra länken</Link>
      </Panel>,
    )
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Första länken' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Andra länken' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('link', { name: 'Första länken' })).toHaveFocus()
  })

  test('passes attributes through: id, lang and title on the consumer’s element', async () => {
    await render(
      <Panel data-testid="panel" id="kontakt" lang="en" title="Panel">
        Contact us
      </Panel>,
    )
    const panel = page.getByTestId('panel')
    await expect.element(panel).toHaveAttribute('id', 'kontakt')
    await expect.element(panel).toHaveAttribute('lang', 'en')
    await expect.element(panel).toHaveAttribute('title', 'Panel')
  })

  test('keeps its own class: a consumer className joins it instead of replacing it', async () => {
    await render(
      <Panel data-testid="panel" className="kv-panel--canvas annat">
        Text
      </Panel>,
    )
    await expect
      .element(page.getByTestId('panel'))
      .toHaveClass('kv-panel', 'kv-panel--canvas', 'annat')
  })

  test('keeps its own class when a render element sets another one', async () => {
    await render(
      <Panel className="fran-prop" render={<section className="annat" data-testid="panel" />}>
        Text
      </Panel>,
    )
    await expect.element(page.getByTestId('panel')).toHaveClass('kv-panel', 'fran-prop', 'annat')
  })

  test('keeps its own class when a render element’s className is empty', async () => {
    await render(<Panel render={<section className="" data-testid="panel" />}>Text</Panel>)
    expect(page.getByTestId('panel').element().className).toBe('kv-panel')
  })

  test('Panel, Panel.Root and PanelRoot are the same component', () => {
    expect(Panel.Root).toBe(PanelRoot)
    expect(Panel).toBe(PanelRoot)
  })

  test('has no axe violations as a sidebar and as a band with a card', async () => {
    const { container } = await render(
      <main>
        <h1>Bygglov</h1>
        <ContactPanel />
        <Panel>
          <h2>Nyheter</h2>
          <ul>
            <Card.Root render={<li />}>Nya öppettider</Card.Root>
            <Card.Root render={<li />}>Vinterväghållning</Card.Root>
          </ul>
        </Panel>
      </main>,
    )
    await expect.element(page.getByRole('heading', { name: 'Nyheter', level: 2 })).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

describe('refs, className and style', () => {
  test('forwards its ref to the element', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Panel ref={ref} data-testid="panel">
        Text
      </Panel>,
    )
    expect(ref.current).toBe(page.getByTestId('panel').element())
  })

  test('forwards a ref to any element: <aside>, <section> and <li>', async () => {
    const asideRef = createRef<HTMLElement>()
    const itemRef = createRef<HTMLLIElement>()
    await render(
      <>
        <Panel ref={asideRef} render={<aside aria-label="Sidopanel" />}>
          Text
        </Panel>
        <ul>
          <Panel ref={itemRef} render={<li />}>
            Punkt
          </Panel>
        </ul>
      </>,
    )
    expect(asideRef.current?.tagName).toBe('ASIDE')
    expect(itemRef.current?.tagName).toBe('LI')
  })

  test('forwards className and style', async () => {
    await render(
      <Panel data-testid="panel" className="sidopanel" style={{ maxInlineSize: '20rem' }}>
        Text
      </Panel>,
    )
    const panel = page.getByTestId('panel')
    await expect.element(panel).toHaveClass('sidopanel')
    await expect.element(panel).toHaveStyle({ maxInlineSize: '20rem' })
  })

  test('merges className and style with a render element, and both refs get the element', async () => {
    const partRef = createRef<HTMLElement>()
    const elementRef = createRef<HTMLElement>()
    await render(
      <Panel
        ref={partRef}
        className="sidopanel"
        style={{ maxInlineSize: '20rem', color: 'rgb(0, 0, 0)' }}
        render={
          <aside
            ref={elementRef}
            className="kontakt"
            style={{ color: 'rgb(1, 2, 3)' }}
            aria-label="Kontakt"
            data-testid="panel"
          />
        }
      >
        Text
      </Panel>,
    )
    const panel = page.getByTestId('panel')
    await expect.element(panel).toHaveClass('sidopanel kontakt')
    await expect.element(panel).toHaveStyle({ maxInlineSize: '20rem', color: 'rgb(1, 2, 3)' })
    expect(partRef.current).toBe(panel.element())
    expect(elementRef.current).toBe(panel.element())
  })
})

describe('render', () => {
  test('<aside aria-labelledby> makes the panel a named complementary landmark', async () => {
    const { container } = await render(
      <main>
        <h1>Bygglov</h1>
        <ContactPanel />
      </main>,
    )
    const panel = page.getByRole('complementary', { name: 'Kontakta oss' })
    await expect.element(panel).toBeVisible()
    await expect.element(panel).toHaveClass('kv-panel', 'kv-panel--padding-lg')
    await expectNoA11yViolations(container)
  })

  test('<section aria-labelledby> makes the panel a named region', async () => {
    function NewsBand() {
      const headingId = useId()
      return (
        <Panel render={<section aria-labelledby={headingId} />}>
          <h2 id={headingId}>Nyheter</h2>
        </Panel>
      )
    }
    const { container } = await render(
      <main>
        <NewsBand />
      </main>,
    )
    await expect.element(page.getByRole('region', { name: 'Nyheter' })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('<nav aria-labelledby> makes the panel a named navigation landmark', async () => {
    function CaseNavigation() {
      const headingId = useId()
      return (
        <Panel render={<nav aria-labelledby={headingId} />}>
          <h2 id={headingId}>Ärenden</h2>
          <Link href="#aktuella">Aktuella ärenden</Link>
        </Panel>
      )
    }
    const { container } = await render(
      <main>
        <CaseNavigation />
      </main>,
    )
    await expect.element(page.getByRole('navigation', { name: 'Ärenden' })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('<li> panels make a list with one item per panel', async () => {
    const { container } = await render(
      <ul>
        <Panel render={<li />}>Nya öppettider</Panel>
        <Panel render={<li />}>Vinterväghållning</Panel>
      </ul>,
    )
    expect(page.getByRole('listitem').elements()).toHaveLength(2)
    await expectNoA11yViolations(container)
  })

  test('a function receives the part props and an empty state', async () => {
    const seenStates: PanelState[] = []
    await render(
      <Panel
        className="sidopanel"
        render={(panelProps, state) => {
          seenStates.push(state)
          return <div {...panelProps} data-testid="panel" data-own="" />
        }}
      >
        Text
      </Panel>,
    )
    const panel = page.getByTestId('panel')
    await expect.element(panel).toHaveClass('kv-panel', 'sidopanel')
    await expect.element(panel).toHaveAttribute('data-own', '')
    await expect.element(panel).toHaveTextContent('Text')
    expect(seenStates.at(-1)).toEqual({})
  })

  test('a function’s props include the ref', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Panel ref={ref} render={(panelProps) => <aside {...panelProps} data-testid="panel" />}>
        Text
      </Panel>,
    )
    expect(ref.current).toBe(page.getByTestId('panel').element())
    expect(ref.current?.tagName).toBe('ASIDE')
  })
})

describe('usePanel', () => {
  function HookPanel() {
    const panel = usePanel()
    const headingId = useId()
    return (
      <nav {...panel.rootProps} aria-labelledby={headingId} data-testid="panel">
        <h2 id={headingId}>Ärenden</h2>
      </nav>
    )
  }

  test('gives the class for your own element', async () => {
    const { container } = await render(
      <main>
        <HookPanel />
      </main>,
    )
    await expect.element(page.getByRole('navigation', { name: 'Ärenden' })).toHaveClass('kv-panel')
    await expectNoA11yViolations(container)
  })

  test('returns only the class, the same props the component renders', () => {
    function PanelPropsAsText() {
      return <pre>{JSON.stringify(usePanel())}</pre>
    }
    const html = renderToString(<PanelPropsAsText />)
    const result: unknown = JSON.parse(
      html
        .replace(/^<pre>/, '')
        .replace(/<\/pre>$/, '')
        .replaceAll('&quot;', '"'),
    )
    expect(result).toEqual({ rootProps: { className: 'kv-panel' } })
  })
})

describe('server rendering', () => {
  test('renders to a string without touching the page', () => {
    const html = renderToString(
      <Panel className="kv-panel--canvas">
        <p>Text</p>
      </Panel>,
    )
    expect(html).toBe('<div class="kv-panel--canvas kv-panel"><p>Text</p></div>')
  })
})

describe('types', () => {
  test('exports the part, hook and state types', () => {
    expectTypeOf<PanelPartProps>().toEqualTypeOf<{ className: 'kv-panel' }>()
    expectTypeOf<UsePanelResult['rootProps']['className']>().toEqualTypeOf<'kv-panel'>()
    expectTypeOf<PanelState>().toEqualTypeOf<Record<string, never>>()
  })

  test('the root takes HTML attributes, a ref to any element, and render', () => {
    const props = {} as PanelRootProps
    expectTypeOf(props).toHaveProperty('render')
    expectTypeOf(props).toHaveProperty('className')
    expectTypeOf(props).toHaveProperty('aria-labelledby')
    expectTypeOf(createRef<HTMLLIElement>()).toExtend<NonNullable<typeof props.ref>>()
    expectTypeOf<PanelElementProps>().toHaveProperty('ref')
  })
})
