import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Link } from '../link/link.tsx'
import { Navigation, NavigationItem, NavigationList, NavigationRoot } from './navigation.tsx'
import type {
  NavigationItemProps,
  NavigationListProps,
  NavigationRootProps,
  NavigationState,
} from './navigation.tsx'
import { useNavigation } from './use-navigation.ts'
import type {
  NavigationItemPartProps,
  NavigationListPartProps,
  NavigationRootPartProps,
  UseNavigationOptions,
  UseNavigationResult,
} from './use-navigation.ts'

// Contract: navigation.a11y.md. The keyboard rows are covered end to end in
// apps/storybook/src/components/navigation/navigation.e2e.ts.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function warnings(): string[] {
  return consoleWarn.mock.calls.map((call) => String(call[0]))
}

/** The design spec's example, in Swedish: two levels, with the current page nested. */
function MainMenu() {
  return (
    <Navigation.Root label="Huvudmeny">
      {/* Unstyled links: a 24px minimum keeps them clear of axe's target-size rule (2.5.8). */}
      <style>{'a { display: inline-block; min-block-size: 24px; }'}</style>
      <Navigation.List>
        <Navigation.Item>
          <Link.Root href="#start">Start</Link.Root>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#bygga">Bygga och bo</Link.Root>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#bygglov" current="page">
                Bygglov
              </Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Item>
        <Navigation.Item>
          <Link.Root href="#om-oss">Om oss</Link.Root>
        </Navigation.Item>
      </Navigation.List>
    </Navigation.Root>
  )
}

describe('rendering', () => {
  test('renders a named navigation landmark with a list of list items', async () => {
    const { container } = await render(<MainMenu />)
    const navigation = page.getByRole('navigation', { name: 'Huvudmeny' })
    await expect.element(navigation).toBeVisible()
    await expect.element(navigation).toHaveAttribute('aria-label', 'Huvudmeny')
    expect(navigation.element().tagName).toBe('NAV')
    expect(page.getByRole('list').all()).toHaveLength(2)
    expect(page.getByRole('listitem').all()).toHaveLength(4)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a nested list sits inside an item, so the level is announced', async () => {
    await render(<MainMenu />)
    const [outer, nested] = page.getByRole('list').all()
    expect(outer?.element().parentElement?.tagName).toBe('NAV')
    expect(nested?.element().parentElement?.tagName).toBe('LI')
    expect(outer?.element().contains(nested?.element() ?? null)).toBe(true)
    await expect.element(page.getByRole('link', { name: 'Bygglov' })).toBeVisible()
  })

  test('marks its parts with kv-navigation, kv-navigation-list and kv-navigation-item', async () => {
    await render(
      <Navigation.Root label="Huvudmeny" data-testid="root">
        <Navigation.List data-testid="list">
          <Navigation.Item data-testid="item">
            <Link.Root href="#start">Start</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    expect(page.getByTestId('root').element().className).toBe('kv-navigation')
    expect(page.getByTestId('list').element().className).toBe('kv-navigation-list')
    expect(page.getByTestId('item').element().className).toBe('kv-navigation-item')
    await expect.element(page.getByTestId('root')).not.toHaveAttribute('data-kv')
  })

  test('current on a Link is the only current page: aria-current="page"', async () => {
    await render(<MainMenu />)
    await expect
      .element(page.getByRole('link', { name: 'Bygglov' }))
      .toHaveAttribute('aria-current', 'page')
    for (const name of ['Start', 'Bygga och bo', 'Om oss']) {
      await expect.element(page.getByRole('link', { name })).not.toHaveAttribute('aria-current')
    }
  })

  test('aria-labelledby names it instead of label, without a warning', async () => {
    const { container } = await render(
      <>
        <h2 id="avsnitt">I det här avsnittet</h2>
        <Navigation.Root aria-labelledby="avsnitt">
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#start">Start</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
      </>,
    )
    const navigation = page.getByRole('navigation', { name: 'I det här avsnittet' })
    await expect.element(navigation).toBeVisible()
    await expect.element(navigation).not.toHaveAttribute('aria-label')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('passes other attributes through and joins className, refs and render elements', async () => {
    const rootRef = createRef<HTMLElement>()
    const listRef = createRef<HTMLElement>()
    const itemRef = createRef<HTMLElement>()
    await render(
      <Navigation.Root
        ref={rootRef}
        label="Huvudmeny"
        id="huvudmeny"
        lang="sv"
        className="min-meny"
        data-testid="root"
      >
        <Navigation.List ref={listRef} className="min-lista" data-testid="list">
          <Navigation.Item
            ref={itemRef}
            render={<li data-own="ja" className="eget" />}
            data-testid="item"
          >
            <Link.Root href="#start">Start</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    const root = page.getByTestId('root')
    await expect.element(root).toHaveAttribute('id', 'huvudmeny')
    await expect.element(root).toHaveAttribute('lang', 'sv')
    await expect.element(root).toHaveClass('kv-navigation', 'min-meny')
    expect(rootRef.current).toBe(root.element())
    expect(listRef.current).toBe(page.getByTestId('list').element())
    const item = page.getByTestId('item')
    expect(itemRef.current).toBe(item.element())
    await expect.element(item).toHaveAttribute('data-own', 'ja')
    await expect.element(item).toHaveClass('kv-navigation-item', 'eget')
  })

  test('render as a function receives the part props and keeps the landmark', async () => {
    await render(
      <Navigation.Root
        label="Huvudmeny"
        render={(rootProps) => <nav {...rootProps} data-rendered="ja" />}
      >
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#start">Start</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    const navigation = page.getByRole('navigation', { name: 'Huvudmeny' })
    await expect.element(navigation).toHaveAttribute('data-rendered', 'ja')
    await expect.element(navigation).toHaveClass('kv-navigation')
  })

  test('adds no role, tabindex or other ARIA of its own, and is never a Tab stop', async () => {
    await render(<MainMenu />)
    for (const element of document.querySelectorAll(
      '.kv-navigation, .kv-navigation-list, .kv-navigation-item',
    )) {
      expect(element.getAttributeNames()).not.toContain('role')
      expect(element.getAttributeNames()).not.toContain('tabindex')
      expect(element.getAttributeNames().filter((name) => name.startsWith('aria-'))).toEqual(
        element.matches('nav') ? ['aria-label'] : [],
      )
    }
  })
})

describe('development warnings', () => {
  test('warns once, naming the problem, when it has no name', async () => {
    await render(
      <>
        <Navigation.Root>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#start">Start</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
        <Navigation.Root>
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#om">Om oss</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
      </>,
    )
    const matching = warnings().filter((text) => text.includes('<Navigation.Root>'))
    expect(matching).toHaveLength(1)
    expect(matching[0]).toContain('label')
    expect(matching[0]).toContain('2.4.1')
  })

  test('an empty or whitespace label counts as no name', async () => {
    await render(
      <Navigation.Root label="  ">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#start">Start</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    expect(warnings().filter((text) => text.includes('<Navigation.Root>'))).toHaveLength(1)
    await expect.element(page.getByRole('navigation')).not.toHaveAttribute('aria-label')
  })

  test('a named navigation does not warn', async () => {
    await render(<MainMenu />)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('warns when two navigation landmarks share a name', async () => {
    await render(
      <>
        <Navigation.Root label="Huvudmeny">
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#start">Start</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
        <Navigation.Root label="Huvudmeny">
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#om">Om oss</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
      </>,
    )
    const matching = warnings().filter((text) => text.includes('Huvudmeny'))
    expect(matching).toHaveLength(1)
    expect(matching[0]).toContain('2.4.1')
  })

  test('a plain <nav aria-label> with the same name counts too', async () => {
    await render(
      <>
        <nav aria-label="Sidfot">
          <a href="#kontakt">Kontakt</a>
        </nav>
        <Navigation.Root label="Sidfot">
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#om">Om oss</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
      </>,
    )
    expect(warnings().filter((text) => text.includes('Sidfot'))).toHaveLength(1)
  })

  test('navigations with different names do not warn', async () => {
    await render(
      <>
        <Navigation.Root label="Huvudmeny">
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#start">Start</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
        <Navigation.Root label="I det här avsnittet">
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#bygglov">Bygglov</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
      </>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('useNavigation', () => {
  function OwnNavigation({ label }: { label?: string }) {
    const navigation = useNavigation({ label })
    return (
      <nav {...navigation.rootProps} data-testid="root">
        <ul {...navigation.listProps} data-testid="list">
          <li {...navigation.itemProps} data-testid="item">
            <a href="#start">Start</a>
          </li>
        </ul>
      </nav>
    )
  }

  test('gives spreadable props for your own elements, with the name from label', async () => {
    await render(<OwnNavigation label="Huvudmeny" />)
    const navigation = page.getByRole('navigation', { name: 'Huvudmeny' })
    expect(navigation.element()).toBe(page.getByTestId('root').element())
    expect(page.getByTestId('root').element().className).toBe('kv-navigation')
    expect(page.getByTestId('list').element().className).toBe('kv-navigation-list')
    expect(page.getByTestId('item').element().className).toBe('kv-navigation-item')
  })

  test('without a label it sets no aria-label', async () => {
    await render(<OwnNavigation />)
    await expect.element(page.getByTestId('root')).not.toHaveAttribute('aria-label')
  })
})

describe('server rendering', () => {
  test('renders the landmark and its list to a string without touching the page', () => {
    const html = renderToString(
      <Navigation.Root label="Huvudmeny">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#start" current="page">
              Start
            </Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    expect(html).toBe(
      '<nav class="kv-navigation" aria-label="Huvudmeny"><ul class="kv-navigation-list"><li class="kv-navigation-item"><a href="#start" class="kv-link" aria-current="page" data-current="">Start</a></li></ul></nav>',
    )
  })
})

describe('names', () => {
  test('Navigation.Root, List and Item are the flat named exports', () => {
    expect(Navigation.Root).toBe(NavigationRoot)
    expect(Navigation.List).toBe(NavigationList)
    expect(Navigation.Item).toBe(NavigationItem)
    expect(NavigationRoot.displayName).toBe('Navigation.Root')
    expect(NavigationList.displayName).toBe('Navigation.List')
    expect(NavigationItem.displayName).toBe('Navigation.Item')
  })
})

describe('types', () => {
  test('exports the part props and the hook types', () => {
    expectTypeOf<NavigationRootProps['label']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<NavigationListProps>().toHaveProperty('render')
    expectTypeOf<NavigationItemProps>().toHaveProperty('render')
    expectTypeOf<NavigationState>().toEqualTypeOf<Record<string, never>>()
    expectTypeOf<UseNavigationOptions['label']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<NavigationRootPartProps['className']>().toEqualTypeOf<'kv-navigation'>()
    expectTypeOf<NavigationListPartProps['className']>().toEqualTypeOf<'kv-navigation-list'>()
    expectTypeOf<NavigationItemPartProps['className']>().toEqualTypeOf<'kv-navigation-item'>()
    expectTypeOf<UseNavigationResult['rootProps']>().toEqualTypeOf<NavigationRootPartProps>()
    expectTypeOf<NavigationRootPartProps>().not.toHaveProperty('data-kv')
  })
})
