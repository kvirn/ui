import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Link } from '../link/link.tsx'
import {
  Navigation,
  NavigationItem,
  NavigationLabel,
  NavigationList,
  NavigationRoot,
} from './navigation.tsx'
import type {
  NavigationItemProps,
  NavigationLabelProps,
  NavigationListProps,
  NavigationRootProps,
  NavigationState,
} from './navigation.tsx'
import { useNavigation } from './use-navigation.ts'
import type {
  NavigationItemPartProps,
  NavigationLabelPartProps,
  NavigationListPartProps,
  NavigationRootPartProps,
  UseNavigationOptions,
  UseNavigationResult,
} from './use-navigation.ts'

// Contract: navigation.a11y.md.

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

describe('keyboard', () => {
  const link = (name: string) => page.getByRole('link', { name, exact: true })

  function MenuWithLinksAround() {
    return (
      <>
        <a href="#before">Before the menu</a>
        <MainMenu />
        <a href="#after">After the menu</a>
        <h2 id="om-oss">Om oss</h2>
      </>
    )
  }

  test('Tab moves through the links in DOM order, nested ones included', async () => {
    await render(<MenuWithLinksAround />)
    link('Before the menu').element().focus()
    for (const name of ['Start', 'Bygga och bo', 'Bygglov', 'Om oss']) {
      await userEvent.tab()
      await expect.element(link(name)).toHaveFocus()
    }
    await userEvent.tab()
    await expect.element(link('After the menu')).toHaveFocus()
  })

  test('Tab skips a collapsed group', async () => {
    await render(
      <Navigation.Root label="Huvudmeny">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#start">Start</Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#bygga">Bygga och bo</Link.Root>
            <Navigation.List hidden>
              <Navigation.Item>
                <Link.Root href="#bygglov">Bygglov</Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#om-oss">Om oss</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    link('Start').element().focus()
    await userEvent.tab()
    await expect.element(link('Bygga och bo')).toHaveFocus()
    await userEvent.tab()
    await expect.element(link('Om oss')).toHaveFocus()
    const collapsed = page.getByRole('link', { name: 'Bygglov', includeHidden: true })
    expect(collapsed.all()).toHaveLength(1)
    await expect.element(collapsed).not.toBeVisible()
  })

  test('Shift+Tab moves back through the links, then out of the navigation', async () => {
    await render(<MenuWithLinksAround />)
    link('After the menu').element().focus()
    for (const name of ['Om oss', 'Bygglov', 'Bygga och bo', 'Start', 'Before the menu']) {
      await userEvent.tab({ shift: true })
      await expect.element(link(name)).toHaveFocus()
    }
  })

  test('Enter follows the link', async () => {
    await render(<MenuWithLinksAround />)
    link('Om oss').element().focus()
    await userEvent.keyboard('{Enter}')
    try {
      await expect.poll(() => window.location.hash).toBe('#om-oss')
      expect(document.querySelector(':target')?.id).toBe('om-oss')
    } finally {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  })

  test('Arrow keys, Home and End are not handled', async () => {
    await render(
      <>
        <MainMenu />
        <div dir="rtl">
          <Navigation.Root label="Main menu">
            <Navigation.List>
              <Navigation.Item>
                <Link.Root href="#first">First</Link.Root>
              </Navigation.Item>
              <Navigation.Item>
                <Link.Root href="#second">Second</Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Root>
        </div>
      </>,
    )
    for (const name of ['Start', 'First']) {
      const start = link(name)
      start.element().focus()
      for (const key of ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'End', 'Home']) {
        await userEvent.keyboard(`{${key}}`)
        await expect.element(start).toHaveFocus()
      }
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

  // One current item per navigation: ARIA allows one per set, and the theme draws every
  // aria-current as the current page, so an ancestor marked too would look like the page.
  test('warns once, naming the navigation, when more than one link is current', async () => {
    await render(
      <Navigation.Root label="Huvudmeny">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#bygga" current="page">
              Bygga och bo
            </Link.Root>
            <Navigation.List>
              <Navigation.Item>
                <Link.Root href="#bygglov" current="page">
                  Bygglov
                </Link.Root>
              </Navigation.Item>
              <Navigation.Item>
                <Link.Root href="#bygga-om" current>
                  Bygga om
                </Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    const matching = warnings().filter((text) => text.includes('marked current'))
    expect(matching).toHaveLength(1)
    expect(matching[0]).toContain('"Huvudmeny"')
    expect(matching[0]).toContain('4.1.2')
  })

  test('a current link inside a hidden group counts too', async () => {
    await render(
      <Navigation.Root label="Huvudmeny">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#bygga" current>
              Bygga och bo
            </Link.Root>
            <Navigation.List hidden>
              <Navigation.Item>
                <Link.Root href="#bygglov" current="page">
                  Bygglov
                </Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    expect(warnings().filter((text) => text.includes('marked current'))).toHaveLength(1)
  })

  test('one current link does not warn, and aria-current="false" is not current', async () => {
    await render(
      <Navigation.Root label="Huvudmeny">
        <Navigation.List>
          <Navigation.Item>
            <a href="#start" aria-current="false">
              Start
            </a>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#bygglov" current="page">
              Bygglov
            </Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#om-oss" current={false}>
              Om oss
            </Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('two navigations with one current link each do not warn', async () => {
    await render(
      <>
        <Navigation.Root label="Huvudmeny">
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#bygga" current="page">
                Bygga och bo
              </Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
        <Navigation.Root label="I det här avsnittet">
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#bygglov" current="page">
                Bygglov
              </Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
      </>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('an unnamed navigation with two current links warns about both problems', async () => {
    await render(
      <Navigation.Root>
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#start" current="page">
              Start
            </Link.Root>
          </Navigation.Item>
          <Navigation.Item>
            <Link.Root href="#om-oss" current="page">
              Om oss
            </Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    expect(warnings().filter((text) => text.includes('<Navigation.Root>'))).toHaveLength(1)
    expect(warnings().filter((text) => text.includes('marked current'))).toHaveLength(1)
  })
})

describe('Navigation.Label', () => {
  function GroupedMenu({ listProps = {} }: { listProps?: Record<string, string> }) {
    return (
      <Navigation.Root label="Dokumentation">
        <style>{'a { display: inline-block; min-block-size: 24px; }'}</style>
        <Navigation.List>
          <Navigation.Item>
            <Navigation.Label>Komponenter</Navigation.Label>
            <Navigation.List {...listProps}>
              <Navigation.Item>
                <Link.Root href="#knapp">Knapp</Link.Root>
              </Navigation.Item>
              <Navigation.Item>
                <Link.Root href="#lank">Länk</Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Item>
          <Navigation.Item>
            <Navigation.Label>Grunder</Navigation.Label>
            <Navigation.List>
              <Navigation.Item>
                <Link.Root href="#farger">Färger</Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
    )
  }

  test('names the nested list in its item, so each group is announced by its label', async () => {
    await render(<GroupedMenu />)
    const links = (name: string) =>
      page.getByRole('list', { name }).element().querySelectorAll('a').length
    expect(links('Komponenter')).toBe(2)
    expect(links('Grunder')).toBe(1)
  })

  test('the outer list stays unnamed and the label is plain text, not a heading or a link', async () => {
    await render(<GroupedMenu />)
    const label = page.getByText('Komponenter', { exact: true })
    expect(label.element().tagName).toBe('SPAN')
    expect(label.element().className).toBe('kv-navigation-label')
    expect(label.element().hasAttribute('role')).toBe(false)
    expect(label.element().hasAttribute('tabindex')).toBe(false)
    await expect.element(page.getByRole('heading')).not.toBeInTheDocument()
    await expect.element(page.getByRole('link', { name: 'Komponenter' })).not.toBeInTheDocument()
    const outer = page.getByRole('navigation').element().querySelector('ul')
    expect(outer?.hasAttribute('aria-labelledby')).toBe(false)
  })

  test('the list points at the label by id, and the ids are unique per item', async () => {
    await render(<GroupedMenu />)
    const lists = [...document.querySelectorAll('li > ul')]
    const ids = lists.map((list) => list.getAttribute('aria-labelledby'))
    expect(new Set(ids).size).toBe(2)
    expect(ids.map((id) => document.getElementById(id ?? '')?.textContent)).toEqual([
      'Komponenter',
      'Grunder',
    ])
  })

  test('a list with its own aria-labelledby keeps it', async () => {
    await render(
      <>
        <GroupedMenu listProps={{ 'aria-labelledby': 'own-name' }} />
        <span id="own-name">Eget namn</span>
      </>,
    )
    await expect.element(page.getByRole('list', { name: 'Eget namn' })).toBeInTheDocument()
  })

  test('a list with its own aria-label keeps it', async () => {
    await render(<GroupedMenu listProps={{ 'aria-label': 'Egen etikett' }} />)
    await expect.element(page.getByRole('list', { name: 'Egen etikett' })).toBeInTheDocument()
  })

  test('a nested list in an item with no label gets no name', async () => {
    await render(<MainMenu />)
    expect(document.querySelector('li > ul')?.hasAttribute('aria-labelledby')).toBe(false)
  })

  test('the label is no Tab stop: Tab goes from link to link past it', async () => {
    await render(<GroupedMenu />)
    page.getByRole('link', { name: 'Knapp' }).element().focus()
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Länk' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Färger' })).toHaveFocus()
  })

  test('keeps the id, a class and the ref of your own, and renders another element', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Navigation.Root label="Dokumentation">
        <Navigation.List>
          <Navigation.Item>
            <Navigation.Label ref={ref} id="own-label" className="own" lang="en" render={<small />}>
              Components
            </Navigation.Label>
            <Navigation.List>
              <Navigation.Item>
                <Link.Root href="#button">Button</Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    expect(ref.current?.tagName).toBe('SMALL')
    expect(ref.current?.className).toBe('own kv-navigation-label')
    expect(ref.current?.getAttribute('lang')).toBe('en')
    expect(ref.current?.id).toBe('own-label')
    await expect.element(page.getByRole('list', { name: 'Components' })).toBeInTheDocument()
  })

  test('an explicit id={undefined} on the label still names the nested list', async () => {
    await render(
      <Navigation.Root label="Dokumentation">
        <Navigation.List>
          <Navigation.Item>
            <Navigation.Label id={undefined}>Komponenter</Navigation.Label>
            <Navigation.List>
              <Navigation.Item>
                <Link.Root href="#button">Button</Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    await expect.element(page.getByRole('list', { name: 'Komponenter' })).toBeInTheDocument()
  })

  test('warns once when a label is in an item with no nested list', async () => {
    await render(
      <Navigation.Root label="Dokumentation">
        <Navigation.List>
          <Navigation.Item>
            <Navigation.Label>Ensam</Navigation.Label>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    await expect
      .poll(() => warnings().filter((message) => message.includes('Navigation.Label')))
      .toHaveLength(1)
  })

  test('warns when a label is outside a Navigation.Item', async () => {
    await render(
      <Navigation.Root label="Dokumentation">
        <Navigation.Label>Vilsen</Navigation.Label>
      </Navigation.Root>,
    )
    await expect
      .poll(() => warnings().some((message) => message.includes('outside a Navigation.Item')))
      .toBe(true)
  })

  test('has no axe violations', async () => {
    const { container } = await render(<GroupedMenu />)
    await expectNoA11yViolations(container)
  })

  test('server rendering gives the label its id; the list is named once it hydrates', () => {
    const html = renderToString(
      <Navigation.Root label="Dokumentation">
        <Navigation.List>
          <Navigation.Item>
            <Navigation.Label>Komponenter</Navigation.Label>
            <Navigation.List />
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>,
    )
    expect(html).toMatch(/<span id="[^"]+" class="kv-navigation-label">Komponenter<\/span>/)
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

  test('labelProps gives the label part its class', async () => {
    function OwnLabel() {
      const navigation = useNavigation()
      return <span {...navigation.labelProps}>Grupp</span>
    }
    await render(<OwnLabel />)
    expect(page.getByText('Grupp').element().className).toBe('kv-navigation-label')
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
    expect(Navigation.Label).toBe(NavigationLabel)
    expect(NavigationLabel.displayName).toBe('Navigation.Label')
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
    expectTypeOf<NavigationLabelProps>().toHaveProperty('render')
    expectTypeOf<NavigationState>().toEqualTypeOf<Record<string, never>>()
    expectTypeOf<UseNavigationOptions['label']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<NavigationRootPartProps['className']>().toEqualTypeOf<'kv-navigation'>()
    expectTypeOf<NavigationListPartProps['className']>().toEqualTypeOf<'kv-navigation-list'>()
    expectTypeOf<NavigationLabelPartProps['className']>().toEqualTypeOf<'kv-navigation-label'>()
    expectTypeOf<NavigationItemPartProps['className']>().toEqualTypeOf<'kv-navigation-item'>()
    expectTypeOf<UseNavigationResult['rootProps']>().toEqualTypeOf<NavigationRootPartProps>()
    expectTypeOf<NavigationRootPartProps>().not.toHaveProperty('data-kv')
  })

  test('has no orientation prop: a horizontal bar is the class kv-navigation--horizontal', () => {
    // Links are plain Tab stops, so orientation changes no keys: it is a look, and a look is a
    // class (Plan 0047). Tabs and Toolbar take an orientation prop because it changes their keys.
    expectTypeOf<NavigationRootProps>().not.toHaveProperty('orientation')
    expectTypeOf<UseNavigationOptions>().not.toHaveProperty('orientation')
  })
})
