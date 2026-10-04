import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { renderToString } from 'react-dom/server'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { useMessages } from '../provider/use-messages.ts'
import { useAnnouncer } from './use-announcer.ts'
import type { UseAnnouncerResult } from './use-announcer.ts'

// Contract: announcer.a11y.md. The component has no keys, so there is no e2e spec.

type Announce = UseAnnouncerResult['announce']

/** Hands the hook's `announce` to the test, and counts renders that saw a new function. */
function Probe({ onAnnounce }: { onAnnounce: (announce: Announce) => void }) {
  const { announce } = useAnnouncer()
  useEffect(() => {
    onAnnounce(announce)
  }, [announce, onAnnounce])
  return null
}

async function renderProbe(providerProps: Parameters<typeof KvirnProvider>[0] = {}) {
  let announce: Announce | undefined
  const view = await render(
    <KvirnProvider {...providerProps}>
      <main>
        <Probe
          onAnnounce={(next) => {
            announce = next
          }}
        />
      </main>
    </KvirnProvider>,
  )
  return {
    view,
    announce: (...parameters: Parameters<Announce>) => {
      if (announce === undefined) {
        throw new Error('The probe has not mounted yet')
      }
      return announce(...parameters)
    },
  }
}

const politeRegion = () => page.getByRole('status')
const assertiveRegion = () => page.getByRole('alert')

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('the live regions', () => {
  test('a polite and an assertive region exist, empty, as soon as the provider mounts', async () => {
    await render(<KvirnProvider>Innehåll</KvirnProvider>)

    await expect.element(politeRegion()).toBeInTheDocument()
    await expect.element(politeRegion()).toBeEmptyDOMElement()
    await expect.element(politeRegion()).toHaveAttribute('aria-live', 'polite')
    await expect.element(assertiveRegion()).toBeInTheDocument()
    await expect.element(assertiveRegion()).toBeEmptyDOMElement()
    await expect.element(assertiveRegion()).toHaveAttribute('aria-live', 'assertive')
  })

  test('the regions are in the server HTML, empty, so they exist before hydration', () => {
    const html = renderToString(<KvirnProvider>Innehåll</KvirnProvider>)
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('output[aria-live="polite"]')?.textContent).toBe('')
    expect(container.querySelector('[role="alert"]')?.textContent).toBe('')
  })

  test('the regions are never hidden from assistive technology', async () => {
    await render(<KvirnProvider>Innehåll</KvirnProvider>)

    for (const region of [politeRegion(), assertiveRegion()]) {
      const element = region.element()
      expect(element.closest('[aria-hidden], [hidden], [inert]')).toBeNull()
    }
  })

  test('the regions are not focusable', async () => {
    await render(<KvirnProvider>Innehåll</KvirnProvider>)

    for (const region of [politeRegion(), assertiveRegion()]) {
      const element = region.element()
      expect(element.hasAttribute('tabindex')).toBe(false)
      expect(element.querySelector('a, button, input, select, textarea, [tabindex]')).toBeNull()
    }
  })

  test('a nested provider adds no second pair of regions', async () => {
    let announce: Announce | undefined
    await render(
      <KvirnProvider>
        <KvirnProvider locale="sv" messages={sv}>
          <Probe
            onAnnounce={(next) => {
              announce = next
            }}
          />
        </KvirnProvider>
      </KvirnProvider>,
    )

    expect(page.getByRole('status').elements()).toHaveLength(1)
    expect(page.getByRole('alert').elements()).toHaveLength(1)
    announce?.('Sparat')
    await expect.element(politeRegion()).toHaveTextContent('Sparat')
  })
})

describe('announce', () => {
  test('a polite message is added to the polite region after it was already in the page', async () => {
    const { announce } = await renderProbe()
    await expect.element(politeRegion()).toBeEmptyDOMElement()
    const regionElement = politeRegion().element()

    announce('Ändringarna är sparade')

    await expect.element(politeRegion()).toHaveTextContent('Ändringarna är sparade')
    expect(politeRegion().element()).toBe(regionElement)
    await expect.element(assertiveRegion()).toBeEmptyDOMElement()
  })

  test('an assertive message goes to the alert region', async () => {
    const { announce } = await renderProbe()

    announce('Sessionen har gått ut', { politeness: 'assertive' })

    await expect.element(assertiveRegion()).toHaveTextContent('Sessionen har gått ut')
    await expect.element(politeRegion()).toBeEmptyDOMElement()
  })

  test('the same message again is cleared and set again, so it is read again', async () => {
    const { announce } = await renderProbe()
    await expect.element(politeRegion()).toBeInTheDocument()
    const seen: string[] = []
    const observer = new MutationObserver(() => {
      seen.push(politeRegion().element().textContent)
    })
    observer.observe(politeRegion().element(), {
      childList: true,
      characterData: true,
      subtree: true,
    })

    announce('Sparat')
    await expect.element(politeRegion()).toHaveTextContent('Sparat')
    announce('Sparat')
    await vi.waitFor(() => {
      expect(seen.filter((text) => text === 'Sparat')).toHaveLength(2)
    })
    observer.disconnect()

    expect(seen).toEqual(['Sparat', '', 'Sparat'])
  })

  test('returns true when accepted and false when throttled by key', async () => {
    const { announce } = await renderProbe()

    expect(announce('Endast siffror', { key: 'telefon' })).toBe(true)
    expect(announce('Endast siffror', { key: 'telefon' })).toBe(false)
    // Once spoken, the key stays throttled. A different key is not affected.
    await expect.element(politeRegion()).toHaveTextContent('Endast siffror')
    expect(announce('Endast siffror', { key: 'postnummer' })).toBe(true)
    expect(announce('Endast siffror', { key: 'telefon' })).toBe(false)
  })

  test('text is passed through unchanged, in the provider language (sv and fi)', async () => {
    function Notice() {
      const { announce } = useAnnouncer()
      const link = useMessages('link')
      useEffect(() => {
        announce(link.newTabNotice)
      }, [announce, link.newTabNotice])
      return null
    }

    const swedish = await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Notice />
      </KvirnProvider>,
    )
    await expect.element(politeRegion()).toHaveTextContent(sv.link.newTabNotice)
    await swedish.unmount()

    await render(
      <KvirnProvider locale="fi" messages={fi}>
        <Notice />
      </KvirnProvider>,
    )
    await expect.element(politeRegion()).toHaveTextContent(fi.link.newTabNotice)
  })

  test('announce keeps its identity across re-renders', async () => {
    const seen = new Set<Announce>()
    const view = await render(
      <KvirnProvider>
        <Probe onAnnounce={(announce) => seen.add(announce)} />
      </KvirnProvider>,
    )
    await view.rerender(
      <KvirnProvider locale="sv">
        <Probe onAnnounce={(announce) => seen.add(announce)} />
      </KvirnProvider>,
    )

    expect(seen.size).toBe(1)
  })

  test('unmounting the provider cancels what is pending, and nothing throws', async () => {
    const { announce, view } = await renderProbe()
    await expect.element(politeRegion()).toBeInTheDocument()
    announce('Sparat')

    await view.unmount()
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the types: announce returns a boolean and politeness is polite or assertive', () => {
    expectTypeOf<Announce>().toBeFunction()
    expectTypeOf<ReturnType<Announce>>().toEqualTypeOf<boolean>()
    expectTypeOf<NonNullable<Parameters<Announce>[1]>['politeness']>().toEqualTypeOf<
      'polite' | 'assertive' | undefined
    >()
  })
})

describe('without a provider', () => {
  test('announce is a no-op that returns false, and a development warning says why, once', async () => {
    let announce: Announce | undefined
    const view = await render(
      <Probe
        onAnnounce={(next) => {
          announce = next
        }}
      />,
    )

    expect(announce?.('Sparat')).toBe(false)
    expect(announce?.('Sparat', { politeness: 'assertive' })).toBe(false)
    await view.rerender(<Probe onAnnounce={() => {}} />)

    expect(page.getByRole('status').elements()).toHaveLength(0)
    expect(page.getByRole('alert').elements()).toHaveLength(0)
    const warnings = consoleWarn.mock.calls.filter(([message]) =>
      String(message).includes('useAnnouncer'),
    )
    expect(warnings).toHaveLength(1)
    expect(String(warnings[0]?.[0])).toContain('<KvirnProvider>')
  })
})

describe('axe', () => {
  test('no violations with both regions empty', async () => {
    const { container } = await render(
      <KvirnProvider locale="sv" messages={sv}>
        <main>
          <h1>Ansökan</h1>
        </main>
      </KvirnProvider>,
    )

    await expect.element(politeRegion()).toBeEmptyDOMElement()
    await expect.element(assertiveRegion()).toBeEmptyDOMElement()
    await expectNoA11yViolations(container)
  })

  test('no violations while both regions hold a message', async () => {
    const { announce } = await renderProbe({ locale: 'sv', messages: sv })
    announce('Sparat')
    announce('Sessionen har gått ut', { politeness: 'assertive' })
    await expect.element(politeRegion()).toHaveTextContent('Sparat')
    await expect.element(assertiveRegion()).toHaveTextContent('Sessionen har gått ut')

    await expectNoA11yViolations(document.body)
  })
})
