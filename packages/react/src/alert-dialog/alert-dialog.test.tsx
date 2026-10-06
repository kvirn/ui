import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { useAnnouncer } from '../announcer/use-announcer.ts'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { AlertDialog, Dialog } from '../index.ts'
import type {
  AlertDialogChangeDetails,
  UseAlertDialogOptions,
  UseAlertDialogResult,
} from '../index.ts'
import { useAlertDialog } from './use-alert-dialog.ts'

// Contract: alert-dialog.a11y.md. The shared Dialog behaviour (focus return, scroll lock,
// announcements, nesting) is proved in dialog.test.tsx; this file proves what an alert dialog adds.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const warnings = () => consoleWarn.mock.calls.flat().join('\n')

// Without the theme the buttons touch: axe's target-size rule (2.5.8) needs room between them.
const spaced = { margin: 8 }

interface ConfirmProps {
  onOpenChange?: (open: boolean, details: AlertDialogChangeDetails) => void
  refuse?: boolean
  defaultOpen?: boolean
  withFocusRef?: boolean
  withDescription?: boolean
  children?: ReactNode
}

function Confirm({
  onOpenChange,
  refuse = false,
  defaultOpen = false,
  withFocusRef = true,
  withDescription = true,
  children,
}: ConfirmProps) {
  const [open, setOpen] = useState(defaultOpen)
  const keepRef = useRef<HTMLButtonElement>(null)
  return (
    <>
      <button type="button">Före</button>
      <AlertDialog.Root
        open={open}
        initialFocusRef={withFocusRef ? keepRef : undefined}
        onOpenChange={(next, details) => {
          onOpenChange?.(next, details)
          if (!refuse) {
            setOpen(next)
          }
        }}
      >
        <AlertDialog.Trigger>Ta bort utkast</AlertDialog.Trigger>
        <AlertDialog.Popup>
          <AlertDialog.Title>Vill du ta bort utkastet?</AlertDialog.Title>
          {withDescription ? (
            <AlertDialog.Description>Det går inte att ångra.</AlertDialog.Description>
          ) : null}
          {children}
          <AlertDialog.Actions>
            <button type="button" style={spaced} onClick={() => setOpen(false)}>
              Ta bort utkastet
            </button>
            <button ref={keepRef} type="button" style={spaced} onClick={() => setOpen(false)}>
              Behåll utkastet
            </button>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Root>
      <button type="button">Efter</button>
    </>
  )
}

const trigger = () => page.getByRole('button', { name: 'Ta bort utkast', exact: true })
const deleteButton = () => page.getByRole('button', { name: 'Ta bort utkastet', exact: true })
const keepButton = () => page.getByRole('button', { name: 'Behåll utkastet', exact: true })
const popupElement = () => document.querySelector<HTMLDialogElement>('dialog.kv-alert-dialog')
const triggerElement = () => document.querySelector<HTMLButtonElement>('.kv-dialog-trigger')
const isModal = () => popupElement()?.matches(':modal') === true

const pressAt = (element: Element, clientX: number, clientY: number, pointerType = 'mouse') =>
  element.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      clientX,
      clientY,
      pointerType,
      pointerId: 7,
    }),
  )

describe('rendering and ARIA', () => {
  test('a closed alert dialog is a hidden <dialog> whose content is not reachable', async () => {
    const { container } = await render(<Confirm />)
    expect(popupElement()?.open).toBe(false)
    expect(popupElement()?.querySelector('button')?.checkVisibility()).toBe(false)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('an open alert dialog is modal, has role alertdialog, a name, a description and no axe violations', async () => {
    const { container } = await render(<Confirm />)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    const popup = popupElement()
    expect(popup?.getAttribute('role')).toBe('alertdialog')
    expect(popup?.getAttribute('aria-modal')).toBe('true')
    expect(popup?.getAttribute('aria-labelledby')).toBe(
      document.querySelector('.kv-alert-dialog-title')?.id,
    )
    expect(popup?.getAttribute('aria-describedby')).toBe(
      document.querySelector('.kv-alert-dialog-description')?.id,
    )
    expect(popup?.hasAttribute('data-open')).toBe(true)
    expect(triggerElement()?.getAttribute('aria-haspopup')).toBe('dialog')
    await expect
      .element(page.getByRole('alertdialog', { name: 'Vill du ta bort utkastet?' }))
      .toBeVisible()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('every part carries the shared kv-dialog class and its own kv-alert-dialog class', async () => {
    await render(<Confirm defaultOpen />)
    await expect.poll(isModal).toBe(true)
    expect(popupElement()?.classList.contains('kv-dialog')).toBe(true)
    expect(document.querySelector('.kv-alert-dialog-title.kv-dialog-title')?.tagName).toBe('H2')
    expect(
      document.querySelector('.kv-alert-dialog-description.kv-dialog-description')?.tagName,
    ).toBe('P')
    expect(document.querySelector('.kv-alert-dialog-actions.kv-dialog-actions')).not.toBeNull()
  })

  test('Close is a plain button with its own class and no icon, no default name and no aria-label', async () => {
    await render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Popup>
          <AlertDialog.Title>Titel</AlertDialog.Title>
          <AlertDialog.Description>Text</AlertDialog.Description>
          <AlertDialog.Close>Behåll</AlertDialog.Close>
        </AlertDialog.Popup>
      </AlertDialog.Root>,
    )
    await expect.poll(isModal).toBe(true)
    const close = document.querySelector('.kv-alert-dialog-close')
    expect(close?.tagName).toBe('BUTTON')
    expect(close?.getAttribute('type')).toBe('button')
    expect(close?.hasAttribute('aria-label')).toBe(false)
    expect(close?.querySelector('svg')).toBeNull()
    expect(close?.classList.contains('kv-dialog-close')).toBe(false)
    expect(close?.textContent).toBe('Behåll')
  })

  test('forwards refs, className and native props, and render replaces the element', async () => {
    const popupRef = createRef<HTMLDialogElement>()
    await render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Popup ref={popupRef} className="egen" data-egen="popup">
          <AlertDialog.Title render={(partProps) => <h3 {...partProps}>{partProps.children}</h3>}>
            Titel
          </AlertDialog.Title>
          <AlertDialog.Description>Text</AlertDialog.Description>
          <AlertDialog.Body render={<section />}>Innehåll</AlertDialog.Body>
        </AlertDialog.Popup>
      </AlertDialog.Root>,
    )
    expect(popupRef.current).toBe(popupElement())
    expect(popupRef.current?.classList.contains('egen')).toBe(true)
    expect(popupRef.current?.classList.contains('kv-alert-dialog')).toBe(true)
    expect(popupRef.current?.classList.contains('kv-dialog')).toBe(true)
    expect(popupRef.current?.getAttribute('data-egen')).toBe('popup')
    expect(document.querySelector('h3.kv-dialog-title')).not.toBeNull()
    expect(document.querySelector('section.kv-dialog-body')).not.toBeNull()
  })

  test('useAlertDialog spreads the same props, with the alertdialog role, on your own elements', async () => {
    function Own() {
      const alertDialog = useAlertDialog()
      const { registerTitle, registerDescription } = alertDialog
      useEffect(() => registerTitle(), [registerTitle])
      useEffect(() => registerDescription(), [registerDescription])
      return (
        <>
          <button {...alertDialog.triggerProps}>Öppna</button>
          <dialog {...alertDialog.popupProps}>
            {alertDialog.isOpen ? (
              <>
                <h2 {...alertDialog.titleProps}>Egen titel</h2>
                <p {...alertDialog.descriptionProps}>Egen text</p>
                <button {...alertDialog.closeProps}>Stäng</button>
              </>
            ) : null}
          </dialog>
        </>
      )
    }
    await render(<Own />)
    await userEvent.click(page.getByRole('button', { name: 'Öppna' }))
    await expect.element(page.getByRole('alertdialog', { name: 'Egen titel' })).toBeVisible()
    await expect.element(page.getByRole('alertdialog')).toHaveAccessibleDescription('Egen text')
  })

  test('server rendering with defaultOpen writes a closed <dialog> and touches no window', () => {
    const html = renderToString(<Confirm defaultOpen />)
    expect(html).not.toMatch(/<dialog[^>]*\sopen/)
    expect(html).toContain('Vill du ta bort utkastet?')
  })

  test('nested over a Dialog, with no axe violations', async () => {
    const { container } = await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Dialog.Title>Redigera</Dialog.Title>
          <AlertDialog.Root defaultOpen>
            <AlertDialog.Popup>
              <AlertDialog.Title>Förkasta?</AlertDialog.Title>
              <AlertDialog.Description>Ändringarna sparas inte.</AlertDialog.Description>
              <button type="button">Förkasta</button>
            </AlertDialog.Popup>
          </AlertDialog.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.poll(() => document.querySelectorAll('dialog:modal').length).toBe(2)
    await expectNoA11yViolations(container)
  })
})

describe('keyboard', () => {
  test('Tab focuses the trigger, and is one stop', async () => {
    await render(<Confirm />)
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(trigger()).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('Shift+Tab leaves the trigger backwards', async () => {
    await render(<Confirm />)
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('Enter and Space on the trigger open it, and focus starts on initialFocusRef', async () => {
    await render(<Confirm />)
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    await expect.poll(isModal).toBe(true)
    await expect.element(keepButton()).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
    await userEvent.keyboard(' ')
    await expect.poll(isModal).toBe(true)
    await expect.element(keepButton()).toHaveFocus()
  })

  test('Tab and Shift+Tab move between the tabbable elements inside, in DOM order', async () => {
    await render(<Confirm defaultOpen />)
    await expect.poll(isModal).toBe(true)
    await expect.element(keepButton()).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(deleteButton()).toHaveFocus()
    await userEvent.tab()
    await expect.element(keepButton()).toHaveFocus()
  })

  test('Tab and Shift+Tab never reach the page behind the dialog', async () => {
    await render(<Confirm defaultOpen />)
    await expect.poll(isModal).toBe(true)
    const outside = [...document.querySelectorAll('button')].filter(
      (button) => !popupElement()?.contains(button),
    )
    expect(outside.length).toBeGreaterThan(0)
    for (let step = 0; step < 6; step += 1) {
      await userEvent.tab()
      expect(outside).not.toContain(document.activeElement)
    }
    for (let step = 0; step < 6; step += 1) {
      await userEvent.tab({ shift: true })
      expect(outside).not.toContain(document.activeElement)
    }
  })

  test('Escape reports escape, closes the alert dialog and returns focus to the trigger', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: AlertDialogChangeDetails) => void>()
    await render(<Confirm onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape' }),
    )
  })

  test('Escape that the owner refuses keeps the alert dialog open', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: AlertDialogChangeDetails) => void>()
    await render(<Confirm defaultOpen refuse onOpenChange={onOpenChange} />)
    await expect.poll(isModal).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => onOpenChange.mock.calls.length).toBe(1)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(isModal()).toBe(true)
  })

  test('Escape closes an alert dialog over a dialog first, then the dialog', async () => {
    await render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup className="outer-dialog">
          <Dialog.Title>Redigera</Dialog.Title>
          <AlertDialog.Root>
            <AlertDialog.Trigger>Förkasta</AlertDialog.Trigger>
            <AlertDialog.Popup>
              <AlertDialog.Title>Förkasta?</AlertDialog.Title>
              <AlertDialog.Description>Ändringarna sparas inte.</AlertDialog.Description>
              <button type="button">Ja, förkasta</button>
            </AlertDialog.Popup>
          </AlertDialog.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    const outerModal = () => document.querySelector('.outer-dialog')?.matches(':modal') === true
    await expect.poll(outerModal).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Förkasta', exact: true }))
    await expect.poll(isModal).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isModal).toBe(false)
    expect(outerModal()).toBe(true)
    await expect.element(page.getByRole('button', { name: 'Förkasta', exact: true })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(outerModal).toBe(false)
  })

  test('Enter and Space on an action are the button’s own, and the consumer closes it', async () => {
    await render(<Confirm defaultOpen />)
    await expect.poll(isModal).toBe(true)
    await userEvent.keyboard('{Enter}')
    await expect.poll(isModal).toBe(false)
    await userEvent.click(trigger())
    await expect.poll(isModal).toBe(true)
    await userEvent.keyboard(' ')
    await expect.poll(isModal).toBe(false)
  })

  test('Enter and Space on Close close the alert dialog with reason close-press, and focus returns', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: AlertDialogChangeDetails) => void>()
    await render(
      <AlertDialog.Root onOpenChange={onOpenChange}>
        <AlertDialog.Trigger>Öppna</AlertDialog.Trigger>
        <AlertDialog.Popup>
          <AlertDialog.Title>Titel</AlertDialog.Title>
          <AlertDialog.Description>Text</AlertDialog.Description>
          <AlertDialog.Close>Behåll</AlertDialog.Close>
        </AlertDialog.Popup>
      </AlertDialog.Root>,
    )
    const open = page.getByRole('button', { name: 'Öppna' })
    await userEvent.click(open)
    await expect.poll(isModal).toBe(true)
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Behåll' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(isModal).toBe(false)
    await expect.element(open).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'close-press' }),
    )
    await userEvent.keyboard(' ')
    await expect.poll(isModal).toBe(true)
    await userEvent.tab()
    await userEvent.keyboard(' ')
    await expect.poll(isModal).toBe(false)
  })

  test('a controlled owner may refuse a Close press, and the alert dialog stays open', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: AlertDialogChangeDetails) => void>()
    await render(
      <AlertDialog.Root open onOpenChange={onOpenChange}>
        <AlertDialog.Popup>
          <AlertDialog.Title>Titel</AlertDialog.Title>
          <AlertDialog.Description>Text</AlertDialog.Description>
          <AlertDialog.Close>Behåll</AlertDialog.Close>
        </AlertDialog.Popup>
      </AlertDialog.Root>,
    )
    await expect.poll(isModal).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Behåll' }))
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'close-press' }),
    )
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(isModal()).toBe(true)
  })

  test('a press on the backdrop never closes an alert dialog', async () => {
    const onOpenChange = vi.fn<() => void>()
    await render(<Confirm defaultOpen onOpenChange={onOpenChange} />)
    await expect.poll(isModal).toBe(true)
    const popup = popupElement()
    if (popup === null) {
      throw new Error('no popup')
    }
    pressAt(popup, 2, 2)
    pressAt(popup, 2, 2, 'touch')
    popup.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        clientX: 2,
        clientY: 2,
        pointerType: 'touch',
        pointerId: 7,
      }),
    )
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(isModal()).toBe(true)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  test('a press inside the alert dialog does nothing', async () => {
    const onOpenChange = vi.fn<() => void>()
    await render(<Confirm defaultOpen onOpenChange={onOpenChange} />)
    await expect.poll(isModal).toBe(true)
    await userEvent.click(page.getByText('Det går inte att ångra.'))
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(isModal()).toBe(true)
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

describe('focus', () => {
  test('with no initialFocusRef, focus starts on the title, not the first control', async () => {
    await render(<Confirm defaultOpen withFocusRef={false} />)
    await expect.poll(() => document.activeElement?.textContent).toBe('Vill du ta bort utkastet?')
  })

  test('initial focus is initialFocusRef, the safe action, not the first control', async () => {
    await render(<Confirm defaultOpen />)
    await expect.element(keepButton()).toHaveFocus()
  })
})

describe('announcements', () => {
  function Announces() {
    const { announce } = useAnnouncer()
    return (
      <button type="button" onClick={() => announce('Sparat')}>
        Spara
      </button>
    )
  }

  test('a component inside announces in the alert dialog’s own live region', async () => {
    await render(
      <Confirm defaultOpen>
        <Announces />
      </Confirm>,
    )
    await expect.poll(isModal).toBe(true)
    await userEvent.click(page.getByRole('button', { name: 'Spara' }))
    await expect
      .poll(() => popupElement()?.querySelector('[aria-live="polite"]')?.textContent)
      .toBe('Sparat')
  })
})

describe('development warnings', () => {
  test('no Description warns, because an alert dialog is read out with its message', async () => {
    await render(<Confirm defaultOpen withDescription={false} />)
    await expect.poll(warnings).toContain('has no Description')
  })

  test('no initialFocusRef warns', async () => {
    await render(<Confirm defaultOpen withFocusRef={false} />)
    await expect.poll(warnings).toContain('no initialFocusRef')
  })

  test('with a Description and an initialFocusRef nothing warns', async () => {
    await render(<Confirm defaultOpen />)
    await expect.poll(isModal).toBe(true)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('no name warns', async () => {
    await render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Popup>
          <AlertDialog.Description>Text</AlertDialog.Description>
        </AlertDialog.Popup>
      </AlertDialog.Root>,
    )
    await expect.poll(warnings).toContain('no accessible name')
  })

  test('a title silences the no-name warning', async () => {
    await render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Popup>
          <AlertDialog.Title>Titel</AlertDialog.Title>
          <AlertDialog.Description>Text</AlertDialog.Description>
        </AlertDialog.Popup>
      </AlertDialog.Root>,
    )
    await expect.poll(isModal).toBe(true)
    expect(warnings()).not.toContain('no accessible name')
  })
})

describe('Close without a name', () => {
  test('a Close with no children, aria-label or aria-labelledby warns', async () => {
    await render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Popup>
          <AlertDialog.Title>Titel</AlertDialog.Title>
          <AlertDialog.Description>Text</AlertDialog.Description>
          <AlertDialog.Close />
        </AlertDialog.Popup>
      </AlertDialog.Root>,
    )
    await expect.poll(warnings).toContain('AlertDialog.Close has no name')
  })

  test('a Close with children or an aria-label does not warn', async () => {
    await render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Popup>
          <AlertDialog.Title>Titel</AlertDialog.Title>
          <AlertDialog.Description>Text</AlertDialog.Description>
          <AlertDialog.Close>Behåll</AlertDialog.Close>
          <AlertDialog.Close aria-label="Stäng" />
        </AlertDialog.Popup>
      </AlertDialog.Root>,
    )
    await expect.poll(isModal).toBe(true)
    expect(warnings()).not.toContain('AlertDialog.Close has no name')
  })
})

describe('types', () => {
  test('the options have no dismissOnOutsidePress, and the result is the dialog’s', () => {
    expectTypeOf<UseAlertDialogOptions>().not.toHaveProperty('dismissOnOutsidePress')
    expectTypeOf<UseAlertDialogOptions>().toHaveProperty('initialFocusRef')
    expectTypeOf<UseAlertDialogResult['popupProps']['role']>().toEqualTypeOf<
      'dialog' | 'alertdialog'
    >()
  })
})
