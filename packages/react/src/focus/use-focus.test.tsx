import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { StrictMode, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { useToast } from '../toast/use-toast.ts'
import { FocusScope } from './focus-scope.tsx'
import type { FocusScopeProps } from './focus-scope.tsx'
import { useFocus } from './use-focus.ts'
import type { UseFocusOptions, UseFocusResult } from './use-focus.ts'

// Contract: focus.a11y.md.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

type DrawerProps = Omit<UseFocusOptions, 'active'> & { children?: ReactNode; strict?: boolean }

/** A drawer of your own: the opener, a scope that is only hidden when closed, and a button after it. */
function Drawer({ children, ...options }: DrawerProps) {
  const [open, setOpen] = useState(false)
  const { scopeProps } = useFocus({ ...options, active: open })
  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
      <button type="button" onClick={() => setOpen(true)}>
        Öppna
      </button>
      <aside {...scopeProps} aria-label="Filter" hidden={!open}>
        {children ?? (
          <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
            <button type="button">Första</button>
            <button type="button" id="second">
              Mellan
            </button>
            <button type="button" onClick={() => setOpen(false)}>
              Sista
            </button>
          </div>
        )}
      </aside>
      <button type="button">Efter</button>
    </div>
  )
}

const opener = () => page.getByRole('button', { name: 'Öppna' })
const byName = (name: string) => page.getByRole('button', { name, exact: true })

async function openDrawer() {
  await userEvent.click(opener())
}

describe('use-focus.test.tsx › keyboard', () => {
  test('Tab on the last stop wraps to the first', async () => {
    await render(<Drawer contain="loop" onEscape={() => {}} />)
    await openDrawer()
    byName('Sista').element().focus()
    await userEvent.tab()
    await expect.element(byName('Första')).toHaveFocus()
  })

  test('Shift+Tab on the first stop wraps to the last', async () => {
    await render(<Drawer contain="loop" onEscape={() => {}} />)
    await openDrawer()
    await expect.element(byName('Första')).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(byName('Sista')).toHaveFocus()
  })

  test('Tab inside the loop moves on as the browser does', async () => {
    await render(<Drawer contain="loop" onEscape={() => {}} />)
    await openDrawer()
    await userEvent.tab()
    await expect.element(byName('Mellan')).toHaveFocus()
  })

  test('the loop reads the stops at key time, so a stop added later is the last', async () => {
    function Growing() {
      const [extra, setExtra] = useState(false)
      return (
        <Drawer contain="loop" onEscape={() => {}}>
          <button type="button" onClick={() => setExtra(true)}>
            Lägg till
          </button>
          {extra && <button type="button">Ny</button>}
        </Drawer>
      )
    }
    await render(<Growing />)
    await openDrawer()
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()
    await expect.element(byName('Ny')).toHaveFocus()
    await userEvent.tab()
    await expect.element(byName('Lägg till')).toHaveFocus()
  })

  test('inert keeps Tab inside and restores siblings', async () => {
    function Page() {
      const [open, setOpen] = useState(false)
      const { scopeProps } = useFocus({ active: open, contain: 'inert', onEscape: () => {} })
      return (
        <div>
          <main data-testid="page">
            <button type="button" onClick={() => setOpen(true)}>
              Öppna
            </button>
          </main>
          <nav data-testid="already" inert>
            Redan inert
          </nav>
          <div data-testid="wrapper">
            <aside {...scopeProps} aria-label="Filter" hidden={!open}>
              <button type="button" onClick={() => setOpen(false)}>
                Stäng
              </button>
            </aside>
            <p data-testid="inner-sibling">Text</p>
          </div>
        </div>
      )
    }
    await render(<Page />)
    await openDrawer()
    await expect.element(page.getByTestId('page')).toHaveAttribute('inert')
    await expect.element(page.getByTestId('inner-sibling')).toHaveAttribute('inert')
    for (let presses = 0; presses < 3; presses++) {
      await userEvent.tab()
      expect(document.activeElement?.closest('main, nav, [data-testid="inner-sibling"]')).toBeNull()
    }
    await userEvent.click(byName('Stäng'))
    await expect.element(page.getByTestId('page')).not.toHaveAttribute('inert')
    await expect.element(page.getByTestId('inner-sibling')).not.toHaveAttribute('inert')
    await expect.element(page.getByTestId('already')).toHaveAttribute('inert')
  })

  test('inert leaves the Announcer and Toast regions untouched', async () => {
    function Page() {
      const [open, setOpen] = useState(false)
      const toast = useToast()
      const { scopeProps } = useFocus({ active: open, contain: 'inert', onEscape: () => {} })
      return (
        <div>
          <button
            type="button"
            onClick={() => {
              toast.show({ variant: 'success', title: 'Sparat' })
              setOpen(true)
            }}
          >
            Öppna
          </button>
          <aside {...scopeProps} aria-label="Filter" hidden={!open}>
            <button type="button">Inne</button>
          </aside>
        </div>
      )
    }
    const { container } = await render(
      <KvirnProvider>
        <Page />
      </KvirnProvider>,
    )
    await openDrawer()
    const body = container.ownerDocument.body
    await vi.waitFor(() => expect(body.querySelector('.kv-toast-region')).not.toBeNull())
    expect(body.querySelector('output[aria-live]')?.closest('[inert]')).toBeNull()
    expect(body.querySelector('[role="alert"]')?.closest('[inert]')).toBeNull()
    expect(body.querySelector('.kv-toast-region')?.closest('[inert]')).toBeNull()
  })

  test('Escape calls onEscape', async () => {
    const onEscape = vi.fn<() => void>()
    await render(<Drawer contain="loop" onEscape={onEscape} />)
    await openDrawer()
    await userEvent.keyboard('{Escape}')
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  test('Escape does nothing when contain is off', async () => {
    const onEscape = vi.fn<() => void>()
    await render(<Drawer onEscape={onEscape} />)
    await openDrawer()
    await userEvent.keyboard('{Escape}')
    expect(onEscape).not.toHaveBeenCalled()
  })

  test('Tab after a move continues after the target', async () => {
    function Wizard() {
      const [step, setStep] = useState('1')
      useFocus({ moveOn: { key: step } })
      return (
        <>
          <button type="button" onClick={() => setStep('2')}>
            Nästa
          </button>
          <h1>Steg {step}</h1>
          <button type="button">Fortsätt</button>
        </>
      )
    }
    await render(<Wizard />)
    await userEvent.click(byName('Nästa'))
    await expect.element(page.getByRole('heading', { name: 'Steg 2' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(byName('Fortsätt')).toHaveFocus()
  })

  test('Shift+Tab after a move goes back to the stop before the target', async () => {
    function Wizard() {
      const [step, setStep] = useState('1')
      useFocus({ moveOn: { key: step } })
      return (
        <>
          <button type="button" onClick={() => setStep('2')}>
            Nästa
          </button>
          <h1>Steg {step}</h1>
        </>
      )
    }
    await render(<Wizard />)
    await userEvent.click(byName('Nästa'))
    await userEvent.tab({ shift: true })
    await expect.element(byName('Nästa')).toHaveFocus()
  })
})

describe('use-focus.test.tsx › moveOn', () => {
  test('does not move on the first render, and adds no tabindex that stays', async () => {
    await render(<MoveProbe stepKey="1" />)
    expect(document.activeElement).toBe(document.body)
    await page.getByRole('button', { name: 'Steg' }).click()
    const heading = page.getByRole('heading', { level: 2 }).element()
    expect(document.activeElement).toBe(heading)
    expect(heading.getAttribute('tabindex')).toBe('-1')
    byName('Steg').element().focus()
    expect(heading.hasAttribute('tabindex')).toBe(false)
  })

  test('onLost is called when no element matches the selector', async () => {
    const onLost = vi.fn<() => void>()
    await render(<MoveProbe stepKey="1" selector="h6" onLost={onLost} />)
    await page.getByRole('button', { name: 'Steg' }).click()
    expect(onLost).toHaveBeenCalledTimes(1)
  })
})

function MoveProbe({
  stepKey,
  selector = 'h2',
  onLost,
}: {
  stepKey: string
  selector?: string
  onLost?: () => void
}) {
  const [step, setStep] = useState(stepKey)
  const containerRef = useRef<HTMLDivElement>(null)
  useFocus({ moveOn: { key: step, selector, containerRef }, onLost })
  return (
    <div ref={containerRef}>
      <button type="button" onClick={() => setStep('2')}>
        Steg
      </button>
      <h2>Rubrik {step}</h2>
    </div>
  )
}

describe('use-focus.test.tsx › focus management', () => {
  test('focus moves to the first stop when the scope opens', async () => {
    await render(<Drawer />)
    await openDrawer()
    await expect.element(byName('Första')).toHaveFocus()
  })

  test('initialFocus container focuses the scope without leaving a Tab stop', async () => {
    await render(<Drawer initialFocus="container" />)
    await openDrawer()
    const scope = page.getByRole('complementary').element()
    expect(document.activeElement).toBe(scope)
    await userEvent.tab()
    await expect.element(byName('Första')).toHaveFocus()
    expect(scope.hasAttribute('tabindex')).toBe(false)
  })

  test('initialFocus none leaves focus on the opener', async () => {
    await render(<Drawer initialFocus="none" />)
    await openDrawer()
    await expect.element(opener()).toHaveFocus()
  })

  test('initialFocus as a selector focuses that element', async () => {
    await render(<Drawer initialFocus="#second" />)
    await openDrawer()
    await expect.element(byName('Mellan')).toHaveFocus()
  })

  test('initialFocus as a selector falls through to the first stop when it matches nothing', async () => {
    await render(<Drawer initialFocus="#gone" />)
    await openDrawer()
    await expect.element(byName('Första')).toHaveFocus()
  })

  test('a scope with no focusable stop focuses the container', async () => {
    await render(
      <Drawer>
        <p>Bara text</p>
      </Drawer>,
    )
    await openDrawer()
    expect(document.activeElement).toBe(page.getByRole('complementary').element())
  })

  test('focus returns to the opener when the scope closes', async () => {
    await render(<Drawer />)
    await openDrawer()
    await userEvent.click(byName('Sista'))
    await expect.element(opener()).toHaveFocus()
  })

  test('focus goes to finalFocusRef first, then the trigger, then the opener', async () => {
    function Order() {
      const finalRef = useRef<HTMLButtonElement>(null)
      const triggerRef = useRef<HTMLButtonElement>(null)
      const [open, setOpen] = useState(false)
      const [useFinal, setUseFinal] = useState(true)
      const { scopeProps } = useFocus({
        active: open,
        finalFocusRef: useFinal ? finalRef : undefined,
        triggerRef,
      })
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Öppna
          </button>
          <button type="button" ref={finalRef}>
            Slutmål
          </button>
          <button type="button" ref={triggerRef}>
            Utlösare
          </button>
          <button type="button" onClick={() => setUseFinal(false)}>
            Utan slutmål
          </button>
          <aside {...scopeProps} aria-label="Filter" hidden={!open}>
            <button type="button" onClick={() => setOpen(false)}>
              Stäng
            </button>
          </aside>
        </>
      )
    }
    await render(<Order />)
    await openDrawer()
    await userEvent.click(byName('Stäng'))
    await expect.element(byName('Slutmål')).toHaveFocus()
    await userEvent.click(byName('Utan slutmål'))
    await openDrawer()
    await userEvent.click(byName('Stäng'))
    await expect.element(byName('Utlösare')).toHaveFocus()
  })

  test('focus the user moved elsewhere is not taken back', async () => {
    function Moves() {
      const [open, setOpen] = useState(false)
      const { scopeProps } = useFocus({ active: open })
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Öppna
          </button>
          <button type="button" onClick={() => setOpen(false)}>
            Stäng utanför
          </button>
          <aside {...scopeProps} aria-label="Filter" hidden={!open}>
            <button type="button">Inne</button>
          </aside>
        </>
      )
    }
    await render(<Moves />)
    await openDrawer()
    await userEvent.click(byName('Stäng utanför'))
    await expect.element(byName('Stäng utanför')).toHaveFocus()
  })

  test('restore false leaves focus where it is', async () => {
    await render(<Drawer restore={false} />)
    await openDrawer()
    await userEvent.click(byName('Sista'))
    expect(document.activeElement).not.toBe(opener().element())
  })

  test('onLost is called when nothing can take focus on return', async () => {
    const onLost = vi.fn<() => void>()
    function Lost() {
      const [open, setOpen] = useState(false)
      const [showOpener, setShowOpener] = useState(true)
      const { scopeProps } = useFocus({ active: open, onLost })
      return (
        <>
          {showOpener && (
            <button type="button" onClick={() => setOpen(true)}>
              Öppna
            </button>
          )}
          <aside {...scopeProps} aria-label="Filter" hidden={!open}>
            <button
              type="button"
              onClick={() => {
                setShowOpener(false)
                setOpen(false)
              }}
            >
              Stäng
            </button>
          </aside>
        </>
      )
    }
    await render(<Lost />)
    await openDrawer()
    await userEvent.click(byName('Stäng'))
    expect(onLost).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(document.body)
  })

  test('survives StrictMode: the loop, the restore and the inert undo still work', async () => {
    function Page() {
      const [open, setOpen] = useState(false)
      const { scopeProps } = useFocus({ active: open, contain: 'inert', onEscape: () => {} })
      return (
        <div>
          <main data-testid="page">
            <button type="button" onClick={() => setOpen(true)}>
              Öppna
            </button>
          </main>
          <div>
            <aside {...scopeProps} aria-label="Filter" hidden={!open}>
              <button type="button" onClick={() => setOpen(false)}>
                Stäng
              </button>
            </aside>
          </div>
        </div>
      )
    }
    await render(
      <StrictMode>
        <Page />
      </StrictMode>,
    )
    await openDrawer()
    await expect.element(byName('Stäng')).toHaveFocus()
    await expect.element(page.getByTestId('page')).toHaveAttribute('inert')
    await userEvent.click(byName('Stäng'))
    await expect.element(page.getByTestId('page')).not.toHaveAttribute('inert')
    await expect.element(opener()).toHaveFocus()
  })
})

describe('use-focus.test.tsx › FocusScope', () => {
  test('FocusScope renders the element given to as and merges the ref', async () => {
    const ref = { current: null as HTMLElement | null }
    await render(
      <FocusScope active ref={ref} as="aside" aria-label="Filter">
        <button type="button">Inne</button>
      </FocusScope>,
    )
    expect(ref.current?.tagName).toBe('ASIDE')
    await expect.element(byName('Inne')).toHaveFocus()
  })

  test('FocusScope with a tag outside its list warns once and renders a div', async () => {
    const notAllowed = 'ul' as FocusScopeProps['as']
    const ref = { current: null as HTMLElement | null }
    await render(
      <FocusScope active ref={ref} as={notAllowed}>
        <button type="button">Inne</button>
      </FocusScope>,
    )
    expect(ref.current?.tagName).toBe('DIV')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('FocusScope as="ul"')
  })

  test('FocusScope loops Tab and calls onEscape', async () => {
    const onEscape = vi.fn<() => void>()
    await render(
      <FocusScope active contain="loop" onEscape={onEscape}>
        <button type="button">A</button>
        <button type="button">B</button>
      </FocusScope>,
    )
    await userEvent.tab({ shift: true })
    await expect.element(byName('B')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  test('a consumer onKeyDown still runs', async () => {
    const onKeyDown = vi.fn<() => void>()
    await render(
      <FocusScope active contain="loop" onEscape={() => {}} onKeyDown={onKeyDown}>
        <button type="button">A</button>
      </FocusScope>,
    )
    await userEvent.keyboard('x')
    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })
})

describe('use-focus.test.tsx › development warning', () => {
  test('contain without onEscape warns once with focus-scope-no-exit text', async () => {
    await render(<Drawer contain="loop" />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('no way out')
  })

  test('contain with onEscape does not warn', async () => {
    await render(<Drawer contain="loop" onEscape={() => {}} />)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('use-focus.test.tsx › imperative and types', () => {
  test('focusFirstAvailable skips a disabled element and never focuses body', async () => {
    let result: UseFocusResult | undefined
    function Probe() {
      const focus = useFocus()
      useEffect(() => {
        result = focus
      })
      return (
        <>
          <button type="button" disabled>
            Av
          </button>
          <button type="button">På</button>
        </>
      )
    }
    await render(<Probe />)
    expect(
      result?.focusFirstAvailable([
        null,
        byName('Av').element() as HTMLElement,
        byName('På').element() as HTMLElement,
      ]),
    ).toBe(true)
    await expect.element(byName('På')).toHaveFocus()
    expect(result?.focusFirstAvailable([null])).toBe(false)
    expect(result?.isFocusTarget(byName('Av').element() as HTMLElement)).toBe(false)
  })

  test('renders nothing on the server', () => {
    function Probe() {
      useFocus({ active: true, contain: 'inert', onEscape: () => {} })
      return <p>Server</p>
    }
    expect(renderToString(<Probe />)).toBe('<p>Server</p>')
  })

  test('exports its option and prop types', () => {
    expectTypeOf<UseFocusOptions['contain']>().toEqualTypeOf<false | 'loop' | 'inert' | undefined>()
    expectTypeOf<FocusScopeProps['contain']>().toEqualTypeOf<UseFocusOptions['contain']>()
  })
})

describe('use-focus.test.tsx › accessibility', () => {
  test('an open scope has no axe violations', async () => {
    const { container } = await render(<Drawer contain="loop" onEscape={() => {}} />)
    await openDrawer()
    await expectNoA11yViolations(container)
  })
})
