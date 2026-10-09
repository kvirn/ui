import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef } from 'react'
import type { ComponentPropsWithRef } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Link, LinkIcon, LinkNewTabNotice, LinkRoot } from './link.tsx'
import type { LinkCurrent, LinkIconProps, LinkNewTabNoticeProps, LinkProps } from './link.tsx'
import {
  brokenLinkComponent,
  MockRouterProvider,
  mockRouterLinkComponent,
  useMockPathname,
} from './link.fixture.tsx'
import { useLink } from './use-link.ts'
import type { LinkPartProps, UseLinkOptions, UseLinkResult } from './use-link.ts'

// Contract: link.a11y.md.

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
    const { container } = await render(<Link.Root href="#ansok">Ansök</Link.Root>)
    const link = page.getByRole('link', { name: 'Ansök' })
    await expect.element(link).toHaveAttribute('href', '#ansok')
    await expect.element(link).not.toHaveAttribute('aria-current')
    await expect.element(link).not.toHaveAttribute('data-current')
    await expect.element(link).not.toHaveAttribute('rel')
    await expect.element(link).not.toHaveAttribute('data-router-link')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('marks its parts with class="kv-link" and class="kv-link-new-tab-notice"', async () => {
    await render(
      <Link.Root href="https://www.digg.se/" target="_blank">
        Digg <Link.NewTabNotice />
      </Link.Root>,
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
      <Link.Root ref={ref} href="/fil.pdf" download className="lank" title="Hämta">
        Blankett
      </Link.Root>,
    )
    const link = page.getByRole('link', { name: 'Blankett' })
    expect(ref.current).toBe(link.element())
    await expect.element(link).toHaveClass('lank', 'kv-link')
    await expect.element(link).toHaveAttribute('download', '')
  })

  test('passes lang and hrefLang through', async () => {
    const { container } = await render(
      <Link.Root href="/fi" hrefLang="fi" lang="fi">
        Suomeksi
      </Link.Root>,
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
      <Link.Root href="#ansok" onClick={onClick}>
        Ansök
      </Link.Root>,
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
        <Link.Root href="#start">Start</Link.Root>
        <Link.Root href="#ansok" current="page">
          Ansök
        </Link.Root>
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
      <Link.Root href="#steg" current={current}>
        Steg 2
      </Link.Root>,
    )
    const link = page.getByRole('link', { name: 'Steg 2' })
    await expect.element(link).toHaveAttribute('aria-current', ariaCurrent)
    await expect.element(link).toHaveAttribute('data-current', '')
  })

  test('current={false} sets nothing', async () => {
    await render(
      <Link.Root href="#steg" current={false}>
        Steg 2
      </Link.Root>,
    )
    const link = page.getByRole('link', { name: 'Steg 2' })
    await expect.element(link).not.toHaveAttribute('aria-current')
    await expect.element(link).not.toHaveAttribute('data-current')
  })
})

describe('new tab', () => {
  test('target="_blank" adds rel="noopener noreferrer"', async () => {
    const { container } = await render(
      <Link.Root href="https://www.digg.se/" target="_blank">
        Digg <Link.NewTabNotice />
      </Link.Root>,
    )
    const link = page.getByRole('link', { name: 'Digg (opens in a new tab)' })
    await expect.element(link).toHaveAttribute('target', '_blank')
    await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('keeps the consumer’s own rel tokens, without duplicates', async () => {
    await render(
      <Link.Root href="https://www.digg.se/" target="_blank" rel="external noopener">
        Digg <Link.NewTabNotice />
      </Link.Root>,
    )
    await expect
      .element(page.getByRole('link', { name: /^Digg/ }))
      .toHaveAttribute('rel', 'external noopener noreferrer')
  })

  test('leaves rel alone without target="_blank"', async () => {
    await render(
      <Link.Root href="/om" rel="help">
        Om tjänsten
      </Link.Root>,
    )
    await expect
      .element(page.getByRole('link', { name: 'Om tjänsten' }))
      .toHaveAttribute('rel', 'help')
  })

  // Maintainer decision 2026-10-05 (Plan 0045): no dev warning and no type error. The docs say a
  // link that opens a new tab must say so (WCAG 3.2.5, G201).
  test('a target="_blank" link without a notice still gets rel and no dev warning', async () => {
    await render(
      <Link.Root href="https://www.digg.se/" target="_blank">
        Digg
      </Link.Root>,
    )
    const link = page.getByRole('link', { name: 'Digg' })
    await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('new-tab notice resolution', () => {
  test('uses built-in en without a provider', async () => {
    await render(<Link.NewTabNotice />)
    await expect.element(page.getByText('(opens in a new tab)')).toBeVisible()
  })

  test('uses the provider’s catalog: sv and fi', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Link.Root href="https://www.digg.se/" target="_blank">
          Digg <Link.NewTabNotice />
        </Link.Root>
        <KvirnProvider locale="fi-FI" messages={fi}>
          <Link.Root href="https://www.suomi.fi/" target="_blank" lang="fi">
            Suomi.fi <Link.NewTabNotice />
          </Link.Root>
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
          <Link.Root href="https://www.digg.se/" target="_blank">
            Digg <Link.NewTabNotice />
          </Link.Root>
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
        <Link.Root
          href="https://www.digg.se/"
          target="_blank"
          messages={{ newTabNotice: '(nytt fönster)' }}
        >
          Digg <Link.NewTabNotice />
        </Link.Root>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('link', { name: 'Digg (nytt fönster)' })).toBeVisible()
  })

  test('children beat every message', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Link.Root
          href="https://www.digg.se/"
          target="_blank"
          messages={{ newTabNotice: '(nytt fönster)' }}
        >
          Digg <Link.NewTabNotice>(extern länk)</Link.NewTabNotice>
        </Link.Root>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('link', { name: 'Digg (extern länk)' })).toBeVisible()
  })

  test('an empty instance override falls through to the provider and warns once', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Link.Root href="https://www.digg.se/" target="_blank" messages={{ newTabNotice: ' ' }}>
          Digg <Link.NewTabNotice />
        </Link.Root>
      </KvirnProvider>,
    )
    await expect
      .element(page.getByRole('link', { name: 'Digg (öppnas i en ny flik)' }))
      .toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('link.newTabNotice')
  })

  test('whitespace-only children fall back to the message', async () => {
    await render(<Link.NewTabNotice> </Link.NewTabNotice>)
    await expect.element(page.getByText('(opens in a new tab)')).toBeVisible()
  })

  test('takes span props and as', async () => {
    await render(
      <>
        <Link.NewTabNotice />
        <Link.NewTabNotice as="em">(extern länk)</Link.NewTabNotice>
      </>,
    )
    const notice = page.getByText('(opens in a new tab)')
    await expect.element(notice).toBeVisible()
    expect(page.getByText('(extern länk)').element().tagName).toBe('EM')
  })

  test('as keeps the notice’s class and joins your own', async () => {
    await render(
      <Link.NewTabNotice as="em" className="egen">
        (extern länk)
      </Link.NewTabNotice>,
    )
    await expect
      .element(page.getByText('(extern länk)'))
      .toHaveClass('kv-link-new-tab-notice', 'egen')
  })
})

describe('keyboard', () => {
  test('Tab moves focus to the link', async () => {
    await render(<Link.Root href="#ansok">Ansök</Link.Root>)
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Ansök' })).toHaveFocus()
  })

  test('Shift+Tab moves focus off the link', async () => {
    await render(
      <>
        <Link.Root href="#ansok">Ansök</Link.Root>
        <Link.Root href="#kontakt">Kontakta oss</Link.Root>
      </>,
    )
    await userEvent.keyboard('{Tab}{Tab}')
    await expect.element(page.getByRole('link', { name: 'Kontakta oss' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('link', { name: 'Ansök' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('link', { name: 'Ansök' })).not.toHaveFocus()
  })

  test('Enter on a new-tab link does not intercept the browser’s own handling', async () => {
    let defaultWasPrevented: boolean | undefined
    const onClick = vi.fn<
      (event: { defaultPrevented: boolean; preventDefault: () => void }) => void
    >((event) => {
      defaultWasPrevented = event.defaultPrevented
      event.preventDefault()
    })
    await render(
      <Link.Root href="https://www.digg.se/" target="_blank" onClick={onClick}>
        Digg <Link.NewTabNotice />
      </Link.Root>,
    )
    const link = page.getByRole('link', { name: 'Digg (opens in a new tab)' })
    await userEvent.keyboard('{Tab}')
    await expect.element(link).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(defaultWasPrevented).toBe(false)
    await expect.element(link).toHaveAttribute('target', '_blank')
  })
})

describe('router link', () => {
  function CurrentPathname() {
    return <p>Nuvarande sida: {useMockPathname()}</p>
  }

  test('renders the provider’s registered link component and navigates through it', async () => {
    const { container } = await render(
      <KvirnProvider linkComponent={mockRouterLinkComponent}>
        <MockRouterProvider initialPathname="/start">
          <Link.Root href="/ansok">Ansök</Link.Root>
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

  test('Enter follows a router link without a page load', async () => {
    const pageMarker = Symbol('page marker')
    Reflect.set(window, 'kvirnPageMarker', pageMarker)
    await render(
      <KvirnProvider linkComponent={mockRouterLinkComponent}>
        <MockRouterProvider initialPathname="/start">
          <Link.Root href="/ansok">Ansök</Link.Root>
          <CurrentPathname />
        </MockRouterProvider>
      </KvirnProvider>,
    )
    const link = page.getByRole('link', { name: 'Ansök' })
    await userEvent.keyboard('{Tab}')
    await expect.element(link).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByText('Nuvarande sida: /ansok')).toBeVisible()
    await expect.element(link).toHaveFocus()
    expect(Reflect.get(window, 'kvirnPageMarker')).toBe(pageMarker)
    Reflect.deleteProperty(window, 'kvirnPageMarker')
  })

  test('as="a" opts out of the router', async () => {
    await render(
      <KvirnProvider linkComponent={mockRouterLinkComponent}>
        <Link.Root as="a" href="#fil" download>
          Blankett
        </Link.Root>
      </KvirnProvider>,
    )
    const link = page.getByRole('link', { name: 'Blankett' })
    await expect.element(link).not.toHaveAttribute('data-router-link')
    await expect.element(link).toHaveAttribute('href', '#fil')
    await expect.element(link).toHaveAttribute('download', '')
  })

  test('as={Component} receives the other props, a ref and the part’s class joined to yours', async () => {
    const ref = createRef<HTMLAnchorElement>()
    function DesignSystemLink({ children, ...anchorProps }: ComponentPropsWithRef<'a'>) {
      return (
        <a {...anchorProps} data-design-system="">
          {children}
        </a>
      )
    }
    await render(
      <Link.Root as={DesignSystemLink} ref={ref} href="#fil" className="fran-link" current="page">
        Blankett
      </Link.Root>,
    )
    const link = page.getByRole('link', { name: 'Blankett' })
    await expect.element(link).toHaveAttribute('data-design-system', '')
    await expect.element(link).toHaveClass('kv-link', 'fran-link')
    await expect.element(link).toHaveAttribute('aria-current', 'page')
    expect(ref.current).toBe(link.element())
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('target="_blank" with as="a" adds rel and the new-tab notice names the link', async () => {
    await render(
      <Link.Root as="a" href="https://www.digg.se/" target="_blank" rel="external">
        Digg <Link.NewTabNotice />
      </Link.Root>,
    )
    const link = page.getByRole('link', { name: 'Digg (opens in a new tab)' })
    await expect.element(link).toHaveAttribute('target', '_blank')
    await expect.element(link).toHaveAttribute('rel', 'external noopener noreferrer')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('target="_blank" with no notice gets rel and no dev warning', async () => {
    await render(
      <Link.Root as="a" href="https://www.digg.se/" target="_blank">
        Digg
      </Link.Root>,
    )
    const link = page.getByRole('link', { name: 'Digg' })
    await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('warns in development when the link component does not render an <a> with its ref', async () => {
    await render(
      <KvirnProvider linkComponent={brokenLinkComponent}>
        <Link.Root href="/ansok">Ansök</Link.Root>
      </KvirnProvider>,
    )
    await expect.element(page.getByText('Ansök')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('forward its ref')
  })

  test('warns in development when as resolves to something other than an <a>', async () => {
    await render(
      <Link.Root href="/ansok" as="span">
        Ansök
      </Link.Root>,
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
        <Link.Root href="#ett">Ett</Link.Root>
        <Link.Root href="#tva">Två</Link.Root>
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

describe('Link.Icon', () => {
  test('is a decorative span: aria-hidden, class kv-link-icon, and not part of the link’s name', async () => {
    const { container } = await render(
      <Link.Root href="https://www.digg.se/" target="_blank" className="kv-link--service">
        <Link.Icon data-testid="icon">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 12h16" />
          </svg>
        </Link.Icon>
        Ansök om bygglov <Link.NewTabNotice />
      </Link.Root>,
    )
    const icon = page.getByTestId('icon')
    await expect.element(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon.element().tagName).toBe('SPAN')
    expect(icon.element().className).toBe('kv-link-icon')
    // Visible label = name (2.5.3): the icon adds nothing to it.
    await expect
      .element(page.getByRole('link', { name: 'Ansök om bygglov (opens in a new tab)' }))
      .toBeVisible()
    await expect.element(page.getByRole('link')).toHaveClass('kv-link', 'kv-link--service')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('works in a plain link, and takes span props, a ref and as', async () => {
    const ref = createRef<HTMLSpanElement>()
    await render(
      <Link.Root href="#ansok">
        <Link.Icon ref={ref} className="min-ikon" data-testid="icon">
          →
        </Link.Icon>
        Ansök
      </Link.Root>,
    )
    const icon = page.getByTestId('icon')
    expect(ref.current).toBe(icon.element())
    await expect.element(icon).toHaveClass('kv-link-icon', 'min-ikon')
    await expect.element(page.getByRole('link', { name: 'Ansök' })).toBeVisible()
  })

  test('as="i" keeps the decoration: aria-hidden and the class', async () => {
    await render(
      <Link.Root href="#ansok">
        <Link.Icon as="i">→</Link.Icon>
        Ansök
      </Link.Root>,
    )
    const icon = page.getByText('→')
    expect(icon.element().tagName).toBe('I')
    await expect.element(icon).toHaveAttribute('aria-hidden', 'true')
    await expect.element(icon).toHaveClass('kv-link-icon')
  })

  test('a tag outside the list warns once and falls back to the default element', async () => {
    const notAllowed = 'div' as LinkIconProps['as']
    await render(
      <Link.Root href="#ansok">
        <Link.Icon as={notAllowed}>→</Link.Icon>
        Ansök
      </Link.Root>,
    )
    expect(page.getByText('→').element().tagName).toBe('SPAN')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Link.Icon as="div"')
  })

  test('Link.Icon, LinkIcon and the display name agree', () => {
    expect(Link.Icon).toBe(LinkIcon)
    expect(LinkIcon.displayName).toBe('Link.Icon')
    expectTypeOf<LinkIconProps>().toHaveProperty('as')
  })
})

describe('server rendering', () => {
  test('renders the link and its notice to a string without touching the page', () => {
    const html = renderToString(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Link.Root href="https://www.digg.se/" target="_blank" current="page">
          Digg <Link.NewTabNotice />
        </Link.Root>
      </KvirnProvider>,
    )
    // The provider adds its two empty live regions after the link.
    const link = html.slice(0, html.indexOf('</a>') + '</a>'.length)
    expect(link).toBe(
      '<a href="https://www.digg.se/" class="kv-link" target="_blank" rel="noopener noreferrer" aria-current="page" data-current="">Digg <span class="kv-link-new-tab-notice">(öppnas i en ny flik)</span></a>',
    )
  })
})

describe('names', () => {
  test('Link.Root, the named exports and the callable Link are one component', async () => {
    expect(Link.Root).toBe(LinkRoot)
    expect(Link.NewTabNotice).toBe(LinkNewTabNotice)
    expect(Link).toBe(LinkRoot)
    expect(LinkRoot.displayName).toBe('Link.Root')
    expect(LinkNewTabNotice.displayName).toBe('Link.NewTabNotice')
    // The callable root is deprecated but keeps working.
    await render(
      <Link href="#ansok" target="_blank">
        Ansök <LinkNewTabNotice />
      </Link>,
    )
    await expect
      .element(page.getByRole('link', { name: 'Ansök (opens in a new tab)' }))
      .toHaveAttribute('rel', 'noopener noreferrer')
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
  })
})
