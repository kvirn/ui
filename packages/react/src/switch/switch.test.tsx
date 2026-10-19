import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Switch } from './switch.tsx'
import type { SwitchProps } from './switch.tsx'
import { useSwitch } from './use-switch.ts'
import type {
  SwitchChangeDetails,
  SwitchDataState,
  SwitchPartProps,
  UseSwitchOptions,
  UseSwitchResult,
} from './use-switch.ts'

// Contract: switch.a11y.md. The keyboard rows are in the `keyboard` block.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('rendering', () => {
  test('renders a native <input type="checkbox" role="switch">, outside a Field', async () => {
    const { container } = await render(<Switch aria-label="Text message" />)
    const control = page.getByRole('switch', { name: 'Text message' })
    await expect.element(control).toHaveAttribute('type', 'checkbox')
    await expect.element(control).toHaveAttribute('role', 'switch')
    await expect.element(control).toHaveAttribute('data-state', 'unchecked')
    await expect.element(control).not.toHaveAttribute('id')
    await expect.element(control).not.toHaveAttribute('aria-describedby')
    await expect.element(control).not.toHaveAttribute('aria-invalid')
    await expect.element(control).not.toHaveAttribute('aria-required')
    await expect.element(control).not.toHaveAttribute('aria-checked')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('forwards its ref and native props, and has the part class kv-switch joined with a consumer’s', async () => {
    const ref = createRef<HTMLInputElement>()
    await render(
      <Switch
        ref={ref}
        aria-label="Text message"
        className="own"
        name="sms"
        value="yes"
        form="settings"
        data-own=""
      />,
    )
    const control = page.getByRole('switch', { name: 'Text message' })
    expect(ref.current).toBe(control.element())
    await expect.element(control).toHaveClass('own', 'kv-switch')
    await expect.element(control).toHaveAttribute('name', 'sms')
    await expect.element(control).toHaveAttribute('value', 'yes')
    await expect.element(control).toHaveAttribute('form', 'settings')
    await expect.element(control).toHaveAttribute('data-own', '')
  })
})

describe('in a Field', () => {
  test('the Field’s label is the name, and the description is the help text', async () => {
    const { container } = await render(
      <Field.Root>
        <Switch name="sms" />
        <Field.Label marker="none">Get messages by text message</Field.Label>
        <Field.HelpText>You can change this at any time.</Field.HelpText>
      </Field.Root>,
    )
    const control = page.getByRole('switch', { name: 'Get messages by text message' })
    const id = control.element().id
    expect(id).not.toBe('')
    expect(container.querySelector('label')?.getAttribute('for')).toBe(id)
    await expect.element(control).toHaveAccessibleDescription('You can change this at any time.')
    await expect.element(control).not.toHaveAttribute('aria-required')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a standalone Field marks the label optional, and marker="none" removes it', async () => {
    await render(
      <>
        <Field.Root>
          <Switch />
          <Field.Label>Newsletter</Field.Label>
        </Field.Root>
        <Field.Root>
          <Switch />
          <Field.Label marker="none">Text message</Field.Label>
        </Field.Root>
      </>,
    )
    await expect.element(page.getByRole('switch', { name: 'Newsletter (optional)' })).toBeVisible()
    await expect
      .element(page.getByRole('switch', { name: 'Text message', exact: true }))
      .toBeVisible()
  })

  test('an invalid Field gives aria-invalid and the error in the description', async () => {
    const { container } = await render(
      <Field.Root invalid>
        <Switch />
        <Field.Label marker="none">Reminders by text message</Field.Label>
        <Field.HelpText>We send a text message the day before.</Field.HelpText>
        <Field.ErrorMessage>The setting was not saved</Field.ErrorMessage>
      </Field.Root>,
    )
    const control = page.getByRole('switch', { name: 'Reminders by text message' })
    await expect.element(control).toHaveAttribute('aria-invalid', 'true')
    await expect.element(control).toHaveAttribute('data-invalid', '')
    await expect
      .element(control)
      .toHaveAccessibleDescription(
        'We send a text message the day before. Error: The setting was not saved',
      )
    await expectNoA11yViolations(container)
  })

  test('a disabled Field disables the switch, and the switch’s own disabled does too', async () => {
    await render(
      <>
        <Field.Root disabled>
          <Switch />
          <Field.Label marker="none">One</Field.Label>
        </Field.Root>
        <Field.Root>
          <Switch disabled />
          <Field.Label marker="none">Two</Field.Label>
        </Field.Root>
      </>,
    )
    await expect.element(page.getByRole('switch', { name: 'One' })).toBeDisabled()
    const second = page.getByRole('switch', { name: 'Two' })
    await expect.element(second).toBeDisabled()
    await expect.element(second).toHaveAttribute('data-disabled', '')
  })

  test('a disabled switch keeps its help text in its description', async () => {
    await render(
      <Field.Root>
        <Switch disabled />
        <Field.Label marker="none">Text message</Field.Label>
        <Field.HelpText>Add a mobile number to turn this on.</Field.HelpText>
      </Field.Root>,
    )
    const disabled = page.getByRole('switch', { name: 'Text message' })
    await expect.element(disabled).toBeDisabled()
    await expect
      .element(disabled)
      .toHaveAccessibleDescription('Add a mobile number to turn this on.')
  })

  test('keeps your own aria-describedby ids, after the Field’s', async () => {
    await render(
      <>
        <p id="extra">More information.</p>
        <Field.Root>
          <Switch aria-describedby="extra" />
          <Field.Label marker="none">Text message</Field.Label>
          <Field.HelpText>You can change this.</Field.HelpText>
        </Field.Root>
      </>,
    )
    await expect
      .element(page.getByRole('switch', { name: 'Text message' }))
      .toHaveAccessibleDescription('You can change this. More information.')
  })

  test('the accessible name and description follow the locale', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Field.Root invalid>
          <Switch />
          <Field.Label>Newsletter</Field.Label>
          <Field.ErrorMessage>The setting was not saved</Field.ErrorMessage>
        </Field.Root>
      </KvirnProvider>,
    )
    // kv-lang-ok: the sv catalog strings for the optional marker and the error prefix
    const control = page.getByRole('switch', { name: 'Newsletter (valfritt)' })
    await expect.element(control).toHaveAccessibleDescription('Fel: The setting was not saved')
  })

  test('the name is the same in English and does not change with the state', async () => {
    await render(
      <Field.Root>
        <Switch />
        <Field.Label marker="none">Text message reminders</Field.Label>
      </Field.Root>,
    )
    const control = page.getByRole('switch', { name: 'Text message reminders' })
    await userEvent.click(control)
    await expect.element(control).toBeChecked()
    await expect
      .element(page.getByRole('switch', { name: 'Text message reminders', exact: true }))
      .toBeVisible()
  })

  test('a required Field gives no aria-required or data-required, and warns once', async () => {
    await render(
      <Field.Root required>
        <Switch />
        <Field.Label marker="none">Text message</Field.Label>
      </Field.Root>,
    )
    const control = page.getByRole('switch', { name: 'Text message' })
    await expect.element(control).not.toHaveAttribute('aria-required')
    await expect.element(control).not.toHaveAttribute('data-required')
    expect((control.element() as HTMLInputElement).required).toBe(false)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Checkbox')
  })
})

describe('checked', () => {
  test('uncontrolled: defaultChecked is kept, and onCheckedChange reports the next value with the reason', async () => {
    const onCheckedChange = vi.fn<(checked: boolean, details: SwitchChangeDetails) => void>()
    const onChange = vi.fn<(event: React.ChangeEvent<HTMLInputElement>) => void>()
    await render(
      <Switch
        aria-label="Text message"
        defaultChecked
        onCheckedChange={onCheckedChange}
        onChange={onChange}
      />,
    )
    const control = page.getByRole('switch', { name: 'Text message' })
    await expect.element(control).toBeChecked()
    await userEvent.click(control)
    await expect.element(control).not.toBeChecked()
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange.mock.calls[0]?.[0]).toBe(false)
    expect(onCheckedChange.mock.calls[0]?.[1].reason).toBe('input')
    expect(onCheckedChange.mock.calls[0]?.[1].event.type).toBe('change')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  test('a controlled switch shows the checked it is given', async () => {
    function Controlled() {
      const [checked, setChecked] = useState(false)
      return (
        <>
          <Switch aria-label="Text message" checked={checked} onCheckedChange={setChecked} />
          <output>{checked ? 'on' : 'off'}</output>
        </>
      )
    }
    await render(<Controlled />)
    const control = page.getByRole('switch', { name: 'Text message' })
    await expect.element(control).not.toBeChecked()
    await userEvent.click(control)
    await expect.element(control).toBeChecked()
    await expect.element(control).toHaveAttribute('data-state', 'checked')
    await expect.element(page.getByRole('status')).toHaveTextContent('on')
  })

  test('a controlled switch stays as it is when the parent does not update checked', async () => {
    const onCheckedChange = vi.fn<(checked: boolean, details: SwitchChangeDetails) => void>()
    await render(
      <Switch aria-label="Text message" checked={false} onCheckedChange={onCheckedChange} />,
    )
    const control = page.getByRole('switch', { name: 'Text message' })
    await userEvent.click(control)
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'input' }))
    await expect.element(control).not.toBeChecked()
    await expect.element(control).toHaveAttribute('data-state', 'unchecked')
  })

  test('works in a plain form: on sends name=value, off sends nothing, and reset restores defaultChecked', async () => {
    let submitted: FormData | undefined
    await render(
      <form
        aria-label="Settings"
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <Field.Root>
          <Switch name="sms" />
          <Field.Label marker="none">Text message</Field.Label>
        </Field.Root>
        <Field.Root>
          <Switch name="email" value="yes" defaultChecked />
          <Field.Label marker="none">E-post</Field.Label>
        </Field.Root>
        <button type="submit">Save</button>
        <button type="reset">Reset</button>
      </form>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Save' }))
    expect(submitted?.has('sms')).toBe(false)
    expect(submitted?.get('email')).toBe('yes')
    await userEvent.click(page.getByRole('switch', { name: 'Text message' }))
    await userEvent.click(page.getByRole('switch', { name: 'E-post' }))
    await userEvent.click(page.getByRole('button', { name: 'Save' }))
    expect(submitted?.get('sms')).toBe('on')
    expect(submitted?.has('email')).toBe(false)
    await userEvent.click(page.getByRole('button', { name: 'Reset' }))
    await expect.element(page.getByRole('switch', { name: 'Text message' })).not.toBeChecked()
    await expect.element(page.getByRole('switch', { name: 'E-post' })).toBeChecked()
  })

  test('a form library’s spread props and ref reach the native input', async () => {
    const registered: { element: HTMLInputElement | null; changes: boolean[] } = {
      element: null,
      changes: [],
    }
    const register = (name: string) => ({
      name,
      ref: (element: HTMLInputElement | null) => {
        registered.element = element
      },
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        registered.changes.push(event.currentTarget.checked)
      },
    })
    await render(
      <Field.Root>
        <Switch {...register('sms')} />
        <Field.Label marker="none">Text message</Field.Label>
      </Field.Root>,
    )
    const control = page.getByRole('switch', { name: 'Text message' })
    expect(registered.element).toBe(control.element())
    await userEvent.click(control)
    await userEvent.click(control)
    expect(registered.changes).toEqual([true, false])
  })
})

describe('data-state', () => {
  test('data-state follows the native state', async () => {
    await render(<Switch aria-label="Text message" />)
    const control = page.getByRole('switch', { name: 'Text message' })
    await expect.element(control).toHaveAttribute('data-state', 'unchecked')
    await userEvent.click(control)
    await expect.element(control).toHaveAttribute('data-state', 'checked')
    await userEvent.click(control)
    await expect.element(control).toHaveAttribute('data-state', 'unchecked')
  })

  test('defaultChecked starts as checked', async () => {
    await render(<Switch aria-label="Text message" defaultChecked />)
    await expect
      .element(page.getByRole('switch', { name: 'Text message' }))
      .toHaveAttribute('data-state', 'checked')
  })
})

describe('dev warnings', () => {
  test('a switch in a Field with no label warns once', async () => {
    await render(
      <Field.Root>
        <Switch />
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Field.Label')
  })

  test('a switch with no name at all warns once', async () => {
    await render(<Switch />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('accessible name')
  })

  test('an id inside a Field is ignored with a dev warning: the label stays associated', async () => {
    await render(
      <Field.Root controlId="the-field">
        <Switch id="other" />
        <Field.Label marker="none">Text message</Field.Label>
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('switch', { name: 'Text message' }))
      .toHaveAttribute('id', 'the-field')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('controlId')
  })

  test('switch-required: a required Field warns once, however many switches', async () => {
    await render(
      <Field.Root required>
        <Switch />
        <Field.Label marker="none">Text message</Field.Label>
        <Switch aria-label="Extra" />
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('required')
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Checkbox')
  })

  test('switch-optional-marker: a Field with the optional marker warns once, and marker="none" does not', async () => {
    await render(
      <Field.Root>
        <Switch />
        <Field.Label marker="none">Text message</Field.Label>
      </Field.Root>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
    await render(
      <Field.Root>
        <Switch />
        <Field.Label>Newsletter</Field.Label>
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('marker="none"')
  })
})

describe('useSwitch', () => {
  test('spreads the same props on your own input', async () => {
    function Own() {
      const control = useSwitch({ defaultChecked: true, name: 'sms' })
      return <input aria-label="Own" {...control.inputProps} />
    }
    await render(<Own />)
    const input = page.getByRole('switch', { name: 'Own' })
    await expect.element(input).toBeChecked()
    await expect.element(input).toHaveAttribute('data-state', 'checked')
    await expect.element(input).toHaveAttribute('name', 'sms')
    await expect.element(input).toHaveClass('kv-switch')
  })
})

describe('server rendering', () => {
  test('server markup is complete: the role, the id, the state', () => {
    const markup = renderToString(
      <Field.Root controlId="field">
        <Switch defaultChecked />
        <Field.Label marker="none">Text message</Field.Label>
        <Field.HelpText>Direkt.</Field.HelpText>
      </Field.Root>,
    )
    expect(markup).toContain('type="checkbox"')
    expect(markup).toContain('role="switch"')
    expect(markup).toContain('id="field"')
    expect(markup).toContain('data-state="checked"')
    expect(markup).toContain('checked=""')
    expect(markup).not.toContain('aria-checked')
  })
})

describe('keyboard', () => {
  function Form() {
    return (
      <form>
        <button type="button">Before</button>
        <Switch aria-label="Text message" />
        <Switch aria-label="E-post" />
        <Switch aria-label="Case" disabled />
        <Switch aria-label="Post" />
        <button type="button">Send</button>
      </form>
    )
  }

  function recordPreventedKeys() {
    const keys: string[] = []
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) keys.push(event.key)
    }
    document.addEventListener('keydown', listener)
    return { keys, stop: () => document.removeEventListener('keydown', listener) }
  }

  test('Tab moves to each switch, one stop each', async () => {
    await render(<Form />)
    page.getByRole('button', { name: 'Before' }).element().focus()
    await userEvent.tab()
    await expect.element(page.getByRole('switch', { name: 'Text message' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('switch', { name: 'E-post' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('switch', { name: 'Post' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Send' })).toHaveFocus()
  })

  test('Shift+Tab moves to the previous switch', async () => {
    await render(<Form />)
    page.getByRole('switch', { name: 'Post' }).element().focus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('switch', { name: 'E-post' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('switch', { name: 'Text message' })).toHaveFocus()
  })

  test('Tab skips a disabled switch', async () => {
    await render(<Form />)
    const disabled = page.getByRole('switch', { name: 'Case' })
    await expect.element(disabled).toBeDisabled()
    page.getByRole('switch', { name: 'E-post' }).element().focus()
    await userEvent.tab()
    await expect.element(disabled).not.toHaveFocus()
    await expect.element(page.getByRole('switch', { name: 'Post' })).toHaveFocus()
  })

  test('Space toggles the switch and reports the new state', async () => {
    const onCheckedChange = vi.fn<(checked: boolean, details: SwitchChangeDetails) => void>()
    await render(<Switch aria-label="Text message" onCheckedChange={onCheckedChange} />)
    const control = page.getByRole('switch', { name: 'Text message' })
    control.element().focus()
    const prevented = recordPreventedKeys()
    await userEvent.keyboard(' ')
    await expect.element(control).toBeChecked()
    await expect.element(control).toHaveAttribute('data-state', 'checked')
    expect(onCheckedChange.mock.calls.at(-1)?.[0]).toBe(true)
    await userEvent.keyboard(' ')
    await expect.element(control).not.toBeChecked()
    await expect.element(control).toHaveAttribute('data-state', 'unchecked')
    expect(onCheckedChange.mock.calls.at(-1)?.[0]).toBe(false)
    await expect.element(control).toHaveFocus()
    prevented.stop()
    expect(prevented.keys).toEqual([])
  })

  test('Enter does not toggle the switch and is not intercepted', async () => {
    await render(<Form />)
    const control = page.getByRole('switch', { name: 'Text message' })
    control.element().focus()
    const prevented = recordPreventedKeys()
    await userEvent.keyboard('{Enter}')
    await expect.element(control).not.toBeChecked()
    await expect.element(control).toHaveFocus()
    prevented.stop()
    expect(prevented.keys).toEqual([])
  })

  test('clicking the label text toggles the switch and focuses it', async () => {
    await render(
      <Field.Root>
        <Switch />
        <Field.Label marker="none">Reminders by text message</Field.Label>
      </Field.Root>,
    )
    const control = page.getByRole('switch', { name: /Reminders by text message/ })
    await userEvent.click(page.getByText('Reminders by text message'))
    await expect.element(control).toBeChecked()
    await expect.element(control).toHaveFocus()
  })

  test('the same keys work in a right-to-left page', async () => {
    await render(
      <div dir="rtl">
        <button type="button">Before</button>
        <Switch aria-label="Text message" />
      </div>,
    )
    page.getByRole('button', { name: 'Before' }).element().focus()
    await userEvent.tab()
    const control = page.getByRole('switch', { name: 'Text message' })
    await expect.element(control).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect.element(control).toBeChecked()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(control).toBeChecked()
  })
})

describe('types', () => {
  test('exports the prop, state and hook types', () => {
    expectTypeOf<SwitchProps['onCheckedChange']>().toEqualTypeOf<
      ((checked: boolean, details: SwitchChangeDetails) => void) | undefined
    >()
    expectTypeOf<SwitchProps>().not.toHaveProperty('required')
    expectTypeOf<SwitchProps>().not.toHaveProperty('indeterminate')
    expectTypeOf<SwitchProps>().not.toHaveProperty('type')
    expectTypeOf<SwitchProps>().not.toHaveProperty('messages')
    expectTypeOf<UseSwitchOptions['checked']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<SwitchPartProps['className']>().toEqualTypeOf<'kv-switch'>()
    expectTypeOf<SwitchPartProps['role']>().toEqualTypeOf<'switch'>()
    expectTypeOf<SwitchDataState>().toEqualTypeOf<'checked' | 'unchecked'>()
    expectTypeOf<UseSwitchResult['inputProps']>().toEqualTypeOf<SwitchPartProps>()
  })
})
