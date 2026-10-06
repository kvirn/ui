import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import {
  Button,
  ButtonGroup,
  Popover,
  PopoverClose,
  PopoverPopup,
  PopoverRoot,
  PopoverTrigger,
  Toolbar,
} from '../index.ts'
import type {
  PopoverChangeDetails,
  PopoverChangeReason,
  PopoverRootProps,
  UsePopoverOptions,
  UsePopoverResult,
} from '../index.ts'
import { usePopover } from './use-popover.ts'

// Contract: popover.a11y.md. Component tests load no theme: the popup is the browser's own
// `popover` element with the inline placement the hook sets.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function Example(rootProps: PopoverRootProps) {
  return (
    <>
      {/* Above the trigger, so the popup (placed under it) never covers the text a test presses. */}
      <p>Text utanför</p>
      <button type="button">Före</button>
      <Popover.Root {...rootProps}>
        <Popover.Trigger>Hjälp</Popover.Trigger>
        <Popover.Popup aria-label="Hjälp om tjänsten">
          <p>Tjänsten drivs av kommunen.</p>
          <Popover.Close>Stäng</Popover.Close>
        </Popover.Popup>
      </Popover.Root>
      <button type="button">Efter</button>
    </>
  )
}

const trigger = () => page.getByRole('button', { name: 'Hjälp', exact: true })
const closeButton = () => page.getByRole('button', { name: 'Stäng', exact: true })
const popupElement = () => document.querySelector<HTMLElement>('.kv-popover-popup')
const isShown = () => popupElement()?.matches(':popover-open') === true
const triggerElement = () => trigger().element()

describe('rendering', () => {
  test('a closed popover: the trigger is wired to a hidden popup', async () => {
    const { container } = await render(<Example />)
    const button = triggerElement()
    const popup = popupElement()
    expect(button.getAttribute('type')).toBe('button')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.getAttribute('aria-haspopup')).toBe('dialog')
    expect(button.hasAttribute('data-open')).toBe(false)
    expect(popup?.getAttribute('popover')).toBe('auto')
    expect(popup?.getAttribute('role')).toBe('dialog')
    expect(popup?.id).not.toBe('')
    expect(button.getAttribute('aria-controls')).toBe(popup?.id)
    expect(popup?.hasAttribute('data-open')).toBe(false)
    expect(popup?.getAttribute('data-placement')).toBe('bottom-start')
    expect(isShown()).toBe(false)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('an open popover: expanded, shown, data-open, no axe violations', async () => {
    const { container } = await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
    expect(triggerElement().hasAttribute('data-open')).toBe(true)
    expect(popupElement()?.hasAttribute('data-open')).toBe(true)
    await expect.element(page.getByRole('dialog', { name: 'Hjälp om tjänsten' })).toBeVisible()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('defaultOpen shows the popup from the start', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
  })

  test('forwards refs, className and native props, and merges them with its own', async () => {
    const triggerRef = createRef<HTMLButtonElement>()
    const popupRef = createRef<HTMLDivElement>()
    const closeRef = createRef<HTMLButtonElement>()
    await render(
      <Popover.Root defaultOpen>
        <Popover.Trigger ref={triggerRef} className="egen" data-egen="trigger">
          Hjälp
        </Popover.Trigger>
        <Popover.Popup ref={popupRef} className="egen" aria-label="Hjälp" data-egen="popup">
          <Popover.Close ref={closeRef} className="egen">
            Stäng
          </Popover.Close>
        </Popover.Popup>
      </Popover.Root>,
    )
    expect(triggerRef.current).toBe(triggerElement())
    expect(popupRef.current).toBe(popupElement())
    expect(closeRef.current).toBe(closeButton().element())
    expect(triggerRef.current?.className).toBe('egen kv-popover-trigger')
    expect(popupRef.current?.className).toBe('egen kv-popover-popup')
    expect(closeRef.current?.className).toBe('egen kv-popover-close')
    expect(triggerRef.current?.getAttribute('data-egen')).toBe('trigger')
    expect(popupRef.current?.getAttribute('data-egen')).toBe('popup')
    // The part's own ref still reaches the hook: the popup was placed next to the trigger.
    await expect.poll(() => popupRef.current?.style.position).toBe('fixed')
  })

  test('render replaces the element and gives the state', async () => {
    const states: boolean[] = []
    await render(
      <Popover.Root>
        <Popover.Trigger
          render={(partProps) => (
            <button {...partProps} data-egen="render">
              Hjälp
            </button>
          )}
        />
        <Popover.Popup
          aria-label="Hjälp"
          render={(partProps, state) => {
            states.push(state.isOpen)
            return <section {...partProps} />
          }}
        >
          Text
        </Popover.Popup>
      </Popover.Root>,
    )
    const customTrigger = trigger().element()
    expect(customTrigger.getAttribute('data-egen')).toBe('render')
    expect(customTrigger.getAttribute('aria-expanded')).toBe('false')
    expect(popupElement()?.tagName).toBe('SECTION')
    expect(states).toContain(false)
    await userEvent.click(trigger())
    expect(states.at(-1)).toBe(true)
  })

  test('usePopover spreads the same props on your own elements', async () => {
    function Own() {
      const popover = usePopover()
      return (
        <>
          <button {...popover.triggerProps}>Hjälp</button>
          <div {...popover.popupProps} aria-label="Hjälp om tjänsten">
            <button {...popover.closeProps}>Stäng</button>
          </div>
        </>
      )
    }
    await render(<Own />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await userEvent.click(closeButton())
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })
})

describe('opening and closing', () => {
  test('a press on the trigger opens the popup, and focus stays on the trigger', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: PopoverChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(trigger()).toHaveFocus()
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger-press', event: expect.any(Event) }),
    )
  })

  test('a second press on the trigger closes it, and does not open it again', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: PopoverChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(false)
    // Wait out anything the platform's own light dismiss still queues.
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(isShown()).toBe(false)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('false')
    expect(onOpenChange.mock.calls.map(([isOpen]) => isOpen)).toEqual([true, false])
  })

  test('Enter and Space on the trigger toggle the popup', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: PopoverChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(isShown).toBe(true)
    await expect.element(trigger()).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect.poll(isShown).toBe(false)
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'trigger-press' }),
    )
    await userEvent.keyboard('{Enter}')
    await expect.poll(isShown).toBe(true)
  })

  test('Tab focuses the trigger, and is one stop', async () => {
    await render(<Example />)
    page.getByRole('button', { name: 'Före' }).element().focus()
    await userEvent.tab()
    await expect.element(trigger()).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('Shift+Tab leaves the trigger backwards', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('Enter and Space on Close close the popup and return focus to the trigger', async () => {
    await render(<Example />)
    triggerElement().focus()
    for (const key of ['{Enter}', ' ']) {
      await userEvent.keyboard('{Enter}')
      await expect.poll(isShown).toBe(true)
      await userEvent.tab()
      await expect.element(closeButton()).toHaveFocus()
      await userEvent.keyboard(key)
      await expect.poll(isShown).toBe(false)
      await expect.element(trigger()).toHaveFocus()
    }
  })

  test('Escape closes the popup and returns focus to the trigger from inside the popup', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: PopoverChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    closeButton().element().focus()
    await expect.element(closeButton()).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape' }),
    )
  })

  test('a popup that starts open and is closed by the platform while focus was never in it does not move focus to the trigger', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    const other = document.createElement('div')
    other.popover = 'auto'
    document.body.append(other)
    try {
      other.showPopover()
      await expect.poll(isShown).toBe(false)
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(document.activeElement).toBe(document.body)
    } finally {
      other.remove()
    }
  })

  test('Close returns focus to the trigger when a pointer opened the popup without focusing the trigger', async () => {
    await render(<Example />)
    // Script clicks focus nothing, as a press does in Safari.
    ;(triggerElement() as HTMLElement).click()
    await expect.poll(isShown).toBe(true)
    expect(document.activeElement).toBe(document.body)
    ;(closeButton().element() as HTMLElement).click()
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })

  test('a light dismiss that finds focus lost to the page after it was inside the popup returns focus to the trigger', async () => {
    await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    closeButton().element().focus()
    closeButton().element().blur()
    expect(document.activeElement).toBe(document.body)
    const other = document.createElement('div')
    other.popover = 'auto'
    document.body.append(other)
    try {
      other.showPopover()
      await expect.poll(isShown).toBe(false)
      await expect.element(trigger()).toHaveFocus()
    } finally {
      other.remove()
    }
  })

  test('an outside press with the trigger scrolled out of view returns focus to it without scrolling the page, and Escape scrolls', async () => {
    await render(
      <>
        <Example />
        <div style={{ blockSize: '3000px' }}>
          <p style={{ marginBlockStart: '2000px' }}>Långt ner</p>
        </div>
      </>,
    )
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    closeButton().element().focus()
    const focus = vi.spyOn(triggerElement(), 'focus')
    window.scrollTo(0, 1500)
    await expect.poll(() => window.scrollY).toBe(1500)
    await userEvent.click(page.getByText('Långt ner'))
    await expect.poll(isShown).toBe(false)
    expect(window.scrollY).toBe(1500)
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: true })
    window.scrollTo(0, 0)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    closeButton().element().focus()
    focus.mockClear()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: false })
  })

  test('Escape closes the popup with focus on the trigger, which keeps focus', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })

  test('Escape does nothing while the popup is closed', async () => {
    const onOpenChange = vi.fn<(...args: unknown[]) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    triggerElement().focus()
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).not.toHaveBeenCalled()
    await expect.element(trigger()).toHaveFocus()
  })

  test('a press outside closes the popup', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: PopoverChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await userEvent.click(page.getByText('Text utanför'))
    await expect.poll(isShown).toBe(false)
    expect(onOpenChange).toHaveBeenCalledTimes(2)
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'outside-press' }),
    )
  })

  test('a press on another control closes the popup, and that control keeps the focus', async () => {
    await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Efter' }))
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('a press inside the popup does not close it', async () => {
    const onOpenChange = vi.fn<(...args: unknown[]) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await userEvent.click(page.getByText('Tjänsten drivs av kommunen.'))
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(isShown()).toBe(true)
    expect(onOpenChange).toHaveBeenCalledTimes(1)
  })

  test('Close closes the popup and returns focus to the trigger', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: PopoverChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await userEvent.click(closeButton())
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'close-press' }),
    )
  })

  test('the platform hiding the popup (another auto popover opened) closes it in the state too', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: PopoverChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    popupElement()?.hidePopover()
    await expect.poll(() => triggerElement().getAttribute('aria-expanded')).toBe('false')
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'light-dismiss' }),
    )
  })

  test('Tab goes from the trigger into the popup, and Shift+Tab goes back', async () => {
    await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await userEvent.tab()
    await expect.element(closeButton()).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    // The popup stays open: Tab is never a dismissal.
    expect(isShown()).toBe(true)
    await userEvent.tab({ shift: true })
    await expect.element(closeButton()).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(trigger()).toHaveFocus()
  })

  test('opening does not move focus into the popup', async () => {
    await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    expect(popupElement()?.contains(document.activeElement)).toBe(false)
  })
})

describe('controlled', () => {
  test('open decides: onOpenChange reports and the popup waits for you', async () => {
    const onOpenChange = vi.fn<(...args: unknown[]) => void>()
    await render(<Example open={false} onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger-press' }),
    )
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(isShown()).toBe(false)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('false')
  })

  test('follows the open prop in both directions', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen((current) => !current)}>
            Växla
          </button>
          <Example open={open} onOpenChange={setOpen} />
          <output data-testid="open">{String(open)}</output>
        </>
      )
    }
    await render(<Controlled />)
    await userEvent.click(page.getByRole('button', { name: 'Växla' }))
    await expect.poll(isShown).toBe(true)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByTestId('open')).toHaveTextContent('false')
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(page.getByTestId('open')).toHaveTextContent('true')
  })
})

describe('layers', () => {
  function Nested() {
    return (
      <Popover.Root>
        <Popover.Trigger>Yttre</Popover.Trigger>
        <Popover.Popup aria-label="Yttre ruta" className="outer">
          <Popover.Root>
            <Popover.Trigger>Inre</Popover.Trigger>
            <Popover.Popup aria-label="Inre ruta" className="inner">
              Inre text
            </Popover.Popup>
          </Popover.Root>
        </Popover.Popup>
      </Popover.Root>
    )
  }
  const shown = (name: string) =>
    document.querySelector(`.${name}`)?.matches(':popover-open') === true

  test('Escape closes the innermost popup only, then the next', async () => {
    await render(<Nested />)
    await userEvent.click(page.getByRole('button', { name: 'Yttre' }))
    await expect.poll(() => shown('outer')).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Inre' }))
    await expect.poll(() => shown('inner')).toBe(true)
    expect(shown('outer')).toBe(true)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => shown('inner')).toBe(false)
    expect(shown('outer')).toBe(true)
    await expect.element(page.getByRole('button', { name: 'Inre' })).toHaveFocus()

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => shown('outer')).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Yttre' })).toHaveFocus()
  })

  test('a press inside the inner popup keeps both open', async () => {
    await render(<Nested />)
    await userEvent.click(page.getByRole('button', { name: 'Yttre' }))
    await userEvent.click(page.getByRole('button', { name: 'Inre' }))
    await expect.poll(() => shown('inner')).toBe(true)
    await userEvent.click(page.getByText('Inre text'))
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(shown('inner')).toBe(true)
    expect(shown('outer')).toBe(true)
  })
})

describe('placement', () => {
  test('the popup sits under the trigger, in the top layer, with its limits as CSS variables', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    const popup = popupElement()
    expect(popup?.style.position).toBe('fixed')
    expect(popup?.getAttribute('data-placement')).toBe('bottom-start')
    expect(
      Number.parseFloat(popup?.style.getPropertyValue('--kv-popup-max-height') ?? ''),
    ).toBeGreaterThan(0)
    expect(
      Number.parseFloat(popup?.style.getPropertyValue('--kv-popup-width') ?? ''),
    ).toBeGreaterThan(0)
    expect(
      Number.parseFloat(popup?.style.getPropertyValue('--kv-anchor-width') ?? ''),
    ).toBeGreaterThan(0)
  })

  test('it flips above the trigger when there is no room below', async () => {
    await render(
      <Popover.Root defaultOpen>
        <Popover.Trigger style={{ position: 'fixed', bottom: 0, left: 16 }}>Hjälp</Popover.Trigger>
        <Popover.Popup aria-label="Hjälp om tjänsten">Text</Popover.Popup>
      </Popover.Root>,
    )
    await expect.poll(() => popupElement()?.getAttribute('data-placement')).toBe('top-start')
  })

  test('placement end-start is reported on the popup', async () => {
    await render(
      <div style={{ padding: '120px 16px' }}>
        <Popover.Root defaultOpen placement="end-start">
          <Popover.Trigger>Hjälp</Popover.Trigger>
          <Popover.Popup aria-label="Hjälp om tjänsten">Text</Popover.Popup>
        </Popover.Root>
      </div>,
    )
    await expect.poll(() => popupElement()?.getAttribute('data-placement')).toBe('end-start')
  })

  test('matchAnchorWidth ties the popup width to the trigger width', async () => {
    await render(
      <Popover.Root defaultOpen matchAnchorWidth>
        <Popover.Trigger style={{ width: 220 }}>Hjälp</Popover.Trigger>
        <Popover.Popup aria-label="Hjälp om tjänsten">Text</Popover.Popup>
      </Popover.Root>,
    )
    await expect.poll(() => popupElement()?.style.width).toBe('var(--kv-popup-width)')
  })

  test('it follows the trigger when the page scrolls', async () => {
    await render(
      <>
        <Example defaultOpen />
        <div style={{ height: 3000 }} />
      </>,
    )
    await expect.poll(isShown).toBe(true)
    const before = Number.parseFloat(popupElement()?.style.top ?? '')
    window.scrollTo(0, 40)
    await expect
      .poll(() => Number.parseFloat(popupElement()?.style.top ?? ''))
      .toBeCloseTo(before - 40, 0)
    window.scrollTo(0, 0)
  })

  test('it follows the trigger when its size changes', async () => {
    function Resizing() {
      const [width, setWidth] = useState(200)
      // A press elsewhere would be an outside press and close the popup, so the size changes on a timer.
      useEffect(() => {
        const timer = setTimeout(() => setWidth(300), 100)
        return () => clearTimeout(timer)
      }, [])
      return (
        <Popover.Root defaultOpen matchAnchorWidth>
          <Popover.Trigger style={{ width }}>Hjälp</Popover.Trigger>
          <Popover.Popup aria-label="Hjälp om tjänsten">Text</Popover.Popup>
        </Popover.Root>
      )
    }
    await render(<Resizing />)
    await expect
      .poll(() =>
        Number.parseFloat(popupElement()?.style.getPropertyValue('--kv-anchor-width') ?? ''),
      )
      .toBeCloseTo(300, 0)
  })
})

describe('server rendering', () => {
  test('renders the closed markup and touches no window', () => {
    const html = renderToString(<Example />)
    expect(html).toContain('popover="auto"')
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain('data-placement="bottom-start"')
    expect(html).not.toContain('data-open')
    expect(html).not.toContain('style=')
  })

  test('renders data-open for a popover that starts open, and no inline placement', () => {
    const html = renderToString(<Example defaultOpen />)
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('data-open=""')
    expect(html).not.toContain('style=')
  })
})

describe('development warnings', () => {
  const messages = () => consoleWarn.mock.calls.map(([message]) => String(message))

  test('a Popup with no accessible name', async () => {
    await render(
      <Popover.Root>
        <Popover.Trigger>Hjälp</Popover.Trigger>
        <Popover.Popup>Text</Popover.Popup>
      </Popover.Root>,
    )
    expect(
      messages().some((message) => message.includes('Popover.Popup has no accessible name')),
    ).toBe(true)
  })

  test('the parts outside a Root', async () => {
    await render(
      <>
        <PopoverTrigger>Hjälp</PopoverTrigger>
        <PopoverPopup aria-label="Hjälp">Text</PopoverPopup>
        <PopoverClose>Stäng</PopoverClose>
      </>,
    )
    const text = messages().join('\n')
    expect(text).toContain('Popover.Trigger is outside a Popover.Root')
    expect(text).toContain('Popover.Popup is outside a Popover.Root')
    expect(text).toContain('Popover.Close is outside a Popover.Root')
  })
})

describe('in a Toolbar (Plan 0036)', () => {
  // A Popover's popup holds a form, not toolbar items. It sits in the toolbar's React tree, so it
  // must not inherit the toolbar: a ButtonGroup in it would warn about a missing name, and a
  // Toolbar part in it would register as an item of a toolbar it isn't in.
  test('the popup is outside the toolbar: its form does not register as items or warn', async () => {
    await render(
      <Toolbar.Root aria-label="Formatering">
        <Toolbar.Button>Ett</Toolbar.Button>
        <Toolbar.Button>Två</Toolbar.Button>
        <Popover.Root defaultOpen>
          <Toolbar.Item render={<Popover.Trigger />}>Länk</Toolbar.Item>
          <Popover.Popup aria-label="Lägg till länk">
            <ButtonGroup>
              <Button>Spara</Button>
              <Popover.Close>Avbryt</Popover.Close>
            </ButtonGroup>
            <Toolbar.Button>Utanför</Toolbar.Button>
          </Popover.Popup>
        </Popover.Root>
      </Toolbar.Root>,
    )
    await expect.element(page.getByRole('button', { name: 'Spara' })).toBeVisible()
    const messages = consoleWarn.mock.calls.map(([message]) => String(message))
    // The unnamed ButtonGroup is no toolbar group, so it has nothing to warn about.
    expect(messages.some((message) => message.includes('<ButtonGroup> in a <Toolbar>'))).toBe(false)
    // The Toolbar.Button in the popup is outside any toolbar, and says so.
    expect(messages.some((message) => message.includes('Toolbar.Button is outside'))).toBe(true)
    // Arrow keys in the popup never move the toolbar's focus.
    await userEvent.click(page.getByRole('button', { name: 'Spara' }))
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(page.getByRole('button', { name: 'Spara' })).toHaveFocus()
  })
})

describe('types', () => {
  test('the public types', () => {
    expectTypeOf<PopoverRootProps['open']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<PopoverRootProps['defaultOpen']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<PopoverRootProps['children']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<UsePopoverOptions['onOpenChange']>().toEqualTypeOf<
      ((open: boolean, details: PopoverChangeDetails) => void) | undefined
    >()
    expectTypeOf<PopoverChangeDetails['reason']>().toEqualTypeOf<PopoverChangeReason>()
    expectTypeOf<PopoverChangeReason>().toEqualTypeOf<
      'trigger-press' | 'close-press' | 'escape' | 'outside-press' | 'light-dismiss'
    >()
    expectTypeOf<UsePopoverResult['isOpen']>().toEqualTypeOf<boolean>()
    expectTypeOf<UsePopoverResult['triggerProps']['aria-haspopup']>().toEqualTypeOf<'dialog'>()
    expectTypeOf(PopoverRoot).toBeFunction()
  })
})
