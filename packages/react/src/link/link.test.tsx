import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createElement, createRef } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Link, LinkNewTabNotice } from './link.tsx'
import type { LinkCurrent, LinkNewTabNoticeProps, LinkProps, LinkState } from './link.tsx'
import {
  brokenLinkComponent,
  MockRouterProvider,
  mockRouterLinkComponent,
  useMockPathname,
} from './link.fixture.tsx'
import { useLink } from './use-link.ts'
import type { LinkPartProps, UseLinkOptions, UseLinkResult } from './use-link.ts'

// Contract: link.a11y.md. Keyboard rows are also covered end to end in
// apps/storybook/src/components/link/link.e2e.ts.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('rendering', () => {
  test('renders a native <a href> without a provider', async () => {
    const { container } = await render(<Link href="#ansok">Ansök</Link>)
    const link = page.getByRole('link', { name: 'Ansök' })
    await expect.element(link).toHaveAttribute('href', '#ansok')
    expect(link.element().tagName).toBe('A')
    await expect.element(link).not.toHaveAttribute('aria-current')
    await expect.element(link).not.toHaveAttribute('data-current')
    await expect.element(link).not.toHaveAttribute('rel')
    await expect.element(link).not.toHaveAttribute('data-router-link')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('marks its parts with class="kv-link" and class="kv-link-new-tab-notice"', async () => {
    await render(
      <Link href="https://www.digg.se/" target="_blank">
        Digg <Link.NewTabNotice />
      </Link>,
    )
    const link = page.getByRole('link', { name: 'Digg (opens in a new tab)' })
    const notice = page.getByText('(opens in a new tab)')
    expect(link.element().className).toBe('kv-link')
    expect(notice.element().className).toBe('kv-link-new-tab-notice')
    await expect.element(link).not.toHaveAttribute('data-kv')
    await expect.element(notice).not.toHaveAttribute('data-kv')
  })

  test('forwards its ref, className and other anchor props', async () => {
    const ref = createRef<HTMLAnchorElement>()
    await render(
      <Link ref={ref} href="/fil.pdf" download className="lank" title="Hämta">
        Blankett
      </Link>,
    )
    const link = page.getByRole('link', { name: 'Blankett' })
    expect(ref.current).toBe(link.element())
    await expect.element(link).toHaveClass('lank', 'kv-link')
    await expect.element(link).toHaveAttribute('download', '')
  })

  test('passes lang and hrefLang through', async () => {
    const { container } = await render(
      <Link href="/fi" hrefLang="fi" lang="fi">
        Suomeksi
      </Link>,
    )
    const link = page.getByRole('link', { name: 'Suomeksi' })
    await expect.element(link).toHaveAttribute('lang', 'fi')
    await expect.element(link).toHaveAttribute('hreflang', 'fi')
    await expectNoA11yViolations(container)
  })

  test('Enter activates the link; Space does not', async () => {
    const onClick = vi.fn<(event: { preventDefault: () => void }) => void>((event) =>
      event.preventDefault(),
    )
    await render(
      <Link href="#ansok" onClick={onClick}>
        Ansök
      </Link>,
    )
    const link = page.getByRole('link', { name: 'Ansök' })
    await userEvent.keyboard('{Tab}')
    await expect.element(link).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(onClick).not.toHaveBeenCalled()
    await userEvent.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
    await expect.element(link).toHaveFocus()
  })
})

describe('current', () => {
  test('current="page" sets aria-current and data-current', async () => {
    const { container } = await render(
      <nav aria-label="Huvudmeny">
        <Link href="#start">Start</Link>
        <Link href="#ansok" current="page">
          Ansök
        </Link>
      </nav>,
    )
    const current = page.getByRole('link', { name: 'Ansök' })
    await expect.element(current).toHaveAttribute('aria-current', 'page')
    await expect.element(current).toHaveAttribute('data-current', '')
    await expect
      .element(page.getByRole('link', { name: 'Start' }))
      .not.toHaveAttribute('aria-current')
    await expectNoA11yViolations(container)
  })

  test.each([
    ['step', 'step'],
    ['location', 'location'],
    ['date', 'date'],
    ['time', 'time'],
    [true, 'true'],
  ] as const)('current=%s sets aria-current="%s"', async (current, ariaCurrent) => {
    await render(
      <Link href="#steg" current={current}>
        Steg 2
      </Link>,
    )
    const link = page.getByRole('link', { name: 'Steg 2' })
    await expect.element(link).toHaveAttribute('aria-current', ariaCurrent)
    await expect.element(link).toHaveAttribute('data-current', '')
  })

  test('current={false} sets nothing', async () => {
    await render(
      <Link href="#steg" current={false}>
        Steg 2
      </Link>,
    )
    const link = page.getByRole('link', { name: 'Steg 2' })
    await expect.element(link).not.toHaveAttribute('aria-current')
    await expect.element(link).not.toHaveAttribute('data-current')
  })
})

describe('new tab', () => {
  test('target="_blank" adds rel="noopener noreferrer"', async () => {
    const { container } = await render(
      <Link href="https://www.digg.se/" target="_blank">
        Digg <Link.NewTabNotice />
      </Link>,
    )
    const link = page.getByRole('link', { name: 'Digg (opens in a new tab)' })
    await expect.element(link).toHaveAttribute('target', '_blank')
    await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('keeps the consumer’s own rel tokens, without duplicates', async () => {
    await render(
      <Link href="https://www.digg.se/" target="_blank" rel="external noopener">
        Digg <Link.NewTabNotice />
      </Link>,
    )
    await expect
      .element(page.getByRole('link', { name: /^Digg/ }))
      .toHaveAttribute('rel', 'external noopener noreferrer')
  })

  test('leaves rel alone without target="_blank"', async () => {
    await render(
      <Link href="/om" rel="help">
        Om tjänsten
      </Link>,
    )
    await expect
      .element(page.getByRole('link', { name: 'Om tjänsten' }))
      .toHaveAttribute('rel', 'help')
  })

  test('warns in development when a target="_blank" link has no notice', async () => {
    await render(
      <Link href="https://www.digg.se/" target="_blank">
        Digg
      </Link>,
    )
    await expect.element(page.getByRole('link', { name: 'Digg' })).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('NewTabNotice')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('"Digg"')
  })
})

describe('new-tab notice (ADR-0007 resolution)', () => {
  test('uses built-in en without a provider', async () => {
    await render(<LinkNewTabNotice />)
    await expect.element(page.getByText('(opens in a new tab)')).toBeVisible()
  })

  test('uses the provider’s catalog: sv and fi', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Link href="https://www.digg.se/" target="_blank">
          Digg <Link.NewTabNotice />
        </Link>
        <KvirnProvider locale="fi-FI" messages={fi}>
          <Link href="https://www.suomi.fi/" target="_blank" lang="fi">
            Suomi.fi <Link.NewTabNotice />
          </Link>
        </KvirnProvider>
      </KvirnProvider>,
    )
    await expect
      .element(page.getByRole('link', { name: 'Digg (öppnas i en ny flik)' }))
      .toBeVisible()
    await expect
      .element(page.getByRole('link', { name: 'Suomi.fi (avautuu uuteen välilehteen)' }))
      .toBeVisible()
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a provider override beats the catalog', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <KvirnProvider messages={{ link: { newTabNotice: '(extern tjänst, ny flik)' } }}>
          <Link href="https://www.digg.se/" target="_blank">
            Digg <Link.NewTabNotice />
          </Link>
        </KvirnProvider>
      </KvirnProvider>,
    )
    await expect
      .element(page.getByRole('link', { name: 'Digg (extern tjänst, ny flik)' }))
      .toBeVisible()
  })

  test('the instance messages prop beats the provider', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Link
          href="https://www.digg.se/"
          target="_blank"
          messages={{ newTabNotice: '(nytt fönster)' }}
        >
          Digg <Link.NewTabNotice />
        </Link>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('link', { name: 'Digg (nytt fönster)' })).toBeVisible()
  })

  test('children beat every message', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Link
          href="https://www.digg.se/"
          target="_blank"
          messages={{ newTabNotice: '(nytt fönster)' }}
        >
          Digg <Link.NewTabNotice>(extern länk)</Link.NewTabNotice>
        </Link>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('link', { name: 'Digg (extern länk)' })).toBeVisible()
  })

  test('an empty instance override falls through to the provider and warns once', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Link href="https://www.digg.se/" target="_blank" messages={{ newTabNotice: ' ' }}>
          Digg <Link.NewTabNotice />
        </Link>
      </KvirnProvider>,
    )
    await expect
      .element(page.getByRole('link', { name: 'Digg (öppnas i en ny flik)' }))
      .toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('link.newTabNotice')
  })

  test('whitespace-only children fall back to the message', async () => {
    await render(<LinkNewTabNotice> </LinkNewTabNotice>)
    await expect.element(page.getByText('(opens in a new tab)')).toBeVisible()
  })

  test('renders a <span> that takes span props and render', async () => {
    await render(
      <>
        <LinkNewTabNotice className="visuellt-dold" />
        <LinkNewTabNotice render={<em />}>(extern länk)</LinkNewTabNotice>
      </>,
    )
    const notice = page.getByText('(opens in a new tab)')
    expect(notice.element().tagName).toBe('SPAN')
    await expect.element(notice).toHaveClass('visuellt-dold', 'kv-link-new-tab-notice')
    expect(page.getByText('(extern länk)').element().tagName).toBe('EM')
  })

  test('a render element’s own class joins the notice’s class', async () => {
    await render(
      <LinkNewTabNotice render={<em className="egen" />}>(extern länk)</LinkNewTabNotice>,
    )
    await expect
      .element(page.getByText('(extern länk)'))
      .toHaveClass('kv-link-new-tab-notice', 'egen')
  })
})

describe('router link (ADR-0005)', () => {
  function CurrentPathname() {
    return <p>Nuvarande sida: {useMockPathname()}</p>
  }

  test('renders the provider’s registered link component and navigates through it', async () => {
    const { container } = await render(
      <KvirnProvider linkComponent={mockRouterLinkComponent}>
        <MockRouterProvider initialPathname="/start">
          <Link href="/ansok">Ansök</Link>
          <CurrentPathname />
        </MockRouterProvider>
      </KvirnProvider>,
    )
    const link = page.getByRole('link', { name: 'Ansök' })
    await expect.element(link).toHaveAttribute('data-router-link', '')
    await expect.element(link).toHaveAttribute('href', '/ansok')
    await userEvent.click(link)
    await expect.element(page.getByText('Nuvarande sida: /ansok')).toBeVisible()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  // `plainAnchor` is `<a />`, the documented form. Written with createElement because JSX
  // `<a />` trips jsx-a11y anchor-has-content, although the Link supplies the content.
  test('render={<a />} as an element opts out of the router', async () => {
    const plainAnchor = createElement('a')
    await render(
      <KvirnProvider linkComponent={mockRouterLinkComponent}>
        <Link render={plainAnchor} href="#fil" download>
          Blankett
        </Link>
      </KvirnProvider>,
    )
    const link = page.getByRole('link', { name: 'Blankett' })
    await expect.element(link).not.toHaveAttribute('data-router-link')
    await expect.element(link).toHaveAttribute('href', '#fil')
    await expect.element(link).toHaveAttribute('download', '')
  })

  test('a render element’s own class joins the part’s class', async () => {
    const styledAnchor = createElement('a', { className: 'egen' })
    await render(
      <Link render={styledAnchor} href="#fil" className="fran-link">
        Blankett
      </Link>,
    )
    await expect
      .element(page.getByRole('link', { name: 'Blankett' }))
      .toHaveClass('kv-link', 'fran-link', 'egen')
  })

  test('target and rel on a render element go through useLink', async () => {
    const newTabAnchor = createElement('a', { target: '_blank', rel: 'external' })
    await render(
      <Link render={newTabAnchor} href="https://www.digg.se/">
        Digg <Link.NewTabNotice />
      </Link>,
    )
    const link = page.getByRole('link', { name: 'Digg (opens in a new tab)' })
    await expect.element(link).toHaveAttribute('target', '_blank')
    await expect.element(link).toHaveAttribute('rel', 'external noopener noreferrer')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a render element with target="_blank" and no notice gets the dev warning', async () => {
    const newTabAnchor = createElement('a', { target: '_blank' })
    await render(
      <Link render={newTabAnchor} href="https://www.digg.se/">
        Digg
      </Link>,
    )
    const link = page.getByRole('link', { name: 'Digg' })
    await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('NewTabNotice')
  })

  test('render with a plain <a> opts out of the router', async () => {
    await render(
      <KvirnProvider linkComponent={mockRouterLinkComponent}>
        <Link
          render={(linkProps) => (
            <a {...linkProps} href={linkProps.href}>
              {linkProps.children}
            </a>
          )}
          href="#fil"
          download
        >
          Blankett
        </Link>
      </KvirnProvider>,
    )
    const link = page.getByRole('link', { name: 'Blankett' })
    await expect.element(link).not.toHaveAttribute('data-router-link')
    await expect.element(link).toHaveAttribute('download', '')
  })

  test('render as a function receives the link props and the state', async () => {
    const seenStates: LinkState[] = []
    await render(
      <Link
        href="#ansok"
        current="page"
        render={(linkProps, state) => {
          seenStates.push(state)
          return (
            <a {...linkProps} href={linkProps.href} data-egen="">
              {linkProps.children}
            </a>
          )
        }}
      >
        Ansök
      </Link>,
    )
    const link = page.getByRole('link', { name: 'Ansök' })
    await expect.element(link).toHaveAttribute('data-egen', '')
    await expect.element(link).toHaveAttribute('aria-current', 'page')
    expect(seenStates.at(-1)).toEqual({
      isCurrent: true,
      isFocusVisible: false,
      opensInNewTab: false,
    })
  })

  test('warns in development when the link component does not render an <a> with its ref', async () => {
    await render(
      <KvirnProvider linkComponent={brokenLinkComponent}>
        <Link href="/ansok">Ansök</Link>
      </KvirnProvider>,
    )
    await expect.element(page.getByText('Ansök')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('forward its ref')
  })

  test('warns in development when render resolves to something other than an <a>', async () => {
    await render(
      <Link href="/ansok" render={<span />}>
        Ansök
      </Link>,
    )
    await expect.element(page.getByText('Ansök')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('<span>')
  })
})

describe('focus visible', () => {
  test('sets data-focus-visible on keyboard focus only', async () => {
    await render(
      <>
        <Link href="#ett">Ett</Link>
        <Link href="#tva">Två</Link>
      </>,
    )
    const first = page.getByRole('link', { name: 'Ett' })
    await userEvent.keyboard('{Tab}')
    await expect.element(first).toHaveAttribute('data-focus-visible', '')
    await userEvent.keyboard('{Tab}')
    await expect.element(first).not.toHaveAttribute('data-focus-visible')
  })
})

describe('useLink', () => {
  function HookLink(options: UseLinkOptions & { href: string; label: string }) {
    const { href, label, ...linkOptions } = options
    const link = useLink(linkOptions)
    return (
      <a href={href} {...link.linkProps}>
        {label} {link.opensInNewTab ? <span>{link.newTabNotice}</span> : null}
      </a>
    )
  }

  test('gives spreadable linkProps and the resolved notice for your own <a>', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <HookLink href="https://www.digg.se/" target="_blank" current="page" label="Digg" />
      </KvirnProvider>,
    )
    const link = page.getByRole('link', { name: 'Digg (öppnas i en ny flik)' })
    await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer')
    await expect.element(link).toHaveAttribute('target', '_blank')
    await expect.element(link).toHaveAttribute('aria-current', 'page')
    await expect.element(link).toHaveClass('kv-link')
    await expectNoA11yViolations(container)
  })

  test('takes instance messages', async () => {
    await render(
      <HookLink
        href="https://www.digg.se/"
        target="_blank"
        messages={{ newTabNotice: '(new window)' }}
        label="Digg"
      />,
    )
    await expect.element(page.getByRole('link', { name: 'Digg (new window)' })).toBeVisible()
  })
})

describe('server rendering', () => {
  test('renders the link and its notice to a string without touching the page', () => {
    const html = renderToString(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Link href="https://www.digg.se/" target="_blank" current="page">
          Digg <Link.NewTabNotice />
        </Link>
      </KvirnProvider>,
    )
    expect(html).toBe(
      '<a href="https://www.digg.se/" class="kv-link" target="_blank" rel="noopener noreferrer" aria-current="page" data-current="">Digg <span class="kv-link-new-tab-notice">(öppnas i en ny flik)</span></a>',
    )
  })
})

describe('types', () => {
  test('Link has no disabled prop and no raw aria-current', () => {
    expectTypeOf<LinkProps>().not.toHaveProperty('disabled')
    expectTypeOf<LinkProps>().not.toHaveProperty('aria-current')
    expectTypeOf<LinkCurrent>().toEqualTypeOf<
      'page' | 'step' | 'location' | 'date' | 'time' | boolean
    >()
  })

  test('exports the hook and part types', () => {
    expectTypeOf<UseLinkResult['newTabNotice']>().toEqualTypeOf<string>()
    expectTypeOf<LinkPartProps['className']>().toEqualTypeOf<'kv-link'>()
    expectTypeOf<LinkPartProps>().not.toHaveProperty('data-kv')
    expectTypeOf<UseLinkResult['isCurrent']>().toEqualTypeOf<boolean>()
    expectTypeOf<UseLinkResult['opensInNewTab']>().toEqualTypeOf<boolean>()
    expectTypeOf<LinkNewTabNoticeProps>().toHaveProperty('children')
    expectTypeOf<LinkState>().toEqualTypeOf<{
      isCurrent: boolean
      isFocusVisible: boolean
      opensInNewTab: boolean
    }>()
  })
})
