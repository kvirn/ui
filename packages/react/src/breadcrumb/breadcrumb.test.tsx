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
import { Breadcrumb } from './breadcrumb.tsx'
import type { BreadcrumbLinkProps, BreadcrumbRootProps } from './breadcrumb.tsx'
import { useBreadcrumb } from './use-breadcrumb.ts'
import type {
  BreadcrumbCurrentPartProps,
  BreadcrumbRootPartProps,
  UseBreadcrumbOptions,
  UseBreadcrumbResult,
} from './use-breadcrumb.ts'

// Contract: breadcrumb.a11y.md. The wrapping, the separators and the targets are the theme's,
// proved in the Storybook stories (breadcrumb.stories.tsx), where theme.css is loaded.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function Trail(props: BreadcrumbRootProps) {
  return (
    <>
      {/* Unstyled links: a 24px minimum keeps them clear of axe's target-size rule (2.5.8). */}
      <style>{'a { display: inline-block; min-block-size: 24px; }'}</style>
      <Breadcrumb.Root {...props}>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/">Start</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/barn">Barn och utbildning</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Current>Förskola</Breadcrumb.Current>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
      <button type="button">Efter</button>
    </>
  )
}

describe('Breadcrumb keyboard', () => {
  test('Tab moves through the links in order and the current page is not a stop', async () => {
    await render(<Trail />)
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Start' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Barn och utbildning' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('Shift+Tab moves to the previous link', async () => {
    await render(<Trail />)
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('link', { name: 'Start' })).toHaveFocus()
  })

  test('Enter follows a link through the registered router link, without a page load', async () => {
    function Pathname() {
      return <p>Nuvarande sida: {useMockPathname()}</p>
    }
    await render(
      <KvirnProvider linkComponent={mockRouterLinkComponent}>
        <MockRouterProvider initialPathname="/barn/forskola">
          <Trail />
          <Pathname />
        </MockRouterProvider>
      </KvirnProvider>,
    )
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByText('Nuvarande sida: /barn')).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Barn och utbildning' })).toHaveFocus()
  })

  test('Space is not handled', async () => {
    await render(<Trail />)
    await userEvent.tab()
    const link = page.getByRole('link', { name: 'Start' }).element()
    const keydown = vi.fn<(event: Event) => boolean>((event) => event.defaultPrevented)
    link.addEventListener('keydown', keydown)
    await userEvent.keyboard(' ')
    expect(keydown).toHaveReturnedWith(false)
    expect(document.activeElement).toBe(link)
  })
})

describe('Breadcrumb', () => {
  test('is a navigation landmark named by the message breadcrumb.label', async () => {
    const { container } = await render(<Trail />)
    await expect.element(page.getByRole('navigation', { name: 'You are here' })).toBeVisible()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the trail is an ordered list of items in the order given', async () => {
    await render(<Trail />)
    const list = page.getByRole('list').element()
    expect(list.tagName).toBe('OL')
    expect(list.parentElement?.tagName).toBe('NAV')
    expect([...list.children].map((item) => item.tagName)).toEqual(['LI', 'LI', 'LI'])
    expect([...list.children].map((item) => item.textContent)).toEqual([
      'Start',
      'Barn och utbildning',
      'Förskola',
    ])
  })

  test('the last item is the current page: text with aria-current="page", not a link', async () => {
    await render(<Trail />)
    const current = page.getByText('Förskola')
    await expect.element(current).toHaveAttribute('aria-current', 'page')
    expect(current.element().tagName).toBe('SPAN')
    expect(current.element().closest('a')).toBeNull()
    expect(page.getByRole('link').elements()).toHaveLength(2)
  })

  test('exactly one element is current', async () => {
    await render(<Trail />)
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1)
  })

  test('the links are native anchors with an href', async () => {
    await render(<Trail />)
    const link = page.getByRole('link', { name: 'Barn och utbildning' }).element()
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('/barn')
  })

  test('Breadcrumb.Link renders the provider’s registered router link', async () => {
    await render(
      <KvirnProvider linkComponent={mockRouterLinkComponent}>
        <MockRouterProvider initialPathname="/barn/forskola">
          <Trail />
        </MockRouterProvider>
      </KvirnProvider>,
    )
    await expect
      .element(page.getByRole('link', { name: 'Start' }))
      .toHaveAttribute('data-router-link', '')
  })

  test('label replaces the message', async () => {
    await render(<Trail label="Brödsmulor" />)
    await expect.element(page.getByRole('navigation', { name: 'Brödsmulor' })).toBeVisible()
  })

  test('messages override the name per instance', async () => {
    await render(<Trail messages={{ label: 'Din plats' }} />)
    await expect.element(page.getByRole('navigation', { name: 'Din plats' })).toBeVisible()
  })

  test.each([
    ['sv', sv, 'Du är här'],
    ['en', en, 'You are here'],
    ['fi', fi, 'Olet tässä'],
    ['nb', nb, 'Du er her'],
    ['nn', nn, 'Du er her'],
    ['se', se, 'You are here'],
  ] as const)('the %s catalog names the landmark', async (locale, messages, name) => {
    await render(
      <KvirnProvider locale={locale} messages={messages}>
        <Trail />
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('navigation', { name })).toBeVisible()
  })

  test('marks its parts with the kv-breadcrumb classes', async () => {
    await render(
      <Breadcrumb.Root data-testid="root">
        <Breadcrumb.List data-testid="list">
          <Breadcrumb.Item data-testid="item">
            <Breadcrumb.Link href="/" data-testid="link">
              Start
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Current data-testid="current">Förskola</Breadcrumb.Current>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    )
    expect(page.getByTestId('root').element().className).toBe('kv-breadcrumb')
    expect(page.getByTestId('list').element().className).toBe('kv-breadcrumb-list')
    expect(page.getByTestId('item').element().className).toBe('kv-breadcrumb-item')
    expect(page.getByTestId('link').element().className).toBe('kv-breadcrumb-link kv-link')
    expect(page.getByTestId('current').element().className).toBe('kv-breadcrumb-current')
  })

  test('adds no role, tabindex or key handling to its own parts', async () => {
    await render(<Trail />)
    for (const element of document.querySelectorAll(
      '.kv-breadcrumb, .kv-breadcrumb-list, .kv-breadcrumb-item, .kv-breadcrumb-current',
    )) {
      expect(element.getAttributeNames()).not.toContain('role')
      expect(element.getAttributeNames()).not.toContain('tabindex')
    }
  })

  test('passes attributes through and joins className, refs and render elements', async () => {
    const rootRef = createRef<HTMLElement>()
    const currentRef = createRef<HTMLElement>()
    await render(
      <Breadcrumb.Root ref={rootRef} id="smulor" className="min" data-testid="root">
        <Breadcrumb.List>
          <Breadcrumb.Item render={<li data-own="ja" className="eget" />} data-testid="item">
            <Breadcrumb.Current ref={currentRef}>Förskola</Breadcrumb.Current>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    )
    const root = page.getByTestId('root')
    await expect.element(root).toHaveAttribute('id', 'smulor')
    await expect.element(root).toHaveClass('kv-breadcrumb', 'min')
    expect(rootRef.current).toBe(root.element())
    expect(currentRef.current).toBe(page.getByText('Förskola').element())
    const item = page.getByTestId('item')
    await expect.element(item).toHaveAttribute('data-own', 'ja')
    await expect.element(item).toHaveClass('kv-breadcrumb-item', 'eget')
  })

  test('a Breadcrumb.Link keeps the ref and joins className', async () => {
    const ref = createRef<HTMLAnchorElement>()
    await render(
      <Breadcrumb.Link href="/" ref={ref} className="min">
        Start
      </Breadcrumb.Link>,
    )
    const link = page.getByRole('link', { name: 'Start' })
    expect(ref.current).toBe(link.element())
    await expect.element(link).toHaveClass('kv-breadcrumb-link', 'kv-link', 'min')
  })

  test('render as a function keeps the landmark', async () => {
    await render(
      <Breadcrumb.Root render={(rootProps) => <nav {...rootProps} data-rendered="ja" />}>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Current>Förskola</Breadcrumb.Current>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    )
    const navigation = page.getByRole('navigation', { name: 'You are here' })
    await expect.element(navigation).toHaveAttribute('data-rendered', 'ja')
    await expect.element(navigation).toHaveClass('kv-breadcrumb')
  })

  test('renders on the server with the landmark, the list and the current page', () => {
    const html = renderToString(<Trail />)
    expect(html).toContain('aria-label="You are here"')
    expect(html).toContain('<ol class="kv-breadcrumb-list">')
    expect(html).toContain('aria-current="page"')
  })
})

describe('useBreadcrumb', () => {
  function Probe(options: UseBreadcrumbOptions) {
    const breadcrumb = useBreadcrumb(options)
    return (
      <nav {...breadcrumb.rootProps}>
        <ol {...breadcrumb.listProps}>
          <li {...breadcrumb.itemProps}>
            <span {...breadcrumb.currentProps}>{breadcrumb.label}</span>
          </li>
        </ol>
      </nav>
    )
  }

  test('returns the part props for your own elements', async () => {
    const { container } = await render(<Probe />)
    await expect.element(page.getByRole('navigation', { name: 'You are here' })).toBeVisible()
    await expect
      .element(page.getByText('You are here', { exact: true }).last())
      .toHaveAttribute('aria-current', 'page')
    await expectNoA11yViolations(container)
  })

  test('an empty label falls back to the message', async () => {
    await render(<Probe label="  " />)
    await expect.element(page.getByRole('navigation', { name: 'You are here' })).toBeVisible()
  })
})

describe('Breadcrumb types', () => {
  test('the props are typed', () => {
    expectTypeOf<UseBreadcrumbResult['rootProps']>().toEqualTypeOf<BreadcrumbRootPartProps>()
    expectTypeOf<BreadcrumbRootPartProps['className']>().toEqualTypeOf<'kv-breadcrumb'>()
    expectTypeOf<BreadcrumbCurrentPartProps['aria-current']>().toEqualTypeOf<'page'>()
    expectTypeOf<BreadcrumbLinkProps>().toHaveProperty('href')
    expectTypeOf<BreadcrumbRootProps['label']>().toEqualTypeOf<string | undefined>()
  })
})
