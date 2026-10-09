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
    const { container } = await render(<Switch aria-label="Sms" />)
    const control = page.getByRole('switch', { name: 'Sms' })
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
        aria-label="Sms"
        className="egen"
        name="sms"
        value="ja"
        form="inställningar"
        data-egen=""
      />,
    )
    const control = page.getByRole('switch', { name: 'Sms' })
    expect(ref.current).toBe(control.element())
    await expect.element(control).toHaveClass('egen', 'kv-switch')
    await expect.element(control).toHaveAttribute('name', 'sms')
    await expect.element(control).toHaveAttribute('value', 'ja')
    await expect.element(control).toHaveAttribute('form', 'inställningar')
    await expect.element(control).toHaveAttribute('data-egen', '')
  })
})

describe('in a Field', () => {
  test('the Field’s label is the name, and the description is the help text', async () => {
    const { container } = await render(
      <Field.Root>
        <Switch name="sms" />
        <Field.Label marker="none">Få meddelanden som sms</Field.Label>
        <Field.HelpText>Du kan ändra detta när som helst.</Field.HelpText>
      </Field.Root>,
    )
    const control = page.getByRole('switch', { name: 'Få meddelanden som sms' })
    const id = control.element().id
    expect(id).not.toBe('')
    expect(container.querySelector('label')?.getAttribute('for')).toBe(id)
    await expect.element(control).toHaveAccessibleDescription('Du kan ändra detta när som helst.')
    await expect.element(control).not.toHaveAttribute('aria-required')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a standalone Field marks the label optional, and marker="none" removes it', async () => {
    await render(
      <>
        <Field.Root>
          <Switch />
          <Field.Label>Nyhetsbrev</Field.Label>
        </Field.Root>
        <Field.Root>
          <Switch />
          <Field.Label marker="none">Sms</Field.Label>
        </Field.Root>
      </>,
    )
    await expect.element(page.getByRole('switch', { name: 'Nyhetsbrev (optional)' })).toBeVisible()
    await expect.element(page.getByRole('switch', { name: 'Sms', exact: true })).toBeVisible()
  })

  test('an invalid Field gives aria-invalid and the error in the description', async () => {
    const { container } = await render(
      <Field.Root invalid>
        <Switch />
        <Field.Label marker="none">Påminnelser via sms</Field.Label>
        <Field.HelpText>Vi skickar ett sms dagen före.</Field.HelpText>
        <Field.ErrorMessage>Inställningen sparades inte</Field.ErrorMessage>
      </Field.Root>,
    )
    const control = page.getByRole('switch', { name: 'Påminnelser via sms' })
    await expect.element(control).toHaveAttribute('aria-invalid', 'true')
    await expect.element(control).toHaveAttribute('data-invalid', '')
    await expect
      .element(control)
      .toHaveAccessibleDescription(
        'Vi skickar ett sms dagen före. Error: Inställningen sparades inte',
      )
    await expectNoA11yViolations(container)
  })

  test('a disabled Field disables the switch, and the switch’s own disabled does too', async () => {
    await render(
      <>
        <Field.Root disabled>
          <Switch />
          <Field.Label marker="none">Ett</Field.Label>
        </Field.Root>
        <Field.Root>
          <Switch disabled />
          <Field.Label marker="none">Två</Field.Label>
        </Field.Root>
      </>,
    )
    await expect.element(page.getByRole('switch', { name: 'Ett' })).toBeDisabled()
    const second = page.getByRole('switch', { name: 'Två' })
    await expect.element(second).toBeDisabled()
    await expect.element(second).toHaveAttribute('data-disabled', '')
  })

  test('keeps your own aria-describedby ids, after the Field’s', async () => {
    await render(
      <>
        <p id="extra">Mer information.</p>
        <Field.Root>
          <Switch aria-describedby="extra" />
          <Field.Label marker="none">Sms</Field.Label>
          <Field.HelpText>Du kan ändra detta.</Field.HelpText>
        </Field.Root>
      </>,
    )
    await expect
      .element(page.getByRole('switch', { name: 'Sms' }))
      .toHaveAccessibleDescription('Du kan ändra detta. Mer information.')
  })

  test('the accessible name and description follow the locale', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Field.Root invalid>
          <Switch />
          <Field.Label>Nyhetsbrev</Field.Label>
          <Field.ErrorMessage>Inställningen sparades inte</Field.ErrorMessage>
        </Field.Root>
      </KvirnProvider>,
    )
    const control = page.getByRole('switch', { name: 'Nyhetsbrev (valfritt)' })
    await expect.element(control).toHaveAccessibleDescription('Fel: Inställningen sparades inte')
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
        <Field.Label marker="none">Sms</Field.Label>
      </Field.Root>,
    )
    const control = page.getByRole('switch', { name: 'Sms' })
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
        aria-label="Sms"
        defaultChecked
        onCheckedChange={onCheckedChange}
        onChange={onChange}
      />,
    )
    const control = page.getByRole('switch', { name: 'Sms' })
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
          <Switch aria-label="Sms" checked={checked} onCheckedChange={setChecked} />
          <output>{checked ? 'på' : 'av'}</output>
        </>
      )
    }
    await render(<Controlled />)
    const control = page.getByRole('switch', { name: 'Sms' })
    await expect.element(control).not.toBeChecked()
    await userEvent.click(control)
    await expect.element(control).toBeChecked()
    await expect.element(control).toHaveAttribute('data-state', 'checked')
    await expect.element(page.getByRole('status')).toHaveTextContent('på')
  })

  test('a controlled switch stays as it is when the parent does not update checked', async () => {
    const onCheckedChange = vi.fn<(checked: boolean, details: SwitchChangeDetails) => void>()
    await render(<Switch aria-label="Sms" checked={false} onCheckedChange={onCheckedChange} />)
    const control = page.getByRole('switch', { name: 'Sms' })
    await userEvent.click(control)
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'input' }))
    await expect.element(control).not.toBeChecked()
    await expect.element(control).toHaveAttribute('data-state', 'unchecked')
  })

  test('works in a plain form: on sends name=value, off sends nothing, and reset restores defaultChecked', async () => {
    let submitted: FormData | undefined
    await render(
      <form
        aria-label="Inställningar"
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <Field.Root>
          <Switch name="sms" />
          <Field.Label marker="none">Sms</Field.Label>
        </Field.Root>
        <Field.Root>
          <Switch name="epost" value="ja" defaultChecked />
          <Field.Label marker="none">E-post</Field.Label>
        </Field.Root>
        <button type="submit">Spara</button>
        <button type="reset">Återställ</button>
      </form>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Spara' }))
    expect(submitted?.has('sms')).toBe(false)
    expect(submitted?.get('epost')).toBe('ja')
    await userEvent.click(page.getByRole('switch', { name: 'Sms' }))
    await userEvent.click(page.getByRole('switch', { name: 'E-post' }))
    await userEvent.click(page.getByRole('button', { name: 'Spara' }))
    expect(submitted?.get('sms')).toBe('on')
    expect(submitted?.has('epost')).toBe(false)
    await userEvent.click(page.getByRole('button', { name: 'Återställ' }))
    await expect.element(page.getByRole('switch', { name: 'Sms' })).not.toBeChecked()
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
        <Field.Label marker="none">Sms</Field.Label>
      </Field.Root>,
    )
    const control = page.getByRole('switch', { name: 'Sms' })
    expect(registered.element).toBe(control.element())
    await userEvent.click(control)
    await userEvent.click(control)
    expect(registered.changes).toEqual([true, false])
  })
})

describe('data-state', () => {
  test('data-state follows the native state', async () => {
    await render(<Switch aria-label="Sms" />)
    const control = page.getByRole('switch', { name: 'Sms' })
    await expect.element(control).toHaveAttribute('data-state', 'unchecked')
    await userEvent.click(control)
    await expect.element(control).toHaveAttribute('data-state', 'checked')
    await userEvent.click(control)
    await expect.element(control).toHaveAttribute('data-state', 'unchecked')
  })

  test('defaultChecked starts as checked', async () => {
    await render(<Switch aria-label="Sms" defaultChecked />)
    await expect
      .element(page.getByRole('switch', { name: 'Sms' }))
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
      <Field.Root controlId="fältet">
        <Switch id="annat" />
        <Field.Label marker="none">Sms</Field.Label>
      </Field.Root>,
    )
    await expect.element(page.getByRole('switch', { name: 'Sms' })).toHaveAttribute('id', 'fältet')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('controlId')
  })

  test('switch-required: a required Field warns once, however many switches', async () => {
    await render(
      <Field.Root required>
        <Switch />
        <Field.Label marker="none">Sms</Field.Label>
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
        <Field.Label marker="none">Sms</Field.Label>
      </Field.Root>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
    await render(
      <Field.Root>
        <Switch />
        <Field.Label>Nyhetsbrev</Field.Label>
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
      return <input aria-label="Egen" {...control.inputProps} />
    }
    await render(<Own />)
    const input = page.getByRole('switch', { name: 'Egen' })
    await expect.element(input).toBeChecked()
    await expect.element(input).toHaveAttribute('data-state', 'checked')
    await expect.element(input).toHaveAttribute('name', 'sms')
    await expect.element(input).toHaveClass('kv-switch')
  })
})

describe('server rendering', () => {
  test('server markup is complete: the role, the id, the state', () => {
    const markup = renderToString(
      <Field.Root controlId="fält">
        <Switch defaultChecked />
        <Field.Label marker="none">Sms</Field.Label>
        <Field.HelpText>Direkt.</Field.HelpText>
      </Field.Root>,
    )
    expect(markup).toContain('type="checkbox"')
    expect(markup).toContain('role="switch"')
    expect(markup).toContain('id="fält"')
    expect(markup).toContain('data-state="checked"')
    expect(markup).toContain('checked=""')
    expect(markup).not.toContain('aria-checked')
  })
})

describe('keyboard', () => {
  function Form() {
    return (
      <form>
        <button type="button">Före</button>
        <Switch aria-label="Sms" />
        <Switch aria-label="E-post" />
        <Switch aria-label="Ärende" disabled />
        <Switch aria-label="Post" />
        <button type="button">Skicka</button>
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
    page.getByRole('button', { name: 'Före' }).element().focus()
    await userEvent.tab()
    await expect.element(page.getByRole('switch', { name: 'Sms' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('switch', { name: 'E-post' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('switch', { name: 'Post' })).toHaveFocus()
    await userEvent.tab()
    await expect.element(page.getByRole('button', { name: 'Skicka' })).toHaveFocus()
  })

  test('Shift+Tab moves to the previous switch', async () => {
    await render(<Form />)
    page.getByRole('switch', { name: 'Post' }).element().focus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('switch', { name: 'E-post' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(page.getByRole('switch', { name: 'Sms' })).toHaveFocus()
  })

  test('Tab skips a disabled switch', async () => {
    await render(<Form />)
    const disabled = page.getByRole('switch', { name: 'Ärende' })
    await expect.element(disabled).toBeDisabled()
    page.getByRole('switch', { name: 'E-post' }).element().focus()
    await userEvent.tab()
    await expect.element(disabled).not.toHaveFocus()
    await expect.element(page.getByRole('switch', { name: 'Post' })).toHaveFocus()
  })

  test('Space toggles the switch and reports the new state', async () => {
    const onCheckedChange = vi.fn<(checked: boolean, details: SwitchChangeDetails) => void>()
    await render(<Switch aria-label="Sms" onCheckedChange={onCheckedChange} />)
    const control = page.getByRole('switch', { name: 'Sms' })
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
    const control = page.getByRole('switch', { name: 'Sms' })
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
        <Field.Label marker="none">Påminnelser via sms</Field.Label>
      </Field.Root>,
    )
    const control = page.getByRole('switch', { name: /Påminnelser via sms/ })
    await userEvent.click(page.getByText('Påminnelser via sms'))
    await expect.element(control).toBeChecked()
    await expect.element(control).toHaveFocus()
  })

  test('the same keys work in a right-to-left page', async () => {
    await render(
      <div dir="rtl">
        <button type="button">Före</button>
        <Switch aria-label="Sms" />
      </div>,
    )
    page.getByRole('button', { name: 'Före' }).element().focus()
    await userEvent.tab()
    const control = page.getByRole('switch', { name: 'Sms' })
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
