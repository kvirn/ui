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
  MenuPopupProps,
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
  onDeliver?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined
  closeOnSelect?: boolean | undefined
}

function Example({ onPrint, onDeliver, closeOnSelect, ...rootProps }: ExampleProps) {
  return (
    <>
      {/* Above the trigger, so the popup (placed under it) never covers the text a test presses. */}
      <p>Text outside</p>
      <button type="button" style={controlStyle}>
        Before
      </button>
      <Menu.Root {...rootProps}>
        <Menu.Trigger style={controlStyle}>Actions</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item style={controlStyle} onSelect={onPrint} closeOnSelect={closeOnSelect}>
            Save as
          </Menu.Item>
          <Menu.Item style={controlStyle} disabled onSelect={onDeliver}>
            Deliver
          </Menu.Item>
          <Menu.Item style={controlStyle}>Load down</Menu.Item>
          <Menu.Item style={controlStyle}>Load up</Menu.Item>
          <Menu.Separator />
          <Menu.Item style={controlStyle}>Remove</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <button type="button" style={controlStyle}>
        After
      </button>
    </>
  )
}

const trigger = () => page.getByRole('button', { name: 'Actions', exact: true })
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
    const disabled = item('Deliver').element()
    expect(disabled.getAttribute('aria-disabled')).toBe('true')
    expect(disabled.hasAttribute('data-disabled')).toBe(true)
    expect(disabled.hasAttribute('disabled')).toBe(false)
  })

  test('a disabled item points at the reason on the page with aria-describedby', async () => {
    await render(
      <>
        <p id="share-reason">You cannot deliver a draft.</p>
        <Menu.Root defaultOpen>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item disabled aria-describedby="share-reason">
              Deliver
            </Menu.Item>
          </Menu.Popup>
        </Menu.Root>
      </>,
    )
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Deliver')).toHaveAccessibleDescription('You cannot deliver a draft.')
  })

  test('checkbox and radio items expose role, aria-checked and groups, with no axe violations', async () => {
    const { container } = await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger style={controlStyle}>Show</Menu.Trigger>
        <Menu.Popup>
          <Menu.Group>
            <Menu.GroupLabel>Layout</Menu.GroupLabel>
            <Menu.CheckboxItem style={controlStyle} defaultChecked>
              Grid
            </Menu.CheckboxItem>
            <Menu.CheckboxItem style={controlStyle}>Compact</Menu.CheckboxItem>
          </Menu.Group>
          <Menu.Separator />
          <Menu.RadioGroup aria-label="Sort" defaultValue="name">
            <Menu.RadioItem style={controlStyle} value="name">
              Name
            </Menu.RadioItem>
            <Menu.RadioItem style={controlStyle} value="date">
              Date
            </Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Item style={controlStyle} disabled>
            Deliver
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(isShown).toBe(true)
    const grid = page.getByRole('menuitemcheckbox', { name: 'Grid' })
    await expect.element(grid).toHaveAttribute('aria-checked', 'true')
    await expect.element(grid).toHaveAttribute('data-checked', '')
    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'Compact' }))
      .toHaveAttribute('aria-checked', 'false')
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Name' }))
      .toHaveAttribute('aria-checked', 'true')
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Date' }))
      .toHaveAttribute('aria-checked', 'false')
    await expect.element(page.getByRole('group', { name: 'Layout' })).toBeVisible()
    await expect.element(page.getByRole('group', { name: 'Sort' })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('a scrolling menu has keyboard access through its focused item, and no axe violations', async () => {
    const { container } = await render(
      <>
        <button type="button" style={controlStyle}>
          Before
        </button>
        <Menu.Root>
          <Menu.Trigger style={controlStyle}>Actions</Menu.Trigger>
          <Menu.Popup
            style={{ '--kv-popup-height-limit': '6rem', overflowY: 'auto' } as CSSProperties}
          >
            {Array.from({ length: 30 }, (_, index) => (
              <Menu.Item key={index} style={controlStyle}>
                {`Action ${index + 1}`}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Root>
        <button type="button" style={controlStyle}>
          After
        </button>
      </>,
    )
    await openWithEnter()
    const popup = popupElement()
    expect(popup && popup.scrollHeight > popup.clientHeight).toBe(true)
    expect(popup?.hasAttribute('tabindex')).toBe(false)
    expect(document.activeElement?.getAttribute('tabindex')).toBe('0')
    await expect.element(item('Action 1')).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  test('the popup is named by the trigger unless the consumer names it', async () => {
    await render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Popup aria-label="Own label">
          <Menu.Item>Save as</Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    )
    const popup = popupElement()
    expect(popup?.getAttribute('aria-label')).toBe('Own label')
    expect(popup?.hasAttribute('aria-labelledby')).toBe(false)
  })

  test('forwards refs, className and native props, and merges them with its own', async () => {
    const triggerRef = createRef<HTMLButtonElement>()
    const popupRef = createRef<HTMLDivElement>()
    const itemRef = createRef<HTMLButtonElement>()
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger ref={triggerRef} className="own" data-own="trigger">
          Actions
        </Menu.Trigger>
        <Menu.Popup ref={popupRef} className="own" data-own="popup">
          <Menu.Item ref={itemRef} className="own" data-own="item">
            Save as
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(isShown).toBe(true)
    expect(triggerRef.current).toBe(triggerElement())
    expect(popupRef.current).toBe(popupElement())
    expect(itemRef.current).toBe(item('Save as').element())
    expect(triggerRef.current?.className).toBe('own kv-menu-trigger')
    expect(popupRef.current?.className).toBe('own kv-menu-popup')
    expect(itemRef.current?.className).toBe('own kv-menu-item')
    expect(itemRef.current?.getAttribute('data-own')).toBe('item')
  })

  test('as changes the Trigger, the Popup, the groups and the label, and keeps the roles', async () => {
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger as={Button} data-own="trigger">
          Actions
        </Menu.Trigger>
        <Menu.Popup as="section">
          <Menu.Group as="section" aria-label="Group">
            <Menu.GroupLabel as="span" data-own="label">
              Label
            </Menu.GroupLabel>
            <Menu.Item>One</Menu.Item>
            <Menu.CheckboxItem data-own="checkbox">Two</Menu.CheckboxItem>
          </Menu.Group>
          <Menu.RadioGroup aria-label="Val" as="section">
            <Menu.RadioItem value="a" data-own="radio">
              Tre
            </Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Separator data-own="separator" />
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(isShown).toBe(true)
    expect(triggerElement().getAttribute('data-own')).toBe('trigger')
    expect(triggerElement().getAttribute('aria-expanded')).toBe('true')
    expect(popupElement()?.tagName).toBe('SECTION')
    expect(popupElement()?.getAttribute('role')).toBe('menu')
    expect(document.querySelector('[data-own="label"]')?.tagName).toBe('SPAN')
    expect(document.querySelector('[data-own="label"]')?.className).toBe('kv-menu-group-label')
    expect(document.querySelector('[data-own="separator"]')?.getAttribute('role')).toBe('separator')
    expect(document.querySelector('[data-own="checkbox"]')?.getAttribute('role')).toBe(
      'menuitemcheckbox',
    )
    expect(document.querySelector('[data-own="radio"]')?.getAttribute('role')).toBe('menuitemradio')
    expect(document.querySelector('section.kv-menu-group')?.getAttribute('role')).toBe('group')
  })

  test('a tag outside the Popup’s list warns once and falls back to a div', async () => {
    const notAllowed = 'ul' as MenuPopupProps['as']
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Popup as={notAllowed}>
          <Menu.Item>One</Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    )
    expect(popupElement()?.tagName).toBe('DIV')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('Menu.Popup as="ul"')
  })

  test('the focused item is the highlight: data-highlighted follows focus', async () => {
    await render(<Example />)
    await openWithEnter()
    await expect.element(item('Save as')).toHaveAttribute('data-highlighted', '')
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Save as')).not.toHaveAttribute('data-highlighted')
    await expect.element(item('Deliver')).toHaveAttribute('data-highlighted', '')
  })

  test('useMenu spreads the same props on your own elements', async () => {
    function Own() {
      const menu = useMenu()
      const [current, setCurrent] = useState<string>()
      return (
        <>
          <button {...menu.triggerProps}>Actions</button>
          <div {...menu.popupProps}>
            {menu.isOpen ? (
              <>
                <button
                  {...menu.getItemProps('item', { isCurrent: current === 'print' })}
                  onFocus={() => setCurrent('print')}
                  onBlur={() => setCurrent(undefined)}
                >
                  Save as
                </button>
                <button {...menu.getItemProps('checkbox', { checked: true })}>Grid</button>
                <button {...menu.getItemProps('radio', { disabled: true })}>Name</button>
              </>
            ) : null}
          </div>
        </>
      )
    }
    await render(<Own />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Save as')).toHaveFocus()
    await expect.element(item('Save as')).toHaveAttribute('tabindex', '0')
    await expect.element(item('Save as')).toHaveAttribute('data-highlighted', '')
    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'Grid' }))
      .toHaveAttribute('tabindex', '-1')
    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'Grid' }))
      .toHaveAttribute('aria-checked', 'true')
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Name' }))
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
    await expect.element(page.getByRole('button', { name: 'Before' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(trigger()).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus()
  })

  test('Shift+Tab leaves the trigger backwards', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('button', { name: 'Before' })).toHaveFocus()
  })

  test('Enter and Space on the trigger open the menu with focus on the first item', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Save as')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Save as')).toHaveFocus()
  })

  test('ArrowDown and ArrowUp on the trigger open the menu on the first and last item', async () => {
    await render(<Example />)
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Save as')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(isShown).toBe(false)
    await userEvent.keyboard('{ArrowUp}')
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Remove')).toHaveFocus()
  })

  test('a pointer press on the trigger toggles the menu, and a closing press does not reopen it', async () => {
    await render(<Example />)
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Save as')).toHaveFocus()
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
    await expect.element(item('Deliver')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Load down')).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(item('Deliver')).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    await expect.element(item('Remove')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Save as')).toHaveFocus()
  })

  test('ArrowDown and ArrowUp do not flip in right-to-left text', async () => {
    await render(
      <div dir="rtl">
        <Example />
      </div>,
    )
    await openWithEnter()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Deliver')).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    await expect.element(item('Remove')).toHaveFocus()
  })

  test('Home and End move to the first and last item', async () => {
    await render(<Example />)
    await openWithEnter()
    await userEvent.keyboard('{End}')
    await expect.element(item('Remove')).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect.element(item('Save as')).toHaveFocus()
  })

  test('a character moves focus by typeahead, a word narrows it and a pause resets it', async () => {
    await render(<Example />)
    await openWithEnter()
    await userEvent.keyboard('r')
    await expect.element(item('Remove')).toHaveFocus()
    await wait(600)
    // A word narrows the match: "load u" passes over "Load down" to "Load up".
    await userEvent.keyboard('load u')
    await expect.element(item('Load up')).toHaveFocus()
    await wait(600)
    // A repeated character cycles through the items that start with it.
    await userEvent.keyboard('l')
    await expect.element(item('Load down')).toHaveFocus()
    await userEvent.keyboard('l')
    await expect.element(item('Load up')).toHaveFocus()
    await wait(600)
    // A disabled item is found by typeahead too.
    await userEvent.keyboard('d')
    await expect.element(item('Deliver')).toHaveFocus()
    expect(isShown()).toBe(true)
  })

  test('Control, Alt and Meta characters are not typeahead', async () => {
    await render(<Example />)
    await openWithEnter()
    await userEvent.keyboard('{Control>}r{/Control}')
    await userEvent.keyboard('{Alt>}r{/Alt}')
    await userEvent.keyboard('{Meta>}r{/Meta}')
    await expect.element(item('Save as')).toHaveFocus()
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
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Save as</Menu.Item>
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
    await expect.element(item('Save as')).toHaveFocus()
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
    await userEvent.keyboard('load ')
    await userEvent.keyboard('u')
    await expect.element(item('Load up')).toHaveFocus()
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
    await expect.element(item('Save as')).toHaveFocus()
  })

  test('event.preventDefault() in onSelect keeps the menu open', async () => {
    await render(<Example onPrint={(event) => event.preventDefault()} />)
    await openWithEnter()
    await userEvent.keyboard('{Enter}')
    expect(isShown()).toBe(true)
  })

  test('Enter and Space on a disabled item do nothing and keep the menu open', async () => {
    const onDeliver = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>()
    await render(<Example onDeliver={onDeliver} />)
    await openWithEnter()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Deliver')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onDeliver).not.toHaveBeenCalled()
    expect(isShown()).toBe(true)
    await expect.element(item('Deliver')).toHaveFocus()
  })

  test('Escape closes the menu and returns focus to the trigger, and only the menu', async () => {
    await render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Mer</Popover.Trigger>
        <Popover.Popup aria-label="Mer">
          <Menu.Root>
            <Menu.Trigger>Actions</Menu.Trigger>
            <Menu.Popup>
              <Menu.Item>Save as</Menu.Item>
            </Menu.Popup>
          </Menu.Root>
        </Popover.Popup>
      </Popover.Root>,
    )
    await expect.poll(() => document.querySelector('.kv-popover-popup:popover-open')).not.toBeNull()
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Save as')).toHaveFocus()
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
    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus()
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus()
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
    await expect.element(item('Save as')).toHaveFocus()
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
    await userEvent.hover(item('Load up'))
    await expect.element(item('Load up')).toHaveFocus()
    await userEvent.hover(item('Remove'))
    await expect.element(item('Remove')).toHaveFocus()
    await userEvent.click(item('Save as'))
    expect(onPrint).toHaveBeenCalledTimes(1)
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
    await openWithClick()
    await userEvent.click(page.getByText('Text outside'))
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })

  test('only a mouse move focuses an item: touch and pen moves do not', async () => {
    await render(<Example />)
    await openWithClick()
    const target = item('Remove').element()
    for (const pointerType of ['touch', 'pen']) {
      target.dispatchEvent(
        new PointerEvent('pointermove', { pointerType, movementX: 4, movementY: 4, bubbles: true }),
      )
    }
    await expect.element(item('Save as')).toHaveFocus()
    target.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerType: 'mouse',
        movementX: 4,
        movementY: 4,
        bubbles: true,
      }),
    )
    await expect.element(item('Remove')).toHaveFocus()
  })

  test('a press on another control closes the menu, and that control keeps the focus', async () => {
    await render(<Example />)
    await openWithClick()
    await userEvent.click(page.getByRole('button', { name: 'Before' }))
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Before' })).toHaveFocus()
  })

  test('a press on a disabled item does not run it or close the menu', async () => {
    const onDeliver = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>()
    await render(<Example onDeliver={onDeliver} />)
    await openWithClick()
    // Playwright will not press an aria-disabled element, as a user can: the click is dispatched.
    document.querySelector<HTMLElement>('[aria-disabled="true"]')?.click()
    expect(onDeliver).not.toHaveBeenCalled()
    expect(isShown()).toBe(true)
  })

  test('an enabled item runs its onClick and closes', async () => {
    const elementOnClick = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>()
    await render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Popup aria-label="Actions">
          <Menu.Item onClick={elementOnClick}>Deliver</Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    )
    await openWithEnter()
    await item('Deliver').click()
    expect(elementOnClick).toHaveBeenCalledTimes(1)
    await expect.poll(isShown).toBe(false)
  })

  test('a disabled item does not run its onClick, by click or key', async () => {
    const elementOnClick = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>()
    await render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Popup aria-label="Actions">
          <Menu.Item disabled onClick={elementOnClick}>
            Deliver
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    )
    await openWithEnter()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Deliver')).toHaveFocus()
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
    await userEvent.click(page.getByText('Text outside'))
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
    await expect.element(item('Save as')).toHaveFocus()
    await rerender(<Example open={false} />)
    await expect.poll(isShown).toBe(false)
  })

  test('a menu that starts open is open but does not move focus on load', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    await wait(100)
    expect(document.activeElement).toBe(document.body)
    item('Save as').element().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Deliver')).toHaveFocus()
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
        <Menu.Trigger>Show</Menu.Trigger>
        <Menu.Popup>
          <Menu.CheckboxItem onCheckedChange={onCheckedChange}>Grid</Menu.CheckboxItem>
        </Menu.Popup>
      </Menu.Root>,
    )
    const checkbox = () => page.getByRole('menuitemcheckbox', { name: 'Grid' })
    await userEvent.click(page.getByRole('button', { name: 'Show' }))
    await expect.poll(isShown).toBe(true)
    await userEvent.keyboard('{Enter}')
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
    await expect.poll(isShown).toBe(false)
    await userEvent.click(page.getByRole('button', { name: 'Show' }))
    await expect.element(checkbox()).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard(' ')
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)
  })

  test('a controlled checkbox item only reports: checked is the owner’s', async () => {
    const onCheckedChange = vi.fn<(checked: boolean) => void>()
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Show</Menu.Trigger>
        <Menu.Popup>
          <Menu.CheckboxItem
            checked={false}
            onCheckedChange={onCheckedChange}
            closeOnSelect={false}
          >
            Grid
          </Menu.CheckboxItem>
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(isShown).toBe(true)
    page.getByRole('menuitemcheckbox', { name: 'Grid' }).element().focus()
    await userEvent.keyboard('{Enter}')
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    await expect
      .element(page.getByRole('menuitemcheckbox', { name: 'Grid' }))
      .toHaveAttribute('aria-checked', 'false')
    expect(isShown()).toBe(true)
  })

  test('a radio item chooses its value in an uncontrolled group, and the others clear', async () => {
    const onValueChange = vi.fn<(value: string) => void>()
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Sort</Menu.Trigger>
        <Menu.Popup>
          <Menu.RadioGroup aria-label="Sort" defaultValue="name" onValueChange={onValueChange}>
            <Menu.RadioItem value="name" closeOnSelect={false}>
              Name
            </Menu.RadioItem>
            <Menu.RadioItem value="date" closeOnSelect={false}>
              Date
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Popup>
      </Menu.Root>,
    )
    await expect.poll(isShown).toBe(true)
    page.getByRole('menuitemradio', { name: 'Name' }).element().focus()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('date')
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Date' }))
      .toHaveAttribute('aria-checked', 'true')
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Name' }))
      .toHaveAttribute('aria-checked', 'false')
  })

  test('a controlled radio group follows value', async () => {
    function Controlled() {
      const [value, setValue] = useState('name')
      return (
        <Menu.Root defaultOpen>
          <Menu.Trigger>Sort</Menu.Trigger>
          <Menu.Popup>
            <Menu.RadioGroup aria-label="Sort" value={value} onValueChange={setValue}>
              <Menu.RadioItem value="name" closeOnSelect={false}>
                Name
              </Menu.RadioItem>
              <Menu.RadioItem value="date" closeOnSelect={false}>
                Date
              </Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Root>
      )
    }
    await render(<Controlled />)
    await expect.poll(isShown).toBe(true)
    page.getByRole('menuitemradio', { name: 'Name' }).element().focus()
    await userEvent.keyboard('{ArrowDown}{Enter}')
    await expect
      .element(page.getByRole('menuitemradio', { name: 'Date' }))
      .toHaveAttribute('aria-checked', 'true')
  })
})

describe('focus return', () => {
  function WithDialog({ dialogFirst }: { dialogFirst: boolean }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const dialog = (
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Popup>
          <Dialog.Title>Remove the case?</Dialog.Title>
          <Dialog.Actions>
            <button type="button" onClick={() => setDialogOpen(false)}>
              Cancel
            </button>
          </Dialog.Actions>
        </Dialog.Popup>
      </Dialog.Root>
    )
    return (
      <>
        {dialogFirst ? dialog : null}
        <Menu.Root>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item onSelect={() => setDialogOpen(true)}>Delete…</Menu.Item>
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
      await userEvent.click(page.getByRole('button', { name: 'Cancel' }))
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
    await userEvent.click(page.getByText('Text outside'))
    await expect.poll(isShown).toBe(false)
    await wait(100)
    expect(focus).not.toHaveBeenCalled()
    expect(document.activeElement).not.toBe(triggerElement())
  })

  test('a menu that starts open, with focus on an item, returns focus to the trigger when the platform closes it', async () => {
    await render(<Example defaultOpen />)
    await expect.poll(isShown).toBe(true)
    item('Save as').element().focus()
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
          <p style={{ marginBlockStart: '2000px' }}>Far down</p>
        </div>
      </>,
    )
    await openWithClick()
    const focus = vi.spyOn(triggerElement(), 'focus')
    window.scrollTo(0, 1500)
    await expect.poll(() => window.scrollY).toBe(1500)
    await userEvent.click(page.getByText('Far down'))
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
            <Menu.Trigger>Actions</Menu.Trigger>
            <Menu.Popup>
              <Menu.Item>Save as</Menu.Item>
            </Menu.Popup>
          </Menu.Root>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
        </>
      )
    }
    await render(<OpenedFromAnotherControl />)
    await userEvent.click(page.getByRole('button', { name: 'Open' }))
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Save as')).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Open' })).toHaveFocus()
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Open' })).toHaveFocus()
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
            <Menu.Trigger>Actions</Menu.Trigger>
            <Menu.Popup>
              <Menu.Item>Save as</Menu.Item>
            </Menu.Popup>
            <button type="button">After</button>
          </Menu.Root>
        )
      }
      await render(<Refusing />)
      await expect.poll(isShown).toBe(true)
      item('Save as').element().focus()
      await expect.element(item('Save as')).toHaveFocus()
      if (leaveBy === 'tab') {
        await userEvent.tab()
      } else {
        page.getByRole('button', { name: 'After' }).element().focus()
      }
      await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus()
      await wait(100)
      expect(isShown()).toBe(true)
      item('Save as').element().focus()
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
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Popup>
            <Menu.Item>Save as</Menu.Item>
          </Menu.Popup>
          <button type="button">After</button>
        </Menu.Root>
      )
    }
    await render(<Refusing />)
    await expect.poll(isShown).toBe(true)
    item('Save as').element().focus()
    await expect.element(item('Save as')).toHaveFocus()
    page.getByRole('button', { name: 'After' }).element().focus()
    await wait(100)
    item('Save as').element().focus()
    closeFromOutside()
    await expect.poll(isShown).toBe(false)
    await expect.element(trigger()).toHaveFocus()
  })

  test('focus moved out of the menu without Tab closes it and stays where it went', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: MenuChangeDetails) => void>()
    await render(<Example onOpenChange={onOpenChange} />)
    await openWithEnter()
    page.getByRole('button', { name: 'Before' }).element().focus()
    await expect.poll(isShown).toBe(false)
    await expect.element(page.getByRole('button', { name: 'Before' })).toHaveFocus()
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
      <Toolbar.Root aria-label="Tools" orientation="vertical">
        <Toolbar.Button style={controlStyle}>One</Toolbar.Button>
        <Menu.Root>
          <Toolbar.Item as={Menu.Trigger} style={controlStyle}>
            Actions
          </Toolbar.Item>
          <Menu.Popup>
            <Menu.Item style={controlStyle}>Save as</Menu.Item>
            <Menu.Item style={controlStyle}>Deliver</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
        <Toolbar.Button style={controlStyle}>Two</Toolbar.Button>
      </Toolbar.Root>,
    )
    triggerElement().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Save as')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(item('Deliver')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.element(trigger()).toHaveFocus()
  })

  test('under Tooltip.Trigger the tooltip closes while the menu is open', async () => {
    const group = createTooltipGroup()
    await render(
      <Tooltip.Root delay={20} group={group}>
        <Menu.Root>
          <Tooltip.Trigger as={Menu.Trigger} style={controlStyle}>
            Actions
          </Tooltip.Trigger>
          <Tooltip.Popup>More actions</Tooltip.Popup>
          <Menu.Popup>
            <Menu.Item style={controlStyle}>Save as</Menu.Item>
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
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Popup>
          <Dialog.Title>Case</Dialog.Title>
          <Dialog.Body>
            <Menu.Root>
              <Menu.Trigger>Actions</Menu.Trigger>
              <Menu.Popup>
                <Menu.Item>Save as</Menu.Item>
              </Menu.Popup>
            </Menu.Root>
          </Dialog.Body>
        </Dialog.Popup>
      </Dialog.Root>,
    )
    await expect.element(page.getByRole('dialog')).toBeVisible()
    await userEvent.click(trigger())
    await expect.poll(isShown).toBe(true)
    await expect.element(item('Save as')).toHaveFocus()
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
        <Menu.Item>One</Menu.Item>
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
        <Menu.Trigger as="div">Actions</Menu.Trigger>
        <Menu.Popup />
      </Menu.Root>,
    )
    expect(messages().join('\n')).toContain('A Menu.Trigger rendered a <div>')
  })

  test('a RadioGroup and a Group with no name', async () => {
    await render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Popup>
          <Menu.RadioGroup>
            <Menu.RadioItem value="a">One</Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Group>
            <Menu.Item>Two</Menu.Item>
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
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Popup>
          <Menu.RadioGroup aria-label="Sort">
            <Menu.RadioItem value="a">One</Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Group>
            <Menu.GroupLabel>Show</Menu.GroupLabel>
            <Menu.Item>Two</Menu.Item>
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
