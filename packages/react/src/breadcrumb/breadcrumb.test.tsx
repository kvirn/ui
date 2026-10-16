import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useEffect } from 'react'
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
            <Breadcrumb.Link href="/children">Children and education</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Current>Preschool</Breadcrumb.Current>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
      <button type="button">After</button>
    </>
  )
}

describe('Breadcrumb keyboard', () => {
  test('Tab moves through the links in order and the current page is not a stop', async () => {
    await render(<Trail />)
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Start' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Children and education' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus()
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
      return <p>Current page: {useMockPathname()}</p>
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
    await expect.element(page.getByText('Current page: /children')).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Children and education' })).toHaveFocus()
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
      'Children and education',
      'Preschool',
    ])
  })

  test('the last item is the current page: text with aria-current="page", not a link', async () => {
    await render(<Trail />)
    const current = page.getByText('Preschool')
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
    const link = page.getByRole('link', { name: 'Children and education' }).element()
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('/children')
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
    await render(<Trail label="Breadcrumbs" />)
    await expect.element(page.getByRole('navigation', { name: 'Breadcrumbs' })).toBeVisible()
  })

  test('messages override the name per instance', async () => {
    await render(<Trail messages={{ label: 'Your location' }} />)
    await expect.element(page.getByRole('navigation', { name: 'Your location' })).toBeVisible()
  })

  test.each([
    ['sv', sv, 'Du är här'], // kv-lang-ok: the catalog string
    ['en', en, 'You are here'],
    ['fi', fi, 'Olet tässä'], // kv-lang-ok: the catalog string
    ['nb', nb, 'Du er her'],
    ['nn', nn, 'Du er her'],
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
            <Breadcrumb.Current data-testid="current">Preschool</Breadcrumb.Current>
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

  test('adds no tabindex or key handling, and only the list role, to its own parts', async () => {
    await render(<Trail />)
    for (const element of document.querySelectorAll(
      '.kv-breadcrumb, .kv-breadcrumb-list, .kv-breadcrumb-item, .kv-breadcrumb-current',
    )) {
      expect(element.getAttribute('role')).toBe(element.tagName === 'OL' ? 'list' : null)
      expect(element.getAttributeNames()).not.toContain('tabindex')
    }
  })

  test('passes attributes through and and joins className and refs', async () => {
    const rootRef = createRef<HTMLElement>()
    const currentRef = createRef<HTMLElement>()
    await render(
      <Breadcrumb.Root ref={rootRef} id="smulor" className="min" data-testid="root">
        <Breadcrumb.List>
          <Breadcrumb.Item data-own="yes" className="own-class" data-testid="item">
            <Breadcrumb.Current ref={currentRef}>Preschool</Breadcrumb.Current>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    )
    const root = page.getByTestId('root')
    await expect.element(root).toHaveAttribute('id', 'smulor')
    await expect.element(root).toHaveClass('kv-breadcrumb', 'min')
    expect(rootRef.current).toBe(root.element())
    expect(currentRef.current).toBe(page.getByText('Preschool').element())
    const item = page.getByTestId('item')
    await expect.element(item).toHaveAttribute('data-own', 'yes')
    await expect.element(item).toHaveClass('kv-breadcrumb-item', 'own-class')
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

  test('a Breadcrumb.Link with as="a" bypasses the registered router link', async () => {
    await render(
      <KvirnProvider linkComponent={mockRouterLinkComponent}>
        <Breadcrumb.Link href="/" as="a">
          Start
        </Breadcrumb.Link>
      </KvirnProvider>,
    )
    const link = page.getByRole('link', { name: 'Start' })
    await expect.element(link).not.toHaveAttribute('data-router-link')
    await expect.element(link).toHaveClass('kv-breadcrumb-link', 'kv-link')
  })

  test('variant slash adds kv-breadcrumb--slash to the nav', async () => {
    await render(<Trail variant="slash" data-testid="root" />)
    await expect
      .element(page.getByTestId('root'))
      .toHaveClass('kv-breadcrumb', 'kv-breadcrumb--slash')
  })

  test('separator renders one aria-hidden kv-breadcrumb-separator per item and the links keep their names', async () => {
    await render(<Trail separator={<svg data-testid="mark" />} />)
    const separators = [...document.querySelectorAll('.kv-breadcrumb-separator')]
    expect(separators).toHaveLength(3)
    for (const separator of separators) {
      expect(separator.getAttribute('aria-hidden')).toBe('true')
      expect(separator.parentElement?.tagName).toBe('LI')
    }
    await expect.element(page.getByRole('link', { name: 'Start' })).toBeVisible()
    await expect.element(page.getByRole('link', { name: 'Children and education' })).toBeVisible()
  })

  test('without a separator no separator element is rendered', async () => {
    await render(<Trail />)
    expect(document.querySelectorAll('.kv-breadcrumb-separator')).toHaveLength(0)
  })

  test('has no axe violations with a separator icon', async () => {
    const { container } = await render(
      <Trail separator={<svg aria-hidden="true" focusable="false" />} />,
    )
    await expect.element(page.getByRole('navigation', { name: 'You are here' })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('renders on the server with the landmark, the list and the current page', () => {
    const html = renderToString(<Trail />)
    expect(html).toContain('aria-label="You are here"')
    expect(html).toContain('<ol class="kv-breadcrumb-list" role="list">')
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

  test('separatorProps is the decorative class and aria-hidden, and the result is stable per variant', async () => {
    const results: UseBreadcrumbResult[] = []
    function Capture(options: UseBreadcrumbOptions) {
      const breadcrumb = useBreadcrumb(options)
      useEffect(() => {
        results.push(breadcrumb)
      })
      return null
    }
    const { rerender } = await render(<Capture variant="slash" />)
    const first = results[0]
    expect(first?.separatorProps).toEqual({
      className: 'kv-breadcrumb-separator',
      'aria-hidden': true,
    })
    await rerender(<Capture variant="slash" />)
    expect(results.at(-1)).toBe(first)
    expect(Object.isFrozen(first?.separatorProps)).toBe(true)
  })

  test('an empty label falls back to the message', async () => {
    await render(<Probe label="  " />)
    await expect.element(page.getByRole('navigation', { name: 'You are here' })).toBeVisible()
  })
})

describe('Breadcrumb types', () => {
  test('the props are typed', () => {
    expectTypeOf<UseBreadcrumbResult['rootProps']>().toEqualTypeOf<BreadcrumbRootPartProps>()
    expectTypeOf<BreadcrumbRootPartProps['className']>().toEqualTypeOf<
      'kv-breadcrumb' | 'kv-breadcrumb kv-breadcrumb--slash'
    >()
    expectTypeOf<BreadcrumbRootProps['variant']>().toEqualTypeOf<'chevron' | 'slash' | undefined>()
    expectTypeOf<BreadcrumbCurrentPartProps['aria-current']>().toEqualTypeOf<'page'>()
    expectTypeOf<BreadcrumbLinkProps>().toHaveProperty('href')
    expectTypeOf<BreadcrumbRootProps['label']>().toEqualTypeOf<string | undefined>()
  })
})
