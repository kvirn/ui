import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { StrictMode, createRef, useEffect, useState } from 'react'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import {
  Button,
  Dialog,
  Menu,
  MenuRoot,
  Popover,
  Toolbar,
  Tooltip,
  createTooltipGroup,
} from '../index.ts'
import type {
  MenuChangeDetails,
  MenuChangeReason,
  MenuRootProps,
  UseMenuOptions,
  UseMenuResult,
} from '../index.ts'
import { useMenu } from './use-menu.ts'

// Contract: menu.a11y.md. Component tests load no theme: the popup is the browser's own
// `popover` element with the inline placement the hook sets.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

/** The fixture's own buttons are unstyled: give them the 24px that 2.5.8 asks for, so axe checks the Menu. */
const controlStyle = { display: 'block', minBlockSize: '2rem', minInlineSize: '2rem' } as const

interface ExampleProps extends Omit<MenuRootProps, 'children'> {
  onPrint?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined
  onShare?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined
  closeOnSelect?: boolean | undefined
}

function Example({ onPrint, onShare, closeOnSelect, ...rootProps }: ExampleProps) {
  return (
    <>
      {/* Above the trigger, so the popup (placed under it) never covers the text a test presses. */}
      <p>Text utanför</p>
      <button type="button" style={controlStyle}>
        Före
      </button>
      <Menu.Root {...rootProps}>
        <Menu.Trigger style={controlStyle}>Åtgärder</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item style={controlStyle} onSelect={onPrint} closeOnSelect={closeOnSelect}>
            Skriv ut
          </Menu.Item>
          <Menu.Item style={controlStyle} disabled onSelect={onShare}>
            Dela
          </Menu.Item>
          <Menu.Item style={controlStyle}>Ladda ner</Menu.Item>
          <Menu.Item style={controlStyle}>Ladda upp</Menu.Item>
          <Menu.Separator />
          <Menu.Item style={controlStyle}>Radera</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <button type="button" style={controlStyle}>
        Efter
      </button>
    </>
  )
}

const trigger = () => page.getByRole('button', { name: 'Åtgärder', exact: true })
const item = (name: string) => page.getByRole('menuitem', { name, exact: true })
const triggerElement = () => trigger().element()
const popupElement = () => document.querySelector<HTMLElement>('.kv-menu-popup')
const isShown = () => popupElement()?.matches(':popover-open') === true
const openWithClick = async () => {
  await userEvent.click(trigger())
  await expect.poll(isShown).toBe(true)
}
const openWithEnter = async () => {
  triggerElement().focus()
  await userEvent.keyboard('{Enter}')
  await expect.poll(isShown).toBe(true)
}

describe('rendering', () => {
  test('a closed menu: the trigger is wired to a hidden popup', async () => {
    const { container } = await render(<Example />)
    const button = triggerElement()
    const popup = popupElement()
    expect(button.getAttribute('type')).toBe('button')
    expect(button.getAttribute('aria-haspopup')).toBe('menu')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.hasAttribute('data-open')).toBe(false)
    expect(button.getAttribute('aria-controls')).toBe(popup?.id)
    expect(popup?.getAttribute('popover')).toBe('auto')
    expect(popup?.getAttribute('role')).toBe('menu')
    expect(popup?.getAttribute('aria-labelledby')).toBe(button.id)
    expect(popup?.querySelectorAll('[role^="menuitem"]')).toHaveLength(5)
    expect(isShown()).toBe(false)
    await expectNoA11yViolations(container)
  })

  test('an open menu: expanded, shown, a roving tabindex on the items, no axe violations', async () => {
    const { container } = await render(<Example />)
    await openWithClick()
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
    expect(triggerElement().hasAttribute('data-open')).toBe(true)
    expect(popupElement()?.hasAttribute('data-open')).toBe(true)
    const items = Array.from(popupElement()?.querySelectorAll('[role="menuitem"]') ?? [])
    expect(items).toHaveLength(5)
    for (const element of items) {
      // Opening focused the first item: it is the one tabbable element, the others are not.
      expect(element.getAttribute('tabindex')).toBe(element === document.activeElement ? '0' : '-1')
      expect(element.getAttribute('type')).toBe('button')
    }
    expect(popupElement()?.querySelector('[role="separator"]')).not.toBeNull()
    await expectNoA11yViolations(container)
  })

  test('a disabled item has aria-disabled and data-disabled, and is still a button that takes focus', async () => {
    await render(<Example />)
    await openWithClick()
    const disabled = item('Dela').element()
    expect(disabled.getAttribute('aria-disabled')).toBe('true')
    expect(disabled.hasAttribute('data-disabled')).toBe(true)
    expect(disabled.hasAttribute('disabled')).toBe(false)
  })

  test('checkbox and radio items expose role, aria-checked and groups, with no axe violations', async () => {
    const { container } = await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger style={controlStyle}>Visa</Menu.Trigger>
        <Menu.Popup>
          <Menu.Group>
            <Menu.GroupLabel>Layout</Menu.GroupLabel>
            <Menu.CheckboxItem style={controlStyle} defaultChecked>
              Rutnät
            </Menu.CheckboxItem>
            <Menu.CheckboxItem style={controlStyle}>Kompakt</Menu.CheckboxItem>
          </Menu.Group>
          <Menu.Separator />
          <Menu.RadioGroup aria-label="Sortera" defaultValue="name">
            <Menu.RadioItem style={controlStyle} value="name">
              Namn
            </Menu.RadioItem>
            <Menu.RadioItem style={controlStyle} value="date">
              Datum
            </Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Item style={controlStyle} disabled>
            Dela
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(isShown).toBe(true)
    const grid = page.getByRole('menuitemcheckbox', { name: 'Rutnät' })
    await expect.element(grid).toHaveAttribute('aria-checked', 'true')
    await expect.element(grid).toHaveAttribute('data-checked', '')
    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'Kompakt' }))
      .toHaveAttribute('aria-checked', 'false')
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Namn' }))
      .toHaveAttribute('aria-checked', 'true')
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Datum' }))
      .toHaveAttribute('aria-checked', 'false')
    await expect.element(page.getByRole('group', { name: 'Layout' })).toBeVisible()
    await expect.element(page.getByRole('group', { name: 'Sortera' })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('a scrolling menu has keyboard access through its focused item, and no axe violations', async () => {
    const { container } = await render(
      <>
        <button type="button" style={controlStyle}>
          Före
        </button>
        <Menu.Root>
          <Menu.Trigger style={controlStyle}>Åtgärder</Menu.Trigger>
          <Menu.Popup
            style={{ '--kv-popup-height-limit': '6rem', overflowY: 'auto' } as CSSProperties}
          >
            {Array.from({ length: 30 }, (_, index) => (
              <Menu.Item key={index} style={controlStyle}>
                {`Åtgärd ${index + 1}`}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Root>
        <button type="button" style={controlStyle}>
          Efter
        </button>
      </>,
    )
    await openWithEnter()
    const popup = popupElement()
    expect(popup && popup.scrollHeight > popup.clientHeight).toBe(true)
    expect(popup?.hasAttribute('tabindex')).toBe(false)
    expect(document.activeElement?.getAttribute('tabindex')).toBe('0')
    await expect.element(item('Åtgärd 1')).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  test('the popup is named by the trigger unless the consumer names it', async () => {
    await render(
      <Menu.Root>
        <Menu.Trigger>Åtgärder</Menu.Trigger>
        <Menu.Popup aria-label="Egen etikett">
          <Menu.Item>Skriv ut</Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    )
    const popup = popupElement()
    expect(popup?.getAttribute('aria-label')).toBe('Egen etikett')
    expect(popup?.hasAttribute('aria-labelledby')).toBe(false)
  })

  test('forwards refs, className and native props, and merges them with its own', async () => {
    const triggerRef = createRef<HTMLButtonElement>()
    const popupRef = createRef<HTMLDivElement>()
    const itemRef = createRef<HTMLButtonElement>()
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger ref={triggerRef} className="egen" data-egen="trigger">
          Åtgärder
        </Menu.Trigger>
        <Menu.Popup ref={popupRef} className="egen" data-egen="popup">
          <Menu.Item ref={itemRef} className="egen" data-egen="item">
            Skriv ut
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(isShown).toBe(true)
    expect(triggerRef.current).toBe(triggerElement())
    expect(popupRef.current).toBe(popupElement())
    expect(itemRef.current).toBe(item('Skriv ut').element())
    expect(triggerRef.current?.className).toBe('egen kv-menu-trigger')
    expect(popupRef.current?.className).toBe('egen kv-menu-popup')
    expect(itemRef.current?.className).toBe('egen kv-menu-item')
    expect(itemRef.current?.getAttribute('data-egen')).toBe('item')
  })

  test('render replaces the element on every part and gives the state', async () => {
    const states: boolean[] = []
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger
          render={(partProps) => (
            <button {...partProps} data-egen="render">
              Åtgärder
            </button>
          )}
        />
        <Menu.Popup
          render={(partProps, state) => {
            states.push(state.isOpen)
            return <section {...partProps} />
          }}
        >
          <Menu.Group render={(partProps) => <section {...partProps} />} aria-label="Grupp">
            <Menu.GroupLabel render={(partProps) => <span {...partProps} data-egen="label" />}>
              Etikett
            </Menu.GroupLabel>
            <Menu.Item
              render={(partProps, state) => (
                <button {...partProps} data-highlighted-state={String(state.isHighlighted)} />
              )}
            >
              Ett
            </Menu.Item>
            <Menu.CheckboxItem
              render={(partProps) => <button {...partProps} data-egen="checkbox" />}
            >
              Två
            </Menu.CheckboxItem>
          </Menu.Group>
          <Menu.RadioGroup aria-label="Val" render={(partProps) => <section {...partProps} />}>
            <Menu.RadioItem
              value="a"
              render={(partProps) => <button {...partProps} data-egen="radio" />}
            >
              Tre
            </Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Separator render={(partProps) => <div {...partProps} data-egen="separator" />} />
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(isShown).toBe(true)
    expect(triggerElement().getAttribute('data-egen')).toBe('render')
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
    expect(popupElement()?.tagName).toBe('SECTION')
    expect(states.at(-1)).toBe(true)
    expect(document.querySelector('[data-egen="label"]')?.className).toBe('kv-menu-group-label')
    expect(document.querySelector('[data-egen="separator"]')?.getAttribute('role')).toBe(
      'separator',
    )
    expect(document.querySelector('[data-egen="checkbox"]')?.getAttribute('role')).toBe(
      'menuitemcheckbox',
    )
    expect(document.querySelector('[data-egen="radio"]')?.getAttribute('role')).toBe(
      'menuitemradio',
    )
    item('Ett').element().focus()
    await expect
      .poll(() => item('Ett').element().getAttribute('data-highlighted-state'))
      .toBe('true')
  })

  test('the focused item is the highlight: data-highlighted follows focus', async () => {
    await render(<Example />)
    await openWithEnter()
    await expect.element(item('Skriv ut')).toHaveAttribute('data-highlighted', '')
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Skriv ut')).not.toHaveAttribute('data-highlighted')
    await expect.element(item('Dela')).toHaveAttribute('data-highlighted', '')
  })

  test('useMenu spreads the same props on your own elements', async () => {
    function Own() {
      const menu = useMenu()
      const [current, setCurrent] = useState<string>()
      return (
        <>
          <button {...menu.triggerProps}>Åtgärder</button>
          <div {...menu.popupProps}>
            {menu.isOpen ? (
              <>
                <button
                  {...menu.getItemProps('item', { isCurrent: current === 'print' })}
                  onFocus={() => setCurrent('print')}
                  onBlur={() => setCurrent(undefined)}
                >
                  Skriv ut
                </button>
                <button {...menu.getItemProps('checkbox', { checked: true })}>Rutnät</button>
                <button {...menu.getItemProps('radio', { disabled: true })}>Namn</button>
              </>
            ) : null}
          </div>
        </>
      )
    }
    await render(<Own />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Skriv ut')).toHaveFocus()
    await expect.element(item('Skriv ut')).toHaveAttribute('tabindex', '0')
    await expect.element(item('Skriv ut')).toHaveAttribute('data-highlighted', '')
    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'Rutnät' }))
      .toHaveAttribute('tabindex', '-1')
    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'Rutnät' }))
      .toHaveAttribute('aria-checked', 'true')
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Namn' }))
      .toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{Enter}')
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })
})

describe('keyboard: the trigger', () => {
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
    triggerElement().focus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('Enter and Space on the trigger open the menu with focus on the first item', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Skriv ut')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Skriv ut')).toHaveFocus()
  })

  test('ArrowDown and ArrowUp on the trigger open the menu on the first and last item', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Skriv ut')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await userEvent.keyboard('{ArrowUp}')
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Radera')).toHaveFocus()
  })

  test('a pointer press on the trigger toggles the menu, and a closing press does not reopen it', async () => {
    await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Skriv ut')).toHaveFocus()
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(false)
    // Wait out anything the platform's own light dismiss still queues.
    await wait(100)
    expect(isShown()).toBe(false)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('false')
  })
})

describe('keyboard: in the menu', () => {
  test('ArrowDown and ArrowUp move between items, wrap and include disabled items', async () => {
    await render(<Example />)
    await openWithEnter()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Dela')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Ladda ner')).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(item('Dela')).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    await expect.element(item('Radera')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Skriv ut')).toHaveFocus()
  })

  test('ArrowDown and ArrowUp do not flip in right-to-left text', async () => {
    await render(
      <div dir="rtl">
        <Example />
      </div>,
    )
    await openWithEnter()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Dela')).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    await expect.element(item('Radera')).toHaveFocus()
  })

  test('Home and End move to the first and last item', async () => {
    await render(<Example />)
    await openWithEnter()
    await userEvent.keyboard('{End}')
    await expect.element(item('Radera')).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect.element(item('Skriv ut')).toHaveFocus()
  })

  test('a character moves focus by typeahead, a word narrows it and a pause resets it', async () => {
    await render(<Example />)
    await openWithEnter()
    await userEvent.keyboard('r')
    await expect.element(item('Radera')).toHaveFocus()
    await wait(600)
    // A word narrows the match: "ladda u" passes over "Ladda ner" to "Ladda upp".
    await userEvent.keyboard('ladda u')
    await expect.element(item('Ladda upp')).toHaveFocus()
    await wait(600)
    // A repeated character cycles through the items that start with it.
    await userEvent.keyboard('l')
    await expect.element(item('Ladda ner')).toHaveFocus()
    await userEvent.keyboard('l')
    await expect.element(item('Ladda upp')).toHaveFocus()
    await wait(600)
    // A disabled item is found by typeahead too.
    await userEvent.keyboard('d')
    await expect.element(item('Dela')).toHaveFocus()
    expect(isShown()).toBe(true)
  })

  test('Control, Alt and Meta characters are not typeahead', async () => {
    await render(<Example />)
    await openWithEnter()
    await userEvent.keyboard('{Control>}r{/Control}')
    await userEvent.keyboard('{Alt>}r{/Alt}')
    await userEvent.keyboard('{Meta>}r{/Meta}')
    await expect.element(item('Skriv ut')).toHaveFocus()
  })

  test('a character taken by typeahead is prevented, one that is not is left alone', async () => {
    await render(<Example />)
    await openWithEnter()
    const prevented: Record<string, boolean> = {}
    const record = (event: KeyboardEvent) => {
      prevented[`${event.ctrlKey ? 'Control+' : ''}${event.key}`] = event.defaultPrevented
    }
    document.addEventListener('keydown', record)
    await userEvent.keyboard('r')
    await userEvent.keyboard('{Control>}r{/Control}')
    document.removeEventListener('keydown', record)
    expect(prevented['r']).toBe(true)
    expect(prevented['Control+r']).toBe(false)
  })

  test('keys typed in a field inside the popup are the field’s own', async () => {
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Åtgärder</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Skriv ut</Menu.Item>
          <input aria-label="Filter" />
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(isShown).toBe(true)
    const field = page.getByRole('textbox', { name: 'Filter' })
    field.element().focus()
    const prevented: boolean[] = []
    const record = (event: KeyboardEvent) => prevented.push(event.defaultPrevented)
    document.addEventListener('keydown', record)
    await userEvent.keyboard('rs{Home}{ArrowDown}')
    document.removeEventListener('keydown', record)
    expect(prevented.every((value) => !value)).toBe(true)
    await expect.element(field).toHaveFocus()
    await expect.element(field).toHaveValue('rs')
  })

  test('a key during IME composition is not typeahead', async () => {
    await render(<Example />)
    await openWithEnter()
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'r',
        isComposing: true,
        bubbles: true,
        cancelable: true,
      }),
    )
    await expect.element(item('Skriv ut')).toHaveFocus()
  })

  test('Space during a typeahead word adds a space and does not activate', async () => {
    const onPrint = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>()
    await render(<Example onPrint={onPrint} />)
    await openWithEnter()
    await userEvent.keyboard('s')
    await userEvent.keyboard(' ')
    await wait(50)
    expect(onPrint).not.toHaveBeenCalled()
    expect(isShown()).toBe(true)
    await userEvent.keyboard('{ArrowDown}')
    await wait(600)
    await userEvent.keyboard('ladda ')
    await userEvent.keyboard('u')
    await expect.element(item('Ladda upp')).toHaveFocus()
  })

  test('Enter and Space on an item run it, close the menu and return focus to the trigger', async () => {
    const onPrint = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>()
    await render(<Example onPrint={onPrint} />)
    await openWithEnter()
    await userEvent.keyboard('{Enter}')
    expect(onPrint).toHaveBeenCalledTimes(1)
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    await openWithEnter()
    await userEvent.keyboard(' ')
    expect(onPrint).toHaveBeenCalledTimes(2)
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })

  test('closeOnSelect={false} keeps the menu open and focus on the item', async () => {
    const onPrint = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>()
    await render(<Example onPrint={onPrint} closeOnSelect={false} />)
    await openWithEnter()
    await userEvent.keyboard('{Enter}')
    expect(onPrint).toHaveBeenCalledTimes(1)
    expect(isShown()).toBe(true)
    await expect.element(item('Skriv ut')).toHaveFocus()
  })

  test('event.preventDefault() in onSelect keeps the menu open', async () => {
    await render(<Example onPrint={(event) => event.preventDefault()} />)
    await openWithEnter()
    await userEvent.keyboard('{Enter}')
    expect(isShown()).toBe(true)
  })

  test('Enter and Space on a disabled item do nothing and keep the menu open', async () => {
    const onShare = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>()
    await render(<Example onShare={onShare} />)
    await openWithEnter()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Dela')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onShare).not.toHaveBeenCalled()
    expect(isShown()).toBe(true)
    await expect.element(item('Dela')).toHaveFocus()
  })

  test('Escape closes the menu and returns focus to the trigger, and only the menu', async () => {
    await render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Mer</Popover.Trigger>
        <Popover.Popup aria-label="Mer">
          <Menu.Root>
            <Menu.Trigger>Åtgärder</Menu.Trigger>
            <Menu.Popup>
              <Menu.Item>Skriv ut</Menu.Item>
            </Menu.Popup>
          </Menu.Root>
        </Popover.Popup>
      </Popover.Root>,
    )
    await expect.poll(() => document.querySelector('.kv-popover-popup:popover-open')).not.toBeNull()
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Skriv ut')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    expect(document.querySelector('.kv-popover-popup:popover-open')).not.toBeNull()
    await expect.element(trigger()).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.querySelector('.kv-popover-popup:popover-open')).toBeNull()
  })

  test('Tab in the menu closes it and moves focus to the next focusable after the trigger', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: MenuChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await openWithEnter()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'tab' }))
  })

  test('Shift+Tab in the menu closes it and moves focus to the trigger', async () => {
    await render(<Example />)
    await openWithEnter()
    await userEvent.tab({ shift: true })
    await expect.element(trigger()).toHaveFocus()
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })

  test('ArrowLeft and ArrowRight are not handled or prevented', async () => {
    await render(<Example />)
    await openWithEnter()
    const prevented: boolean[] = []
    const record = (event: KeyboardEvent) => prevented.push(event.defaultPrevented)
    document.addEventListener('keydown', record)
    await userEvent.keyboard('{ArrowRight}{ArrowLeft}')
    document.removeEventListener('keydown', record)
    expect(prevented).toEqual([false, false])
    await expect.element(item('Skriv ut')).toHaveFocus()
    expect(isShown()).toBe(true)
  })

  test('Escape does nothing while the menu is closed', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('{Escape}')
    expect(isShown()).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })
})

describe('pointer', () => {
  test('moving the pointer over an item focuses it, a press runs it and a press outside closes the menu', async () => {
    const onPrint = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>()
    await render(<Example onPrint={onPrint} />)
    await openWithClick()
    await userEvent.hover(item('Ladda upp'))
    await expect.element(item('Ladda upp')).toHaveFocus()
    await userEvent.hover(item('Radera'))
    await expect.element(item('Radera')).toHaveFocus()
    await userEvent.click(item('Skriv ut'))
    expect(onPrint).toHaveBeenCalledTimes(1)
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    await openWithClick()
    await userEvent.click(page.getByText('Text utanför'))
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })

  test('only a mouse move focuses an item: touch and pen moves do not', async () => {
    await render(<Example />)
    await openWithClick()
    const target = item('Radera').element()
    for (const pointerType of ['touch', 'pen']) {
      target.dispatchEvent(
        new PointerEvent('pointermove', { pointerType, movementX: 4, movementY: 4, bubbles: true }),
      )
    }
    await expect.element(item('Skriv ut')).toHaveFocus()
    target.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerType: 'mouse',
        movementX: 4,
        movementY: 4,
        bubbles: true,
      }),
    )
    await expect.element(item('Radera')).toHaveFocus()
  })

  test('a press on another control closes the menu, and that control keeps the focus', async () => {
    await render(<Example />)
    await openWithClick()
    await userEvent.click(page.getByRole('button', { name: 'Före' }))
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('a press on a disabled item does not run it or close the menu', async () => {
    const onShare = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>()
    await render(<Example onShare={onShare} />)
    await openWithClick()
    // Playwright will not press an aria-disabled element, as a user can: the click is dispatched.
    document.querySelector<HTMLElement>('[aria-disabled="true"]')?.click()
    expect(onShare).not.toHaveBeenCalled()
    expect(isShown()).toBe(true)
  })

  test('an enabled item runs the onClick of its render element and closes', async () => {
    const elementOnClick = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>()
    await render(
      <Menu.Root>
        <Menu.Trigger>Åtgärder</Menu.Trigger>
        <Menu.Popup aria-label="Åtgärder">
          <Menu.Item render={<button aria-label="Dela" onClick={elementOnClick} />}>Dela</Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    )
    await openWithEnter()
    await item('Dela').click()
    expect(elementOnClick).toHaveBeenCalledTimes(1)
    await expect.poll(isShown).toBe(false)
  })

  test('a disabled item does not run the onClick of its render element, by click or key', async () => {
    const elementOnClick = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>()
    await render(
      <Menu.Root>
        <Menu.Trigger>Åtgärder</Menu.Trigger>
        <Menu.Popup aria-label="Åtgärder">
          <Menu.Item disabled render={<button aria-label="Dela" onClick={elementOnClick} />}>
            Dela
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    )
    await openWithEnter()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Dela')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    document.querySelector<HTMLElement>('[aria-disabled="true"]')?.click()
    expect(elementOnClick).not.toHaveBeenCalled()
  })

  test('the platform hiding the popup (another auto popover opened) closes it in the state too', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: MenuChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await openWithClick()
    popupElement()?.hidePopover()
    await expect.poll(() => triggerElement().getAttribute('aria-expanded')).toBe('false')
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'light-dismiss' }),
    )
  })
})

describe('onOpenChange reasons', () => {
  const reasons = (onOpenChange: { mock: { calls: unknown[][] } }) =>
    onOpenChange.mock.calls.map(([open, details]) => [open, (details as MenuChangeDetails).reason])

  test('reports pointer, key, item, escape and outside presses', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: MenuChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Enter}')
    await expect.poll(isShown).toBe(false)
    await openWithClick()
    await userEvent.click(page.getByText('Text utanför'))
    await expect.poll(isShown).toBe(false)
    expect(reasons(onOpenChange)).toEqual([
      [true, 'trigger-press'],
      [false, 'escape'],
      [true, 'key'],
      [false, 'item-press'],
      [true, 'trigger-press'],
      [false, 'outside-press'],
    ])
  })
})

describe('controlled', () => {
  test('open decides: onOpenChange reports and the popup waits for you', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: MenuChangeDetails) => void>()
    await render(<Example open={false} onOpenChange={onOpenChange} />)
    await userEvent.click(trigger())
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger-press' }),
    )
    await wait(50)
    expect(isShown()).toBe(false)
    expect(triggerElement().getAttribute('aria-expanded')).toBe('false')
  })

  test('follows the open prop in both directions, and focuses the first item when it opens', async () => {
    const { rerender } = await render(<Example open={false} />)
    expect(isShown()).toBe(false)
    await rerender(<Example open />)
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Skriv ut')).toHaveFocus()
    await rerender(<Example open={false} />)
    await expect.poll(isShown).toBe(false)
  })

  test('a menu that starts open is open but does not move focus on load', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    await wait(100)
    expect(document.activeElement).toBe(document.body)
    item('Skriv ut').element().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Dela')).toHaveFocus()
  })

  test('StrictMode’s second effect run does not count as an opening', async () => {
    await render(
      <StrictMode>
        <Example defaultOpen />
      </StrictMode>,
    )
    await expect.poll(isShown).toBe(true)
    await wait(100)
    expect(document.activeElement).toBe(document.body)
  })

  test('a controlled open that starts true does not move focus either', async () => {
    await render(<Example open />)
    await expect.poll(isShown).toBe(true)
    await wait(100)
    expect(document.activeElement).toBe(document.body)
  })
})

describe('checkbox and radio items', () => {
  test('a checkbox item toggles when uncontrolled, reports, and closes the menu', async () => {
    const onCheckedChange = vi.fn<(checked: boolean) => void>()
    await render(
      <Menu.Root>
        <Menu.Trigger>Visa</Menu.Trigger>
        <Menu.Popup>
          <Menu.CheckboxItem onCheckedChange={onCheckedChange}>Rutnät</Menu.CheckboxItem>
        </Menu.Popup>
      </Menu.Root>,
    )
    const checkbox = () => page.getByRole('menuitemcheckbox', { name: 'Rutnät' })
    await userEvent.click(page.getByRole('button', { name: 'Visa' }))
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Enter}')
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
    await expect.poll(isShown).toBe(false)
    await userEvent.click(page.getByRole('button', { name: 'Visa' }))
    await expect.element(checkbox()).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard(' ')
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)
  })

  test('a controlled checkbox item only reports: checked is the owner’s', async () => {
    const onCheckedChange = vi.fn<(checked: boolean) => void>()
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Visa</Menu.Trigger>
        <Menu.Popup>
          <Menu.CheckboxItem
            checked={false}
            onCheckedChange={onCheckedChange}
            closeOnSelect={false}
          >
            Rutnät
          </Menu.CheckboxItem>
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(isShown).toBe(true)
    page.getByRole('menuitemcheckbox', { name: 'Rutnät' }).element().focus()
    await userEvent.keyboard('{Enter}')
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'Rutnät' }))
      .toHaveAttribute('aria-checked', 'false')
    expect(isShown()).toBe(true)
  })

  test('a radio item chooses its value in an uncontrolled group, and the others clear', async () => {
    const onValueChange = vi.fn<(value: string) => void>()
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Sortera</Menu.Trigger>
        <Menu.Popup>
          <Menu.RadioGroup aria-label="Sortera" defaultValue="name" onValueChange={onValueChange}>
            <Menu.RadioItem value="name" closeOnSelect={false}>
              Namn
            </Menu.RadioItem>
            <Menu.RadioItem value="date" closeOnSelect={false}>
              Datum
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(isShown).toBe(true)
    page.getByRole('menuitemradio', { name: 'Namn' }).element().focus()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('date')
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Datum' }))
      .toHaveAttribute('aria-checked', 'true')
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Namn' }))
      .toHaveAttribute('aria-checked', 'false')
  })

  test('a controlled radio group follows value', async () => {
    function Controlled() {
      const [value, setValue] = useState('name')
      return (
        <Menu.Root defaultOpen>
          <Menu.Trigger>Sortera</Menu.Trigger>
          <Menu.Popup>
            <Menu.RadioGroup aria-label="Sortera" value={value} onValueChange={setValue}>
              <Menu.RadioItem value="name" closeOnSelect={false}>
                Namn
              </Menu.RadioItem>
              <Menu.RadioItem value="date" closeOnSelect={false}>
                Datum
              </Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Root>
      )
    }
    await render(<Controlled />)
    await expect.poll(isShown).toBe(true)
    page.getByRole('menuitemradio', { name: 'Namn' }).element().focus()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Datum' }))
      .toHaveAttribute('aria-checked', 'true')
  })
})

describe('focus return', () => {
  function WithDialog({ dialogFirst }: { dialogFirst: boolean }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const dialog = (
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Popup>
          <Dialog.Title>Ta bort ärendet?</Dialog.Title>
          <Dialog.Actions>
            <button type="button" onClick={() => setDialogOpen(false)}>
              Avbryt
            </button>
          </Dialog.Actions>
        </Dialog.Popup>
      </Dialog.Root>
    )
    return (
      <>
        {dialogFirst ? dialog : null}
        <Menu.Root>
          <Menu.Trigger>Åtgärder</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item onSelect={() => setDialogOpen(true)}>Ta bort…</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
        {dialogFirst ? null : dialog}
      </>
    )
  }

  for (const dialogFirst of [true, false]) {
    test(`an item that opens a Dialog with no Dialog.Trigger returns focus to the menu trigger when the dialog closes (Dialog ${dialogFirst ? 'before' : 'after'} the Menu)`, async () => {
      await render(<WithDialog dialogFirst={dialogFirst} />)
      await userEvent.click(trigger())
      await expect.poll(isShown).toBe(true)
      await userEvent.keyboard('{Enter}')
      await expect.element(page.getByRole('dialog')).toBeVisible()
      await userEvent.click(page.getByRole('button', { name: 'Avbryt' }))
      await expect.poll(() => document.querySelector('dialog')?.open).toBe(false)
      await expect.element(trigger()).toHaveFocus()
    })
  }

  test('a menu that starts open and is closed by the platform while focus was never in it does not move focus to the trigger', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    const other = document.createElement('div')
    other.popover = 'auto'
    document.body.append(other)
    try {
      other.showPopover()
      await expect.poll(isShown).toBe(false)
      await wait(100)
      expect(document.activeElement).not.toBe(triggerElement())
      expect(document.activeElement).toBe(document.body)
    } finally {
      other.remove()
    }
  })

  test('an outside press on a menu that starts open, which nobody touched, does not move focus to the trigger', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    const focus = vi.spyOn(triggerElement(), 'focus')
    await userEvent.click(page.getByText('Text utanför'))
    await expect.poll(isShown).toBe(false)
    await wait(100)
    expect(focus).not.toHaveBeenCalled()
    expect(document.activeElement).not.toBe(triggerElement())
  })

  test('a menu that starts open, with focus on an item, returns focus to the trigger when the platform closes it', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    item('Skriv ut').element().focus()
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
    await openWithClick()
    const focus = vi.spyOn(triggerElement(), 'focus')
    window.scrollTo(0, 1500)
    await expect.poll(() => window.scrollY).toBe(1500)
    await userEvent.click(page.getByText('Långt ner'))
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    expect(window.scrollY).toBe(1500)
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: true })
    window.scrollTo(0, 0)
    await openWithClick()
    focus.mockClear()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: false })
  })

  test('Tab that lands on the element that opened the menu leaves focus there', async () => {
    function OpenedFromAnotherControl() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <Menu.Root open={open} onOpenChange={setOpen}>
            <Menu.Trigger>Åtgärder</Menu.Trigger>
            <Menu.Popup>
              <Menu.Item>Skriv ut</Menu.Item>
            </Menu.Popup>
          </Menu.Root>
          <button type="button" onClick={() => setOpen(true)}>
            Öppna
          </button>
        </>
      )
    }
    await render(<OpenedFromAnotherControl />)
    await userEvent.click(page.getByRole('button', { name: 'Öppna' }))
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Skriv ut')).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Öppna' })).toHaveFocus()
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Öppna' })).toHaveFocus()
  })

  for (const leaveBy of ['focus-out', 'tab'] as const) {
    test(`a refused ${leaveBy} close does not stop a later Escape from returning focus`, async () => {
      function Refusing() {
        const [open, setOpen] = useState(true)
        return (
          <Menu.Root
            open={open}
            onOpenChange={(next, { reason }) => {
              if (reason !== 'focus-out' && reason !== 'tab') {
                setOpen(next)
              }
            }}
          >
            <Menu.Trigger>Åtgärder</Menu.Trigger>
            <Menu.Popup>
              <Menu.Item>Skriv ut</Menu.Item>
            </Menu.Popup>
            <button type="button">Efter</button>
          </Menu.Root>
        )
      }
      await render(<Refusing />)
      await expect.poll(isShown).toBe(true)
      item('Skriv ut').element().focus()
      await expect.element(item('Skriv ut')).toHaveFocus()
      if (leaveBy === 'tab') {
        await userEvent.tab()
      } else {
        page.getByRole('button', { name: 'Efter' }).element().focus()
      }
      await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
      await wait(100)
      expect(isShown()).toBe(true)
      item('Skriv ut').element().focus()
      await userEvent.keyboard('{Escape}')
      await expect.poll(isShown).toBe(false)
      await expect.element(trigger()).toHaveFocus()
    })
  }

  test('a refused focus-out close does not stop the owner closing the menu later with focus returned', async () => {
    let closeFromOutside = () => {}
    function Refusing() {
      const [open, setOpen] = useState(true)
      useEffect(() => {
        closeFromOutside = () => setOpen(false)
      }, [])
      return (
        <Menu.Root
          open={open}
          onOpenChange={(next, { reason }) => {
            if (reason !== 'focus-out') {
              setOpen(next)
            }
          }}
        >
          <Menu.Trigger>Åtgärder</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item>Skriv ut</Menu.Item>
          </Menu.Popup>
          <button type="button">Efter</button>
        </Menu.Root>
      )
    }
    await render(<Refusing />)
    await expect.poll(isShown).toBe(true)
    item('Skriv ut').element().focus()
    await expect.element(item('Skriv ut')).toHaveFocus()
    page.getByRole('button', { name: 'Efter' }).element().focus()
    await wait(100)
    item('Skriv ut').element().focus()
    closeFromOutside()
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })

  test('focus moved out of the menu without Tab closes it and stays where it went', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: MenuChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await openWithEnter()
    page.getByRole('button', { name: 'Före' }).element().focus()
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'focus-out' }),
    )
    expect(onOpenChange).toHaveBeenCalledTimes(2)
  })
})

describe('composition', () => {
  test('in a vertical Toolbar the trigger’s ArrowDown opens the menu and the toolbar does not move focus', async () => {
    await render(
      <Toolbar.Root aria-label="Verktyg" orientation="vertical">
        <Toolbar.Button style={controlStyle}>Ett</Toolbar.Button>
        <Menu.Root>
          <Toolbar.Item render={<Menu.Trigger style={controlStyle} />}>Åtgärder</Toolbar.Item>
          <Menu.Popup>
            <Menu.Item style={controlStyle}>Skriv ut</Menu.Item>
            <Menu.Item style={controlStyle}>Dela</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
        <Toolbar.Button style={controlStyle}>Två</Toolbar.Button>
      </Toolbar.Root>,
    )
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Skriv ut')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Dela')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.element(trigger()).toHaveFocus()
  })

  test('under Tooltip.Trigger the tooltip closes while the menu is open', async () => {
    const group = createTooltipGroup()
    await render(
      <Tooltip.Root delay={20} group={group}>
        <Menu.Root>
          <Tooltip.Trigger render={<Menu.Trigger style={controlStyle} />}>Åtgärder</Tooltip.Trigger>
          <Tooltip.Popup>Fler åtgärder</Tooltip.Popup>
          <Menu.Popup>
            <Menu.Item style={controlStyle}>Skriv ut</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
      </Tooltip.Root>,
    )
    const tooltipShown = () => document.querySelector('.kv-tooltip:popover-open') !== null
    triggerElement().focus()
    await expect.poll(tooltipShown).toBe(true)
    await userEvent.keyboard('{Enter}')
    await expect.poll(isShown).toBe(true)
    await expect.poll(tooltipShown).toBe(false)
    await wait(150)
    expect(tooltipShown()).toBe(false)
  })

  test('inside a Dialog the menu stacks above it and Escape closes the menu only', async () => {
    await render(
      <Dialog.Root defaultOpen>
        <Dialog.Trigger>Öppna</Dialog.Trigger>
        <Dialog.Popup>
          <Dialog.Title>Ärende</Dialog.Title>
          <Dialog.Body>
            <Menu.Root>
              <Menu.Trigger>Åtgärder</Menu.Trigger>
              <Menu.Popup>
                <Menu.Item>Skriv ut</Menu.Item>
              </Menu.Popup>
            </Menu.Root>
          </Dialog.Body>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.element(page.getByRole('dialog')).toBeVisible()
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Skriv ut')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('dialog')).toBeVisible()
    await expect.element(trigger()).toHaveFocus()
  })
})

describe('server rendering', () => {
  test('renders the closed markup, items included, and no inline position', () => {
    const html = renderToString(<Example />)
    expect(html).toContain('popover="auto"')
    expect(html).toContain('role="menu"')
    expect(html).toContain('aria-haspopup="menu"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('data-placement="bottom-start"')
    expect(html).toContain('role="menuitem"')
    expect(html).not.toContain('data-open')
    expect(html).not.toContain('style="position')
  })
})

describe('development warnings', () => {
  const messages = () => consoleWarn.mock.calls.map(([message]) => String(message))

  test('parts outside a Root', async () => {
    await render(
      <>
        <Menu.Trigger>Ut</Menu.Trigger>
        <Menu.Popup />
        <Menu.Item>Ett</Menu.Item>
      </>,
    )
    const text = messages().join('\n')
    expect(text).toContain('Menu.Trigger is outside a Menu.Root')
    expect(text).toContain('Menu.Popup is outside a Menu.Root')
    expect(text).toContain('Menu.Item is outside a Menu.Root')
  })

  test('a Trigger that is not a button', async () => {
    await render(
      <Menu.Root>
        <Menu.Trigger render={<div />}>Åtgärder</Menu.Trigger>
        <Menu.Popup />
      </Menu.Root>,
    )
    expect(messages().join('\n')).toContain('A Menu.Trigger rendered a <div>')
  })

  test('an Item rendered as a link: a menu is for actions', async () => {
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Åtgärder</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item render={<a href="/start">Startsidan</a>} />
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(() => messages().join('\n')).toContain('A Menu.Item is rendered as a link')
  })

  test('a RadioGroup and a Group with no name', async () => {
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Åtgärder</Menu.Trigger>
        <Menu.Popup>
          <Menu.RadioGroup>
            <Menu.RadioItem value="a">Ett</Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Group>
            <Menu.Item>Två</Menu.Item>
          </Menu.Group>
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect
      .poll(() => messages().join('\n'))
      .toContain('Menu.RadioGroup has no accessible name')
    expect(messages().join('\n')).toContain('Menu.Group has no accessible name')
  })

  test('a Group named by its label and a RadioGroup named by aria-label do not warn', async () => {
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Åtgärder</Menu.Trigger>
        <Menu.Popup>
          <Menu.RadioGroup aria-label="Sortera">
            <Menu.RadioItem value="a">Ett</Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Group>
            <Menu.GroupLabel>Visa</Menu.GroupLabel>
            <Menu.Item>Två</Menu.Item>
          </Menu.Group>
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(isShown).toBe(true)
    expect(messages().filter((message) => message.includes('Menu.'))).toEqual([])
  })
})

describe('types', () => {
  test('the public types', () => {
    expectTypeOf<MenuRootProps['open']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<MenuRootProps['children']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<UseMenuOptions['onOpenChange']>().toEqualTypeOf<
      ((open: boolean, details: MenuChangeDetails) => void) | undefined
    >()
    expectTypeOf<MenuChangeDetails['reason']>().toEqualTypeOf<MenuChangeReason>()
    expectTypeOf<MenuChangeReason>().toEqualTypeOf<
      | 'trigger-press'
      | 'key'
      | 'item-press'
      | 'escape'
      | 'outside-press'
      | 'light-dismiss'
      | 'tab'
      | 'focus-out'
    >()
    expectTypeOf<UseMenuResult['triggerProps']['aria-haspopup']>().toEqualTypeOf<'menu'>()
    expectTypeOf(MenuRoot).toBeFunction()
    expectTypeOf(Button).toBeFunction()
  })
})
