import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { usePopup } from './use-popup.ts'
import type { Placement, UsePopupOptions, UsePopupResult } from './use-popup.ts'

// Contract: popover.a11y.md (placement, top layer, modes). usePopup shows and
// places an element: it never moves focus and never closes anything.

interface PopupExampleProps extends Partial<
  Pick<UsePopupOptions, 'placement' | 'offset' | 'padding' | 'popover'>
> {
  open?: boolean
  matchAnchorWidth?: boolean
  anchorStyle?: CSSProperties
  onNativeDismiss?: () => void
  /** Collects the hook's result, for the tests that read it. */
  onResult?: (result: UsePopupResult) => void
}

function PopupExample({ open = true, anchorStyle, onResult, ...options }: PopupExampleProps) {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const popup = usePopup({ open, anchorRef, popupRef, ...options })
  onResult?.(popup)
  return (
    <>
      <button type="button" ref={anchorRef} style={anchorStyle}>
        Anchor
      </button>
      <div ref={popupRef} {...dialogAttributes} {...popup.popupProps}>
        Content
      </div>
    </>
  )
}

/** The dialog's role and name, spread on the popup element the way a consumer would. */
const dialogAttributes = { role: 'dialog', 'aria-label': 'Popup' } as const

const popupElement = () => document.querySelector<HTMLElement>('[role="dialog"]')
const anchorElement = () => page.getByRole('button', { name: 'Anchor' }).element()
const isShown = () => popupElement()?.matches(':popover-open') === true

describe('the popover attribute', () => {
  test('is auto by default and manual on request', async () => {
    const { unmount } = await render(<PopupExample />)
    expect(popupElement()?.getAttribute('popover')).toBe('auto')
    await unmount()
    await render(<PopupExample popover="manual" />)
    expect(popupElement()?.getAttribute('popover')).toBe('manual')
  })

  test('shows the popup in the top layer when open and hides it when closed', async () => {
    function Toggling() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen((current) => !current)}>
            Toggle
          </button>
          <PopupExample open={open} />
        </>
      )
    }
    await render(<Toggling />)
    expect(isShown()).toBe(false)
    await userEvent.click(page.getByRole('button', { name: 'Toggle' }))
    expect(isShown()).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Toggle' }))
    expect(isShown()).toBe(false)
  })

  test('shows a manual popup too, and a press outside leaves it open (closing is the owner’s)', async () => {
    await render(
      <>
        <PopupExample popover="manual" />
        <p>Outside</p>
      </>,
    )
    expect(isShown()).toBe(true)
    await userEvent.click(page.getByText('Outside'))
    await userEvent.keyboard('{Escape}')
    expect(isShown()).toBe(true)
  })

  test('starts open when open is true on the first render', async () => {
    await render(<PopupExample open />)
    expect(isShown()).toBe(true)
  })

  test('does not move focus', async () => {
    await render(<PopupExample open />)
    expect(popupElement()?.contains(document.activeElement)).toBe(false)
  })

  test('onNativeDismiss runs when the platform hides an open popup, and not when the owner closes it', async () => {
    const onNativeDismiss = vi.fn<(...args: unknown[]) => void>()
    function Owner() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
          <PopupExample open={open} onNativeDismiss={onNativeDismiss} />
        </>
      )
    }
    const { unmount } = await render(<PopupExample open onNativeDismiss={onNativeDismiss} />)
    popupElement()?.hidePopover()
    await expect.poll(() => onNativeDismiss.mock.calls.length).toBe(1)
    await unmount()
    onNativeDismiss.mockClear()

    await render(<Owner />)
    await expect.poll(isShown).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Close' }))
    await expect.poll(isShown).toBe(false)
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(onNativeDismiss).not.toHaveBeenCalled()
  })

  describe('where the Popover API is missing', () => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'showPopover')
    afterEach(() => {
      if (descriptor !== undefined) {
        Object.defineProperty(HTMLElement.prototype, 'showPopover', descriptor)
      }
    })

    test('shows and hides with hidden, and does not throw', async () => {
      Reflect.deleteProperty(HTMLElement.prototype, 'showPopover')
      function Toggling() {
        const [open, setOpen] = useState(false)
        return (
          <>
            <button type="button" onClick={() => setOpen((current) => !current)}>
              Toggle
            </button>
            <PopupExample open={open} />
          </>
        )
      }
      await render(<Toggling />)
      expect(popupElement()?.hidden).toBe(true)
      await userEvent.click(page.getByRole('button', { name: 'Toggle' }))
      expect(popupElement()?.hidden).toBe(false)
      expect(popupElement()?.style.position).toBe('fixed')
      await userEvent.click(page.getByRole('button', { name: 'Toggle' }))
      expect(popupElement()?.hidden).toBe(true)
    })
  })
})

describe('exposed state', () => {
  test('data-open is present only while open, and data-placement starts as the asked placement', async () => {
    function Toggling() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen((current) => !current)}>
            Toggle
          </button>
          <PopupExample open={open} placement="top-end" />
        </>
      )
    }
    await render(<Toggling />)
    expect(popupElement()?.hasAttribute('data-open')).toBe(false)
    expect(popupElement()?.getAttribute('data-placement')).toBe('top-end')
    await userEvent.click(page.getByRole('button', { name: 'Toggle' }))
    expect(popupElement()?.hasAttribute('data-open')).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Toggle' }))
    expect(popupElement()?.hasAttribute('data-open')).toBe(false)
  })

  test('the result carries the placement in use and reposition()', async () => {
    let result: UsePopupResult | undefined
    await render(
      <PopupExample
        anchorStyle={{ position: 'fixed', bottom: 0, left: 16 }}
        onResult={(next) => {
          result = next
        }}
      />,
    )
    await expect.poll(() => result?.placement).toBe('top-start')
    expect(popupElement()?.getAttribute('data-placement')).toBe('top-start')
    expect(() => result?.reposition()).not.toThrow()
  })

  test('sets the three CSS variables and the inline position while open', async () => {
    await render(<PopupExample />)
    const style = popupElement()?.style
    expect(style?.position).toBe('fixed')
    expect(Number.parseFloat(style?.getPropertyValue('--kv-popup-width') ?? '')).toBeGreaterThan(0)
    expect(
      Number.parseFloat(style?.getPropertyValue('--kv-popup-max-height') ?? ''),
    ).toBeGreaterThan(0)
    expect(Number.parseFloat(style?.getPropertyValue('--kv-anchor-width') ?? '')).toBeCloseTo(
      anchorElement().getBoundingClientRect().width,
      0,
    )
  })

  test('the popup passes axe, open and closed', async () => {
    const { container, unmount } = await render(<PopupExample open={false} />)
    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined()
    await unmount()
    const opened = await render(<PopupExample />)
    await expect(expectNoA11yViolations(opened.container)).resolves.toBeUndefined()
  })
})

describe('placement', () => {
  test('goes under the anchor, left edges lined up, and never covers it', async () => {
    await render(<PopupExample offset={4} />)
    const anchor = anchorElement().getBoundingClientRect()
    const popup = popupElement()?.getBoundingClientRect()
    expect(popup?.top).toBeCloseTo(anchor.bottom + 4, 0)
    expect(popup?.left).toBeCloseTo(anchor.left, 0)
  })

  test('start follows the reading direction: the right edge lines up in right-to-left text', async () => {
    await render(
      <div dir="rtl" style={{ padding: '60px 100px' }}>
        <PopupExample />
      </div>,
    )
    const anchor = anchorElement().getBoundingClientRect()
    const popup = popupElement()?.getBoundingClientRect()
    expect(popup?.right).toBeCloseTo(anchor.right, 0)
  })

  test('flips to the top when there is no room below, and reports it', async () => {
    await render(<PopupExample anchorStyle={{ position: 'fixed', bottom: 0, left: 16 }} />)
    await expect.poll(() => popupElement()?.getAttribute('data-placement')).toBe('top-start')
    expect(popupElement()?.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      anchorElement().getBoundingClientRect().top + 0.5,
    )
  })

  test('shifts to stay inside the viewport, keeping the padding', async () => {
    await render(
      <PopupExample
        padding={8}
        anchorStyle={{ position: 'fixed', top: 60, left: 0, width: 4, minWidth: 0, padding: 0 }}
      />,
    )
    expect(popupElement()?.getBoundingClientRect().left).toBeGreaterThanOrEqual(8 - 0.5)
  })

  test('hides the popup while the anchor is entirely outside the viewport, and shows it when it returns', async () => {
    await render(
      <>
        <div style={{ height: 3000 }} />
        <PopupExample />
        <div style={{ height: 3000 }} />
      </>,
    )
    await expect.poll(() => popupElement()?.hasAttribute('data-detached')).toBe(true)
    expect(popupElement()?.style.visibility).toBe('hidden')
    // Even detached, it is never taller than the viewport, so it can't blanket the page.
    expect(popupElement()?.getBoundingClientRect().height).toBeLessThanOrEqual(window.innerHeight)
    window.scrollTo(0, 2900)
    await expect.poll(() => popupElement()?.hasAttribute('data-detached')).toBe(false)
    expect(popupElement()?.style.visibility).toBe('')
    window.scrollTo(0, 0)
    await expect.poll(() => popupElement()?.hasAttribute('data-detached')).toBe(true)
  })

  test('limits the height to the room that is left, and the popup scrolls inside', async () => {
    function Tall() {
      const anchorRef = useRef<HTMLButtonElement>(null)
      const popupRef = useRef<HTMLDivElement>(null)
      const popup = usePopup({ open: true, anchorRef, popupRef, padding: 8 })
      return (
        <>
          <button type="button" ref={anchorRef}>
            Anchor
          </button>
          <div ref={popupRef} {...dialogAttributes} {...popup.popupProps}>
            <div style={{ height: 5000 }}>Tall content</div>
          </div>
        </>
      )
    }
    await render(<Tall />)
    const popup = popupElement()
    const viewportHeight = document.documentElement.clientHeight
    await expect
      .poll(() => popup?.getBoundingClientRect().bottom)
      .toBeLessThanOrEqual(viewportHeight)
    expect(popup?.scrollHeight).toBeGreaterThan(popup?.clientHeight ?? 0)
  })

  test('matchAnchorWidth sets the popup as wide as the anchor', async () => {
    await render(<PopupExample matchAnchorWidth anchorStyle={{ width: 180 }} />)
    expect(popupElement()?.getBoundingClientRect().width).toBeCloseTo(180, 0)
  })

  test('repositions when the page scrolls', async () => {
    await render(
      <>
        <PopupExample />
        <div style={{ height: 3000 }} />
      </>,
    )
    const before = popupElement()?.getBoundingClientRect().top ?? 0
    window.scrollTo(0, 30)
    await expect.poll(() => popupElement()?.getBoundingClientRect().top).toBeCloseTo(before - 30, 0)
    window.scrollTo(0, 0)
  })

  test('repositions when the anchor moves without scrolling or resizing, and never covers it (2.4.11)', async () => {
    function Moving() {
      const [pushed, setPushed] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setPushed(true)}>
            Push
          </button>
          {/* Content that appears above the anchor, as a Combobox's chosen values do. */}
          {pushed ? <div style={{ height: 120 }}>Above</div> : null}
          <PopupExample
            popover="manual"
            anchorStyle={{ display: 'block', width: 180, height: 40 }}
          />
        </>
      )
    }
    await render(<Moving />)
    const bottomOfAnchor = () => anchorElement().getBoundingClientRect().bottom
    expect(popupElement()?.getBoundingClientRect().top ?? 0).toBeGreaterThanOrEqual(
      bottomOfAnchor() - 1,
    )
    const before = bottomOfAnchor()
    await userEvent.click(page.getByRole('button', { name: 'Push' }))
    // Nothing scrolled and nothing changed size: the anchor was only pushed down.
    await expect.poll(bottomOfAnchor).toBeGreaterThan(before + 100)
    await expect
      .poll(() => (popupElement()?.getBoundingClientRect().top ?? 0) >= bottomOfAnchor() - 1)
      .toBe(true)
  })

  test('a scroll inside the popup does not move it and keeps its scroll position', async () => {
    function Scrolling() {
      const anchorRef = useRef<HTMLButtonElement>(null)
      const popupRef = useRef<HTMLDivElement>(null)
      const popup = usePopup({ open: true, anchorRef, popupRef })
      return (
        <>
          <button type="button" ref={anchorRef}>
            Anchor
          </button>
          <div ref={popupRef} {...dialogAttributes} {...popup.popupProps}>
            <div style={{ height: 5000 }}>Tall content</div>
          </div>
        </>
      )
    }
    await render(<Scrolling />)
    const popup = popupElement()
    const top = popup?.getBoundingClientRect().top
    popup?.scrollTo(0, 120)
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(popup?.scrollTop).toBe(120)
    expect(popup?.getBoundingClientRect().top).toBe(top)
  })
})

describe('the width limit', () => {
  test('--kv-popup-width-limit caps the width, and the text wraps inside it', async () => {
    function Limited() {
      const anchorRef = useRef<HTMLButtonElement>(null)
      const popupRef = useRef<HTMLDivElement>(null)
      const popup = usePopup({ open: true, anchorRef, popupRef })
      return (
        <>
          <button type="button" ref={anchorRef}>
            Anchor
          </button>
          <div
            ref={popupRef}
            {...dialogAttributes}
            {...popup.popupProps}
            style={{ '--kv-popup-width-limit': '10rem' } as CSSProperties}
          >
            Content that is far too long to fit on one line inside ten rem, so it has to wrap
          </div>
        </>
      )
    }
    await render(<Limited />)
    await expect.poll(isShown).toBe(true)
    const width = popupElement()?.getBoundingClientRect().width ?? 0
    expect(width).toBeGreaterThan(0)
    expect(width).toBeLessThanOrEqual(160)
  })
})

describe('measuring at the width it will have', () => {
  test('a popup narrowed to the viewport is placed by its narrowed height and never covers its anchor', async () => {
    function Narrowed() {
      const anchorRef = useRef<HTMLButtonElement>(null)
      const popupRef = useRef<HTMLDivElement>(null)
      // A padding that leaves 200px: the popup is measured wider and placed narrower, so its text wraps into more lines.
      const padding = Math.max(0, Math.floor((window.innerWidth - 200) / 2))
      const popup = usePopup({ open: true, anchorRef, popupRef, placement: 'top', padding })
      return (
        <>
          <div style={{ height: 300 }} />
          <button type="button" ref={anchorRef}>
            Anchor
          </button>
          <div
            ref={popupRef}
            {...dialogAttributes}
            {...popup.popupProps}
            style={{ '--kv-popup-width-limit': '2000px' } as CSSProperties}
          >
            Text som måste brytas över flera rader när popupen blir smalare än den mättes. Text som
            måste brytas över flera rader när popupen blir smalare än den mättes.
          </div>
        </>
      )
    }
    await render(<Narrowed />)
    await expect.poll(isShown).toBe(true)
    const popupBox = popupElement()?.getBoundingClientRect()
    const anchorBox = anchorElement().getBoundingClientRect()
    expect(popupBox?.width).toBeLessThanOrEqual(200.5)
    expect(popupBox?.bottom ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(anchorBox.top + 0.5)
  })
})

describe('server rendering and types', () => {
  test('renders the attributes on the server and touches no window', () => {
    const closed = renderToString(<PopupExample open={false} />)
    expect(closed).toContain('popover="auto"')
    expect(closed).toContain('data-placement="bottom-start"')
    expect(closed).not.toContain('data-open')
    const opened = renderToString(<PopupExample />)
    expect(opened).toContain('data-open=""')
    // Placement is measured in an effect, so the server never writes a position.
    expect(opened).not.toContain('style=')
  })

  test('the public types', () => {
    expectTypeOf<UsePopupOptions['open']>().toEqualTypeOf<boolean>()
    expectTypeOf<UsePopupOptions['popover']>().toEqualTypeOf<'auto' | 'manual' | undefined>()
    expectTypeOf<UsePopupOptions['placement']>().toEqualTypeOf<Placement | undefined>()
    expectTypeOf<UsePopupResult['placement']>().toEqualTypeOf<Placement>()
    expectTypeOf<UsePopupResult['popupProps']['popover']>().toEqualTypeOf<'auto' | 'manual'>()
    expectTypeOf<UsePopupResult['reposition']>().toEqualTypeOf<() => void>()
  })
})
