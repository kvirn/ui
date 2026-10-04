import { en } from '@kvirn-ui/i18n/en'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { Button } from '../button/button.tsx'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { TextInput } from '../text-input/text-input.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { InputGroup, InputGroupAddon, InputGroupRoot } from './input-group.tsx'
import type { InputGroupAddonProps, InputGroupRootProps, InputGroupState } from './input-group.tsx'
import { useInputGroup } from './use-input-group.ts'
import type {
  InputGroupAddonPartProps,
  InputGroupRootPartProps,
  UseInputGroupOptions,
  UseInputGroupResult,
} from './use-input-group.ts'

// Contract: input-group.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/input-group/input-group.e2e.ts.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

/** The design spec's rent field: the label says the unit, the "kr" is only a visual repeat. */
function RentField({
  invalid = false,
  disabled = false,
}: {
  invalid?: boolean
  disabled?: boolean
}) {
  return (
    <Field.Root required invalid={invalid} disabled={disabled}>
      <Field.Label>Månadshyra i kronor</Field.Label>
      <InputGroup.Root data-testid="root">
        <TextInput name="rent" inputMode="decimal" className="kv-input--width-10" />
        <InputGroup.Addon data-testid="addon">kr</InputGroup.Addon>
      </InputGroup.Root>
      <Field.Prose>Till exempel 8450</Field.Prose>
      {invalid ? <Field.ErrorMessage>Ange hyran i hela kronor</Field.ErrorMessage> : null}
    </Field.Root>
  )
}

/** A search with a start icon (here a letter, decorative) and a clear Button directly in the Root. */
function SearchField({ onClear }: { onClear?: () => void }) {
  const [value, setValue] = useState('parkering')
  return (
    <>
      <Field.Root>
        <Field.Label marker="none">Sök bland tjänster</Field.Label>
        <InputGroup.Root data-testid="root">
          <InputGroup.Addon data-testid="addon">
            <svg viewBox="0 0 8 8" focusable="false" />
          </InputGroup.Addon>
          <TextInput type="search" value={value} onValueChange={setValue} />
          <Button
            onClick={() => {
              onClear?.()
              setValue('')
            }}
          >
            Rensa
          </Button>
        </InputGroup.Root>
      </Field.Root>
      {/* Component tests load no theme, so the target needs its own size for axe (2.5.8). */}
      <button type="button" style={{ minInlineSize: 24, minBlockSize: 24 }}>
        Efter
      </button>
    </>
  )
}

describe('rendering', () => {
  test('Root has the kv-input-group part class and Addon the kv-input-group-addon one', async () => {
    const { container } = await render(<RentField />)
    const root = page.getByTestId('root').element()
    const addon = page.getByTestId('addon').element()
    expect(root.className).toBe('kv-input-group')
    expect(root.getAttribute('role')).toBeNull()
    expect(addon.className).toBe('kv-input-group-addon')
    expect(root.contains(addon)).toBe(true)
    expect(root.querySelector('input')).not.toBeNull()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('the Addon is aria-hidden and out of the accessibility tree', async () => {
    await render(<RentField />)
    await expect.element(page.getByTestId('addon')).toHaveAttribute('aria-hidden', 'true')
    expect(page.getByText('kr', { exact: true }).element().getAttribute('aria-hidden')).toBe('true')
    // An aria-hidden element can't be found by role or name.
    expect(page.getByRole('textbox', { name: 'kr' }).elements()).toHaveLength(0)
  })

  test('with several children, the DOM order is kept: a start Addon, the Input, an end Addon', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Belopp</Field.Label>
        <InputGroup.Root data-testid="root">
          <InputGroup.Addon>€</InputGroup.Addon>
          <TextInput />
          <InputGroup.Addon>,00</InputGroup.Addon>
        </InputGroup.Root>
      </Field.Root>,
    )
    const children = [...page.getByTestId('root').element().children]
    expect(children.map((child) => child.textContent)).toEqual(['€', '', ',00'])
    expect(children[1]).toBeInstanceOf(HTMLInputElement)
  })

  test('works without a Field: the Input is named by its own aria-label', async () => {
    const { container } = await render(
      <InputGroup.Root>
        <TextInput aria-label="Månadshyra i kronor" />
        <InputGroup.Addon>kr</InputGroup.Addon>
      </InputGroup.Root>,
    )
    await expect.element(page.getByRole('textbox', { name: 'Månadshyra i kronor' })).toBeVisible()
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('name and description come from the Field, never from the Addon', () => {
  test('the accessible name is the label, without "kr"', async () => {
    await render(<RentField />)
    const input = page.getByRole('textbox', { name: 'Månadshyra i kronor' })
    await expect.element(input).toHaveAccessibleName('Månadshyra i kronor')
  })

  test('the accessible description is the Field’s Description and error, without "kr"', async () => {
    await render(<RentField invalid />)
    const input = page.getByRole('textbox', { name: 'Månadshyra i kronor' })
    await expect
      .element(input)
      .toHaveAccessibleDescription('Till exempel 8450 Error: Ange hyran i hela kronor')
    const describedBy = (input.element().getAttribute('aria-describedby') ?? '').split(' ')
    const addon = page.getByTestId('addon').element()
    expect(addon.id).toBe('')
    expect(describedBy).not.toContain(addon.id)
    for (const id of describedBy) {
      expect(document.getElementById(id)?.closest('.kv-input-group')).toBeNull()
    }
  })

  test('the name and description follow the locale, and axe is clean in sv and en', async () => {
    const swedish = await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <RentField invalid />
      </KvirnProvider>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Månadshyra i kronor' }))
      .toHaveAccessibleDescription('Till exempel 8450 Fel: Ange hyran i hela kronor')
    await expectNoA11yViolations(swedish.container)
    await swedish.unmount()

    const english = await render(
      <KvirnProvider locale="en-GB" messages={en}>
        <RentField invalid />
      </KvirnProvider>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Månadshyra i kronor' }))
      .toHaveAccessibleDescription('Till exempel 8450 Error: Ange hyran i hela kronor')
    await expectNoA11yViolations(english.container)
  })

  test('the Button’s name is its own text, and the group adds no name to it', async () => {
    const { container } = await render(<SearchField />)
    await expect.element(page.getByRole('button', { name: 'Rensa' })).toBeVisible()
    await expect
      .element(page.getByRole('searchbox', { name: 'Sök bland tjänster' }))
      .toHaveAccessibleName('Sök bland tjänster')
    await expectNoA11yViolations(container)
  })
})

describe('field state on the Root', () => {
  test('data-invalid and data-disabled come from the Field', async () => {
    await render(<RentField invalid disabled />)
    const root = page.getByTestId('root')
    await expect.element(root).toHaveAttribute('data-invalid', '')
    await expect.element(root).toHaveAttribute('data-disabled', '')
    const input = page.getByRole('textbox', { name: 'Månadshyra i kronor' })
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    await expect.element(input).toBeDisabled()
  })

  test('a valid, enabled Field sets neither', async () => {
    await render(<RentField />)
    const root = page.getByTestId('root')
    await expect.element(root).not.toHaveAttribute('data-invalid')
    await expect.element(root).not.toHaveAttribute('data-disabled')
    await expect.element(root).not.toHaveAttribute('data-focus-visible')
  })

  test('the Root’s own invalid and disabled props win over the Field', async () => {
    await render(
      <Field.Root invalid>
        <Field.Label marker="none">Belopp</Field.Label>
        <Field.ErrorMessage>Ange ett belopp</Field.ErrorMessage>
        <InputGroup.Root data-testid="root" invalid={false} disabled>
          <TextInput />
        </InputGroup.Root>
      </Field.Root>,
    )
    const root = page.getByTestId('root')
    await expect.element(root).not.toHaveAttribute('data-invalid')
    await expect.element(root).toHaveAttribute('data-disabled', '')
  })

  test('render receives the state, and the Addon gets the Root’s state too', async () => {
    const seen: InputGroupState[] = []
    const seenByAddon: InputGroupState[] = []
    await render(
      <Field.Root invalid>
        <Field.Label marker="none">Belopp</Field.Label>
        <Field.ErrorMessage>Ange ett belopp</Field.ErrorMessage>
        <InputGroup.Root
          render={(partProps, state) => {
            seen.push(state)
            return <div {...partProps} data-egen="" />
          }}
        >
          <TextInput />
          <InputGroup.Addon
            render={(partProps, state) => {
              seenByAddon.push(state)
              return <span {...partProps} data-egen-addon="" />
            }}
          >
            kr
          </InputGroup.Addon>
        </InputGroup.Root>
      </Field.Root>,
    )
    expect(seen.at(-1)).toEqual({ isInvalid: true, isDisabled: false, isFocusVisible: false })
    expect(seenByAddon.at(-1)).toEqual({
      isInvalid: true,
      isDisabled: false,
      isFocusVisible: false,
    })
    expect(document.querySelector('[data-egen-addon]')?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('clicking an Addon focuses the Input', () => {
  test('a click on the Addon focuses the Input', async () => {
    await render(<RentField />)
    await userEvent.click(page.getByTestId('addon'))
    await expect.element(page.getByRole('textbox', { name: 'Månadshyra i kronor' })).toHaveFocus()
  })

  test('a mousedown on the box’s padding focuses the Input', async () => {
    await render(<RentField />)
    const root = page.getByTestId('root').element()
    // Dispatched on the Root itself, the way a click in its padding is: not on a child.
    root.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }))
    await expect.element(page.getByRole('textbox', { name: 'Månadshyra i kronor' })).toHaveFocus()
  })

  test('a click on an icon Addon inside the Root focuses the Input, not the Button', async () => {
    await render(<SearchField />)
    await userEvent.click(page.getByTestId('addon'))
    await expect.element(page.getByRole('searchbox')).toHaveFocus()
  })

  test('a click on the Button keeps its own behaviour: focus stays on the Button and it activates', async () => {
    const onClear = vi.fn<() => void>()
    await render(<SearchField onClear={onClear} />)
    await userEvent.click(page.getByRole('button', { name: 'Rensa' }))
    expect(onClear).toHaveBeenCalledTimes(1)
    await expect.element(page.getByRole('searchbox')).toHaveValue('')
  })

  test('a disabled group doesn’t move focus on a click', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Belopp</Field.Label>
        <InputGroup.Root disabled>
          <TextInput />
          <InputGroup.Addon data-testid="addon">kr</InputGroup.Addon>
        </InputGroup.Root>
        <button type="button">Efter</button>
      </Field.Root>,
    )
    await userEvent.click(page.getByTestId('addon'))
    await expect.element(page.getByRole('textbox')).not.toHaveFocus()
  })

  test('a click on the Addon doesn’t select or change the typed text', async () => {
    await render(<RentField />)
    const input = page.getByRole('textbox', { name: 'Månadshyra i kronor' })
    await userEvent.type(input, '8450')
    await userEvent.click(page.getByTestId('addon'))
    await expect.element(input).toHaveValue('8450')
    await expect.element(input).toHaveFocus()
  })
})

describe('data-focus-visible', () => {
  test('is set on the Root while the Input has keyboard focus, and removed on blur', async () => {
    await render(
      <>
        <RentField />
        <button type="button">Efter</button>
      </>,
    )
    const root = page.getByTestId('root')
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('textbox')).toHaveFocus()
    await expect.element(root).toHaveAttribute('data-focus-visible', '')
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    await expect.element(root).not.toHaveAttribute('data-focus-visible')
  })

  test('isn’t set while a Button inside the group has focus: the Button draws its own ring', async () => {
    await render(<SearchField />)
    const root = page.getByTestId('root')
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('searchbox')).toHaveFocus()
    await expect.element(root).toHaveAttribute('data-focus-visible', '')
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Rensa' })).toHaveFocus()
    await expect.element(root).not.toHaveAttribute('data-focus-visible')
    await expect
      .element(page.getByRole('button', { name: 'Rensa' }))
      .toHaveAttribute('data-focus-visible', '')
  })

  test('isn’t set when the focus came from a click on the Button', async () => {
    await render(<SearchField />)
    await userEvent.click(page.getByRole('button', { name: 'Rensa' }))
    await expect.element(page.getByTestId('root')).not.toHaveAttribute('data-focus-visible')
  })
})

describe('keyboard (contract rows)', () => {
  test('Tab goes to the input, then to the Button, and Shift+Tab goes back', async () => {
    await render(<SearchField />)
    // The Addon (an icon) is skipped: the first stop is the Input.
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('searchbox')).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Rensa' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Rensa' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('searchbox')).toHaveFocus()
  })

  test('the Addon is never a Tab stop: Tab from the Input leaves a group without a Button', async () => {
    await render(
      <>
        <RentField />
        <button type="button">Efter</button>
      </>,
    )
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('textbox')).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    expect(page.getByTestId('addon').element().getAttribute('tabindex')).toBeNull()
  })

  test('Enter and Space on the Button activate it', async () => {
    const onClear = vi.fn<() => void>()
    await render(<SearchField onClear={onClear} />)
    await userEvent.keyboard('{Tab}{Tab}')
    await expect.element(page.getByRole('button', { name: 'Rensa' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onClear).toHaveBeenCalledTimes(1)
    await userEvent.keyboard(' ')
    expect(onClear).toHaveBeenCalledTimes(2)
  })

  test('any character types, and the unit can be typed too', async () => {
    await render(<RentField />)
    const input = page.getByRole('textbox', { name: 'Månadshyra i kronor' })
    await userEvent.type(input, '8 450 kr')
    await expect.element(input).toHaveValue('8 450 kr')
  })

  test('the native text keys keep working: Home and End move the caret, Enter submits a form', async () => {
    const onSubmit = vi.fn<(event: unknown) => void>((event) => {
      ;(event as Event).preventDefault()
    })
    await render(
      <form onSubmit={onSubmit}>
        <Field.Root>
          <Field.Label marker="none">Belopp</Field.Label>
          <InputGroup.Root>
            <TextInput defaultValue="8450" />
            <InputGroup.Addon>kr</InputGroup.Addon>
          </InputGroup.Root>
        </Field.Root>
      </form>,
    )
    const input = page.getByRole('textbox', { name: 'Belopp' })
    await userEvent.click(input)
    await userEvent.keyboard('{Home}')
    expect((input.element() as HTMLInputElement).selectionStart).toBe(0)
    await userEvent.keyboard('{End}')
    expect((input.element() as HTMLInputElement).selectionStart).toBe(4)
    await userEvent.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})

describe('dev warnings', () => {
  test('focusable content in an Addon warns once, and says to put a Button in the Root', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Belopp</Field.Label>
        <InputGroup.Root>
          <TextInput />
          <InputGroup.Addon>
            <button type="button">Rensa</button>
          </InputGroup.Addon>
          <InputGroup.Addon>
            <a href="/hjalp">Hjälp</a>
          </InputGroup.Addon>
        </InputGroup.Root>
      </Field.Root>,
    )
    const warnings = consoleWarn.mock.calls
      .map(([message]) => String(message))
      .filter((message) => message.includes('InputGroup.Addon contains focusable content'))
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('directly in <InputGroup.Root>')
  })

  test('an Addon with text or an icon doesn’t warn', async () => {
    await render(<SearchField />)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('an Addon outside a Root warns once', async () => {
    await render(<InputGroup.Addon>kr</InputGroup.Addon>)
    const warnings = consoleWarn.mock.calls
      .map(([message]) => String(message))
      .filter((message) => message.includes('outside an InputGroup.Root'))
    expect(warnings).toHaveLength(1)
  })
})

describe('render and refs', () => {
  test('both parts forward refs, class names and native props, and join handlers', async () => {
    const rootRef = createRef<HTMLDivElement>()
    const addonRef = createRef<HTMLSpanElement>()
    const onMouseDown = vi.fn<() => void>()
    await render(
      <Field.Root>
        <Field.Label marker="none">Belopp</Field.Label>
        <InputGroup.Root
          ref={rootRef}
          className="egen-ruta"
          data-testid="root"
          onMouseDown={onMouseDown}
        >
          <TextInput />
          <InputGroup.Addon ref={addonRef} className="egen-enhet" data-testid="addon">
            kr
          </InputGroup.Addon>
        </InputGroup.Root>
      </Field.Root>,
    )
    expect(rootRef.current).toBe(page.getByTestId('root').element())
    expect(addonRef.current).toBe(page.getByTestId('addon').element())
    await expect.element(page.getByTestId('root')).toHaveClass('egen-ruta', 'kv-input-group')
    await expect
      .element(page.getByTestId('addon'))
      .toHaveClass('egen-enhet', 'kv-input-group-addon')
    await userEvent.click(page.getByTestId('addon'))
    // Your handler runs, and the group's own still focuses the Input.
    expect(onMouseDown).toHaveBeenCalled()
    await expect.element(page.getByRole('textbox')).toHaveFocus()
  })

  test('a handler that prevents the default stops the click from focusing the Input', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Belopp</Field.Label>
        <InputGroup.Root
          onMouseDown={(event) => {
            event.preventDefault()
          }}
        >
          <TextInput />
          <InputGroup.Addon data-testid="addon">kr</InputGroup.Addon>
        </InputGroup.Root>
      </Field.Root>,
    )
    await userEvent.click(page.getByTestId('addon'))
    await expect.element(page.getByRole('textbox')).not.toHaveFocus()
  })

  test('render as an element keeps the group’s props on it', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Belopp</Field.Label>
        <InputGroup.Root render={<section data-testid="root" />}>
          <TextInput />
          <InputGroup.Addon render={<abbr data-testid="addon" />}>kr</InputGroup.Addon>
        </InputGroup.Root>
      </Field.Root>,
    )
    expect(page.getByTestId('root').element().tagName).toBe('SECTION')
    expect(page.getByTestId('addon').element().tagName).toBe('ABBR')
    await expect.element(page.getByTestId('addon')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('useInputGroup', () => {
  function HookGroup(options: UseInputGroupOptions) {
    const group = useInputGroup(options)
    return (
      <Field.Root>
        <Field.Label marker="none">Belopp</Field.Label>
        <div {...group.rootProps} data-testid="root">
          <TextInput />
          <span {...group.addonProps} data-testid="addon">
            kr
          </span>
        </div>
        <output data-testid="state">
          {String(group.isInvalid)} {String(group.isDisabled)} {String(group.isFocusVisible)}
        </output>
      </Field.Root>
    )
  }

  test('gives spreadable props for your own elements, with the same behaviour', async () => {
    const { container } = await render(<HookGroup invalid />)
    const root = page.getByTestId('root')
    await expect.element(root).toHaveAttribute('data-invalid', '')
    await expect.element(page.getByTestId('addon')).toHaveAttribute('aria-hidden', 'true')
    await userEvent.click(page.getByTestId('addon'))
    await expect.element(page.getByRole('textbox')).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  test('reports its state, including keyboard focus', async () => {
    await render(<HookGroup disabled={false} />)
    await expect.element(page.getByTestId('state')).toHaveTextContent('false false false')
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByTestId('state')).toHaveTextContent('false false true')
  })

  test('the addon props are one constant: the same object every render', () => {
    const seen = new Set<InputGroupAddonPartProps>()
    function Probe() {
      seen.add(useInputGroup().addonProps)
      return null
    }
    renderToString(
      <>
        <Probe />
        <Probe />
      </>,
    )
    expect(seen.size).toBe(1)
  })
})

describe('server rendering', () => {
  test('renders the group to a string without touching the page', () => {
    const html = renderToString(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <RentField invalid disabled />
      </KvirnProvider>,
    )
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('data-invalid=""')
    expect(html).toContain('data-disabled=""')
    expect(html).not.toContain('data-focus-visible')
  })

  test('the hook’s markup on the server has the box, the addon and no focus state', () => {
    function Own() {
      const group = useInputGroup()
      return (
        <div {...group.rootProps}>
          <span {...group.addonProps}>kr</span>
        </div>
      )
    }
    const html = renderToString(<Own />)
    expect(html).toContain('aria-hidden="true">kr</span>')
  })
})

describe('types', () => {
  test('Root takes invalid, disabled and render', () => {
    expectTypeOf<InputGroupRootProps['invalid']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<InputGroupRootProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<InputGroupRootProps>().toHaveProperty('render')
    expectTypeOf<InputGroupAddonProps>().toHaveProperty('render')
  })

  test('exports the hook and part types', () => {
    expectTypeOf<InputGroupRootPartProps['className']>().toEqualTypeOf<'kv-input-group'>()
    expectTypeOf<InputGroupAddonPartProps['className']>().toEqualTypeOf<'kv-input-group-addon'>()
    expectTypeOf<InputGroupAddonPartProps['aria-hidden']>().toEqualTypeOf<'true'>()
    expectTypeOf<InputGroupRootPartProps>().not.toHaveProperty('data-kv')
    expectTypeOf<UseInputGroupResult['rootProps']>().toEqualTypeOf<InputGroupRootPartProps>()
    expectTypeOf<UseInputGroupResult['addonProps']>().toEqualTypeOf<InputGroupAddonPartProps>()
    expectTypeOf<UseInputGroupResult['isFocusVisible']>().toEqualTypeOf<boolean>()
    expectTypeOf<UseInputGroupOptions['invalid']>().toEqualTypeOf<boolean | undefined>()
  })

  test('the compound and the named exports are the same parts', () => {
    expect(InputGroup.Root).toBe(InputGroupRoot)
    expect(InputGroup.Addon).toBe(InputGroupAddon)
  })
})
