import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Listbox } from '../listbox/listbox.tsx'
import { Popover } from '../popover/popover.tsx'
import { Toolbar } from './toolbar.tsx'
import type { ToolbarRootProps } from './toolbar.tsx'
import { useToolbar } from './use-toolbar.ts'
import type {
  ToolbarItemPartProps,
  ToolbarRootPartProps,
  UseToolbarOptions,
  UseToolbarResult,
} from './use-toolbar.ts'

// Contract: toolbar.a11y.md. Component tests load no theme.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

/** The fixture's own buttons are unstyled: give them the 24px that 2.5.8 asks for, so axe checks the Toolbar. */
const fixtureButtonStyle = { minBlockSize: '2rem', minInlineSize: '2rem' }

const button = (name: string) => page.getByRole('button', { name, exact: true })
const tabIndexOf = (name: string) => button(name).element().getAttribute('tabindex')
const tabStops = () => page.getByRole('toolbar').element().querySelectorAll('[tabindex="0"]').length

function TextToolbar({
  orientation,
  loop,
  children,
}: UseToolbarOptions & { children?: ReactNode }) {
  return (
    <>
      <button type="button" style={fixtureButtonStyle}>
        Före
      </button>
      <Toolbar.Root aria-label="Formatering" orientation={orientation} loop={loop}>
        {children ?? (
          <>
            <Toolbar.Group aria-label="Ångra">
              <Toolbar.Button style={fixtureButtonStyle}>Ångra</Toolbar.Button>
              <Toolbar.Button style={fixtureButtonStyle}>Gör om</Toolbar.Button>
            </Toolbar.Group>
            <Toolbar.Group aria-label="Textstil">
              <Toolbar.Toggle style={fixtureButtonStyle}>Fet</Toolbar.Toggle>
              <Toolbar.Toggle style={fixtureButtonStyle}>Kursiv</Toolbar.Toggle>
            </Toolbar.Group>
          </>
        )}
      </Toolbar.Root>
      <button type="button" style={fixtureButtonStyle}>
        Efter
      </button>
    </>
  )
}

describe('rendering', () => {
  test('is a div with role="toolbar", its name and the part class, and no aria-orientation when horizontal', async () => {
    const { container } = await render(<TextToolbar />)
    const toolbar = page.getByRole('toolbar', { name: 'Formatering' })
    expect(toolbar.element().tagName).toBe('DIV')
    await expect.element(toolbar).toHaveClass('kv-toolbar')
    await expect.element(toolbar).not.toHaveAttribute('aria-orientation')
    await expect.element(page.getByRole('group', { name: 'Textstil' })).toBeVisible()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('vertical sets aria-orientation="vertical"', async () => {
    await render(<TextToolbar orientation="vertical" />)
    await expect
      .element(page.getByRole('toolbar', { name: 'Formatering' }))
      .toHaveAttribute('aria-orientation', 'vertical')
  })

  test('forwards its ref, joins a class, passes props on, and as changes the element', async () => {
    const ref = createRef<HTMLDivElement>()
    await render(
      <>
        <Toolbar.Root
          ref={ref}
          aria-label="Åtgärder"
          className="egen"
          aria-controls="redigerare"
          data-egen=""
        >
          <Toolbar.Button>A</Toolbar.Button>
          <Toolbar.Button>B</Toolbar.Button>
          <Toolbar.Button>C</Toolbar.Button>
        </Toolbar.Root>
        <Toolbar.Root aria-label="Funktion" orientation="vertical" as="section">
          <Toolbar.Button>D</Toolbar.Button>
          <Toolbar.Button>E</Toolbar.Button>
          <Toolbar.Button>F</Toolbar.Button>
        </Toolbar.Root>
      </>,
    )
    const toolbar = page.getByRole('toolbar', { name: 'Åtgärder' })
    expect(ref.current).toBe(toolbar.element())
    await expect.element(toolbar).toHaveClass('kv-toolbar', 'egen')
    await expect.element(toolbar).toHaveAttribute('aria-controls', 'redigerare')
    await expect.element(toolbar).toHaveAttribute('data-egen', '')
    const functionToolbar = page.getByRole('toolbar', { name: 'Funktion' })
    expect(functionToolbar.element().tagName).toBe('SECTION')
    await expect.element(functionToolbar).toHaveAttribute('aria-orientation', 'vertical')
    await expect.element(functionToolbar).toHaveAttribute('role', 'toolbar')
  })

  test('Toolbar.Button and Toolbar.Toggle are a Button and a Toggle', async () => {
    const onClick = vi.fn<() => void>()
    await render(
      <TextToolbar>
        <Toolbar.Button onClick={onClick}>Ångra</Toolbar.Button>
        <Toolbar.Toggle>Fet</Toolbar.Toggle>
        <Toolbar.Toggle defaultPressed>Kursiv</Toolbar.Toggle>
      </TextToolbar>,
    )
    await expect.element(button('Ångra')).toHaveAttribute('type', 'button')
    await expect.element(button('Fet')).toHaveAttribute('aria-pressed', 'false')
    await expect.element(button('Kursiv')).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(button('Ångra'))
    expect(onClick).toHaveBeenCalledTimes(1)
    await userEvent.click(button('Fet'))
    await expect.element(button('Fet')).toHaveAttribute('aria-pressed', 'true')
  })

  test('Toolbar.Item is a button by default, and takes the roving props', async () => {
    await render(
      <TextToolbar>
        <Toolbar.Item>Länk</Toolbar.Item>
        <Toolbar.Item>Bild</Toolbar.Item>
        <Toolbar.Item>Tabell</Toolbar.Item>
      </TextToolbar>,
    )
    await expect.element(button('Länk')).toHaveAttribute('type', 'button')
    await expect.element(button('Länk')).toHaveAttribute('tabindex', '0')
    await expect.element(button('Bild')).toHaveAttribute('tabindex', '-1')
  })
})

describe('roving tabindex', () => {
  test('exactly one item has tabindex 0, the first, and all others -1', async () => {
    await render(<TextToolbar />)
    expect(tabIndexOf('Ångra')).toBe('0')
    expect(tabIndexOf('Gör om')).toBe('-1')
    expect(tabIndexOf('Fet')).toBe('-1')
    expect(tabIndexOf('Kursiv')).toBe('-1')
    expect(tabStops()).toBe(1)
  })

  test('Tab enters at the first control the first time, and leaves the toolbar with the next Tab', async () => {
    await render(<TextToolbar />)
    await userEvent.keyboard('{Tab}')
    await expect.element(button('Före')).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(button('Ångra')).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(button('Efter')).toHaveFocus()
  })

  test('Tab enters at the control that last had focus, from before and from after', async () => {
    await render(<TextToolbar />)
    await userEvent.keyboard('{Tab}{Tab}')
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expect.element(button('Fet')).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(button('Efter')).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(button('Fet')).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(button('Före')).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(button('Fet')).toHaveFocus()
    expect(tabIndexOf('Fet')).toBe('0')
    expect(tabStops()).toBe(1)
  })

  test('a control focused by a pointer becomes the Tab stop', async () => {
    await render(<TextToolbar />)
    await userEvent.click(button('Kursiv'))
    expect(tabIndexOf('Kursiv')).toBe('0')
    expect(tabIndexOf('Ångra')).toBe('-1')
  })

  test('when the active item unmounts, the next item takes over', async () => {
    function Removable() {
      const [isShown, setIsShown] = useState(true)
      return (
        <TextToolbar>
          <Toolbar.Button>Ångra</Toolbar.Button>
          {isShown ? <Toolbar.Button>Gör om</Toolbar.Button> : null}
          <Toolbar.Button>Fet</Toolbar.Button>
          <Toolbar.Button onClick={() => setIsShown(false)}>Ta bort</Toolbar.Button>
        </TextToolbar>
      )
    }
    await render(<Removable />)
    // Make "Gör om" the Tab stop, then remove it from a control that is not the Tab stop.
    await userEvent.click(button('Gör om'))
    expect(tabIndexOf('Gör om')).toBe('0')
    ;(button('Ta bort').element() as HTMLElement).click()
    await expect.element(button('Gör om')).not.toBeInTheDocument()
    expect(tabIndexOf('Fet')).toBe('0')
    expect(tabStops()).toBe(1)
  })

  test('when the active last item unmounts, the new last item takes over', async () => {
    function Removable() {
      const [isShown, setIsShown] = useState(true)
      return (
        <TextToolbar>
          <Toolbar.Button onClick={() => setIsShown(false)}>Ta bort</Toolbar.Button>
          <Toolbar.Button>Fet</Toolbar.Button>
          {isShown ? <Toolbar.Button>Kursiv</Toolbar.Button> : null}
        </TextToolbar>
      )
    }
    await render(<Removable />)
    await userEvent.click(button('Kursiv'))
    expect(tabIndexOf('Kursiv')).toBe('0')
    ;(button('Ta bort').element() as HTMLElement).click()
    await expect.element(button('Kursiv')).not.toBeInTheDocument()
    expect(tabIndexOf('Fet')).toBe('0')
    expect(tabStops()).toBe(1)
  })

  test('items added later join in DOM order', async () => {
    function Growing() {
      const [isShown, setIsShown] = useState(false)
      return (
        <TextToolbar>
          <Toolbar.Button onClick={() => setIsShown(true)}>Lägg till</Toolbar.Button>
          {isShown ? <Toolbar.Button>Nytt</Toolbar.Button> : null}
          <Toolbar.Button>Sist</Toolbar.Button>
        </TextToolbar>
      )
    }
    await render(<Growing />)
    await userEvent.keyboard('{Tab}{Tab}')
    await userEvent.keyboard('{Enter}')
    await expect.element(button('Nytt')).toBeVisible()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(button('Nytt')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(button('Sist')).toHaveFocus()
  })

  test('an inline ref callback on an item does not loop', async () => {
    const seen: Array<HTMLButtonElement | null> = []
    await render(
      <TextToolbar>
        <Toolbar.Button ref={(element) => void seen.push(element)}>Ångra</Toolbar.Button>
        <Toolbar.Button>Gör om</Toolbar.Button>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(button('Gör om')).toHaveFocus()
    expect(seen.filter((element) => element !== null).length).toBeLessThan(10)
  })
})

describe('arrow keys', () => {
  async function focusFirst() {
    await userEvent.keyboard('{Tab}{Tab}')
    await expect.element(button('Ångra')).toHaveFocus()
  }

  test('ArrowRight and ArrowLeft move across groups, and wrap by default', async () => {
    await render(<TextToolbar />)
    await focusFirst()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(button('Gör om')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(button('Fet')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expect.element(button('Ångra')).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(button('Kursiv')).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(button('Fet')).toHaveFocus()
    expect(tabStops()).toBe(1)
    expect(tabIndexOf('Fet')).toBe('0')
  })

  test('Home and End go to the first and the last control', async () => {
    await render(<TextToolbar />)
    await focusFirst()
    await userEvent.keyboard('{End}')
    await expect.element(button('Kursiv')).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect.element(button('Ångra')).toHaveFocus()
  })

  test('loop={false} stops at the ends', async () => {
    await render(<TextToolbar loop={false} />)
    await focusFirst()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(button('Ångra')).toHaveFocus()
    await userEvent.keyboard('{End}{ArrowRight}')
    await expect.element(button('Kursiv')).toHaveFocus()
  })

  test('vertical: ArrowDown and ArrowUp move and wrap, and ArrowRight does nothing', async () => {
    await render(<TextToolbar orientation="vertical" />)
    await focusFirst()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(button('Ångra')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(button('Gör om')).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}{ArrowUp}')
    await expect.element(button('Kursiv')).toHaveFocus()
  })

  test('horizontal: ArrowDown and ArrowUp do nothing', async () => {
    await render(<TextToolbar />)
    await focusFirst()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(button('Ångra')).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    await expect.element(button('Ångra')).toHaveFocus()
  })

  test('right to left: the arrows flip, read from the toolbar’s direction', async () => {
    await render(
      <div dir="rtl">
        <TextToolbar />
      </div>,
    )
    await focusFirst()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(button('Gör om')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expect.element(button('Kursiv')).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect.element(button('Ångra')).toHaveFocus()
  })

  test('keys with Control, Alt, Meta or Shift are left alone', async () => {
    await render(<TextToolbar />)
    await focusFirst()
    await userEvent.keyboard('{Control>}{ArrowRight}{/Control}')
    await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}')
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}')
    await userEvent.keyboard('{Control>}{End}{/Control}')
    await expect.element(button('Ångra')).toHaveFocus()
  })

  test('Enter and Space activate a button and a toggle, and focus stays', async () => {
    const onClick = vi.fn<() => void>()
    await render(
      <TextToolbar>
        <Toolbar.Button onClick={onClick}>Ångra</Toolbar.Button>
        <Toolbar.Toggle>Fet</Toolbar.Toggle>
        <Toolbar.Toggle>Kursiv</Toolbar.Toggle>
      </TextToolbar>,
    )
    await userEvent.keyboard('{Tab}{Tab}{Enter}')
    await userEvent.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
    await expect.element(button('Ångra')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expect.element(button('Fet')).toHaveAttribute('aria-pressed', 'true')
    await userEvent.keyboard(' ')
    await expect.element(button('Fet')).toHaveAttribute('aria-pressed', 'false')
    await expect.element(button('Fet')).toHaveFocus()
  })
})

describe('keys the item owns', () => {
  test('a key an item already handled (defaultPrevented) is not taken again', async () => {
    await render(
      <TextToolbar>
        <Toolbar.Button onKeyDown={(event) => event.preventDefault()}>Ångra</Toolbar.Button>
        <Toolbar.Button>Gör om</Toolbar.Button>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(button('Ångra')).toHaveFocus()
  })

  test('events from a text field in the toolbar are left alone', async () => {
    await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Toolbar.Item as="input" type="text" aria-label="Sök i texten" defaultValue="abc" />
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    const input = page.getByRole('textbox', { name: 'Sök i texten' })
    await userEvent.click(input)
    await expect.element(input).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}{Home}{End}{ArrowRight}')
    await expect.element(input).toHaveFocus()
  })

  test('events from a contenteditable element in the toolbar are left alone', async () => {
    await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Toolbar.Item as="div" contentEditable suppressContentEditableWarning>
          abc
        </Toolbar.Item>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    const note = page.getByText('abc')
    await userEvent.click(note)
    await expect.element(note).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}{ArrowRight}{Home}')
    await expect.element(note).toHaveFocus()
  })

  test('a Listbox.Trigger as an item has the roving tabindex, not its own', async () => {
    const types = ['Vanlig text', 'Rubrik 2']
    await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Listbox.Root
          items={types}
          itemToString={(type) => type}
          itemToKey={(type) => type}
          native="never"
        >
          <Toolbar.Item as={Listbox.Trigger} aria-label="Texttyp" />
          <Listbox.Popup>
            <Listbox.List>{(type: string) => <Listbox.Option item={type} />}</Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    const trigger = page.getByRole('combobox', { name: 'Texttyp' })
    await expect.element(trigger).toHaveAttribute('tabindex', '-1')
    expect(tabStops()).toBe(1)
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(trigger).toHaveFocus()
    await expect.element(trigger).toHaveAttribute('tabindex', '0')
    expect(tabIndexOf('Ångra')).toBe('-1')
    expect(tabStops()).toBe(1)
    await userEvent.keyboard('{Tab}')
    await expect.element(button('Efter')).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(trigger).toHaveFocus()
  })

  test('a Listbox.Trigger keeps its own keys, and Left and Right still move on', async () => {
    const types = ['Vanlig text', 'Rubrik 2']
    await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Listbox.Root
          items={types}
          itemToString={(type) => type}
          itemToKey={(type) => type}
          native="never"
        >
          <Toolbar.Item as={Listbox.Trigger} aria-label="Texttyp" />
          <Listbox.Popup>
            <Listbox.List>{(type: string) => <Listbox.Option item={type} />}</Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    const trigger = page.getByRole('combobox', { name: 'Texttyp' })
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(trigger).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect.element(trigger).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    // Home on the closed trigger opens it, as the Listbox contract says, and doesn't jump to the first control.
    await userEvent.keyboard('{Home}')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect.element(trigger).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(button('Fet')).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    await expect.element(button('Ångra')).toHaveFocus()
  })

  test('a Popover.Trigger as an item works, and keys inside its popup never move the toolbar', async () => {
    await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Popover.Root>
          <Toolbar.Item as={Popover.Trigger}>Länk</Toolbar.Item>
          <Popover.Popup aria-label="Lägg till länk">
            <label>
              Webbadress
              <input type="url" />
            </label>
            <Popover.Close>Avbryt</Popover.Close>
          </Popover.Popup>
        </Popover.Root>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    await expect.element(button('Länk')).toHaveAttribute('tabindex', '-1')
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(button('Länk')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect.element(button('Länk')).toHaveAttribute('aria-expanded', 'true')
    // Tab goes into the popup, which follows the trigger. Its keys are not the toolbar's.
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('textbox', { name: 'Webbadress' })).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{Home}{End}')
    await expect.element(page.getByRole('textbox', { name: 'Webbadress' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(button('Avbryt')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{ArrowLeft}{Home}')
    await expect.element(button('Avbryt')).toHaveFocus()
    expect(tabStops()).toBe(1)
  })
})

describe('disabled controls', () => {
  test('a disabled button and toggle are focusable with aria-disabled, reachable by the arrows, and inert', async () => {
    const onClick = vi.fn<() => void>()
    const { container } = await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Toolbar.Button disabled onClick={onClick}>
          Gör om
        </Toolbar.Button>
        <Toolbar.Toggle disabled>Fet</Toolbar.Toggle>
      </TextToolbar>,
    )
    const redo = button('Gör om')
    await expect.element(redo).toHaveAttribute('aria-disabled', 'true')
    await expect.element(redo).not.toHaveAttribute('disabled')
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(redo).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(redo, { force: true })
    expect(onClick).not.toHaveBeenCalled()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(button('Fet')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect.element(button('Fet')).toHaveAttribute('aria-pressed', 'false')
    await expectNoA11yViolations(container)
  })

  test('a natively disabled control (focusableWhenDisabled={false}) is skipped by the arrows', async () => {
    await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Toolbar.Button disabled focusableWhenDisabled={false}>
          Gör om
        </Toolbar.Button>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(button('Fet')).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(button('Ångra')).toHaveFocus()
  })

  test('the Tab stop skips a natively disabled first control', async () => {
    await render(
      <TextToolbar>
        <Toolbar.Button disabled focusableWhenDisabled={false}>
          Ångra
        </Toolbar.Button>
        <Toolbar.Button>Gör om</Toolbar.Button>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    expect(tabIndexOf('Ångra')).toBe('-1')
    expect(tabIndexOf('Gör om')).toBe('0')
    expect(tabStops()).toBe(1)
    // Tab reaches the toolbar, at the first control that can take focus, and leaves it.
    await userEvent.keyboard('{Tab}{Tab}')
    await expect.element(button('Gör om')).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(button('Efter')).toHaveFocus()
  })

  test('the Tab stop follows a control that is enabled and disabled again, and is none when every control is disabled', async () => {
    function Switchable() {
      const [isDisabled, setIsDisabled] = useState(true)
      return (
        <>
          <button type="button" onClick={() => setIsDisabled((value) => !value)}>
            Växla
          </button>
          <Toolbar.Root aria-label="Redigerare">
            <Toolbar.Button disabled={isDisabled} focusableWhenDisabled={false}>
              Ångra
            </Toolbar.Button>
            <Toolbar.Button disabled={isDisabled} focusableWhenDisabled={false}>
              Gör om
            </Toolbar.Button>
            <Toolbar.Toggle disabled={isDisabled} focusableWhenDisabled={false}>
              Fet
            </Toolbar.Toggle>
          </Toolbar.Root>
        </>
      )
    }
    await render(<Switchable />)
    // A disabled editor leaves the Tab order.
    expect(tabStops()).toBe(0)
    await userEvent.click(button('Växla'))
    await expect.poll(tabStops).toBe(1)
    expect(tabIndexOf('Ångra')).toBe('0')
    await userEvent.click(button('Växla'))
    await expect.poll(tabStops).toBe(0)
  })

  test('a disabled Toolbar.Item stays reachable and inert', async () => {
    const onClick = vi.fn<() => void>()
    const { container } = await render(
      <TextToolbar>
        <Toolbar.Button style={fixtureButtonStyle}>Ångra</Toolbar.Button>
        <Toolbar.Item disabled onClick={onClick} style={fixtureButtonStyle}>
          Länk
        </Toolbar.Item>
        <Toolbar.Item style={fixtureButtonStyle}>Bild</Toolbar.Item>
      </TextToolbar>,
    )
    const link = button('Länk')
    await expect.element(link).toHaveAttribute('aria-disabled', 'true')
    await expect.element(link).not.toHaveAttribute('disabled')
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(link).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(link, { force: true })
    expect(onClick).not.toHaveBeenCalled()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(button('Bild')).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  test('a disabled Toolbar.Item that renders a Popover.Trigger does not open', async () => {
    await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Popover.Root>
          <Toolbar.Item disabled as={Popover.Trigger}>
            Länk
          </Toolbar.Item>
          <Popover.Popup aria-label="Lägg till länk">
            <Popover.Close>Avbryt</Popover.Close>
          </Popover.Popup>
        </Popover.Root>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(button('Länk')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await expect.element(button('Länk')).toHaveAttribute('aria-expanded', 'false')
  })

  test('a Toolbar.Item with focusableWhenDisabled={false} is natively disabled and skipped', async () => {
    await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Toolbar.Item disabled focusableWhenDisabled={false}>
          Länk
        </Toolbar.Item>
        <Toolbar.Item>Bild</Toolbar.Item>
      </TextToolbar>,
    )
    await expect.element(button('Länk')).toHaveAttribute('disabled')
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(button('Bild')).toHaveFocus()
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a Listbox disabled on its Root stays reachable by the arrows, is aria-disabled, and does not open', async () => {
    await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Listbox.Root
          items={['Vanlig text', 'Rubrik 2']}
          itemToString={(type) => type}
          itemToKey={(type) => type}
          native="never"
          disabled
        >
          <Toolbar.Item as={Listbox.Trigger} aria-label="Texttyp" />
          <Listbox.Popup>
            <Listbox.List>{(type: string) => <Listbox.Option item={type} />}</Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    const trigger = page.getByRole('combobox', { name: 'Texttyp' })
    await expect.element(trigger).toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(trigger).toHaveFocus()
    await expect.element(trigger).toHaveAttribute('tabindex', '0')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    ;(trigger.element() as HTMLElement).click()
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(button('Fet')).toHaveFocus()
  })

  test('focus moves to the new Tab stop when the focused control becomes disabled', async () => {
    function SelfDisabling() {
      const [isDone, setIsDone] = useState(false)
      return (
        <TextToolbar>
          <Toolbar.Button>Ångra</Toolbar.Button>
          <Toolbar.Button
            disabled={isDone}
            focusableWhenDisabled={false}
            onClick={() => setIsDone(true)}
          >
            Spara
          </Toolbar.Button>
          <Toolbar.Button>Fet</Toolbar.Button>
        </TextToolbar>
      )
    }
    await render(<SelfDisabling />)
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(button('Spara')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect.element(button('Spara')).toBeDisabled()
    // Focus is not lost to the page: it moved to the next control that can take it.
    await expect.element(button('Fet')).toHaveFocus()
    expect(tabIndexOf('Fet')).toBe('0')
    expect(tabIndexOf('Spara')).toBe('-1')
    expect(tabStops()).toBe(1)
  })
})

describe('development warnings', () => {
  test('a toolbar without a name', async () => {
    await render(
      <Toolbar.Root>
        <Toolbar.Button>A</Toolbar.Button>
        <Toolbar.Button>B</Toolbar.Button>
        <Toolbar.Button>C</Toolbar.Button>
      </Toolbar.Root>,
    )
    await expect.element(page.getByRole('toolbar')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('no name')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('aria-label')
  })

  test('a toolbar with fewer than three controls', async () => {
    await render(
      <Toolbar.Root aria-label="Åtgärder">
        <Toolbar.Button>A</Toolbar.Button>
        <Toolbar.Button>B</Toolbar.Button>
      </Toolbar.Root>,
    )
    await expect.element(page.getByRole('toolbar', { name: 'Åtgärder' })).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('three')
  })

  test('a named toolbar with three controls does not warn', async () => {
    await render(<TextToolbar />)
    await expect.element(page.getByRole('toolbar')).toBeVisible()
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('Toolbar.Item rendering an element that is not focusable by itself', async () => {
    await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Toolbar.Item as="span">Text</Toolbar.Item>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    await expect.element(page.getByText('Text')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('<span>')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Toolbar.Item')
  })

  test('Toolbar.Item rendering an element that is natively disabled anyway', async () => {
    function AlwaysDisabledButton(props: ComponentPropsWithRef<'button'>) {
      return <button {...props} type="button" disabled />
    }
    await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Toolbar.Item as={AlwaysDisabledButton} aria-label="Länk">
          Länk
        </Toolbar.Item>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    await expect.element(page.getByText('Länk')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('natively disabled')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Toolbar.Item')
  })

  test('a Listbox that renders natively inside a Toolbar warns that its item is gone', async () => {
    await render(
      <TextToolbar>
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Listbox.Root
          items={['Vanlig text', 'Rubrik 2']}
          itemToString={(type) => type}
          itemToKey={(type) => type}
          native="always"
        >
          <Toolbar.Item as={Listbox.Trigger} aria-label="Texttyp" />
        </Listbox.Root>
        <Toolbar.Button>Fet</Toolbar.Button>
      </TextToolbar>,
    )
    await expect.element(page.getByRole('toolbar')).toBeVisible()
    // The select replaces the children: there is no Toolbar.Item and no combobox.
    expect(page.getByRole('combobox', { name: 'Texttyp' }).elements()).toHaveLength(0)
    const warnings = consoleWarn.mock.calls.map((call) => String(call[0]))
    const warning = warnings.find((text) => text.includes('Toolbar'))
    expect(warning).toContain('native="never"')
  })

  test('a part outside a Toolbar.Root warns and still renders', async () => {
    await render(
      <>
        <Toolbar.Button>Ensam</Toolbar.Button>
        <Toolbar.Toggle>Fet</Toolbar.Toggle>
      </>,
    )
    await expect.element(button('Ensam')).toBeVisible()
    expect(consoleWarn).toHaveBeenCalledTimes(2)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Toolbar.Button')
    expect(consoleWarn.mock.calls[1]?.[0]).toContain('Toolbar.Toggle')
  })
})

describe('the toolbar element', () => {
  test('a disabled change is still seen after as swaps the toolbar element', async () => {
    function Swappable() {
      const [isSection, setIsSection] = useState(false)
      const [isDisabled, setIsDisabled] = useState(true)
      return (
        <>
          <button type="button" onClick={() => setIsSection(true)}>
            Byt element
          </button>
          <button type="button" onClick={() => setIsDisabled(false)}>
            Aktivera
          </button>
          <Toolbar.Root aria-label="Redigerare" as={isSection ? 'section' : 'div'}>
            <Toolbar.Button disabled={isDisabled} focusableWhenDisabled={false}>
              Ångra
            </Toolbar.Button>
            <Toolbar.Button disabled={isDisabled} focusableWhenDisabled={false}>
              Gör om
            </Toolbar.Button>
            <Toolbar.Button disabled={isDisabled} focusableWhenDisabled={false}>
              Fet
            </Toolbar.Button>
          </Toolbar.Root>
        </>
      )
    }
    await render(<Swappable />)
    await userEvent.click(button('Byt element'))
    await expect.poll(() => page.getByRole('toolbar').element().tagName).toBe('SECTION')
    expect(tabStops()).toBe(0)
    await userEvent.click(button('Aktivera'))
    await expect.poll(tabStops).toBe(1)
  })
})

describe('useToolbar', () => {
  function HookToolbar(options: UseToolbarOptions) {
    const toolbar = useToolbar(options)
    return (
      // Unstyled buttons: the gaps keep them apart for axe's target-size rule (2.5.8).
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <button type="button">Före</button>
        <div
          {...toolbar.toolbarProps}
          aria-label="Åtgärder"
          style={{ display: 'flex', gap: '1.5rem' }}
        >
          {['Ett', 'Två', 'Tre'].map((name) => (
            <button type="button" key={name} {...toolbar.getItemProps(name)}>
              {name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  test('gives spreadable props: one Tab stop, the arrows and Home and End', async () => {
    const { container } = await render(<HookToolbar />)
    expect(tabIndexOf('Ett')).toBe('0')
    expect(tabIndexOf('Två')).toBe('-1')
    await userEvent.keyboard('{Tab}{Tab}{ArrowRight}')
    await expect.element(button('Två')).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect.element(button('Tre')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(button('Ett')).toHaveFocus()
    await expectNoA11yViolations(container)
  })
})

describe('server rendering', () => {
  test('renders to a string without touching the page', () => {
    const html = renderToString(
      <Toolbar.Root aria-label="Formatering">
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Toolbar.Toggle>Fet</Toolbar.Toggle>
      </Toolbar.Root>,
    )
    expect(html).toContain('role="toolbar"')
    expect(html).toContain('class="kv-toolbar"')
    expect(html).toContain('aria-pressed="false"')
  })

  test('before the items register, every item is an ordinary Tab stop', () => {
    const html = renderToString(
      <Toolbar.Root aria-label="Formatering">
        <Toolbar.Button>Ångra</Toolbar.Button>
        <Toolbar.Toggle>Fet</Toolbar.Toggle>
      </Toolbar.Root>,
    )
    expect(html).not.toContain('tabindex="-1"')
    expect(html.match(/tabindex="0"/g)).toHaveLength(2)
  })
})

describe('types', () => {
  test('exports the hook and part types', () => {
    expectTypeOf<ToolbarRootPartProps['className']>().toEqualTypeOf<'kv-toolbar'>()
    expectTypeOf<ToolbarRootPartProps['role']>().toEqualTypeOf<'toolbar'>()
    expectTypeOf<ToolbarItemPartProps['tabIndex']>().toEqualTypeOf<0 | -1>()
    expectTypeOf<UseToolbarOptions['orientation']>().toEqualTypeOf<
      'horizontal' | 'vertical' | undefined
    >()
    expectTypeOf<UseToolbarOptions['loop']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<UseToolbarResult['toolbarProps']>().toEqualTypeOf<ToolbarRootPartProps>()
    // The role and the orientation attribute come from the hook, never from a prop.
    expectTypeOf<ToolbarRootProps>().not.toHaveProperty('role')
    expectTypeOf<ToolbarRootProps>().not.toHaveProperty('aria-orientation')
  })
})
