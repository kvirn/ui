import type { KvirnMessages } from '@kvirn-ui/i18n'
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
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { SkipLink } from './skip-link.tsx'
import type { SkipLinkProps } from './skip-link.tsx'
import { useSkipLink } from './use-skip-link.ts'
import type { SkipLinkPartProps, UseSkipLinkOptions } from './use-skip-link.ts'

// Contract: skip-link.a11y.md. Whether the link is visible while focused is the theme's, proved
// in the Storybook stories (skip-link.stories.tsx), where theme.css is loaded.

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

/** The skip link first, a wordmark link after it, then the main content with a target. */
function Page({
  mainProps = {},
  children,
}: {
  mainProps?: Record<string, string>
  children?: string
}) {
  return (
    <>
      {/* Unstyled links: a 24px minimum keeps them clear of axe's target-size rule (2.5.8). */}
      <style>{'a { display: inline-block; min-block-size: 24px; }'}</style>
      <SkipLink href="#main">{children}</SkipLink>
      <header>
        <a href="/">Kommunen</a>
      </header>
      <main id="main" {...mainProps}>
        <h1>Startsidan</h1>
        <a href="/avgifter">Avgifter</a>
      </main>
    </>
  )
}

describe('SkipLink keyboard', () => {
  test('the first Tab stop is the skip link', async () => {
    await render(<Page />)
    await userEvent.tab()
    const link = page.getByRole('link', { name: 'Skip to main content' })
    expect(document.activeElement).toBe(link.element())
  })

  test('Tab leaves the skip link for the next stop', async () => {
    await render(<Page />)
    await userEvent.tab()
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Kommunen' }).element())
    expect(document.activeElement).not.toBe(
      page.getByRole('link', { name: 'Skip to main content' }).element(),
    )
  })

  test('Shift+Tab from the skip link leaves the document', async () => {
    await render(<Page />)
    await userEvent.tab()
    await userEvent.tab({ shift: true })
    const link = page.getByRole('link', { name: 'Skip to main content' }).element()
    expect(document.activeElement).not.toBe(link)
    expect(document.activeElement === document.body).toBe(true)
  })

  test('Enter moves focus to the target and the next Tab continues after it', async () => {
    await render(<Page />)
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    const main = page.getByRole('main').element()
    expect(document.activeElement).toBe(main)
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Avgifter' }).element())
  })

  test('Space is not handled', async () => {
    await render(<Page />)
    await userEvent.tab()
    const link = page.getByRole('link', { name: 'Skip to main content' }).element()
    const keydown = vi.fn<(event: Event) => boolean>((event) => event.defaultPrevented)
    link.addEventListener('keydown', keydown)
    await userEvent.keyboard(' ')
    expect(keydown).toHaveReturnedWith(false)
    expect(document.activeElement).toBe(link)
    expect(page.getByRole('main').element().hasAttribute('tabindex')).toBe(false)
  })
})

describe('SkipLink target', () => {
  test('a target without tabindex gets tabindex -1 until it loses focus, then it is removed', async () => {
    await render(<Page />)
    const main = page.getByRole('main').element()
    expect(main.hasAttribute('tabindex')).toBe(false)
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    expect(main.getAttribute('tabindex')).toBe('-1')
    await userEvent.tab()
    expect(main.hasAttribute('tabindex')).toBe(false)
  })

  test('a target that is already focusable is left alone', async () => {
    await render(<Page mainProps={{ tabindex: '0' }} />)
    const main = page.getByRole('main').element()
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(main)
    await userEvent.tab()
    expect(main.getAttribute('tabindex')).toBe('0')
  })

  test('a target with its own tabindex -1 keeps it after blur', async () => {
    await render(<Page mainProps={{ tabindex: '-1' }} />)
    const main = page.getByRole('main').element()
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()
    expect(main.getAttribute('tabindex')).toBe('-1')
  })

  test('a missing target warns once in development and the click does nothing else', async () => {
    await render(<SkipLink href="#nowhere" />)
    expect(warnings()).toEqual([expect.stringContaining('SkipLink href="#nowhere" has no element')])
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    expect(warnings()).toHaveLength(1)
  })

  test('a target that exists does not warn', async () => {
    await render(<Page />)
    expect(warnings()).toEqual([])
  })
})

describe('SkipLink name and attributes', () => {
  test('the name is the default label, rendered as text with no ARIA added', async () => {
    await render(<Page />)
    const link = page.getByRole('link', { name: 'Skip to main content' }).element()
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('#main')
    expect(link.textContent).toBe('Skip to main content')
    expect(link.getAttributeNames().sort()).toEqual(['class', 'href'])
  })

  test('children replace the label', async () => {
    await render(<Page>Hoppa till innehållet</Page>)
    await expect.element(page.getByRole('link', { name: 'Hoppa till innehållet' })).toBeVisible()
  })

  test.each([
    ['sv', sv, 'Hoppa till huvudinnehållet'],
    ['en', en, 'Skip to main content'],
    ['fi', fi, 'Siirry pääsisältöön'],
    ['nb', nb, 'Gå til hovedinnhold'],
    ['nn', nn, 'Gå til hovudinnhald'],
    ['se', se, 'Skip to main content'],
  ] as const)('the %s catalog names the link', async (locale, messages, name) => {
    await render(
      <KvirnProvider locale={locale} messages={messages}>
        <Page />
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('link', { name })).toBeInTheDocument()
  })

  test('messages override the label per instance', async () => {
    await render(
      <>
        <SkipLink href="#main" messages={{ label: 'Till innehållet' }} />
        <main id="main" />
      </>,
    )
    await expect.element(page.getByRole('link', { name: 'Till innehållet' })).toBeInTheDocument()
  })

  test("attributes and the ref pass through, and the part class joins a consumer's", async () => {
    const ref = createRef<HTMLAnchorElement>()
    await render(
      <>
        <SkipLink href="#main" className="annan" id="skip" lang="en" ref={ref} />
        <main id="main" />
      </>,
    )
    const link = page.getByRole('link').element()
    expect(ref.current).toBe(link)
    expect(link.className).toBe('annan kv-skip-link')
    expect(link.id).toBe('skip')
  })

  test("a consumer's onClick runs and the focus still moves", async () => {
    const onClick = vi.fn<() => void>()
    await render(
      <>
        <SkipLink href="#main" onClick={onClick} />
        <main id="main" />
      </>,
    )
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(page.getByRole('main').element())
  })

  test('render changes the element', async () => {
    await render(
      <>
        <SkipLink
          href="#main"
          render={
            <a href="#main" data-testid="element">
              Hoppa
            </a>
          }
        />
        <SkipLink
          href="#main"
          render={(props) => (
            <a {...props} href="#main" data-testid="function">
              {props.children}
            </a>
          )}
        />
        <main id="main" />
      </>,
    )
    expect(page.getByTestId('element').element().getAttribute('href')).toBe('#main')
    expect(page.getByTestId('function').element().className).toBe('kv-skip-link')
  })
})

describe('useSkipLink', () => {
  test('gives the props and the label for your own element', async () => {
    function Own() {
      const { skipLinkProps, label } = useSkipLink({ href: '#main' })
      return (
        <>
          <a {...skipLinkProps}>{label}</a>
          <main id="main" />
        </>
      )
    }
    await render(<Own />)
    const link = page.getByRole('link', { name: 'Skip to main content' }).element()
    expect(link.className).toBe('kv-skip-link')
    expect(link.getAttribute('href')).toBe('#main')
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(page.getByRole('main').element())
  })

  test('exports its types', () => {
    expectTypeOf<UseSkipLinkOptions['href']>().toEqualTypeOf<string>()
    expectTypeOf<UseSkipLinkOptions['messages']>().toEqualTypeOf<
      Partial<KvirnMessages['skipLink']> | undefined
    >()
    expectTypeOf<SkipLinkPartProps['className']>().toEqualTypeOf<'kv-skip-link'>()
    expectTypeOf<SkipLinkProps['href']>().toEqualTypeOf<string>()
  })
})

describe('SkipLink accessibility', () => {
  test('has no axe violations', async () => {
    const { container } = await render(<Page />)
    await expect
      .element(page.getByRole('link', { name: 'Skip to main content' }))
      .toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  test('has no axe violations while focused', async () => {
    const { container } = await render(<Page />)
    await userEvent.tab()
    expect(document.activeElement).toBe(
      page.getByRole('link', { name: 'Skip to main content' }).element(),
    )
    await expectNoA11yViolations(container)
  })
})

describe('server rendering', () => {
  test('renders a working link to a string', () => {
    const html = renderToString(<SkipLink href="#main" />)
    expect(html).toContain('<a')
    expect(html).toContain('href="#main"')
    expect(html).toContain('class="kv-skip-link"')
    expect(html).toContain('>Skip to main content</a>')
    expect(warnings()).toEqual([])
  })
})
