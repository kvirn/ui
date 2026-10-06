import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { useEffect, useRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { useRouteFocus } from './use-route-focus.ts'
import type { UseRouteFocusOptions } from './use-route-focus.ts'

// Contract: route-focus.a11y.md.

const startingAddress = window.location.pathname + window.location.search
const startingTitle = document.title
const startingRestoration = window.history.scrollRestoration

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
  window.history.replaceState(null, '', startingAddress)
  window.history.scrollRestoration = startingRestoration
  document.title = startingTitle
})

type ProbeProps = Omit<UseRouteFocusOptions, 'key' | 'containerRef'> & {
  routeKey: string
  hasContainer?: boolean
  hasTarget?: boolean
}

/** The hook on a page whose route key the test sets through props (`key` is reserved by React). */
function Probe({ routeKey, hasContainer = true, hasTarget = true, ...options }: ProbeProps) {
  const containerRef = useRef<HTMLElement>(null)
  useRouteFocus({
    ...options,
    key: routeKey,
    containerRef: hasContainer ? containerRef : undefined,
  })
  return (
    <>
      <header>
        <a href="#start">Hem</a>
        <a href="#end">Kontakt</a>
      </header>
      <main ref={containerRef}>
        {hasTarget ? <h1>Sidans rubrik</h1> : <p>Ingen rubrik</p>}
        <input aria-label="Sök" />
        <textarea aria-label="Meddelande" />
        <a href="#inside">Första länken</a>
      </main>
    </>
  )
}

const heading = () => page.getByRole('heading', { level: 1 })

const currentAddress = () => window.location.pathname + window.location.search

function PopstateFollower({ onPopstate }: { onPopstate: () => void }) {
  useEffect(() => {
    window.addEventListener('popstate', onPopstate)
    return () => window.removeEventListener('popstate', onPopstate)
  }, [onPopstate])
  return null
}

/** A router stand-in: `history.pushState` on a click, and the key follows `popstate`. */
function Router({
  keyOf = (address) => address,
  ...options
}: Partial<UseRouteFocusOptions> & { keyOf?: (address: string) => string }) {
  const [address, setAddress] = useState(currentAddress)
  const containerRef = useRef<HTMLElement>(null)
  useRouteFocus({ key: keyOf(address), containerRef, ...options })
  const go = (target: string) => (event: { preventDefault: () => void }) => {
    event.preventDefault()
    window.history.pushState(null, '', target)
    setAddress(currentAddress())
  }
  return (
    <>
      <header>
        <a href="/om" onClick={go('/om')}>
          Om oss
        </a>
        <a href="#avsnitt" onClick={go('#avsnitt')}>
          Till avsnittet
        </a>
        <a href="?q=a" onClick={go('?q=a')}>
          Sök
        </a>
        <a href="#kontakt">Kontakt</a>
      </header>
      <main ref={containerRef}>
        <h1>Sidans rubrik</h1>
        <a href="#forst">Första länken</a>
      </main>
      <PopstateFollower onPopstate={() => setAddress(currentAddress())} />
    </>
  )
}

describe('route focus: when it moves', () => {
  test('first load does not move focus or touch the title', async () => {
    await render(<Probe routeKey="/a" />)
    expect(document.activeElement).toBe(document.body)
    await expect.element(heading()).not.toHaveAttribute('tabindex')
  })

  test('the same key on a later render does not move focus', async () => {
    const view = await render(<Probe routeKey="/a" />)
    await view.rerender(<Probe routeKey="/a" />)
    expect(document.activeElement).toBe(document.body)
  })

  test('a key change focuses the h1 with tabindex -1 while it is focused, and removes it on blur', async () => {
    const view = await render(<Probe routeKey="/a" />)
    await view.rerender(<Probe routeKey="/b" />)
    await expect.element(heading()).toHaveFocus()
    await expect.element(heading()).toHaveAttribute('tabindex', '-1')
    await userEvent.tab()
    await expect.element(heading()).not.toHaveAttribute('tabindex')
  })

  test('an h1 that already has a tabindex keeps it after blur', async () => {
    function Own({ routeKey }: { routeKey: string }) {
      useRouteFocus({ key: routeKey })
      return <h1 tabIndex={-1}>Rubrik</h1>
    }
    const view = await render(<Own routeKey="/a" />)
    await view.rerender(<Own routeKey="/b" />)
    await expect.element(heading()).toHaveFocus()
    ;(document.activeElement as HTMLElement).blur()
    await expect.element(heading()).toHaveAttribute('tabindex', '-1')
  })

  test('the selector option picks another target inside the container', async () => {
    function Own({ routeKey }: { routeKey: string }) {
      useRouteFocus({ key: routeKey, selector: '[data-page-title]' })
      return (
        <>
          <h1>Webbplats</h1>
          <h2 data-page-title="">Sidan</h2>
        </>
      )
    }
    const view = await render(<Own routeKey="/a" />)
    await view.rerender(<Own routeKey="/b" />)
    await expect.element(page.getByRole('heading', { level: 2 })).toHaveFocus()
  })

  test('without a containerRef it looks in the whole document', async () => {
    const view = await render(<Probe routeKey="/a" hasContainer={false} />)
    await view.rerender(<Probe routeKey="/b" hasContainer={false} />)
    await expect.element(heading()).toHaveFocus()
  })

  test('typing in a text field skips the move', async () => {
    const view = await render(<Probe routeKey="/a" />)
    const field = page.getByRole('textbox', { name: 'Sök' })
    await userEvent.click(field)
    await view.rerender(<Probe routeKey="/b" />)
    await expect.element(field).toHaveFocus()
    await expect.element(heading()).not.toHaveAttribute('tabindex')
  })

  test('typing in a textarea skips the move', async () => {
    const view = await render(<Probe routeKey="/a" />)
    const field = page.getByRole('textbox', { name: 'Meddelande' })
    await userEvent.click(field)
    await view.rerender(<Probe routeKey="/b" />)
    await expect.element(field).toHaveFocus()
  })

  test('a missing target warns once in development and moves nothing', async () => {
    const view = await render(<Probe routeKey="/a" hasTarget={false} />)
    await view.rerender(<Probe routeKey="/b" hasTarget={false} />)
    await view.rerender(<Probe routeKey="/c" hasTarget={false} />)
    expect(document.activeElement).toBe(document.body)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('useRouteFocus found nothing matching "h1"')
  })

  test('the server render runs no effect and adds no tabindex', () => {
    const html = renderToString(<Probe routeKey="/a" />)
    expect(html).toContain('<h1>Sidans rubrik</h1>')
    expect(html).not.toContain('tabindex')
    expect(document.activeElement).toBe(document.body)
  })
})

describe('route focus: with a real history', () => {
  test('a pushed path moves focus to the title', async () => {
    await render(<Router />)
    await userEvent.click(page.getByRole('link', { name: 'Om oss' }))
    await expect.element(heading()).toHaveFocus()
  })

  test('the key is built from path and search: a changed search moves focus', async () => {
    await render(<Router />)
    await userEvent.click(page.getByRole('link', { name: 'Sök' }))
    await expect.element(heading()).toHaveFocus()
  })

  test('a hash-only change is skipped, and focus stays on the link', async () => {
    await render(<Router />)
    const link = page.getByRole('link', { name: 'Till avsnittet' })
    await userEvent.click(link)
    await expect.element(link).toHaveFocus()
    await expect.element(heading()).not.toHaveAttribute('tabindex')
  })

  test('popstate under automatic scroll restoration is skipped', async () => {
    window.history.scrollRestoration = 'auto'
    await render(<Router />)
    await userEvent.click(page.getByRole('link', { name: 'Om oss' }))
    await expect.element(heading()).toHaveFocus()
    ;(document.activeElement as HTMLElement).blur()
    window.history.back()
    await vi.waitFor(() => expect(window.location.pathname).toBe(startingAddress.split('?')[0]))
    expect(document.activeElement).toBe(document.body)
    await expect.element(heading()).not.toHaveAttribute('tabindex')
  })

  test('Back under automatic scroll restoration is skipped when the key differs from the address', async () => {
    window.history.scrollRestoration = 'auto'
    await render(<Router keyOf={(address) => `/page${address.length}`} />)
    await userEvent.click(page.getByRole('link', { name: 'Om oss' }))
    await expect.element(heading()).toHaveFocus()
    ;(document.activeElement as HTMLElement).blur()
    window.history.back()
    await vi.waitFor(() => expect(window.location.pathname).toBe(startingAddress.split('?')[0]))
    expect(document.activeElement).toBe(document.body)
  })

  test('a hash link, then a pushed path, still focuses the title', async () => {
    window.history.scrollRestoration = 'auto'
    await render(<Router />)
    await userEvent.click(page.getByRole('link', { name: 'Kontakt' }))
    await userEvent.click(page.getByRole('link', { name: 'Om oss' }))
    await expect.element(heading()).toHaveFocus()
  })

  test('a hash link, then a pushed path, still announces', async () => {
    window.history.scrollRestoration = 'auto'
    document.title = 'Om oss'
    await render(
      <KvirnProvider>
        <Router announce />
      </KvirnProvider>,
    )
    await userEvent.click(page.getByRole('link', { name: 'Kontakt' }))
    await userEvent.click(page.getByRole('link', { name: 'Om oss' }))
    await expect.element(page.getByRole('status')).toHaveTextContent('Navigated to Om oss')
  })

  test('popstate under manual scroll restoration moves focus to the title', async () => {
    window.history.scrollRestoration = 'manual'
    await render(<Router />)
    await userEvent.click(page.getByRole('link', { name: 'Om oss' }))
    ;(document.activeElement as HTMLElement).blur()
    window.history.back()
    await expect.element(heading()).toHaveFocus()
  })
})

describe('keyboard', () => {
  test('Tab after a navigation continues after the title', async () => {
    await render(<Router />)
    await userEvent.click(page.getByRole('link', { name: 'Om oss' }))
    await expect.element(heading()).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Första länken' })).toHaveFocus()
  })

  test('Shift+Tab after a navigation goes back to the stop before the title', async () => {
    await render(<Router />)
    await userEvent.click(page.getByRole('link', { name: 'Om oss' }))
    await expect.element(heading()).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('link', { name: 'Kontakt' })).toHaveFocus()
  })

  test('the title is not a control and handles no keys', async () => {
    const view = await render(<Probe routeKey="/a" />)
    await view.rerender(<Probe routeKey="/b" />)
    await expect.element(heading()).toHaveFocus()
    const defaultPrevented: boolean[] = []
    document.addEventListener('keydown', (event) => defaultPrevented.push(event.defaultPrevented), {
      once: true,
    })
    await userEvent.keyboard('{Enter}')
    expect(defaultPrevented).toEqual([false])
    await expect.element(heading()).toHaveFocus()
  })
})

describe('announce', () => {
  test('off by default: nothing is said in the live region', async () => {
    document.title = 'Om oss'
    const view = await render(
      <KvirnProvider>
        <Probe routeKey="/a" />
      </KvirnProvider>,
    )
    await view.rerender(
      <KvirnProvider>
        <Probe routeKey="/b" />
      </KvirnProvider>,
    )
    await expect.element(heading()).toHaveFocus()
    await expect.element(page.getByRole('status')).toBeEmptyDOMElement()
  })

  test('on: says the navigated message with the document title', async () => {
    document.title = 'Om oss'
    const view = await render(
      <KvirnProvider>
        <Probe routeKey="/a" announce />
      </KvirnProvider>,
    )
    await view.rerender(
      <KvirnProvider>
        <Probe routeKey="/b" announce />
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('status')).toHaveTextContent('Navigated to Om oss')
  })

  test('on without a document title: uses the heading text', async () => {
    document.title = ''
    const view = await render(
      <KvirnProvider>
        <Probe routeKey="/a" announce />
      </KvirnProvider>,
    )
    await view.rerender(
      <KvirnProvider>
        <Probe routeKey="/b" announce />
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('status')).toHaveTextContent('Navigated to Sidans rubrik')
  })

  test('the message can be overridden per instance', async () => {
    document.title = 'Om oss'
    const messages = { navigated: ({ title }: { title: string }) => `Nu på ${title}` }
    const view = await render(
      <KvirnProvider>
        <Probe routeKey="/a" announce messages={messages} />
      </KvirnProvider>,
    )
    await view.rerender(
      <KvirnProvider>
        <Probe routeKey="/b" announce messages={messages} />
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('status')).toHaveTextContent('Nu på Om oss')
  })
})

describe('accessibility', () => {
  test('no axe violations with the title focused', async () => {
    const view = await render(
      <KvirnProvider>
        <Probe routeKey="/a" />
      </KvirnProvider>,
    )
    await view.rerender(
      <KvirnProvider>
        <Probe routeKey="/b" />
      </KvirnProvider>,
    )
    await expect.element(heading()).toHaveFocus()
    await expectNoA11yViolations(document.body)
  })

  test('the hook returns nothing to spread', () => {
    expectTypeOf(useRouteFocus).returns.toEqualTypeOf<void>()
  })
})
