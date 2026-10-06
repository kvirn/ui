import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useEffect, useRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { useAnnouncer } from '../announcer/use-announcer.ts'
import { AlertDialog, Dialog, DialogRoot, Popover } from '../index.ts'
import type {
  DialogChangeDetails,
  DialogChangeReason,
  DialogRootProps,
  UseDialogOptions,
  UseDialogResult,
} from '../index.ts'
import { useDialog } from './use-dialog.ts'

// Contract: dialog.a11y.md. Component tests load no theme: the popup is the browser's own modal
// `<dialog>`, and the scroll lock is only the attribute the theme styles.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

// Without the theme the buttons touch: axe's target-size rule (2.5.8) needs room between them.
const spaced = { margin: 8 }

const warnings = () => consoleWarn.mock.calls.flat().join('\n')

function Example({
  withDescription = true,
  ...rootProps
}: DialogRootProps & { withDescription?: boolean }) {
  return (
    <>
      <button type="button">Före</button>
      <Dialog.Root {...rootProps}>
        <Dialog.Trigger>Ändra</Dialog.Trigger>
        <Dialog.Popup>
          <Dialog.Title>Ändra telefonnummer</Dialog.Title>
          <Dialog.Close />
          {withDescription ? <Dialog.Description>Vi skickar en kod.</Dialog.Description> : null}
          <Dialog.Body>
            <label>
              Telefon <input type="tel" />
            </label>
          </Dialog.Body>
          <Dialog.Actions>
            <button type="button" style={spaced}>
              Spara
            </button>
            <button type="button" style={spaced}>
              Ångra
            </button>
          </Dialog.Actions>
        </Dialog.Popup>
      </Dialog.Root>
      <button type="button">Efter</button>
    </>
  )
}

const trigger = () => page.getByRole('button', { name: 'Ändra', exact: true })
const closeButton = () => page.getByRole('button', { name: 'Close dialog', exact: true })
const saveButton = () => page.getByRole('button', { name: 'Spara', exact: true })
const phoneInput = () => page.getByRole('textbox', { name: 'Telefon' })
const popupElement = () => document.querySelector<HTMLDialogElement>('dialog.kv-dialog')
const triggerElement = () => document.querySelector<HTMLButtonElement>('.kv-dialog-trigger')
const isModal = () => popupElement()?.matches(':modal') === true
const isScrollLocked = () => document.documentElement.hasAttribute('data-kv-scroll-locked')

const pressAt = (element: Element, clientX: number, clientY: number, pointerType = 'mouse') =>
  element.dispatchEvent(
    new PointerEvent('pointerdown', { bubbles: true, clientX, clientY, pointerType, pointerId: 7 }),
  )
const liftAt = (element: Element, clientX: number, clientY: number) =>
  element.dispatchEvent(
    new PointerEvent('pointerup', {
      bubbles: true,
      clientX,
      clientY,
      pointerType: 'touch',
      pointerId: 7,
    }),
  )

function Controlled(props: Partial<DialogRootProps> & { refuse?: boolean }) {
  const { refuse = false, ...rootProps } = props
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Öppna
      </button>
      <Example
        {...rootProps}
        open={open}
        onOpenChange={(next, details) => {
          rootProps.onOpenChange?.(next, details)
          if (!refuse) {
            setOpen(next)
          }
        }}
      />
      <output data-testid="open">{String(open)}</output>
    </>
  )
}

describe('rendering and ARIA', () => {
  test('a closed dialog: an always-rendered, hidden <dialog> whose content is not reachable, and a wired trigger', async () => {
    const { container } = await render(<Example />)
    const popup = popupElement()
    expect(popup?.tagName).toBe('DIALOG')
    expect(popup?.open).toBe(false)
    expect(popup?.textContent).toContain('Ändra telefonnummer')
    const field = popup?.querySelector('input')
    expect(field?.checkVisibility()).toBe(false)
    expect(field?.getClientRects().length).toBe(0)
    expect(popup?.hasAttribute('aria-modal')).toBe(false)
    expect(popup?.hasAttribute('data-open')).toBe(false)
    const button = triggerElement()
    expect(button?.getAttribute('type')).toBe('button')
    expect(button?.getAttribute('aria-haspopup')).toBe('dialog')
    expect(button?.hasAttribute('aria-expanded')).toBe(false)
    expect(button?.hasAttribute('aria-controls')).toBe(false)
    expect(button?.hasAttribute('data-open')).toBe(false)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('an open dialog is modal, has role dialog, aria-modal and data-open, and no axe violations', async () => {
    const { container } = await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    const popup = popupElement()
    expect(popup?.getAttribute('role')).toBe('dialog')
    expect(popup?.getAttribute('aria-modal')).toBe('true')
    expect(popup?.hasAttribute('data-open')).toBe(true)
    expect(triggerElement()?.hasAttribute('data-open')).toBe(true)
    await expect.element(page.getByRole('dialog', { name: 'Ändra telefonnummer' })).toBeVisible()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the name is the title, and the description is set only while a Description exists', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isModal).toBe(true)
    const popup = popupElement()
    const titleId = document.querySelector('.kv-dialog-title')?.id
    const descriptionId = document.querySelector('.kv-dialog-description')?.id
    expect(popup?.getAttribute('aria-labelledby')).toBe(titleId)
    expect(popup?.getAttribute('aria-describedby')).toBe(descriptionId)
  })

  test('without a Description there is no aria-describedby', async () => {
    await render(<Example defaultOpen withDescription={false} />)
    await expect.poll(isModal).toBe(true)
    expect(popupElement()?.hasAttribute('aria-describedby')).toBe(false)
    expect(popupElement()?.hasAttribute('aria-labelledby')).toBe(true)
  })

  test('the title is an h2 that takes focus programmatically but is never a Tab stop', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isModal).toBe(true)
    const title = document.querySelector('.kv-dialog-title')
    expect(title?.tagName).toBe('H2')
    expect(title?.getAttribute('tabindex')).toBe('-1')
  })

  test('an icon-only Close is named by dialog.close, and visible text names it otherwise', async () => {
    await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup aria-label="Test">
          <Dialog.Close />
          <Dialog.Close>Stäng</Dialog.Close>
          <Dialog.Close messages={{ close: 'Avsluta' }} />
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.poll(isModal).toBe(true)
    const buttons = [...document.querySelectorAll('.kv-dialog-close')]
    expect(buttons[0]?.getAttribute('aria-label')).toBe('Close dialog')
    expect(buttons[1]?.hasAttribute('aria-label')).toBe(false)
    expect(buttons[1]?.textContent).toBe('Stäng')
    expect(buttons[2]?.getAttribute('aria-label')).toBe('Avsluta')
  })

  test('long content gives no axe violations', async () => {
    const { container } = await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Dialog.Title>Villkor</Dialog.Title>
          <Dialog.Body>
            {Array.from({ length: 80 }, (_, index) => (
              <p key={index}>Stycke {index + 1}: en lång text som får dialogrutan att scrolla.</p>
            ))}
          </Dialog.Body>
          <Dialog.Actions>
            <button type="button">Godkänn</button>
          </Dialog.Actions>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.poll(isModal).toBe(true)
    await expectNoA11yViolations(container)
  })

  test('typed values are kept when the dialog closes and opens again', async () => {
    await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await userEvent.fill(phoneInput(), '0701234567')
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await expect.element(phoneInput()).toHaveValue('0701234567')
  })

  test('forwards refs, className and native props, and merges them with its own', async () => {
    const triggerRef = createRef<HTMLButtonElement>()
    const popupRef = createRef<HTMLDialogElement>()
    const titleRef = createRef<HTMLHeadingElement>()
    await render(
      <Dialog.Root defaultOpen>
        <Dialog.Trigger ref={triggerRef} className="egen" data-egen="trigger">
          Ändra
        </Dialog.Trigger>
        <Dialog.Popup ref={popupRef} className="egen" data-egen="popup">
          <Dialog.Title ref={titleRef} className="egen">
            Titel
          </Dialog.Title>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    expect(triggerRef.current).toBe(triggerElement())
    expect(popupRef.current).toBe(popupElement())
    expect(titleRef.current?.tagName).toBe('H2')
    expect(triggerRef.current?.className).toBe('egen kv-dialog-trigger')
    expect(popupRef.current?.className).toBe('egen kv-dialog')
    expect(titleRef.current?.className).toBe('egen kv-dialog-title')
    expect(popupRef.current?.getAttribute('data-egen')).toBe('popup')
    await expect.poll(isModal).toBe(true)
  })

  test('render replaces the element and gives the state', async () => {
    const states: boolean[] = []
    await render(
      <Dialog.Root>
        <Dialog.Trigger
          render={(partProps) => (
            <button {...partProps} data-egen="render">
              Ändra
            </button>
          )}
        />
        <Dialog.Popup
          aria-label="Ändra"
          render={(partProps, state) => {
            states.push(state.isOpen)
            return <dialog {...partProps} data-egen="popup" />
          }}
        >
          <Dialog.Title render={(partProps) => <h3 {...partProps}>{partProps.children}</h3>}>
            Titel
          </Dialog.Title>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    expect(popupElement()?.getAttribute('data-egen')).toBe('popup')
    expect(states).toContain(false)
    await userEvent.click(page.getByRole('button', { name: 'Ändra' }))
    await expect.poll(isModal).toBe(true)
    expect(states.at(-1)).toBe(true)
    expect(document.querySelector('h3.kv-dialog-title')).not.toBeNull()
  })

  test('useDialog spreads the same props on your own elements', async () => {
    function Own() {
      const dialog = useDialog()
      const { registerTitle } = dialog
      useEffect(() => registerTitle(), [registerTitle])
      return (
        <>
          <button {...dialog.triggerProps}>Ändra</button>
          <dialog {...dialog.popupProps}>
            {dialog.isOpen ? (
              <>
                <h2 {...dialog.titleProps}>Egen titel</h2>
                <button {...dialog.closeProps} aria-label={undefined}>
                  Stäng
                </button>
              </>
            ) : null}
          </dialog>
        </>
      )
    }
    await render(<Own />)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await expect.element(page.getByRole('dialog', { name: 'Egen titel' })).toBeVisible()
    await userEvent.click(page.getByRole('button', { name: 'Stäng' }))
    await expect.poll(isModal).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })

  test('server rendering with defaultOpen writes a closed <dialog> with its content, and touches no window', () => {
    const html = renderToString(<Example defaultOpen />)
    expect(html).toContain('<dialog')
    expect(html).not.toMatch(/<dialog[^>]*\sopen/)
    expect(html).toContain('Ändra telefonnummer')
  })

  test('defaultOpen shows the dialog modally after the first render', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isModal).toBe(true)
  })
})

describe('keyboard', () => {
  test('Tab focuses the trigger, and is one stop', async () => {
    await render(<Example />)
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(trigger()).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('Shift+Tab leaves the trigger backwards', async () => {
    await render(<Example />)
    await userEvent.tab()
    await userEvent.tab()
    await expect.element(trigger()).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('Enter and Space on the trigger open the dialog', async () => {
    await render(<Example />)
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect.poll(isModal).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect.poll(isModal).toBe(true)
  })

  test('Tab and Shift+Tab move between the tabbable elements inside, in DOM order', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isModal).toBe(true)
    await expect.element(phoneInput()).toHaveFocus()
    await userEvent.tab()
    await expect.element(saveButton()).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Ångra', exact: true })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await userEvent.tab({ shift: true })
    await expect.element(phoneInput()).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(closeButton()).toHaveFocus()
  })

  test('Tab and Shift+Tab never reach the page behind the dialog', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isModal).toBe(true)
    const outside = [...document.querySelectorAll('button')].filter(
      (button) => !popupElement()?.contains(button),
    )
    expect(outside.length).toBeGreaterThan(0)
    for (let step = 0; step < 8; step += 1) {
      await userEvent.tab()
      expect(outside).not.toContain(document.activeElement)
    }
    for (let step = 0; step < 8; step += 1) {
      await userEvent.tab({ shift: true })
      expect(outside).not.toContain(document.activeElement)
    }
    expect(popupElement()?.hasAttribute('inert')).toBe(false)
    expect(popupElement()?.matches(':modal')).toBe(true)
  })

  test('Escape closes the dialog and returns focus to the trigger', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DialogChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape', event: expect.any(Event) }),
    )
  })

  test('Escape closes a Popover inside first, then the dialog', async () => {
    await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Dialog.Title>Titel</Dialog.Title>
          <Popover.Root>
            <Popover.Trigger>Hjälp</Popover.Trigger>
            <Popover.Popup aria-label="Hjälp" className="inner-popover">
              <button type="button">Inuti</button>
            </Popover.Popup>
          </Popover.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.poll(isModal).toBe(true)
    const popoverShown = () =>
      document.querySelector('.inner-popover')?.matches(':popover-open') === true
    await userEvent.click(page.getByRole('button', { name: 'Hjälp' }))
    await expect.poll(popoverShown).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(popoverShown).toBe(false)
    expect(isModal()).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
  })

  test('Escape closes the innermost of nested dialogs only', async () => {
    await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup className="outer">
          <Dialog.Title>Yttre</Dialog.Title>
          <Dialog.Root>
            <Dialog.Trigger>Öppna inre</Dialog.Trigger>
            <Dialog.Popup className="inner">
              <Dialog.Title>Inre</Dialog.Title>
              <button type="button">Inuti</button>
            </Dialog.Popup>
          </Dialog.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    const isModalByClass = (name: string) =>
      document.querySelector(`.${name}`)?.matches(':modal') === true
    await expect.poll(() => isModalByClass('outer')).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Öppna inre' }))
    await expect.poll(() => isModalByClass('inner')).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => isModalByClass('inner')).toBe(false)
    expect(isModalByClass('outer')).toBe(true)
    await expect.element(page.getByRole('button', { name: 'Öppna inre' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => isModalByClass('outer')).toBe(false)
  })

  test('Enter and Space on Close close the dialog with reason close-press, and focus returns', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DialogChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await userEvent.tab({ shift: true })
    await expect.element(closeButton()).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(isModal).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'close-press' }),
    )
    await userEvent.keyboard(' ')
    await expect.poll(isModal).toBe(true)
    await userEvent.tab({ shift: true })
    await userEvent.keyboard(' ')
    await expect.poll(isModal).toBe(false)
  })

  test('Enter in a text field submits the form and is not taken', async () => {
    const onSubmit = vi.fn<() => void>()
    const onOpenChange = vi.fn<() => void>()
    await render(
      <Dialog.Root defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Popup>
          <Dialog.Title>Skicka</Dialog.Title>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit()
            }}
          >
            <label>
              Namn <input type="text" />
            </label>
            <button type="submit">Skicka</button>
          </form>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.poll(isModal).toBe(true)
    await expect.element(page.getByRole('textbox', { name: 'Namn' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(isModal()).toBe(true)
  })

  test('a press on the backdrop closes the dialog with dismissOnOutsidePress, and touch counts when the finger lifts', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DialogChangeDetails) => void>()
    await render(<Example dismissOnOutsidePress onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    const popup = popupElement()
    if (popup === null) {
      throw new Error('no popup')
    }
    pressAt(popup, 2, 2, 'touch')
    expect(isModal()).toBe(true)
    liftAt(popup, 2, 2)
    await expect.poll(isModal).toBe(false)
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'outside-press' }),
    )
    await expect.element(trigger()).toHaveFocus()
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    pressAt(popupElement() ?? popup, 2, 2)
    await expect.poll(isModal).toBe(false)
  })

  test('a press on the backdrop does nothing by default', async () => {
    const onOpenChange = vi.fn<() => void>()
    await render(<Example defaultOpen onOpenChange={onOpenChange} />)
    await expect.poll(isModal).toBe(true)
    const popup = popupElement()
    if (popup === null) {
      throw new Error('no popup')
    }
    pressAt(popup, 2, 2)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(isModal()).toBe(true)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  test('a press inside the dialog does nothing', async () => {
    const onOpenChange = vi.fn<() => void>()
    await render(<Example defaultOpen dismissOnOutsidePress onOpenChange={onOpenChange} />)
    await expect.poll(isModal).toBe(true)
    await userEvent.click(page.getByText('Vi skickar en kod.'))
    await userEvent.click(saveButton())
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(isModal()).toBe(true)
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

describe('focus', () => {
  test('opening moves focus to initialFocusRef', async () => {
    function WithInitialFocus() {
      const ref = useRef<HTMLButtonElement>(null)
      return (
        <Dialog.Root defaultOpen initialFocusRef={ref}>
          <Dialog.Popup aria-label="Test">
            <input aria-label="Först" />
            <button ref={ref} type="button">
              Mål
            </button>
          </Dialog.Popup>
        </Dialog.Root>
      )
    }
    await render(<WithInitialFocus />)
    await expect.element(page.getByRole('button', { name: 'Mål' })).toHaveFocus()
  })

  test('opening moves focus to the first tabbable that is not Close', async () => {
    await render(<Example defaultOpen />)
    await expect.element(phoneInput()).toHaveFocus()
  })

  test('with several Close buttons, initial focus skips every one of them', async () => {
    await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Dialog.Title>Ändra</Dialog.Title>
          <Dialog.Close />
          <Dialog.Close>Avbryt</Dialog.Close>
          <label>
            Namn <input type="text" />
          </label>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.element(page.getByRole('textbox', { name: 'Namn' })).toHaveFocus()
  })

  test('with only Close buttons, initial focus goes to the title', async () => {
    await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Dialog.Title>Läs det här</Dialog.Title>
          <Dialog.Close />
          <Dialog.Close>Avbryt</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.poll(() => document.activeElement?.textContent).toBe('Läs det här')
  })

  test('with nothing tabbable but Close, opening moves focus to the title', async () => {
    await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Dialog.Title>Läs det här</Dialog.Title>
          <Dialog.Close />
          <Dialog.Body>Bara text.</Dialog.Body>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.poll(() => document.activeElement?.textContent).toBe('Läs det här')
  })

  test('closing returns focus to the trigger', async () => {
    await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Ångra' }))
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })

  test('with no Trigger, closing returns focus to the element that had it before opening', async () => {
    function NoTrigger() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Öppna
          </button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Popup aria-label="Utan knapp">
              <Dialog.Close>Stäng</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Root>
        </>
      )
    }
    await render(<NoTrigger />)
    await userEvent.click(page.getByRole('button', { name: 'Öppna' }))
    await expect.poll(isModal).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Stäng' }))
    await expect.poll(isModal).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Öppna' })).toHaveFocus()
    expect(warnings()).not.toContain('dialog-return-focus-lost')
  })

  test('finalFocusRef wins over the trigger', async () => {
    function WithFinalFocus() {
      const ref = useRef<HTMLButtonElement>(null)
      return (
        <>
          <button ref={ref} type="button">
            Slutmål
          </button>
          <Example finalFocusRef={ref} />
        </>
      )
    }
    await render(<WithFinalFocus />)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Slutmål' })).toHaveFocus()
  })

  test('a native close (<form method="dialog">) still returns focus to finalFocusRef', async () => {
    function NativeClose() {
      const ref = useRef<HTMLButtonElement>(null)
      return (
        <>
          <button ref={ref} type="button">
            Slutmål
          </button>
          <Dialog.Root finalFocusRef={ref}>
            <Dialog.Trigger>Ändra</Dialog.Trigger>
            <Dialog.Popup aria-label="Test">
              <form method="dialog">
                <button type="submit">Klar</button>
              </form>
            </Dialog.Popup>
          </Dialog.Root>
        </>
      )
    }
    await render(<NativeClose />)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Klar' }))
    await expect.poll(isModal).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Slutmål' })).toHaveFocus()
  })

  test('a trigger that has left the document falls back to the element focused before opening', async () => {
    function TriggerGoes() {
      const [open, setOpen] = useState(false)
      const [showTrigger, setShowTrigger] = useState(true)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Före
          </button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            {showTrigger ? <Dialog.Trigger>Ändra</Dialog.Trigger> : null}
            <Dialog.Popup aria-label="Test">
              <button type="button" onClick={() => setShowTrigger(false)}>
                Ta bort knappen
              </button>
              <Dialog.Close>Stäng</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Root>
        </>
      )
    }
    await render(<TriggerGoes />)
    await userEvent.click(page.getByRole('button', { name: 'Före' }))
    await expect.poll(isModal).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Ta bort knappen' }))
    await userEvent.click(page.getByRole('button', { name: 'Stäng' }))
    await expect.poll(isModal).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('with nowhere to return to, a development warning names the problem and focus never goes to a hidden element', async () => {
    await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup aria-label="Ensam">
          <Dialog.Close>Stäng</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.poll(isModal).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Stäng' }))
    await expect.poll(isModal).toBe(false)
    await expect.poll(warnings).toContain('nothing could take focus back')
  })

  test('focus that the consumer moved after closing is not taken back', async () => {
    function MovesFocus() {
      const [open, setOpen] = useState(false)
      const elsewhere = useRef<HTMLButtonElement>(null)
      const wasOpen = useRef(false)
      useEffect(() => {
        if (wasOpen.current && !open) {
          elsewhere.current?.focus()
        }
        wasOpen.current = open
      }, [open])
      return (
        <>
          <button ref={elsewhere} type="button">
            Annan plats
          </button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>Ändra</Dialog.Trigger>
            <Dialog.Popup aria-label="Test">
              <Dialog.Close>Stäng</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Root>
        </>
      )
    }
    await render(<MovesFocus />)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Stäng' }))
    await expect.poll(isModal).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Annan plats' })).toHaveFocus()
  })
})

describe('layers', () => {
  test('a controlled inner dialog reopens on top of its parent when the parent opens again', async () => {
    const controls = { closeOuter: () => {}, openOuter: () => {}, openInner: () => {} }
    function Nested() {
      const [outerOpen, setOuterOpen] = useState(false)
      const [innerOpen, setInnerOpen] = useState(false)
      useEffect(() => {
        controls.closeOuter = () => setOuterOpen(false)
        controls.openOuter = () => setOuterOpen(true)
        controls.openInner = () => setInnerOpen(true)
      }, [])
      return (
        <Dialog.Root open={outerOpen} onOpenChange={setOuterOpen}>
          <Dialog.Trigger>Yttre</Dialog.Trigger>
          <Dialog.Popup className="outer">
            <Dialog.Title>Yttre</Dialog.Title>
            <button type="button">Yttre knapp</button>
            <Dialog.Root open={innerOpen} onOpenChange={setInnerOpen}>
              <Dialog.Popup className="inner">
                <Dialog.Title>Inre</Dialog.Title>
                <button type="button">Inre knapp</button>
              </Dialog.Popup>
            </Dialog.Root>
          </Dialog.Popup>
        </Dialog.Root>
      )
    }
    const modalByClass = (name: string) =>
      document.querySelector(`.${name}`)?.matches(':modal') === true
    await render(<Nested />)
    await userEvent.click(page.getByRole('button', { name: 'Yttre', exact: true }))
    await expect.poll(() => modalByClass('outer')).toBe(true)
    controls.openInner()
    await expect.poll(() => modalByClass('inner')).toBe(true)
    controls.closeOuter()
    await expect.poll(() => document.querySelectorAll('dialog:modal').length).toBe(0)
    controls.openOuter()
    await expect.poll(() => document.querySelectorAll('dialog:modal').length).toBe(2)
    await expect
      .poll(() => document.querySelector('.inner')?.contains(document.activeElement))
      .toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => modalByClass('inner')).toBe(false)
    expect(modalByClass('outer')).toBe(true)
    await expect
      .poll(() => document.querySelector('.outer')?.contains(document.activeElement))
      .toBe(true)
    expect(warnings()).not.toContain('nothing could take focus back')
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => modalByClass('outer')).toBe(false)
  })

  test('a sibling dialog inside the outer Root but outside its Popup opens while the outer is closed', async () => {
    await render(
      <Dialog.Root>
        <Dialog.Trigger>Yttre</Dialog.Trigger>
        <Dialog.Root>
          <Dialog.Trigger>Syskon</Dialog.Trigger>
          <Dialog.Popup className="sibling">
            <Dialog.Title>Syskon</Dialog.Title>
            <button type="button">Inuti</button>
          </Dialog.Popup>
        </Dialog.Root>
        <Dialog.Popup className="outer">
          <Dialog.Title>Yttre</Dialog.Title>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Syskon' }))
    await expect
      .poll(() => document.querySelector('.sibling')?.matches(':modal') === true)
      .toBe(true)
    expect(document.querySelector('.outer')?.matches(':modal')).toBe(false)
  })

  describe.each([
    ['a Dialog', 'dialog'],
    ['an AlertDialog', 'alert'],
  ] as const)('closing the outer dialog from state while %s inside is open', (_name, kind) => {
    test('closing the outer dialog from state while an inner one is open closes both and returns focus to the outer trigger', async () => {
      const controls = { closeOuter: () => {} }
      function Nested() {
        const [open, setOpen] = useState(false)
        useEffect(() => {
          controls.closeOuter = () => setOpen(false)
        }, [])
        return (
          <>
            <button type="button">Före</button>
            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger>Yttre</Dialog.Trigger>
              <Dialog.Popup className="outer">
                <Dialog.Title>Yttre</Dialog.Title>
                {kind === 'dialog' ? (
                  <Dialog.Root>
                    <Dialog.Trigger>Inre</Dialog.Trigger>
                    <Dialog.Popup>
                      <Dialog.Title>Inre</Dialog.Title>
                      <button type="button">Inuti</button>
                    </Dialog.Popup>
                  </Dialog.Root>
                ) : (
                  <AlertDialog.Root>
                    <AlertDialog.Trigger>Inre</AlertDialog.Trigger>
                    <AlertDialog.Popup>
                      <AlertDialog.Title>Inre</AlertDialog.Title>
                      <AlertDialog.Description>Text</AlertDialog.Description>
                      <button type="button">Inuti</button>
                    </AlertDialog.Popup>
                  </AlertDialog.Root>
                )}
              </Dialog.Popup>
            </Dialog.Root>
          </>
        )
      }
      await render(<Nested />)
      await userEvent.click(page.getByRole('button', { name: 'Yttre', exact: true }))
      await expect.poll(isModal).toBe(true)
      await userEvent.click(page.getByRole('button', { name: 'Inre', exact: true }))
      await expect.poll(() => document.querySelectorAll('dialog:modal').length).toBe(2)
      controls.closeOuter()
      await expect.poll(() => document.querySelectorAll('dialog:modal').length).toBe(0)
      await expect.poll(isScrollLocked).toBe(false)
      await expect.element(page.getByRole('button', { name: 'Yttre', exact: true })).toHaveFocus()
      const before = page.getByRole('button', { name: 'Före' }).element() as HTMLElement
      before.focus()
      expect(document.activeElement).toBe(before)
      expect(warnings()).not.toContain('nothing could take focus back')
    })
  })

  test('a Dialog opened from inside a Popover closes first, and the popover stays', async () => {
    await render(
      <Popover.Root>
        <Popover.Trigger>Mer</Popover.Trigger>
        <Popover.Popup aria-label="Mer" className="outer-popover">
          <Dialog.Root>
            <Dialog.Trigger>Öppna dialog</Dialog.Trigger>
            <Dialog.Popup>
              <Dialog.Title>Från popover</Dialog.Title>
              <button type="button">Inuti</button>
            </Dialog.Popup>
          </Dialog.Root>
        </Popover.Popup>
      </Popover.Root>,
    )
    const popoverShown = () =>
      document.querySelector('.outer-popover')?.matches(':popover-open') === true
    await userEvent.click(page.getByRole('button', { name: 'Mer' }))
    await expect.poll(popoverShown).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Öppna dialog' }))
    await expect.poll(isModal).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
    expect(popoverShown()).toBe(true)
    await expect.element(page.getByRole('button', { name: 'Öppna dialog' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(popoverShown).toBe(false)
  })

  test('nested dialogs have no axe violations', async () => {
    const { container } = await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Dialog.Title>Yttre</Dialog.Title>
          <Dialog.Root defaultOpen>
            <Dialog.Popup>
              <Dialog.Title>Inre</Dialog.Title>
              <button type="button">Inuti</button>
            </Dialog.Popup>
          </Dialog.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.poll(() => document.querySelectorAll('dialog:modal').length).toBe(2)
    await expectNoA11yViolations(container)
  })
})

describe('state', () => {
  test('the five reasons: trigger-press, close-press, escape, outside-press and native-close', async () => {
    const reasons: DialogChangeReason[] = []
    await render(
      <Example
        dismissOnOutsidePress
        onOpenChange={(_open, details) => reasons.push(details.reason)}
      />,
    )
    const open = async () => {
      await userEvent.click(trigger())
      await expect.poll(isModal).toBe(true)
    }
    await open()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
    await open()
    pressAt(popupElement() as Element, 2, 2)
    await expect.poll(isModal).toBe(false)
    await open()
    await userEvent.click(closeButton())
    await expect.poll(isModal).toBe(false)
    await open()
    popupElement()?.close()
    await expect.poll(() => reasons.length).toBe(8)
    expect(reasons).toEqual([
      'trigger-press',
      'escape',
      'trigger-press',
      'outside-press',
      'trigger-press',
      'close-press',
      'trigger-press',
      'native-close',
    ])
  })

  test('a controlled owner that refuses keeps the dialog open after Escape', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DialogChangeDetails) => void>()
    await render(<Controlled refuse onOpenChange={onOpenChange} />)
    await userEvent.click(page.getByRole('button', { name: 'Öppna' }))
    await expect.poll(isModal).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => onOpenChange.mock.calls.length).toBeGreaterThan(0)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(isModal()).toBe(true)
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape' }),
    )
  })

  test('a native close that a controlled owner refuses shows the dialog again', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DialogChangeDetails) => void>()
    await render(<Controlled refuse onOpenChange={onOpenChange} />)
    await userEvent.click(page.getByRole('button', { name: 'Öppna' }))
    await expect.poll(isModal).toBe(true)
    popupElement()?.close()
    await expect.poll(() => onOpenChange.mock.calls.at(-1)?.[1].reason).toBe('native-close')
    await expect.poll(isModal).toBe(true)
  })

  test('a native close that the owner accepts closes the state too', async () => {
    await render(<Controlled />)
    await userEvent.click(page.getByRole('button', { name: 'Öppna' }))
    await expect.poll(isModal).toBe(true)
    popupElement()?.close()
    await expect.element(page.getByTestId('open')).toHaveTextContent('false')
    expect(isModal()).toBe(false)
  })

  test('a cancel event is turned into an escape request, and the dialog closes only if the owner says so', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: DialogChangeDetails) => void>()
    await render(<Example defaultOpen onOpenChange={onOpenChange} />)
    await expect.poll(isModal).toBe(true)
    const cancel = new Event('cancel', { cancelable: true })
    popupElement()?.dispatchEvent(cancel)
    expect(cancel.defaultPrevented).toBe(true)
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'escape' }))
    await expect.poll(isModal).toBe(false)
  })

  test('an owner that opens and closes it from state is followed in both directions', async () => {
    await render(<Controlled />)
    await userEvent.click(page.getByRole('button', { name: 'Öppna' }))
    await expect.poll(isModal).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
    await expect.element(page.getByTestId('open')).toHaveTextContent('false')
  })
})

describe('scroll lock', () => {
  test('data-kv-scroll-locked is on <html> while a dialog is open, and gone after', async () => {
    await render(<Example />)
    expect(isScrollLocked()).toBe(false)
    await userEvent.click(trigger())
    await expect.poll(isScrollLocked).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isScrollLocked).toBe(false)
  })

  test('nested dialogs lock once, and the lock stays until the last one closes', async () => {
    await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup className="outer">
          <Dialog.Title>Yttre</Dialog.Title>
          <Dialog.Root>
            <Dialog.Trigger>Öppna inre</Dialog.Trigger>
            <Dialog.Popup>
              <Dialog.Title>Inre</Dialog.Title>
              <button type="button">Inuti</button>
            </Dialog.Popup>
          </Dialog.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.poll(isScrollLocked).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Öppna inre' }))
    await expect.poll(() => document.querySelectorAll('dialog:modal').length).toBe(2)
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.querySelectorAll('dialog:modal').length).toBe(1)
    expect(isScrollLocked()).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isScrollLocked).toBe(false)
  })

  test('unmounting an open dialog releases the lock', async () => {
    const screen = await render(<Example defaultOpen />)
    await expect.poll(isScrollLocked).toBe(true)
    await screen.unmount()
    expect(isScrollLocked()).toBe(false)
  })

  test('the hook sets no inline style on <html> or <body>', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isScrollLocked).toBe(true)
    expect(document.documentElement.getAttribute('style')).toBeNull()
    expect(document.body.getAttribute('style')).toBeNull()
  })
})

describe('announcements', () => {
  function Announces() {
    const { announce } = useAnnouncer()
    return (
      <button type="button" onClick={() => announce('3 resultat')}>
        Sök
      </button>
    )
  }

  test('a component inside announces in the dialog’s own live region, which exists only while open', async () => {
    await render(
      <Dialog.Root>
        <Dialog.Trigger>Ändra</Dialog.Trigger>
        <Dialog.Popup aria-label="Sök">
          <Announces />
        </Dialog.Popup>
      </Dialog.Root>,
    )
    expect(popupElement()?.querySelector('[aria-live]')).toBeNull()
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Sök' }))
    await expect
      .poll(() => popupElement()?.querySelector('[aria-live="polite"]')?.textContent)
      .toBe('3 resultat')
    expect(popupElement()?.querySelector('[role="alert"]')).not.toBeNull()
    expect(warnings()).not.toContain('announcer-without-provider')
  })
})

describe('announcements are cleared on close', () => {
  test('a message announced inside is gone when the dialog opens again', async () => {
    function Announces() {
      const { announce } = useAnnouncer()
      return (
        <button type="button" onClick={() => announce('3 resultat')}>
          Sök
        </button>
      )
    }
    await render(
      <Dialog.Root>
        <Dialog.Trigger>Ändra</Dialog.Trigger>
        <Dialog.Popup aria-label="Sök">
          <Announces />
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Sök' }))
    await expect
      .poll(() => popupElement()?.querySelector('[aria-live="polite"]')?.textContent)
      .toBe('3 resultat')
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    expect(popupElement()?.querySelector('[aria-live="polite"]')?.textContent).toBe('')
  })
})

describe('development warnings', () => {
  test('a dialog without a name warns, and a title or an aria-label silences it', async () => {
    const { unmount } = await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <p>Utan namn</p>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.poll(warnings).toContain('no accessible name')
    await unmount()
    resetDevWarnings()
    consoleWarn.mockClear()
    await render(
      <>
        <Dialog.Root defaultOpen>
          <Dialog.Popup aria-label="Namn" />
        </Dialog.Root>
        <Dialog.Root defaultOpen>
          <Dialog.Popup>
            <Dialog.Title>Titel</Dialog.Title>
          </Dialog.Popup>
        </Dialog.Root>
      </>,
    )
    await expect.poll(() => document.querySelectorAll('dialog:modal').length).toBe(2)
    expect(warnings()).not.toContain('no accessible name')
  })

  test('a popup named by the consumer’s aria-labelledby does not warn', async () => {
    await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup aria-labelledby="egen-rubrik">
          <h2 id="egen-rubrik">Egen rubrik</h2>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.poll(isModal).toBe(true)
    expect(warnings()).not.toContain('no accessible name')
  })

  test('a closed dialog warns about nothing', async () => {
    await render(
      <Dialog.Root>
        <Dialog.Popup>
          <p>Utan namn</p>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a part outside a Dialog.Root warns', async () => {
    await render(
      <>
        <Dialog.Trigger>Ändra</Dialog.Trigger>
        <Dialog.Close>Stäng</Dialog.Close>
      </>,
    )
    await expect.poll(warnings).toContain('Dialog.Trigger is outside a Dialog.Root')
    expect(warnings()).toContain('Dialog.Close is outside a Dialog.Root')
  })
})

describe('types', () => {
  test('the public types', () => {
    expectTypeOf<DialogChangeReason>().toEqualTypeOf<
      'trigger-press' | 'close-press' | 'escape' | 'outside-press' | 'native-close'
    >()
    expectTypeOf<UseDialogOptions['dismissOnOutsidePress']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<UseDialogResult['registerTitle']>().toEqualTypeOf<() => () => void>()
    expectTypeOf(DialogRoot).parameter(0).toExtend<DialogRootProps>()
  })
})
