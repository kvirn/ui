import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Dialog, KvirnProvider, Popover, useToast } from '../index.ts'
import type {
  KvirnProviderProps,
  ToastShowOptions,
  ToastVariant,
  UseToastResult,
} from '../index.ts'

// Contract: toast.a11y.md. The timing rules are proved in core (`toast-queue.test.ts`); here only
// the wiring. Component tests load no theme: the region is the browser's own popover.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(async () => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  await page.viewport(900, 800)
})

afterEach(() => {
  consoleWarn.mockRestore()
  vi.useRealTimers()
})

// Without the theme the buttons touch: axe's target-size rule (2.5.8) needs room between them.
const spaced = { margin: 8 }

const warnings = () => consoleWarn.mock.calls.flat().join('\n')

type Run = (toast: UseToastResult) => void

function Trigger({ label, run }: { label: string; run: Run }) {
  const toast = useToast()
  return (
    <button type="button" style={spaced} onClick={() => run(toast)}>
      {label}
    </button>
  )
}

function Page({
  actions,
  children,
  ...providerProps
}: KvirnProviderProps & { actions: Record<string, Run> }) {
  return (
    <>
      <button type="button" style={spaced}>
        Före
      </button>
      <KvirnProvider {...providerProps}>
        <main>
          {Object.entries(actions).map(([label, run]) => (
            <Trigger key={label} label={label} run={run} />
          ))}
          {children}
        </main>
      </KvirnProvider>
      <button type="button" style={spaced}>
        Efter
      </button>
    </>
  )
}

const regionElement = () => document.querySelector<HTMLElement>('section.kv-toast-region')
const toastElements = () => [...document.querySelectorAll<HTMLElement>('.kv-toast')]
const toastTitles = () =>
  toastElements().map((element) => element.querySelector('.kv-alert-title')?.textContent)
const politeRegion = () => document.querySelector('output[aria-live="polite"]')
const politeText = () => politeRegion()?.textContent ?? ''

const button = (name: string) => page.getByRole('button', { name, exact: true })
const closeButton = (index: number) =>
  page.getByRole('button', { name: 'Close message', exact: true }).nth(index)
const press = (name: string) => userEvent.click(button(name))

/** Every message the polite live regions of the page held, in order. A region keeps one for five seconds. */
function recordAnnouncements() {
  const outputs = [...document.querySelectorAll('output[aria-live="polite"]')]
  const spoken: string[] = []
  const observers = outputs.map((output) => {
    const observer = new MutationObserver(() => {
      const text = output.textContent ?? ''
      if (text !== '') {
        spoken.push(text)
      }
    })
    observer.observe(output, { childList: true, characterData: true, subtree: true })
    return observer
  })
  return {
    spoken,
    stop: () => {
      for (const observer of observers) {
        observer.disconnect()
      }
    },
  }
}

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds)
  })

const showSaved: Run = (toast) => {
  toast.show({ variant: 'success', title: 'Utkastet sparades' })
}

describe('rendering and ARIA', () => {
  test('the region is absent while no toast exists', async () => {
    await render(<Page actions={{ Visa: showSaved }} />)
    expect(regionElement()).toBeNull()
    expect(document.querySelector('[role="region"], .kv-toast-region')).toBeNull()
  })

  test('a toast is a named region holding a list item, with no role or live region of its own', async () => {
    await render(
      <Page
        actions={{
          Visa: (toast) => {
            toast.show({
              variant: 'success',
              title: 'Utkastet sparades',
              body: <p>Se Mina ärenden.</p>,
            })
          },
        }}
      />,
    )
    await press('Visa')

    await expect.element(page.getByRole('region', { name: 'Messages' })).toBeVisible()
    const region = regionElement()
    expect(region?.tagName).toBe('SECTION')
    expect(region?.getAttribute('popover')).toBe('manual')
    expect(region?.matches(':popover-open')).toBe(true)
    expect(region?.querySelector(':scope > ol.kv-toast-list > li.kv-toast-item')).not.toBeNull()
    const toastElement = toastElements()[0]
    expect([...(toastElement?.classList ?? [])].toSorted()).toEqual([
      'kv-alert',
      'kv-alert--success',
      'kv-toast',
    ])
    expect(toastElement?.tagName).toBe('DIV')

    expect(region?.hasAttribute('role')).toBe(false)
    expect(region?.querySelector('[role], [aria-live], [aria-atomic]')).toBeNull()
    expect(region?.closest('[aria-live]')).toBeNull()
  })

  test('the title is a paragraph that starts with the status word, and it is the only tabindex, at -1', async () => {
    await render(<Page actions={{ Visa: showSaved }} />)
    await press('Visa')

    const title = document.querySelector<HTMLElement>('.kv-toast .kv-alert-title')
    expect(title?.tagName).toBe('P')
    expect(title?.textContent).toBe('Success: Utkastet sparades')
    expect(title?.getAttribute('tabindex')).toBe('-1')
    expect(regionElement()?.querySelectorAll('[tabindex]').length).toBe(1)
  })

  test('info is the default variant', async () => {
    await render(
      <Page
        actions={{
          Visa: (toast) => {
            toast.show({ title: 'Din rapport är klar' })
          },
        }}
      />,
    )
    await press('Visa')

    expect(toastElements()[0]?.classList.contains('kv-alert--info')).toBe(true)
  })

  test('every toast has a Close button, named by alert.close, after the action', async () => {
    await render(
      <Page
        actions={{
          Visa: (toast) => {
            toast.show({
              title: 'Utkastet togs bort',
              action: { label: 'Ångra', onPress: () => {} },
            })
          },
        }}
      />,
    )
    await press('Visa')

    const controls = [...(toastElements()[0]?.querySelectorAll('button') ?? [])]
    expect(
      controls.map((control) => control.getAttribute('aria-label') ?? control.textContent),
    ).toEqual(['Ångra', 'Close message'])
  })

  test('the region carries the provider locale and direction', async () => {
    await render(<Page actions={{ Visa: showSaved }} locale="ar" messages={sv} />)
    await press('Visa')

    expect(regionElement()?.getAttribute('lang')).toBe('ar')
    expect(regionElement()?.getAttribute('dir')).toBe('rtl')
  })

  test('has no axe violations with a status word, a body, an action and two toasts', async () => {
    const { container } = await render(
      <Page
        actions={{
          Visa: (toast) => {
            toast.show({
              variant: 'success',
              title: 'Utkastet har tagits bort',
              body: <p>Du kan ångra det.</p>,
              action: { label: 'Ångra', onPress: () => {} },
            })
            toast.show({ title: 'Din rapport är klar' })
          },
        }}
      />,
    )
    await press('Visa')
    await expect.element(page.getByRole('region', { name: 'Messages' })).toBeVisible()

    // The theme spaces the action and Close; without it they touch (target-size, 2.5.8).
    const spacing = document.createElement('style')
    spacing.textContent = '.kv-toast button { margin: 8px }'
    document.head.append(spacing)
    try {
      await expectNoA11yViolations(container)
    } finally {
      spacing.remove()
    }
  })
})

describe('languages', () => {
  test('sv: a long title wraps in the region, with the Swedish name, status word and Close', async () => {
    const title =
      'Dina ändringar av aviseringsinställningarna är sparade och börjar gälla från och med nästa inloggning'
    const { container } = await render(
      <Page
        locale="sv"
        messages={sv}
        actions={{
          Visa: (toast) => {
            toast.show({ variant: 'success', title })
          },
        }}
      />,
    )
    await press('Visa')

    await expect.element(page.getByRole('region', { name: 'Meddelanden' })).toBeVisible()
    expect(toastTitles()).toEqual([`${sv.alert.successPrefix} ${title}`])
    await expect.element(page.getByRole('button', { name: 'Stäng meddelandet' })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('fi: a long compound-word title and body show in full, with the Finnish name and status word', async () => {
    const title = 'Luonnoksen tallennusasetukset on päivitetty ja ilmoitusasetukset tallennettu'
    const { container } = await render(
      <Page
        locale="fi"
        messages={fi}
        actions={{
          Visa: (toast) => {
            toast.show({
              variant: 'success',
              title,
              body: <p>Löydät asetukset kohdasta Omat asetukset ja tiedot.</p>,
            })
          },
        }}
      />,
    )
    await press('Visa')

    await expect.element(page.getByRole('region', { name: 'Ilmoitukset' })).toBeVisible()
    expect(toastTitles()).toEqual([`${fi.alert.successPrefix} ${title}`])
    await expectNoA11yViolations(container)
  })
})

describe('announcements', () => {
  test('a shown toast is announced once, politely, as status word, title and body, without the action', async () => {
    await render(
      <Page
        actions={{
          Visa: (toast) => {
            toast.show({
              variant: 'success',
              title: 'Utkastet sparades',
              body: <p>Se Mina ärenden.</p>,
              action: { label: 'Ångra', onPress: () => {} },
            })
          },
        }}
      />,
    )
    const { spoken, stop } = recordAnnouncements()
    await press('Visa')

    await expect.poll(politeText).toBe('Success: Utkastet sparades Se Mina ärenden.')
    await wait(300)
    expect(spoken).toEqual(['Success: Utkastet sparades Se Mina ärenden.'])
    expect(document.querySelector('[role="alert"][aria-live="assertive"]')?.textContent).toBe('')
    stop()
  })

  test('the toasts added in one commit are joined into one announcement', async () => {
    await render(
      <Page
        actions={{
          Visa: (toast) => {
            toast.show({ variant: 'success', title: 'Utkastet sparades' })
            toast.show({ title: 'Exporten är klar' })
          },
        }}
      />,
    )
    const { spoken, stop } = recordAnnouncements()
    await press('Visa')

    await expect.poll(politeText).toBe('Success: Utkastet sparades Information: Exporten är klar')
    await wait(300)
    expect(spoken).toHaveLength(1)
    stop()
  })

  test('a toast shown in a later commit is announced on its own', async () => {
    await render(
      <Page
        actions={{
          Första: showSaved,
          Andra: (toast) => {
            toast.show({ title: 'Exporten är klar' })
          },
        }}
      />,
    )
    const { spoken, stop } = recordAnnouncements()
    await press('Första')
    await expect.poll(() => spoken).toEqual(['Success: Utkastet sparades'])
    await wait(200)
    await press('Andra')

    await expect
      .poll(() => spoken)
      .toEqual(['Success: Utkastet sparades', 'Information: Exporten är klar'])
    stop()
  })

  test('dismissing, a timeout and an eviction announce nothing of their own', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    await render(
      <Page
        toast={{ limit: 1, autoDismiss: true }}
        actions={{
          Visa: showSaved,
          Ersätt: (toast) => {
            toast.show({ title: 'Exporten är klar' })
          },
        }}
      />,
    )
    const { spoken, stop } = recordAnnouncements()

    await press('Visa')
    await vi.advanceTimersByTimeAsync(300)
    spoken.length = 0
    await userEvent.click(closeButton(0))
    await vi.advanceTimersByTimeAsync(300)
    expect(spoken).toEqual([])

    await press('Visa')
    await vi.advanceTimersByTimeAsync(300)
    spoken.length = 0
    await vi.advanceTimersByTimeAsync(11_000)
    expect(toastElements()).toHaveLength(0)
    expect(spoken).toEqual([])

    await press('Visa')
    await vi.advanceTimersByTimeAsync(300)
    spoken.length = 0
    await press('Ersätt')
    await vi.advanceTimersByTimeAsync(300)
    expect(toastTitles()).toEqual(['Information: Exporten är klar'])
    expect(spoken).toEqual(['Information: Exporten är klar'])
    stop()
  })

  test('showing the same id again updates the toast in place and announces the new text once', async () => {
    await render(
      <Page
        actions={{
          Spara: (toast) => {
            toast.show({ id: 'draft', title: 'Sparar utkastet' })
          },
          Klart: (toast) => {
            toast.show({ id: 'draft', variant: 'success', title: 'Utkastet sparades' })
          },
        }}
      />,
    )
    const { spoken, stop } = recordAnnouncements()
    await press('Spara')
    await expect.poll(() => spoken).toEqual(['Information: Sparar utkastet'])
    await wait(200)
    await press('Klart')

    await expect
      .poll(() => spoken)
      .toEqual(['Information: Sparar utkastet', 'Success: Utkastet sparades'])
    expect(toastTitles()).toEqual(['Success: Utkastet sparades'])
    expect(toastElements()[0]?.classList.contains('kv-alert--success')).toBe(true)
    stop()
  })

  test('focus: true moves focus to the title and announces nothing', async () => {
    await render(
      <Page
        actions={{
          Visa: (toast) => {
            toast.show({ title: 'Utkastet sparades', focus: true })
          },
        }}
      />,
    )
    const { spoken, stop } = recordAnnouncements()
    await press('Visa')

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(document.querySelector('.kv-toast .kv-alert-title'))
    })
    await wait(400)
    expect(spoken).toEqual([])
    stop()
  })

  test('showing a toast never moves focus', async () => {
    await render(<Page actions={{ Visa: showSaved }} />)
    await press('Visa')

    await expect.element(button('Visa')).toHaveFocus()
  })

  test('toast.focus() focuses the title of the newest toast', async () => {
    await render(
      <Page
        actions={{
          Visa: (toast) => {
            toast.show({ title: 'Första' })
            toast.show({ title: 'Andra' })
          },
          Fokusera: (toast) => {
            toast.focus()
          },
        }}
      />,
    )
    await press('Visa')
    await press('Fokusera')

    await vi.waitFor(() => {
      expect(document.activeElement?.textContent).toBe('Information: Andra')
    })
  })
})

describe('timers', () => {
  const timedOptions: ToastShowOptions = { title: 'Utkastet sparades' }
  const showTimed: Run = (toast) => {
    toast.show(timedOptions)
  }

  function useFakeClock() {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
  }

  test('autoDismiss: false has no timers: a toast stays after ten minutes', async () => {
    useFakeClock()
    await render(<Page actions={{ Visa: showTimed }} />)
    await press('Visa')
    await vi.advanceTimersByTimeAsync(600_000)

    expect(toastElements()).toHaveLength(1)
  })

  test('with autoDismiss a toast times out after its reading time, and not before', async () => {
    useFakeClock()
    await render(<Page toast={{ autoDismiss: true }} actions={{ Visa: showTimed }} />)
    await press('Visa')
    await vi.advanceTimersByTimeAsync(9999)
    expect(toastElements()).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)

    await vi.waitFor(() => {
      expect(regionElement()).toBeNull()
    })
  })

  test('an action makes a toast persistent, even with autoDismiss', async () => {
    useFakeClock()
    await render(
      <Page
        toast={{ autoDismiss: true }}
        actions={{
          Visa: (toast) => {
            toast.show({
              title: 'Utkastet togs bort',
              action: { label: 'Ångra', onPress: () => {} },
            })
          },
        }}
      />,
    )
    await press('Visa')
    await vi.advanceTimersByTimeAsync(600_000)

    expect(toastElements()).toHaveLength(1)
  })

  test('the timer pauses while the pointer is over the region, and resumes with at least five seconds', async () => {
    useFakeClock()
    await render(<Page toast={{ autoDismiss: true }} actions={{ Visa: showTimed }} />)
    await press('Visa')
    await vi.advanceTimersByTimeAsync(8000)
    await userEvent.hover(closeButton(0))
    await vi.advanceTimersByTimeAsync(600_000)
    expect(toastElements()).toHaveLength(1)

    await userEvent.hover(button('Före'))
    await vi.advanceTimersByTimeAsync(4999)
    expect(toastElements()).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)

    await vi.waitFor(() => {
      expect(regionElement()).toBeNull()
    })
  })

  test('the timer pauses while focus is inside a toast, and the toast is not removed under the user', async () => {
    useFakeClock()
    await render(<Page toast={{ autoDismiss: true }} actions={{ Visa: showTimed }} />)
    await press('Visa')
    await userEvent.tab()
    await expect.element(closeButton(0)).toHaveFocus()
    await vi.advanceTimersByTimeAsync(600_000)
    expect(toastElements()).toHaveLength(1)
    await expect.element(closeButton(0)).toHaveFocus()

    await userEvent.tab()
    await vi.advanceTimersByTimeAsync(10_000)

    await vi.waitFor(() => {
      expect(regionElement()).toBeNull()
    })
  })

  test('the timer pauses while the tab is hidden', async () => {
    useFakeClock()
    await render(<Page toast={{ autoDismiss: true }} actions={{ Visa: showTimed }} />)
    await press('Visa')
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(600_000)
    expect(toastElements()).toHaveLength(1)

    Reflect.deleteProperty(document, 'visibilityState')
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(10_000)

    await vi.waitFor(() => {
      expect(regionElement()).toBeNull()
    })
  })

  test('the timer pauses while the window is blurred', async () => {
    useFakeClock()
    await render(<Page toast={{ autoDismiss: true }} actions={{ Visa: showTimed }} />)
    await press('Visa')
    window.dispatchEvent(new Event('blur'))
    await vi.advanceTimersByTimeAsync(600_000)
    expect(toastElements()).toHaveLength(1)

    window.dispatchEvent(new Event('focus'))
    await vi.advanceTimersByTimeAsync(10_000)

    await vi.waitFor(() => {
      expect(regionElement()).toBeNull()
    })
  })

  test('a numeric autoDismiss scales the reading time', async () => {
    useFakeClock()
    await render(<Page toast={{ autoDismiss: 3 }} actions={{ Visa: showTimed }} />)
    await press('Visa')
    await vi.advanceTimersByTimeAsync(29_999)
    expect(toastElements()).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)

    await vi.waitFor(() => {
      expect(regionElement()).toBeNull()
    })
  })
})

describe('limit', () => {
  const showThree: Run = (toast) => {
    toast.show({ id: 'a', title: 'Första' })
    toast.show({ id: 'b', title: 'Andra' })
    toast.show({ id: 'c', title: 'Tredje' })
  }

  test('ten toasts show, at any width, and the eleventh is ignored with a warning', async () => {
    await page.viewport(500, 800)
    const returned: string[] = []
    await render(
      <Page
        actions={{
          Visa: (toast) => {
            for (let index = 1; index <= 11; index += 1) {
              returned.push(toast.show({ id: `t${index}`, title: `Toast ${index}` }))
            }
          },
        }}
      />,
    )
    await press('Visa')

    expect(toastTitles()).toHaveLength(10)
    expect(toastTitles()).not.toContain('Information: Toast 11')
    expect(returned[10]).toBe('')
    expect(returned.slice(0, 10).every((id) => id !== '')).toBe(true)
    expect(warnings()).toMatch(/A toast was ignored: the limit is reached/)
  })

  test('the provider limit lowers it, and an ignored toast is not queued', async () => {
    await render(
      <Page
        toast={{ limit: 2 }}
        actions={{
          Visa: showThree,
          Ta: (toast) => {
            toast.dismiss('a')
          },
        }}
      />,
    )
    await press('Visa')
    expect(toastTitles()).toEqual(['Information: Första', 'Information: Andra'])

    await press('Ta')
    await wait(200)
    expect(toastTitles()).toEqual(['Information: Andra'])
  })

  test('a persistent toast is never evicted: when full the new one is ignored', async () => {
    await render(
      <Page
        toast={{ limit: 1 }}
        actions={{
          Visa: showSaved,
          Ny: (toast) => {
            toast.show({ title: 'Exporten är klar' })
          },
        }}
      />,
    )
    await press('Visa')
    await press('Ny')

    expect(toastTitles()).toEqual(['Success: Utkastet sparades'])
    expect(warnings()).toMatch(/A toast was ignored/)
  })

  test('when full the oldest timed toast goes first', async () => {
    await render(
      <Page
        toast={{ limit: 1, autoDismiss: true }}
        actions={{
          Visa: showSaved,
          Ny: (toast) => {
            toast.show({ title: 'Exporten är klar' })
          },
        }}
      />,
    )
    await press('Visa')
    await press('Ny')

    expect(toastTitles()).toEqual(['Information: Exporten är klar'])
  })

  test('the same id while shown updates in place and keeps the count', async () => {
    await render(
      <Page
        actions={{
          Visa: (toast) => {
            toast.show({ id: 'draft', title: 'Sparar' })
            toast.show({ id: 'draft', title: 'Sparat' })
          },
        }}
      />,
    )
    await press('Visa')

    expect(toastTitles()).toEqual(['Information: Sparat'])
  })

  test('dismiss(id) removes one toast and dismissAll removes every one', async () => {
    await render(
      <Page
        actions={{
          Visa: showThree,
          Ta: (toast) => {
            toast.dismiss('a')
          },
          Alla: (toast) => {
            toast.dismissAll()
          },
        }}
      />,
    )
    await press('Visa')
    await press('Ta')
    await vi.waitFor(() => {
      expect(toastTitles()).toEqual(['Information: Andra', 'Information: Tredje'])
    })

    await press('Alla')
    await vi.waitFor(() => {
      expect(regionElement()).toBeNull()
    })
  })
})

describe('keyboard', () => {
  const showTwo =
    (onPress: () => void = () => {}): Run =>
    (toast) => {
      toast.show({ title: 'Utkastet sparades', action: { label: 'Ångra', onPress } })
      toast.show({ title: 'Exporten är klar' })
    }

  test('Tab from the page enters the first toast at its action, then its Close, then the next toast', async () => {
    await render(<Page actions={{ Visa: showTwo() }} />)
    await press('Visa')
    await expect.element(page.getByRole('region', { name: 'Messages' })).toBeVisible()

    await userEvent.tab()
    await expect.element(button('Ångra')).toHaveFocus()
    await userEvent.tab()
    await expect.element(closeButton(0)).toHaveFocus()
    await userEvent.tab()
    await expect.element(closeButton(1)).toHaveFocus()
  })

  test('Shift+Tab from after the region enters the last toast at its Close and goes back in reverse order', async () => {
    await render(<Page actions={{ Visa: showTwo() }} />)
    await press('Visa')
    button('Efter').element().focus()

    await userEvent.tab({ shift: true })
    await expect.element(closeButton(1)).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(closeButton(0)).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(button('Ångra')).toHaveFocus()
  })

  test('Tab and Shift+Tab inside the region follow DOM order and never trap', async () => {
    await render(<Page actions={{ Visa: showTwo() }} />)
    await press('Visa')
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(closeButton(1)).toHaveFocus()

    await userEvent.tab()
    await expect.element(button('Efter')).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(closeButton(1)).toHaveFocus()
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    await expect.element(button('Visa')).toHaveFocus()
  })

  const overflowing = async (run: () => Promise<void>) => {
    const limiting = document.createElement('style')
    limiting.textContent = '.kv-toast-region { max-block-size: 40px; overflow-y: auto }'
    document.head.append(limiting)
    try {
      await run()
    } finally {
      limiting.remove()
    }
  }

  test('Tab from the page stops on the region first while it overflows, then enters the first toast', async () => {
    await overflowing(async () => {
      await render(<Page actions={{ Visa: showTwo() }} />)
      await press('Visa')
      await vi.waitFor(() => {
        expect(regionElement()?.getAttribute('tabindex')).toBe('0')
      })

      await userEvent.tab()
      expect(document.activeElement).toBe(regionElement())
      await userEvent.tab()
      await expect.element(button('Ångra')).toHaveFocus()
    })
  })

  test('Shift+Tab from the first toast goes back to the region while it overflows', async () => {
    await overflowing(async () => {
      await render(<Page actions={{ Visa: showTwo() }} />)
      await press('Visa')
      await vi.waitFor(() => {
        expect(regionElement()?.getAttribute('tabindex')).toBe('0')
      })
      await userEvent.tab()
      await userEvent.tab()
      await expect.element(button('Ångra')).toHaveFocus()

      await userEvent.tab({ shift: true })

      expect(document.activeElement).toBe(regionElement())
    })
  })

  test('Enter on Close dismisses the toast and returns focus to the element focused before', async () => {
    await render(<Page actions={{ Visa: showSaved }} />)
    await press('Visa')
    await userEvent.tab()
    await expect.element(closeButton(0)).toHaveFocus()

    await userEvent.keyboard('{Enter}')

    await vi.waitFor(() => {
      expect(regionElement()).toBeNull()
    })
    await expect.element(button('Visa')).toHaveFocus()
  })

  test('Space on Close dismisses the toast and returns focus to the element focused before', async () => {
    await render(<Page actions={{ Visa: showSaved }} />)
    await press('Visa')
    await userEvent.tab()
    await expect.element(closeButton(0)).toHaveFocus()

    await userEvent.keyboard(' ')

    await vi.waitFor(() => {
      expect(regionElement()).toBeNull()
    })
    await expect.element(button('Visa')).toHaveFocus()
  })

  test('Enter on the action runs onPress, then dismisses the toast', async () => {
    const toastsWhenPressed: number[] = []
    const onPress = () => {
      toastsWhenPressed.push(toastElements().length)
    }
    await render(<Page actions={{ Visa: showTwo(onPress) }} />)
    await press('Visa')
    await userEvent.tab()
    await expect.element(button('Ångra')).toHaveFocus()

    await userEvent.keyboard('{Enter}')

    await vi.waitFor(() => {
      expect(toastTitles()).toEqual(['Information: Exporten är klar'])
    })
    expect(toastsWhenPressed).toEqual([2])
    await expect.element(button('Visa')).toHaveFocus()
  })

  test('Space on the action runs onPress, then dismisses the toast', async () => {
    const onPress = vi.fn<() => void>()
    await render(<Page actions={{ Visa: showTwo(onPress) }} />)
    await press('Visa')
    await userEvent.tab()
    await expect.element(button('Ångra')).toHaveFocus()

    await userEvent.keyboard(' ')

    await vi.waitFor(() => {
      expect(toastTitles()).toEqual(['Information: Exporten är klar'])
    })
    expect(onPress).toHaveBeenCalledOnce()
    await expect.element(button('Visa')).toHaveFocus()
  })

  test('Escape with focus inside a toast dismisses that toast only', async () => {
    await render(<Page actions={{ Visa: showTwo() }} />)
    await press('Visa')
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(closeButton(0)).toHaveFocus()

    await userEvent.keyboard('{Escape}')

    await vi.waitFor(() => {
      expect(toastTitles()).toEqual(['Information: Exporten är klar'])
    })
    await expect.element(button('Visa')).toHaveFocus()
  })

  test('Escape with focus outside the region is not handled', async () => {
    let wasPrevented: boolean | undefined
    const record = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        wasPrevented = event.defaultPrevented
      }
    }
    window.addEventListener('keydown', record)
    await render(<Page actions={{ Visa: showTwo() }} />)
    await press('Visa')
    button('Före').element().focus()

    await userEvent.keyboard('{Escape}')

    window.removeEventListener('keydown', record)
    expect(wasPrevented).toBe(false)
    expect(toastTitles()).toHaveLength(2)
  })
})

describe('focus on dismissal', () => {
  test('the Close of the next toast gets focus when the element focused before is gone', async () => {
    function Vanishing() {
      const [shown, setShown] = useState(true)
      const toast = useToast()
      return shown ? (
        <button
          type="button"
          style={spaced}
          onClick={() => {
            toast.show({ title: 'Första' })
            toast.show({ title: 'Andra' })
            setShown(false)
          }}
        >
          Visa
        </button>
      ) : null
    }
    await render(
      <KvirnProvider>
        <Vanishing />
      </KvirnProvider>,
    )
    await press('Visa')
    await expect.element(page.getByRole('region', { name: 'Messages' })).toBeVisible()
    await userEvent.tab()
    await expect.element(closeButton(0)).toHaveFocus()

    await userEvent.keyboard('{Enter}')

    await vi.waitFor(() => {
      expect(toastTitles()).toEqual(['Information: Andra'])
    })
    await expect.element(closeButton(0)).toHaveFocus()
  })

  test('the Close of the previous toast gets focus when the last toast goes and nothing else is left', async () => {
    function Vanishing() {
      const [shown, setShown] = useState(true)
      const toast = useToast()
      return shown ? (
        <button
          type="button"
          style={spaced}
          onClick={() => {
            toast.show({ title: 'Första' })
            toast.show({ title: 'Andra' })
            setShown(false)
          }}
        >
          Visa
        </button>
      ) : null
    }
    await render(
      <KvirnProvider>
        <Vanishing />
      </KvirnProvider>,
    )
    await press('Visa')
    await expect.element(page.getByRole('region', { name: 'Messages' })).toBeVisible()
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(closeButton(1)).toHaveFocus()

    await userEvent.keyboard('{Enter}')

    await vi.waitFor(() => {
      expect(toastTitles()).toEqual(['Information: Första'])
    })
    await expect.element(closeButton(0)).toHaveFocus()
  })

  test('with nothing to return focus to, body is not targeted and a development warning says so', async () => {
    function Vanishing() {
      const [shown, setShown] = useState(true)
      const toast = useToast()
      return shown ? (
        <button
          type="button"
          style={spaced}
          onClick={() => {
            toast.show({ title: 'Ensam' })
            setShown(false)
          }}
        >
          Visa
        </button>
      ) : null
    }
    await render(
      <KvirnProvider>
        <Vanishing />
      </KvirnProvider>,
    )
    await press('Visa')
    await expect.element(page.getByRole('region', { name: 'Messages' })).toBeVisible()
    await userEvent.tab()
    const focusSpy = vi.spyOn(document.body, 'focus')

    await userEvent.keyboard('{Enter}')

    await vi.waitFor(() => {
      expect(regionElement()).toBeNull()
    })
    expect(focusSpy).not.toHaveBeenCalled()
    expect(warnings()).toMatch(/nothing could take focus back/)
    focusSpy.mockRestore()
  })

  test('dismissing a toast that does not hold focus leaves focus where it is', async () => {
    await render(
      <Page
        actions={{
          Visa: showSaved,
          Ta: (toast) => {
            toast.dismissAll()
          },
        }}
      />,
    )
    await press('Visa')
    await press('Ta')

    await vi.waitFor(() => {
      expect(regionElement()).toBeNull()
    })
    await expect.element(button('Ta')).toHaveFocus()
  })

  test('a focused toast is never evicted: the new toast is ignored and focus stays', async () => {
    await render(
      <Page
        toast={{ limit: 1, autoDismiss: true }}
        actions={{
          Visa: showSaved,
          Ny: (toast) => {
            toast.show({ title: 'Exporten är klar' })
          },
        }}
      />,
    )
    await press('Visa')
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(closeButton(0)).toHaveFocus()

    button('Ny')
      .element()
      .dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wait(200)

    expect(toastTitles()).toEqual(['Success: Utkastet sparades'])
    await expect.element(closeButton(0)).toHaveFocus()
  })
})

describe('placement', () => {
  const pinned = (insetBlockEnd: number) => ({
    position: 'fixed' as const,
    insetBlockEnd,
    insetInlineEnd: 0,
  })

  test('the region moves to block-start only when the focused element would sit under it, its own inset included', async () => {
    // The theme puts the region at the block end with an inset: do the same here.
    const placing = document.createElement('style')
    placing.textContent =
      '.kv-toast-region { inset: auto 0 40px auto; margin: 0; max-inline-size: 300px }'
    document.head.append(placing)
    try {
      await render(
        <Page actions={{ Visa: showSaved }}>
          <button type="button" style={pinned(0)}>
            Längst ned
          </button>
          <button type="button" style={pinned(60)}>
            Över regionen
          </button>
        </Page>,
      )
      await press('Visa')
      await expect.element(page.getByRole('region', { name: 'Messages' })).toBeVisible()
      expect(regionElement()?.hasAttribute('data-placement')).toBe(false)

      button('Längst ned').element().focus()
      await wait(100)
      expect(regionElement()?.hasAttribute('data-placement')).toBe(false)

      button('Över regionen').element().focus()
      await vi.waitFor(() => {
        expect(regionElement()?.getAttribute('data-placement')).toBe('block-start')
      })
      button('Före').element().focus()
      await vi.waitFor(() => {
        expect(regionElement()?.hasAttribute('data-placement')).toBe(false)
      })
    } finally {
      placing.remove()
    }
  })
})

describe('a region taller than the viewport', () => {
  test('is a keyboard-reachable scroll container only while it overflows', async () => {
    const limiting = document.createElement('style')
    limiting.textContent = '.kv-toast-region { max-block-size: 40px; overflow-y: auto }'
    document.head.append(limiting)
    try {
      await render(
        <Page
          actions={{
            Visa: (toast) => {
              toast.show({
                title: 'Utkastet sparades',
                body: <p>Du hittar det under Mina ärenden.</p>,
              })
            },
          }}
        />,
      )
      await press('Visa')

      await vi.waitFor(() => {
        expect(regionElement()?.getAttribute('tabindex')).toBe('0')
      })
      expect(page.getByRole('region', { name: 'Messages' }).element()).toBe(regionElement())

      limiting.remove()
      await vi.waitFor(() => {
        expect(regionElement()?.hasAttribute('tabindex')).toBe(false)
      })
    } finally {
      limiting.remove()
    }
  })

  test('keeps its tabindex while it has focus, and drops it when focus leaves', async () => {
    const limiting = document.createElement('style')
    limiting.textContent = '.kv-toast-region { max-block-size: 40px; overflow-y: auto }'
    document.head.append(limiting)
    try {
      await render(
        <Page
          actions={{
            Visa: (toast) => {
              toast.show({
                title: 'Utkastet sparades',
                body: <p>Du hittar det under Mina ärenden.</p>,
              })
            },
          }}
        />,
      )
      await press('Visa')
      await vi.waitFor(() => {
        expect(regionElement()?.getAttribute('tabindex')).toBe('0')
      })
      await userEvent.tab()
      expect(document.activeElement).toBe(regionElement())

      limiting.remove()
      await wait(300)
      expect(regionElement()?.getAttribute('tabindex')).toBe('0')
      expect(document.activeElement).toBe(regionElement())

      await userEvent.tab({ shift: true })
      await vi.waitFor(() => {
        expect(regionElement()?.hasAttribute('tabindex')).toBe(false)
      })
    } finally {
      limiting.remove()
    }
  })

  test('focus on the region returns to the element focused before when the last toast goes', async () => {
    const limiting = document.createElement('style')
    limiting.textContent = '.kv-toast-region { max-block-size: 40px; overflow-y: auto }'
    document.head.append(limiting)
    try {
      await render(
        <Page
          actions={{
            Visa: (toast) => {
              toast.show({
                title: 'Utkastet sparades',
                body: <p>Du hittar det under Mina ärenden.</p>,
              })
            },
            Alla: (toast) => {
              toast.dismissAll()
            },
          }}
        />,
      )
      await press('Visa')
      await vi.waitFor(() => {
        expect(regionElement()?.getAttribute('tabindex')).toBe('0')
      })
      await userEvent.tab()
      await userEvent.tab()
      expect(document.activeElement).toBe(regionElement())

      button('Alla')
        .element()
        .dispatchEvent(new MouseEvent('click', { bubbles: true }))

      await vi.waitFor(() => {
        expect(regionElement()).toBeNull()
      })
      await expect.element(button('Alla')).toHaveFocus()
    } finally {
      limiting.remove()
    }
  })

  test('has no tabindex when it fits', async () => {
    await render(<Page actions={{ Visa: showSaved }} />)
    await press('Visa')
    await wait(100)

    expect(regionElement()?.hasAttribute('tabindex')).toBe(false)
  })
})

describe('while a modal is open', () => {
  function ModalExample({ remove = false }: { remove?: boolean }) {
    const toast = useToast()
    const [mounted, setMounted] = useState(true)
    return (
      <>
        {mounted ? (
          <Dialog.Root>
            <Dialog.Trigger>Öppna</Dialog.Trigger>
            <Dialog.Popup>
              <Dialog.Title>Ändra telefonnummer</Dialog.Title>
              <Dialog.Close />
              <button
                type="button"
                style={spaced}
                onClick={() => {
                  toast.show({ variant: 'success', title: 'Numret sparades' })
                  if (remove) {
                    setMounted(false)
                  }
                }}
              >
                Spara
              </button>
            </Dialog.Popup>
          </Dialog.Root>
        ) : null}
      </>
    )
  }

  const isModalOpen = () => document.querySelector('dialog:modal') !== null

  test('a toast shown meanwhile is held and announced nothing, then shown and announced when the dialog closes', async () => {
    await render(
      <KvirnProvider>
        <ModalExample />
      </KvirnProvider>,
    )
    const { spoken, stop } = recordAnnouncements()
    await press('Öppna')
    await vi.waitFor(() => {
      expect(isModalOpen()).toBe(true)
    })
    await press('Spara')
    await wait(400)
    expect(regionElement()).toBeNull()
    expect(spoken).toEqual([])

    await userEvent.keyboard('{Escape}')

    await expect.element(page.getByRole('region', { name: 'Messages' })).toBeVisible()
    expect(toastTitles()).toEqual(['Success: Numret sparades'])
    await expect.poll(() => spoken).toEqual(['Success: Numret sparades'])
    stop()
  })

  test('a held toast is shown when the dialog is removed from the page', async () => {
    await render(
      <KvirnProvider>
        <ModalExample remove />
      </KvirnProvider>,
    )
    await press('Öppna')
    await vi.waitFor(() => {
      expect(isModalOpen()).toBe(true)
    })
    await press('Spara')

    await expect.element(page.getByRole('region', { name: 'Messages' })).toBeVisible()
    expect(isModalOpen()).toBe(false)
    expect(toastTitles()).toEqual(['Success: Numret sparades'])
  })

  test('a held toast is dropped by dismiss(id) before it shows', async () => {
    function Held() {
      const toast = useToast()
      return (
        <Dialog.Root>
          <Dialog.Trigger>Öppna</Dialog.Trigger>
          <Dialog.Popup>
            <Dialog.Title>Ändra</Dialog.Title>
            <Dialog.Close />
            <button
              type="button"
              style={spaced}
              onClick={() => {
                toast.show({ id: 'saved', title: 'Numret sparades' })
                toast.dismiss('saved')
              }}
            >
              Spara
            </button>
          </Dialog.Popup>
        </Dialog.Root>
      )
    }
    await render(
      <KvirnProvider>
        <Held />
      </KvirnProvider>,
    )
    await press('Öppna')
    await vi.waitFor(() => {
      expect(isModalOpen()).toBe(true)
    })
    await press('Spara')
    await userEvent.keyboard('{Escape}')
    await vi.waitFor(() => {
      expect(isModalOpen()).toBe(false)
    })
    await wait(200)

    expect(regionElement()).toBeNull()
  })

  test('a timed toast does not expire while a modal is open, and expires after it closes', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    await render(<Page toast={{ autoDismiss: true }} actions={{ Visa: showSaved }} />)
    await press('Visa')
    await vi.advanceTimersByTimeAsync(300)
    // A bare modal: pressing a trigger would let the test's own waiting move the fake clock.
    const modal = document.createElement('dialog')
    document.body.append(modal)
    modal.showModal()
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(toastTitles()).toEqual(['Success: Utkastet sparades'])

    modal.close()
    modal.remove()
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(4000)
    expect(toastTitles()).toEqual(['Success: Utkastet sparades'])
    await vi.advanceTimersByTimeAsync(6000)

    expect(toastTitles()).toEqual([])
  })
})

describe('several providers on one page', () => {
  const showFirst: Run = (toast) => {
    toast.show({ id: 'first', title: 'Från första' })
  }
  const showSecond: Run = (toast) => {
    toast.show({ id: 'second', title: 'Från andra' })
  }

  test('share one region and one list: a trigger in either subtree shows into it', async () => {
    await render(
      <>
        <KvirnProvider>
          <Trigger label="Visa första" run={showFirst} />
        </KvirnProvider>
        <KvirnProvider>
          <Trigger label="Visa andra" run={showSecond} />
        </KvirnProvider>
      </>,
    )
    await press('Visa andra')
    await press('Visa första')

    expect(document.querySelectorAll('section.kv-toast-region')).toHaveLength(1)
    expect(toastTitles()).toEqual(['Information: Från andra', 'Information: Från första'])
  })

  test('share one limit: the first provider that mounted owns it, and a later toast option is ignored with a warning', async () => {
    await render(
      <>
        <KvirnProvider toast={{ limit: 1 }}>
          <Trigger label="Visa första" run={showFirst} />
        </KvirnProvider>
        <KvirnProvider toast={{ limit: 5 }}>
          <Trigger label="Visa andra" run={showSecond} />
        </KvirnProvider>
      </>,
    )
    await press('Visa första')
    await press('Visa andra')

    expect(toastTitles()).toEqual(['Information: Från första'])
    expect(warnings()).toMatch(/More than one <KvirnProvider> is on the page/)
    expect(warnings().match(/More than one <KvirnProvider>/g)).toHaveLength(1)
  })

  test('the next provider takes over as host when the first unmounts, and the toasts stay', async () => {
    function Handover() {
      const [hasFirst, setHasFirst] = useState(true)
      return (
        <>
          {hasFirst ? (
            <KvirnProvider>
              <Trigger label="Visa första" run={showFirst} />
            </KvirnProvider>
          ) : null}
          <KvirnProvider locale="sv" messages={sv}>
            <button
              type="button"
              style={spaced}
              onClick={() => {
                setHasFirst(false)
              }}
            >
              Ta bort första
            </button>
            <Trigger label="Visa andra" run={showSecond} />
          </KvirnProvider>
        </>
      )
    }
    await render(<Handover />)
    await press('Visa första')
    await expect.element(page.getByRole('region', { name: 'Messages' })).toBeVisible()

    await press('Ta bort första')

    await expect.element(page.getByRole('region', { name: 'Meddelanden' })).toBeVisible()
    expect(toastTitles()).toEqual(['Information: Från första'])
    expect(document.querySelectorAll('section.kv-toast-region')).toHaveLength(1)
    await press('Visa andra')
    expect(toastTitles()).toHaveLength(2)
  })

  function Handover({ hostLocale = 'en' }: { hostLocale?: string }) {
    const [hasFirst, setHasFirst] = useState(true)
    return (
      <>
        {hasFirst ? (
          <KvirnProvider locale={hostLocale}>
            <Trigger label="Visa första" run={showFirst} />
          </KvirnProvider>
        ) : null}
        <KvirnProvider locale="sv" messages={sv}>
          <button
            type="button"
            style={spaced}
            onClick={() => {
              setHasFirst(false)
            }}
          >
            Ta bort första
          </button>
        </KvirnProvider>
      </>
    )
  }
  const removeFirstProvider = () =>
    button('Ta bort första')
      .element()
      .dispatchEvent(new MouseEvent('click', { bubbles: true }))

  test('a handover announces nothing: the toasts that were spoken are not spoken again', async () => {
    await render(<Handover />)
    const { spoken, stop } = recordAnnouncements()
    await press('Visa första')
    await expect.poll(() => spoken).toEqual(['Information: Från första'])
    await wait(200)

    removeFirstProvider()
    await expect.element(page.getByRole('region', { name: 'Meddelanden' })).toBeVisible()
    await wait(500)

    expect(spoken).toEqual(['Information: Från första'])
    stop()
  })

  test('a handover keeps focus in the toast that had it', async () => {
    await render(<Handover />)
    await press('Visa första')
    await userEvent.tab()
    await expect.element(closeButton(0)).toHaveFocus()

    removeFirstProvider()

    await expect.element(page.getByRole('region', { name: 'Meddelanden' })).toBeVisible()
    await vi.waitFor(() => {
      expect(document.activeElement?.classList.contains('kv-alert-close')).toBe(true)
    })
    expect(document.activeElement?.closest('.kv-toast-region')).toBe(regionElement())
  })

  test('a handover keeps the pointer pause: a toast under the pointer does not time out', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    await render(<Handover />)
    await press('Visa första')
    await userEvent.hover(closeButton(0))

    removeFirstProvider()
    await vi.advanceTimersByTimeAsync(0)
    await new Promise((resolve) => {
      requestAnimationFrame(resolve)
    })
    await vi.advanceTimersByTimeAsync(600_000)

    expect(toastTitles()).toEqual(['Information: Från första'])
  })

  test('two React roots each with a provider share one region and announce once', async () => {
    await render(
      <KvirnProvider>
        <Trigger label="Visa första" run={showFirst} />
      </KvirnProvider>,
    )
    await render(
      <KvirnProvider>
        <Trigger label="Visa andra" run={showSecond} />
      </KvirnProvider>,
    )
    await press('Visa första')
    await press('Visa andra')

    expect(document.querySelectorAll('section.kv-toast-region')).toHaveLength(1)
    expect(toastTitles()).toEqual(['Information: Från första', 'Information: Från andra'])
  })

  test('a toast shown from a provider in another language marks its title and body with lang, not the status word or the list item', async () => {
    await render(
      <>
        <KvirnProvider>
          <Trigger label="Visa första" run={showFirst} />
        </KvirnProvider>
        <KvirnProvider locale="sv" messages={sv}>
          <Trigger
            label="Visa andra"
            run={(toast) => {
              toast.show({ id: 'second', title: 'Från andra', body: 'Brödtext' })
            }}
          />
        </KvirnProvider>
      </>,
    )
    await press('Visa första')
    await press('Visa andra')

    expect(document.querySelectorAll('.kv-toast-item[lang]')).toHaveLength(0)
    const [first, second] = [...document.querySelectorAll<HTMLElement>('.kv-toast-item')]
    expect(first?.querySelector('[lang]')).toBeNull()
    expect(second?.querySelector('.kv-alert-title [lang="sv"]')?.textContent).toBe('Från andra')
    expect(second?.querySelector('.kv-alert-title .kv-alert-status')?.closest('[lang]')).toBe(
      regionElement(),
    )
    expect(second?.querySelector('.kv-alert-body')?.getAttribute('lang')).toBe('sv')
    expect(second?.querySelector('.kv-alert-close')?.closest('[lang]')).toBe(regionElement())
  })
})

describe('a region that fills up', () => {
  const limited = async (run: () => Promise<void>) => {
    const limiting = document.createElement('style')
    limiting.textContent = '.kv-toast-region { max-block-size: 80px; overflow-y: auto }'
    document.head.append(limiting)
    try {
      await run()
    } finally {
      limiting.remove()
    }
  }
  let count = 0
  const showNext: Run = (toast) => {
    count += 1
    toast.show({ title: `Meddelande ${count}` })
  }

  test('scrolls the newest toast into view, without moving focus or the page', async () => {
    count = 0
    await limited(async () => {
      await render(<Page actions={{ Ny: showNext }} />)
      for (let index = 0; index < 5; index += 1) {
        await press('Ny')
      }
      const region = regionElement()
      await vi.waitFor(() => {
        expect(region?.scrollTop ?? 0).toBeGreaterThan(0)
      })
      const last = toastElements().at(-1)?.getBoundingClientRect()
      const box = region?.getBoundingClientRect()
      expect(last && box && last.bottom <= box.bottom + 1).toBe(true)
      await expect.element(button('Ny')).toHaveFocus()
    })
  })

  test('the first toasts, added in one commit, leave the newest in view, and a later one too', async () => {
    count = 0
    await limited(async () => {
      await render(
        <Page
          actions={{
            Tio: (toast) => {
              for (let index = 0; index < 10; index += 1) {
                showNext(toast)
              }
            },
            Ny: showNext,
          }}
        />,
      )
      const isNewestInView = () => {
        const region = regionElement()
        const last = toastElements().at(-1)?.getBoundingClientRect()
        const box = region?.getBoundingClientRect()
        return last !== undefined && box !== undefined && last.bottom <= box.bottom + 1
      }
      await press('Tio')
      await vi.waitFor(() => {
        expect(isNewestInView()).toBe(true)
      })
      const region = regionElement()
      expect(region && region.scrollTop + region.clientHeight >= region.scrollHeight - 2).toBe(true)
      await expect.element(button('Tio')).toHaveFocus()

      await press('Ny')
      await vi.waitFor(() => {
        expect(toastTitles()).toHaveLength(10)
      })
    })
  })

  test('does not scroll while the user is reading in it', async () => {
    count = 0
    await limited(async () => {
      await render(<Page actions={{ Ny: showNext }} />)
      for (let index = 0; index < 5; index += 1) {
        await press('Ny')
      }
      const region = regionElement()
      await vi.waitFor(() => {
        expect(region?.scrollTop ?? 0).toBeGreaterThan(0)
      })
      closeButton(0).element().focus()
      if (region) {
        region.scrollTop = 0
      }

      button('Ny')
        .element()
        .dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await wait(300)

      expect(region?.scrollTop).toBe(0)
    })
  })
})

describe('provider and development warnings', () => {
  test('useToast outside a KvirnProvider does nothing and warns once', async () => {
    function Alone() {
      const toast = useToast()
      return (
        <button
          type="button"
          onClick={() => {
            toast.show({ title: 'Utkastet sparades' })
            toast.show({ title: 'Igen' })
            toast.dismissAll()
            toast.focus()
          }}
        >
          Visa
        </button>
      )
    }
    await render(<Alone />)
    await press('Visa')

    expect(regionElement()).toBeNull()
    expect(warnings().match(/useToast\(\) was used outside a <KvirnProvider>/g)).toHaveLength(1)
  })

  test('show returns the id of the toast, given or generated', async () => {
    const ids: string[] = []
    await render(
      <Page
        actions={{
          Visa: (toast) => {
            ids.push(toast.show({ id: 'gen', title: 'Ett' }), toast.show({ title: 'Två' }))
          },
        }}
      />,
    )
    await press('Visa')

    expect(ids[0]).toBe('gen')
    expect(ids[1]).not.toBe('')
  })

  test('a toast shown before the provider has mounted is dropped with a warning', () => {
    const ids: string[] = []
    function Early() {
      const toast = useToast()
      ids.push(toast.show({ title: 'För tidigt' }))
      return null
    }
    renderToString(
      <KvirnProvider>
        <Early />
      </KvirnProvider>,
    )

    expect(ids).toEqual([''])
    expect(warnings()).toMatch(/before the <KvirnProvider> has mounted/)
  })

  test('a timer that autoDismiss asked for is dropped for a toast with an action, with one warning', async () => {
    await render(
      <Page
        toast={{ autoDismiss: true }}
        actions={{
          Visa: (toast) => {
            toast.show({ title: 'Ett', action: { label: 'Ångra', onPress: () => {} } })
            toast.show({ title: 'Två', action: { label: 'Ångra', onPress: () => {} } })
          },
        }}
      />,
    )
    await press('Visa')

    expect(warnings().match(/never times out/g)).toHaveLength(1)
  })

  test('a variant that is not info or success warns once and shows an info toast', async () => {
    await render(
      <Page
        actions={{
          Visa: (toast) => {
            toast.show({ title: 'Fel', variant: 'danger' as ToastVariant })
            toast.show({ title: 'Varning', variant: 'danger' as ToastVariant })
          },
        }}
      />,
    )
    await press('Visa')

    expect(toastElements().every((element) => element.classList.contains('kv-alert--info'))).toBe(
      true,
    )
    expect(warnings().match(/no "danger" toast/g)).toHaveLength(1)
  })

  test('a nested KvirnProvider uses the outer region, and warns when it is given a toast prop', async () => {
    await render(
      <Page actions={{}}>
        <KvirnProvider toast={{ limit: 1 }}>
          <Trigger label="Visa" run={showSaved} />
        </KvirnProvider>
      </Page>,
    )
    await press('Visa')

    expect(document.querySelectorAll('section.kv-toast-region')).toHaveLength(1)
    expect(toastTitles()).toEqual(['Success: Utkastet sparades'])
    expect(warnings()).toMatch(/nested <KvirnProvider> received `toast`/)
  })

  test('changing the toast options keeps the toasts that are shown', async () => {
    function Switchable() {
      const [autoDismiss, setAutoDismiss] = useState(false)
      return (
        <KvirnProvider toast={{ limit: 2, autoDismiss }}>
          <Trigger label="Visa" run={showSaved} />
          <button
            type="button"
            style={spaced}
            onClick={() => {
              setAutoDismiss(true)
            }}
          >
            Ändra
          </button>
        </KvirnProvider>
      )
    }
    await render(<Switchable />)
    const { spoken, stop } = recordAnnouncements()
    await press('Visa')
    await expect.poll(() => spoken).toEqual(['Success: Utkastet sparades'])
    await press('Ändra')
    await wait(400)

    expect(toastTitles()).toEqual(['Success: Utkastet sparades'])
    expect(spoken).toEqual(['Success: Utkastet sparades'])
    stop()
  })

  test('an outside press still light-dismisses a Popover under the toast layer', async () => {
    await render(
      <Page actions={{ Visa: showSaved }}>
        <p>Text utanför</p>
        <Popover.Root>
          <Popover.Trigger>Hjälp</Popover.Trigger>
          <Popover.Popup aria-label="Hjälp om tjänsten">
            <p>Tjänsten drivs av kommunen.</p>
          </Popover.Popup>
        </Popover.Root>
      </Page>,
    )
    await press('Visa')
    await press('Hjälp')
    await expect.element(page.getByText('Tjänsten drivs av kommunen.')).toBeVisible()
    closeButton(0).element().focus()
    await wait(100)
    await expect.element(page.getByText('Tjänsten drivs av kommunen.')).toBeVisible()

    await userEvent.click(page.getByText('Text utanför'))

    await expect.element(page.getByText('Tjänsten drivs av kommunen.')).not.toBeVisible()
  })
})

describe('types', () => {
  test('useToast returns show, dismiss, dismissAll and focus', () => {
    expectTypeOf<UseToastResult['show']>().parameter(0).toEqualTypeOf<ToastShowOptions>()
    expectTypeOf<UseToastResult['show']>().returns.toEqualTypeOf<string>()
    expectTypeOf<UseToastResult['dismiss']>().returns.toEqualTypeOf<boolean>()
    expectTypeOf<ToastVariant>().toEqualTypeOf<'info' | 'success'>()
  })
})
