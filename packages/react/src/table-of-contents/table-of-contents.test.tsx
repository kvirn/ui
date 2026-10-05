import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createElement, createRef } from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { mockRouterLinkComponent } from '../link/link.fixture.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import {
  TableOfContents,
  TableOfContentsItem,
  TableOfContentsLink,
  TableOfContentsList,
  TableOfContentsRoot,
} from './table-of-contents.tsx'
import type {
  TableOfContentsChildrenState,
  TableOfContentsEntry,
  TableOfContentsItemProps,
  TableOfContentsLinkProps,
  TableOfContentsListProps,
  TableOfContentsNode,
  TableOfContentsRootProps,
  TableOfContentsState,
} from './table-of-contents.tsx'
import { useTableOfContents } from './use-table-of-contents.ts'
import type {
  TableOfContentsItemPartProps,
  TableOfContentsLinkPartProps,
  TableOfContentsListPartProps,
  TableOfContentsRootPartProps,
  UseTableOfContentsOptions,
  UseTableOfContentsResult,
} from './use-table-of-contents.ts'

// Contract: table-of-contents.a11y.md. The keyboard rows, and the page-level behaviour in a real
// story, are covered end to end in apps/storybook/src/components/table-of-contents/
// table-of-contents.e2e.ts. These tests scroll the real page: they need a document taller than the
// viewport, so the fixture below makes its sections taller than the viewport.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  window.scrollTo(0, 0)
  consoleWarn.mockRestore()
})

function warnings(): string[] {
  return consoleWarn.mock.calls.map((call) => String(call[0]))
}

const entries: TableOfContentsEntry[] = [
  { id: 'avgift', label: 'Avgift', level: 2 },
  { id: 'avgift-bostad', label: 'Bostäder', level: 3 },
  { id: 'ansok', label: 'Så ansöker du', level: 2 },
]

interface PageProps {
  /** What the list shows. */
  items?: readonly TableOfContentsEntry[]
  /** What the page has headings for. An entry in `items` without one is a missing heading. */
  headings?: readonly TableOfContentsEntry[]
  offset?: number | undefined
  /** The headings' `scroll-margin-top`, which `offset` must match. */
  scrollMargin?: number
  /** Ids of headings that are `display: none`. */
  hidden?: readonly string[]
  /** The last section is shorter than the viewport, so its heading can never reach the top. */
  shortEnd?: boolean
}

/**
 * A visible title, the contents list, and a page that scrolls: a lead, then one section per
 * heading, each taller than the viewport, so any heading can be scrolled to the top. With
 * `shortEnd`, the last section is shorter than the viewport instead.
 */
function Page({
  items = entries,
  headings = items,
  offset,
  scrollMargin = 0,
  hidden = [],
  shortEnd = false,
}: PageProps) {
  return (
    <>
      {/* Unstyled links: a 24px minimum keeps them clear of axe's target-size rule (2.5.8). */}
      <style>{'a { display: inline-block; min-block-size: 24px; }'}</style>
      <h2 id="title">På den här sidan</h2>
      <TableOfContents.Root items={items} offset={offset} aria-labelledby="title" />
      <div style={{ height: 200 }} />
      {headings.map((heading, index) => (
        <section
          key={heading.id}
          style={{ minHeight: shortEnd && index === headings.length - 1 ? '30vh' : '120vh' }}
        >
          <h2
            id={heading.id}
            style={{
              scrollMarginTop: scrollMargin,
              ...(hidden.includes(heading.id) ? ({ display: 'none' } as const) : {}),
            }}
          >
            {heading.label}
          </h2>
        </section>
      ))}
    </>
  )
}

/** The text of every link marked as the current location. */
const currentLabels = (): string[] =>
  [...document.querySelectorAll('a[aria-current]')].map((link) => link.textContent ?? '')

/** Scrolls the page so the heading's top edge is `top` px below the top of the viewport. */
function scrollHeading(id: string, top = 0): void {
  const heading = document.getElementById(id)
  if (heading === null) {
    throw new Error(`The page has no heading #${id}.`)
  }
  window.scrollTo(0, heading.getBoundingClientRect().top + window.scrollY - top)
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

describe('rendering', () => {
  test('renders a navigation landmark named by aria-labelledby, with no aria-label', async () => {
    const { container } = await render(<Page />)
    const navigation = page.getByRole('navigation', { name: 'På den här sidan' })
    await expect.element(navigation).toBeVisible()
    await expect.element(navigation).toHaveAttribute('aria-labelledby', 'title')
    await expect.element(navigation).not.toHaveAttribute('aria-label')
    expect(navigation.element().tagName).toBe('NAV')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('without aria-labelledby the landmark is named by the message, in English by default', async () => {
    await render(<TableOfContents.Root items={entries} />)
    const navigation = page.getByRole('navigation', { name: 'On this page' })
    await expect.element(navigation).toBeVisible()
    await expect.element(navigation).toHaveAttribute('aria-label', 'On this page')
    await expect.element(navigation).not.toHaveAttribute('aria-labelledby')
  })

  const localeNames: Array<[locale: string, messages: KvirnMessages, name: string]> = [
    ['sv', sv, 'På den här sidan'],
    ['fi', fi, 'Tällä sivulla'],
    ['nb', nb, 'På denne siden'],
    ['nn', nn, 'På denne sida'],
    ['se', se, 'On this page'],
    ['en', en, 'On this page'],
  ]
  for (const [locale, messages, name] of localeNames) {
    test(`the name follows the locale: ${locale}`, async () => {
      await render(
        <KvirnProvider locale={locale} messages={messages}>
          <TableOfContents.Root items={entries} />
        </KvirnProvider>,
      )
      await expect.element(page.getByRole('navigation', { name })).toBeVisible()
    })
  }

  test('messages on the instance beat the provider’s message', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <TableOfContents.Root items={entries} messages={{ label: 'Innehåll' }} />
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('navigation', { name: 'Innehåll' })).toBeVisible()
  })

  test('an aria-label of your own names it instead of the message', async () => {
    await render(<TableOfContents.Root items={entries} aria-label="Innehåll" />)
    const navigation = page.getByRole('navigation', { name: 'Innehåll' })
    await expect.element(navigation).toBeVisible()
    await expect.element(navigation).toHaveAttribute('aria-label', 'Innehåll')
  })

  test('nests the lists from the levels, so the depth is announced', async () => {
    await render(<Page />)
    const lists = page.getByRole('list').all()
    expect(lists).toHaveLength(2)
    expect(page.getByRole('listitem').all()).toHaveLength(3)
    expect(lists[0]?.element().parentElement?.tagName).toBe('NAV')
    expect(lists[1]?.element().parentElement?.tagName).toBe('LI')
    expect(lists[0]?.element().contains(lists[1]?.element() ?? null)).toBe(true)
    expect(
      page
        .getByRole('link')
        .all()
        .map((link) => link.element().textContent),
    ).toEqual(['Avgift', 'Bostäder', 'Så ansöker du'])
  })

  test('a skipped level nests one step', async () => {
    await render(
      <TableOfContents.Root
        items={[
          { id: 'a', label: 'A', level: 2 },
          { id: 'b', label: 'B', level: 4 },
        ]}
      />,
    )
    expect(page.getByRole('list').all()).toHaveLength(2)
    const nestedLink = page.getByRole('link', { name: 'B' }).element()
    expect(nestedLink.closest('ul')?.parentElement?.tagName).toBe('LI')
    expect(nestedLink.closest('ul')?.parentElement?.closest('ul')?.parentElement?.tagName).toBe(
      'NAV',
    )
  })

  test('every link is a plain href="#id", and a registered router link is never used', async () => {
    await render(
      <KvirnProvider linkComponent={mockRouterLinkComponent}>
        <Page />
      </KvirnProvider>,
    )
    for (const entry of entries) {
      const link = page.getByRole('link', { name: entry.label })
      await expect.element(link).toHaveAttribute('href', `#${entry.id}`)
      await expect.element(link).not.toHaveAttribute('data-router-link')
    }
  })

  test('empty items render nothing: no empty landmark, and the function child is not called', async () => {
    const children = vi.fn<() => ReactNode>(() => <p>Rubrik</p>)
    const { container } = await render(
      <>
        <TableOfContents.Root items={[]} aria-labelledby="title" />
        <TableOfContents.Root items={[]}>{children}</TableOfContents.Root>
      </>,
    )
    expect(container.innerHTML).toBe('')
    expect(page.getByRole('navigation').all()).toHaveLength(0)
    expect(children).not.toHaveBeenCalled()
  })

  test('marks its parts with kv-table-of-contents, -list, -item and kv-link', async () => {
    await render(<TableOfContents.Root items={entries} data-testid="root" />)
    const root = page.getByTestId('root').element()
    expect(root.className).toBe('kv-table-of-contents')
    expect([...root.querySelectorAll('ul')].map((list) => list.className)).toEqual([
      'kv-table-of-contents-list',
      'kv-table-of-contents-list',
    ])
    expect([...root.querySelectorAll('li')].map((item) => item.className)).toEqual([
      'kv-table-of-contents-item',
      'kv-table-of-contents-item',
      'kv-table-of-contents-item',
    ])
    expect([...root.querySelectorAll('a')].map((link) => link.className)).toEqual([
      'kv-link',
      'kv-link',
      'kv-link',
    ])
    await expect.element(page.getByTestId('root')).not.toHaveAttribute('data-kv')
  })

  test('adds no role, tabindex or ARIA of its own, and no part is a Tab stop', async () => {
    await render(<Page />)
    const parts = document.querySelectorAll(
      '.kv-table-of-contents, .kv-table-of-contents-list, .kv-table-of-contents-item, .kv-table-of-contents a',
    )
    expect(parts.length).toBeGreaterThan(0)
    for (const element of parts) {
      expect(element.getAttributeNames()).not.toContain('role')
      expect(element.getAttributeNames()).not.toContain('tabindex')
      expect(element.getAttributeNames().filter((name) => name.startsWith('aria-'))).toEqual(
        element.matches('nav') ? ['aria-labelledby'] : [],
      )
    }
  })

  test('passes other attributes through and joins className, refs and render elements', async () => {
    const rootRef = createRef<HTMLElement>()
    const listRef = createRef<HTMLElement>()
    const itemRef = createRef<HTMLElement>()
    const linkRef = createRef<HTMLAnchorElement>()
    await render(
      <TableOfContents.Root
        ref={rootRef}
        items={entries.slice(0, 1)}
        id="innehall"
        lang="sv"
        className="min-lista"
        data-testid="root"
      >
        {({ tree }) => (
          <TableOfContents.List ref={listRef} className="min-lista-2" data-testid="list">
            {tree.map((node) => (
              <TableOfContents.Item
                key={node.item.id}
                ref={itemRef}
                render={<li data-own="ja" className="eget" />}
                data-testid="item"
              >
                <TableOfContents.Link
                  item={node.item}
                  ref={linkRef}
                  className="min-lank"
                  data-testid="link"
                />
              </TableOfContents.Item>
            ))}
          </TableOfContents.List>
        )}
      </TableOfContents.Root>,
    )
    const root = page.getByTestId('root')
    await expect.element(root).toHaveAttribute('id', 'innehall')
    await expect.element(root).toHaveAttribute('lang', 'sv')
    await expect.element(root).toHaveClass('kv-table-of-contents', 'min-lista')
    expect(rootRef.current).toBe(root.element())
    await expect
      .element(page.getByTestId('list'))
      .toHaveClass('kv-table-of-contents-list', 'min-lista-2')
    expect(listRef.current).toBe(page.getByTestId('list').element())
    const item = page.getByTestId('item')
    await expect.element(item).toHaveAttribute('data-own', 'ja')
    await expect.element(item).toHaveClass('kv-table-of-contents-item', 'eget')
    expect(itemRef.current).toBe(item.element())
    const link = page.getByTestId('link')
    await expect.element(link).toHaveClass('kv-link', 'min-lank')
    await expect.element(link).toHaveAttribute('href', '#avgift')
    expect(linkRef.current).toBe(link.element())
  })

  test('render as a function receives the part props and the state, and keeps the landmark', async () => {
    await render(
      <TableOfContents.Root
        items={entries}
        render={(rootProps, state) => (
          <nav {...rootProps} data-rendered="ja" data-active={state.activeId ?? 'ingen'} />
        )}
      />,
    )
    const navigation = page.getByRole('navigation', { name: 'On this page' })
    await expect.element(navigation).toHaveAttribute('data-rendered', 'ja')
    await expect.element(navigation).toHaveAttribute('data-active', 'ingen')
    await expect.element(navigation).toHaveClass('kv-table-of-contents')
    expect(page.getByRole('link').all()).toHaveLength(3)
  })

  test('a link can take a render element and its own children', async () => {
    // Written with createElement, because JSX `<a />` trips jsx-a11y anchor-has-content, although
    // the Link supplies the content.
    const ownAnchor = createElement('a', { title: 'Eget element' })
    await render(
      <TableOfContents.Root items={entries.slice(0, 1)}>
        {({ tree }) => (
          <TableOfContents.List>
            {tree.map((node) => (
              <TableOfContents.Item key={node.item.id}>
                <TableOfContents.Link item={node.item} render={ownAnchor}>
                  Första avsnittet
                </TableOfContents.Link>
              </TableOfContents.Item>
            ))}
          </TableOfContents.List>
        )}
      </TableOfContents.Root>,
    )
    const link = page.getByRole('link', { name: 'Första avsnittet' })
    await expect.element(link).toHaveAttribute('title', 'Eget element')
    await expect.element(link).toHaveAttribute('href', '#avgift')
    await expect.element(link).toHaveClass('kv-link')
  })
})

describe('the function child', () => {
  test('replaces the list with your own, and receives the tree and the active id', async () => {
    const received: TableOfContentsChildrenState[] = []
    await render(
      <>
        <style>{'a { display: inline-block; min-block-size: 24px; }'}</style>
        <h2 id="title">På den här sidan</h2>
        <TableOfContents.Root items={entries} aria-labelledby="title">
          {(state) => {
            received.push(state)
            return (
              <>
                <TableOfContents.List data-testid="own-list">
                  {state.tree.map((node) => (
                    <TableOfContents.Item key={node.item.id}>
                      <TableOfContents.Link item={node.item} />
                    </TableOfContents.Item>
                  ))}
                </TableOfContents.List>
                <p data-testid="active">{state.activeId ?? 'ingen'}</p>
              </>
            )
          }}
        </TableOfContents.Root>
        <div style={{ height: 200 }} />
        {entries.map((entry) => (
          <section key={entry.id} style={{ minHeight: '120vh' }}>
            <h2 id={entry.id}>{entry.label}</h2>
          </section>
        ))}
      </>,
    )
    // Only the top level: the function drew its own list, so the h3 has no link.
    expect(page.getByRole('link').all()).toHaveLength(2)
    expect(page.getByRole('list').all()).toHaveLength(1)
    expect(received.at(-1)?.tree.map((node) => node.item.id)).toEqual(['avgift', 'ansok'])
    expect(received.at(-1)?.tree[0]?.children.map((node) => node.item.id)).toEqual([
      'avgift-bostad',
    ])
    await expect.element(page.getByTestId('active')).toHaveTextContent('ingen')
    scrollHeading('ansok')
    await expect.element(page.getByTestId('active')).toHaveTextContent('ansok')
    await expect.poll(currentLabels).toEqual(['Så ansöker du'])
  })
})

describe('the current heading', () => {
  test('nothing is current before the first scroll', async () => {
    await render(<Page />)
    await nextFrame()
    await nextFrame()
    expect(currentLabels()).toEqual([])
    expect(document.querySelectorAll('[data-current]')).toHaveLength(0)
  })

  test('scrolling to a heading makes its link the one aria-current="location"', async () => {
    await render(<Page />)
    scrollHeading('ansok')
    await expect.poll(currentLabels).toEqual(['Så ansöker du'])
    const current = page.getByRole('link', { name: 'Så ansöker du' })
    await expect.element(current).toHaveAttribute('aria-current', 'location')
    await expect.element(current).toHaveAttribute('data-current', '')
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1)
    scrollHeading('avgift-bostad')
    await expect.poll(currentLabels).toEqual(['Bostäder'])
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1)
  })

  test('the last heading above the line stays current while the next one is still below it', async () => {
    await render(<Page />)
    scrollHeading('ansok', 300)
    await expect.poll(currentLabels).toEqual(['Bostäder'])
  })

  test('scrolling back above the first heading leaves nothing current', async () => {
    await render(<Page />)
    scrollHeading('avgift')
    await expect.poll(currentLabels).toEqual(['Avgift'])
    window.scrollTo(0, 0)
    await expect.poll(currentLabels).toEqual([])
  })

  test('offset moves the line: a heading is current once it reaches offset', async () => {
    await render(<Page offset={64} scrollMargin={64} />)
    // 100px below the top is below a line at 64px.
    scrollHeading('ansok', 100)
    await expect.poll(currentLabels).toEqual(['Bostäder'])
    // Where a link to it lands, with scroll-margin-top: 64px.
    scrollHeading('ansok', 64)
    await expect.poll(currentLabels).toEqual(['Så ansöker du'])
  })

  test('a heading that is not rendered (display: none) is skipped', async () => {
    await render(<Page hidden={['avgift-bostad']} />)
    await nextFrame()
    await nextFrame()
    // A hidden heading reads 0 for its top, which would look like it is above the line.
    expect(currentLabels()).toEqual([])
    // Past the first heading and before the last: the hidden one in between is not the current.
    scrollHeading('ansok', 300)
    await expect.poll(currentLabels).toEqual(['Avgift'])
    expect(warnings()).toEqual([])
  })

  test('at the end of the page the last heading is current, though it cannot reach the line', async () => {
    await render(<Page shortEnd />)
    // Before the end, the last heading is below the line, so the one above it is current.
    scrollHeading('avgift-bostad')
    await expect.poll(currentLabels).toEqual(['Bostäder'])
    window.scrollTo(0, document.documentElement.scrollHeight)
    await expect.poll(currentLabels).toEqual(['Så ansöker du'])
    expect(document.getElementById('ansok')?.getBoundingClientRect().top).toBeGreaterThan(1)
  })

  test('a page that does not scroll marks nothing, though it is at its end', async () => {
    // The default 8px body margin, and the list's 16px margin collapsing through the body, would
    // each push this short page 16px past the viewport.
    const bodyStyle = document.body.getAttribute('style')
    document.body.style.margin = '0'
    document.body.style.display = 'flow-root'
    try {
      await render(
        <>
          <TableOfContents.Root items={entries.slice(0, 1)} />
          <div style={{ height: 100 }} />
          <h2 id="avgift">Avgift</h2>
        </>,
      )
      await nextFrame()
      await nextFrame()
      expect(document.documentElement.scrollHeight).toBeLessThanOrEqual(window.innerHeight)
      expect(currentLabels()).toEqual([])
    } finally {
      if (bodyStyle === null) {
        document.body.removeAttribute('style')
      } else {
        document.body.setAttribute('style', bodyStyle)
      }
    }
  })
})

describe('the observer', () => {
  test('unmounting disconnects it, and a new array of the same ids does not re-subscribe', async () => {
    const disconnect = vi.spyOn(IntersectionObserver.prototype, 'disconnect')
    try {
      const { rerender, unmount } = await render(<Page />)
      expect(disconnect).not.toHaveBeenCalled()
      // A new array and new objects, the same ids: the effect is keyed by the ids, not the array.
      await rerender(<Page items={entries.map((entry) => ({ ...entry }))} />)
      expect(disconnect).not.toHaveBeenCalled()
      // A different offset moves the line, so the observer is made again.
      await rerender(<Page items={entries.map((entry) => ({ ...entry }))} offset={32} />)
      expect(disconnect).toHaveBeenCalledTimes(1)
      await unmount()
      expect(disconnect).toHaveBeenCalledTimes(2)
    } finally {
      disconnect.mockRestore()
    }
  })

  test('a changed set of ids is observed again, and a link that is no longer listed is gone', async () => {
    const { rerender } = await render(<Page />)
    scrollHeading('ansok')
    await expect.poll(currentLabels).toEqual(['Så ansöker du'])
    await rerender(<Page items={entries.slice(0, 2)} headings={entries} />)
    // The page is still at the last heading, which is no longer listed: the one above it is.
    await expect.poll(currentLabels).toEqual(['Bostäder'])
    expect(page.getByRole('link').all()).toHaveLength(2)
  })

  test('works without IntersectionObserver: the list renders and nothing is current', async () => {
    const original = window.IntersectionObserver
    Reflect.deleteProperty(window, 'IntersectionObserver')
    try {
      await render(<Page />)
      scrollHeading('ansok')
      await nextFrame()
      await nextFrame()
      expect(page.getByRole('link').all()).toHaveLength(3)
      expect(currentLabels()).toEqual([])
    } finally {
      window.IntersectionObserver = original
    }
  })
})

describe('development warnings', () => {
  test('a missing heading warns once, naming the id, and its link stays', async () => {
    const withMissing = [...entries, { id: 'saknas', label: 'Saknas', level: 2 }]
    const { rerender } = await render(<Page items={withMissing} headings={entries} />)
    const matching = () => warnings().filter((text) => text.includes('#saknas'))
    expect(matching()).toHaveLength(1)
    expect(matching()[0]).toContain('2.4.1')
    await expect
      .element(page.getByRole('link', { name: 'Saknas' }))
      .toHaveAttribute('href', '#saknas')
    // The same ids in a new array: nothing is checked again, and the warning is once per id anyway.
    await rerender(<Page items={[...withMissing]} headings={entries} />)
    expect(matching()).toHaveLength(1)
  })

  test('a list, an item and a link outside the root warn once each, and still render', async () => {
    const first = { id: 'avgift', label: 'Avgift', level: 2 }
    await render(
      <>
        <TableOfContents.List data-testid="list">
          <TableOfContents.Item data-testid="item">
            <TableOfContents.Link item={first} data-testid="link" />
          </TableOfContents.Item>
        </TableOfContents.List>
        <TableOfContents.List />
      </>,
    )
    expect(warnings().filter((text) => text.includes('TableOfContents.List'))).toHaveLength(1)
    expect(warnings().filter((text) => text.includes('TableOfContents.Item'))).toHaveLength(1)
    expect(warnings().filter((text) => text.includes('TableOfContents.Link'))).toHaveLength(1)
    expect(page.getByTestId('list').element().className).toBe('kv-table-of-contents-list')
    expect(page.getByTestId('item').element().className).toBe('kv-table-of-contents-item')
    await expect.element(page.getByTestId('link')).toHaveAttribute('href', '#avgift')
    await expect.element(page.getByTestId('link')).not.toHaveAttribute('aria-current')
  })

  test('a list that is complete and in a root does not warn', async () => {
    await render(<Page />)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('useTableOfContents', () => {
  /** One list per list of nodes, as the hook's docs say: the nested links are drawn too. */
  function OwnNodes({
    contents,
    nodes,
  }: {
    contents: UseTableOfContentsResult
    nodes: TableOfContentsNode[]
  }) {
    return (
      <ul {...contents.listProps}>
        {nodes.map((node) => {
          const linkProps = contents.getLinkProps(node.item)
          return (
            <li key={node.item.id} {...contents.itemProps}>
              <a {...linkProps} href={linkProps.href}>
                {node.item.label}
              </a>
              {node.children.length > 0 ? (
                <OwnNodes contents={contents} nodes={node.children} />
              ) : null}
            </li>
          )
        })}
      </ul>
    )
  }

  function OwnContents({ labelledBy }: { labelledBy?: string }) {
    const contents = useTableOfContents({ items: entries, labelledBy })
    return (
      <>
        <h2 id="title">På den här sidan</h2>
        <nav {...contents.rootProps} data-testid="root">
          <OwnNodes contents={contents} nodes={contents.tree} />
        </nav>
        <p data-testid="active">{contents.activeId ?? 'ingen'}</p>
        <div style={{ height: 200 }} />
        {entries.map((entry) => (
          <section key={entry.id} style={{ minHeight: '120vh' }}>
            <h2 id={entry.id}>{entry.label}</h2>
          </section>
        ))}
      </>
    )
  }

  test('gives spreadable props for your own elements, named by the message', async () => {
    await render(<OwnContents />)
    const root = page.getByTestId('root')
    await expect.element(root).toHaveAttribute('aria-label', 'On this page')
    await expect.element(root).not.toHaveAttribute('aria-labelledby')
    expect(root.element().className).toBe('kv-table-of-contents')
    expect(root.element().querySelector('ul')?.className).toBe('kv-table-of-contents-list')
    expect(root.element().querySelector('li')?.className).toBe('kv-table-of-contents-item')
    const link = page.getByRole('link', { name: 'Avgift' })
    expect(link.element().className).toBe('kv-link')
    await expect.element(link).toHaveAttribute('href', '#avgift')
  })

  test('labelledBy replaces the message: aria-labelledby, and no aria-label', async () => {
    await render(<OwnContents labelledBy="title" />)
    const root = page.getByTestId('root')
    await expect.element(root).toHaveAttribute('aria-labelledby', 'title')
    await expect.element(root).not.toHaveAttribute('aria-label')
    await expect.element(page.getByRole('navigation', { name: 'På den här sidan' })).toBeVisible()
  })

  test('activeId follows the scroll, and getLinkProps marks only that item', async () => {
    await render(<OwnContents />)
    await expect.element(page.getByTestId('active')).toHaveTextContent('ingen')
    scrollHeading('avgift-bostad')
    await expect.element(page.getByTestId('active')).toHaveTextContent('avgift-bostad')
    await expect
      .element(page.getByRole('link', { name: 'Bostäder' }))
      .toHaveAttribute('aria-current', 'location')
    await expect
      .element(page.getByRole('link', { name: 'Avgift' }))
      .not.toHaveAttribute('aria-current')
  })
})

describe('server rendering', () => {
  test('renders the full list to a string, and marks nothing current', () => {
    const html = renderToString(<TableOfContents.Root items={entries} aria-labelledby="title" />)
    expect(html).toContain('<nav')
    expect(html).toContain('aria-labelledby="title"')
    expect(html).not.toContain('aria-label=')
    expect(html).toContain('href="#avgift"')
    expect(html).toContain('href="#avgift-bostad"')
    expect(html).toContain('href="#ansok"')
    expect(html).toContain('>Så ansöker du</a>')
    expect(html).not.toContain('aria-current')
    expect(html.match(/<ul/g)).toHaveLength(2)
    expect(html.match(/<li/g)).toHaveLength(3)
  })

  test('empty items render an empty string', () => {
    expect(renderToString(<TableOfContents.Root items={[]} />)).toBe('')
  })
})

describe('names', () => {
  test('TableOfContents.Root, List, Item and Link are the flat named exports', () => {
    expect(TableOfContents.Root).toBe(TableOfContentsRoot)
    expect(TableOfContents.List).toBe(TableOfContentsList)
    expect(TableOfContents.Item).toBe(TableOfContentsItem)
    expect(TableOfContents.Link).toBe(TableOfContentsLink)
    expect(TableOfContentsRoot.displayName).toBe('TableOfContents.Root')
    expect(TableOfContentsList.displayName).toBe('TableOfContents.List')
    expect(TableOfContentsItem.displayName).toBe('TableOfContents.Item')
    expect(TableOfContentsLink.displayName).toBe('TableOfContents.Link')
  })
})

describe('types', () => {
  test('exports the part props, the state and the hook types', () => {
    expectTypeOf<TableOfContentsRootProps['items']>().toEqualTypeOf<
      readonly TableOfContentsEntry[]
    >()
    expectTypeOf<TableOfContentsRootProps['offset']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<TableOfContentsRootProps>().toHaveProperty('render')
    expectTypeOf<TableOfContentsListProps>().toHaveProperty('render')
    expectTypeOf<TableOfContentsItemProps>().toHaveProperty('render')
    expectTypeOf<TableOfContentsLinkProps['item']>().toEqualTypeOf<TableOfContentsEntry>()
    expectTypeOf<TableOfContentsState['activeId']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<TableOfContentsChildrenState['tree']>().toEqualTypeOf<TableOfContentsNode[]>()
    expectTypeOf<TableOfContentsNode['item']>().toEqualTypeOf<TableOfContentsEntry>()
    expectTypeOf<TableOfContentsEntry['level']>().toEqualTypeOf<number>()
    expectTypeOf<UseTableOfContentsOptions['items']>().toEqualTypeOf<
      readonly TableOfContentsEntry[]
    >()
    expectTypeOf<
      TableOfContentsRootPartProps['className']
    >().toEqualTypeOf<'kv-table-of-contents'>()
    expectTypeOf<
      TableOfContentsListPartProps['className']
    >().toEqualTypeOf<'kv-table-of-contents-list'>()
    expectTypeOf<
      TableOfContentsItemPartProps['className']
    >().toEqualTypeOf<'kv-table-of-contents-item'>()
    expectTypeOf<TableOfContentsLinkPartProps['className']>().toEqualTypeOf<'kv-link'>()
    expectTypeOf<UseTableOfContentsResult['activeId']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<
      UseTableOfContentsResult['rootProps']
    >().toEqualTypeOf<TableOfContentsRootPartProps>()
  })
})
