import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import {
  MockRouterProvider,
  mockRouterLinkComponent,
  useMockPathname,
} from '../link/link.fixture.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Pagination } from './pagination.tsx'
import type { PaginationLinkProps, PaginationRootProps } from './pagination.tsx'
import { usePagination } from './use-pagination.ts'
import type {
  PaginationRootPartProps,
  UsePaginationOptions,
  UsePaginationResult,
} from './use-pagination.ts'

// Contract: pagination.a11y.md. The narrow layout, the 44px targets and the current page's
// shape are the theme's, proved in the Storybook stories (pagination.stories.tsx).

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function Pages(props: PaginationRootProps) {
  return (
    <>
      {/* Unstyled links: a 24px minimum keeps them clear of axe's target-size rule (2.5.8). */}
      <style>{'a { display: inline-block; min-block-size: 24px; }'}</style>
      <Pagination.Root {...props}>
        <Pagination.List>
          <Pagination.Item>
            <Pagination.Previous href="?sida=1" />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Link page={1} href="?sida=1" />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Link page={2} href="?sida=2" current />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Link page={3} href="?sida=3" />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Ellipsis />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Link page={9} href="?sida=9" />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Status page={2} total={9} />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Next href="?sida=3" />
          </Pagination.Item>
        </Pagination.List>
      </Pagination.Root>
      <button type="button">Efter</button>
    </>
  )
}

describe('Pagination keyboard', () => {
  test('Tab moves through every link in order, and the ellipsis and status are no stops', async () => {
    await render(<Pages />)
    const names = ['Previous page', 'Page 1', 'Page 2', 'Page 3', 'Page 9']
    for (const name of names) {
      await userEvent.tab()
      await expect.element(page.getByRole('link', { name })).toHaveFocus()
    }
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Next page' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('the current page is a link and a Tab stop', async () => {
    await render(<Pages />)
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Page 2' })).toHaveFocus()
  })

  test('Shift+Tab moves to the previous link', async () => {
    await render(<Pages />)
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('link', { name: 'Page 1' })).toHaveFocus()
  })

  test('Enter follows a link through the registered router link, without a page load', async () => {
    function Search() {
      return <p>Sökning: {useMockPathname()}</p>
    }
    await render(
      <KvirnProvider linkComponent={mockRouterLinkComponent}>
        <MockRouterProvider initialPathname="/arenden">
          <Pages />
          <Search />
        </MockRouterProvider>
      </KvirnProvider>,
    )
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByText('Sökning: ?sida=1')).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Page 1' })).toHaveFocus()
  })

  test('Space is not handled', async () => {
    await render(<Pages />)
    await userEvent.tab()
    const link = page.getByRole('link', { name: 'Previous page' }).element()
    const keydown = vi.fn<(event: Event) => boolean>((event) => event.defaultPrevented)
    link.addEventListener('keydown', keydown)
    await userEvent.keyboard(' ')
    expect(keydown).toHaveReturnedWith(false)
    expect(document.activeElement).toBe(link)
  })
})

describe('Pagination', () => {
  test('is a navigation landmark named by the message pagination.label', async () => {
    const { container } = await render(<Pages />)
    await expect.element(page.getByRole('navigation', { name: 'Pages' })).toBeVisible()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('warns once when the Root has no Status', async () => {
    await render(
      <Pagination.Root>
        <Pagination.List>
          <Pagination.Item>
            <Pagination.Link page={1} href="?sida=1" current />
          </Pagination.Item>
        </Pagination.List>
      </Pagination.Root>,
    )
    const warnings = consoleWarn.mock.calls.map((call) => String(call[0]))
    const matching = warnings.filter((text) => text.includes('<Pagination.Status>'))
    expect(matching).toHaveLength(1)
    expect(matching[0]).toContain('1.3.1')
  })

  test('is a list of links inside the landmark, with no buttons', async () => {
    await render(<Pages />)
    const list = page.getByRole('list').element()
    expect(list.tagName).toBe('UL')
    expect(list.parentElement?.tagName).toBe('NAV')
    expect([...list.children].every((item) => item.tagName === 'LI')).toBe(true)
    expect(page.getByRole('link').elements()).toHaveLength(6)
    expect(document.querySelectorAll('nav button')).toHaveLength(0)
    for (const link of page.getByRole('link').elements()) {
      expect(link.tagName).toBe('A')
      expect(link.getAttribute('href')).toMatch(/^\?sida=\d$/)
    }
  })

  test('the current page has aria-current="page" and no other link has', async () => {
    await render(<Pages />)
    await expect
      .element(page.getByRole('link', { name: 'Page 2' }))
      .toHaveAttribute('aria-current', 'page')
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1)
  })

  test('a page link shows the number and is named Page N, so the visible text is in the name', async () => {
    await render(<Pages />)
    const link = page.getByRole('link', { name: 'Page 9' })
    expect(link.element().textContent).toBe('9')
    await expect.element(link).toHaveAttribute('aria-label', 'Page 9')
  })

  test('Previous and Next carry words and rel', async () => {
    await render(<Pages />)
    const previous = page.getByRole('link', { name: 'Previous page' })
    const next = page.getByRole('link', { name: 'Next page' })
    expect(previous.element().textContent).toBe('Previous page')
    await expect.element(previous).toHaveAttribute('rel', 'prev')
    await expect.element(next).toHaveAttribute('rel', 'next')
  })

  test('the ellipsis is text in an item: not a link and not focusable', async () => {
    await render(<Pages />)
    const ellipsis = page.getByText('…').element()
    expect(ellipsis.closest('a')).toBeNull()
    expect(ellipsis.tabIndex).toBe(-1)
    expect(ellipsis.closest('li')).not.toBeNull()
  })

  test('the status reads Page N of M', async () => {
    await render(<Pages />)
    await expect.element(page.getByText('Page 2 of 9')).toBeVisible()
  })

  test('children replace the words and the number', async () => {
    await render(
      <Pagination.Root>
        <Pagination.List>
          <Pagination.Item>
            <Pagination.Previous href="?sida=1">Tillbaka</Pagination.Previous>
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Status page={2} total={9}>
              Sida två av nio
            </Pagination.Status>
          </Pagination.Item>
        </Pagination.List>
      </Pagination.Root>,
    )
    await expect.element(page.getByRole('link', { name: 'Tillbaka' })).toBeVisible()
    await expect.element(page.getByText('Sida två av nio')).toBeVisible()
  })

  test('Pagination links render the provider’s registered router link', async () => {
    await render(
      <KvirnProvider linkComponent={mockRouterLinkComponent}>
        <MockRouterProvider initialPathname="/arenden">
          <Pages />
        </MockRouterProvider>
      </KvirnProvider>,
    )
    for (const link of page.getByRole('link').elements()) {
      expect(link.hasAttribute('data-router-link')).toBe(true)
    }
  })

  test('label replaces the landmark name', async () => {
    await render(<Pages label="Sidnavigering" />)
    await expect.element(page.getByRole('navigation', { name: 'Sidnavigering' })).toBeVisible()
  })

  test('messages override the words per instance', async () => {
    await render(
      <Pages
        messages={{ label: 'Resultatsidor', page: ({ page: number }) => `Sidan ${number}` }}
      />,
    )
    await expect.element(page.getByRole('navigation', { name: 'Resultatsidor' })).toBeVisible()
  })

  test.each([
    ['sv', sv, 'Sidor', 'Föregående sida', 'Nästa sida', 'Sida 2 av 9', 'Sida 2'],
    ['en', en, 'Pages', 'Previous page', 'Next page', 'Page 2 of 9', 'Page 2'],
    ['fi', fi, 'Sivut', 'Edellinen sivu', 'Seuraava sivu', 'Sivu 2/9', 'Sivu 2'],
    ['nb', nb, 'Sider', 'Forrige side', 'Neste side', 'Side 2 av 9', 'Side 2'],
    ['nn', nn, 'Sider', 'Førre side', 'Neste side', 'Side 2 av 9', 'Side 2'],
    ['se', se, 'Pages', 'Previous page', 'Next page', 'Page 2 of 9', 'Page 2'],
  ] as const)(
    'the %s catalog names the landmark, the links and the status',
    async (locale, messages, label, previous, next, status, current) => {
      await render(
        <KvirnProvider locale={locale} messages={messages}>
          <Pages />
        </KvirnProvider>,
      )
      await expect.element(page.getByRole('navigation', { name: label })).toBeVisible()
      await expect.element(page.getByRole('link', { name: previous })).toBeVisible()
      await expect.element(page.getByRole('link', { name: next })).toBeVisible()
      await expect.element(page.getByRole('link', { name: current })).toBeVisible()
      await expect.element(page.getByText(status)).toBeVisible()
    },
  )

  test('page numbers are formatted by the locale', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Pagination.Root>
          <Pagination.List>
            <Pagination.Item>
              <Pagination.Link page={1250} href="?sida=1250" />
            </Pagination.Item>
          </Pagination.List>
        </Pagination.Root>
      </KvirnProvider>,
    )
    const link = page.getByRole('link').element()
    expect(link.textContent).toBe(new Intl.NumberFormat('sv').format(1250))
  })

  test('marks its parts with the kv-pagination classes', async () => {
    await render(<Pages />)
    expect(document.querySelector('nav')?.className).toBe('kv-pagination')
    expect(document.querySelector('ul')?.className).toBe('kv-pagination-list')
    expect(document.querySelectorAll('li.kv-pagination-item')).toHaveLength(8)
    expect(page.getByRole('link', { name: 'Page 1' }).element().className).toBe(
      'kv-pagination-link kv-link',
    )
    expect(page.getByRole('link', { name: 'Previous page' }).element().className).toBe(
      'kv-pagination-previous kv-link',
    )
    expect(page.getByRole('link', { name: 'Next page' }).element().className).toBe(
      'kv-pagination-next kv-link',
    )
    expect(page.getByText('…').element().className).toBe('kv-pagination-ellipsis')
    expect(page.getByText('Page 2 of 9').element().className).toBe('kv-pagination-status')
  })

  test('passes attributes through and joins className, refs and render elements', async () => {
    const rootRef = createRef<HTMLElement>()
    const linkRef = createRef<HTMLAnchorElement>()
    await render(
      <Pagination.Root ref={rootRef} id="sidor" className="min" data-testid="root">
        <Pagination.List>
          <Pagination.Item render={<li data-own="ja" className="eget" />} data-testid="item">
            <Pagination.Link page={1} href="?sida=1" ref={linkRef} className="egen" />
          </Pagination.Item>
        </Pagination.List>
      </Pagination.Root>,
    )
    const root = page.getByTestId('root')
    await expect.element(root).toHaveAttribute('id', 'sidor')
    await expect.element(root).toHaveClass('kv-pagination', 'min')
    expect(rootRef.current).toBe(root.element())
    expect(linkRef.current).toBe(page.getByRole('link').element())
    await expect.element(page.getByRole('link')).toHaveClass('kv-pagination-link', 'egen')
    const item = page.getByTestId('item')
    await expect.element(item).toHaveAttribute('data-own', 'ja')
    await expect.element(item).toHaveClass('kv-pagination-item', 'eget')
  })

  test('render as a function keeps the landmark', async () => {
    await render(
      <Pagination.Root render={(rootProps) => <nav {...rootProps} data-rendered="ja" />}>
        <Pagination.List>
          <Pagination.Item>
            <Pagination.Link page={1} href="?sida=1" />
          </Pagination.Item>
        </Pagination.List>
      </Pagination.Root>,
    )
    const navigation = page.getByRole('navigation', { name: 'Pages' })
    await expect.element(navigation).toHaveAttribute('data-rendered', 'ja')
    await expect.element(navigation).toHaveClass('kv-pagination')
  })

  test('renders on the server with the landmark and the current page', () => {
    const html = renderToString(<Pages />)
    expect(html).toContain('aria-label="Pages"')
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('aria-label="Page 2"')
  })
})

describe('usePagination', () => {
  function Probe(options: UsePaginationOptions) {
    const pagination = usePagination(options)
    return (
      <nav {...pagination.rootProps}>
        <ul {...pagination.listProps}>
          <li {...pagination.itemProps}>
            <a href="?sida=3" aria-label={pagination.getPageLabel(3)}>
              3
            </a>
          </li>
          <li {...pagination.itemProps}>
            <span {...pagination.statusProps}>{pagination.getStatus(3, 9)}</span>
          </li>
        </ul>
      </nav>
    )
  }

  test('returns the part props, the name and the words for your own elements', async () => {
    const { container } = await render(<Probe />)
    await expect.element(page.getByRole('navigation', { name: 'Pages' })).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Page 3' })).toBeVisible()
    await expect.element(page.getByText('Page 3 of 9')).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('an empty label falls back to the message', async () => {
    await render(<Probe label=" " />)
    await expect.element(page.getByRole('navigation', { name: 'Pages' })).toBeVisible()
  })
})

describe('Pagination types', () => {
  test('the props are typed', () => {
    expectTypeOf<UsePaginationResult['rootProps']>().toEqualTypeOf<PaginationRootPartProps>()
    expectTypeOf<PaginationRootPartProps['className']>().toEqualTypeOf<'kv-pagination'>()
    expectTypeOf<PaginationLinkProps['page']>().toEqualTypeOf<number>()
    expectTypeOf<PaginationLinkProps['current']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<UsePaginationResult['getPageLabel']>().toEqualTypeOf<(page: number) => string>()
  })
})
