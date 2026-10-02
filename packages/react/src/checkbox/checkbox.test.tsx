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
import { Checkbox } from './checkbox.tsx'
import type { CheckboxProps, CheckboxState } from './checkbox.tsx'
import { useCheckbox } from './use-checkbox.ts'
import type {
  CheckboxChangeDetails,
  CheckboxPartProps,
  UseCheckboxOptions,
  UseCheckboxResult,
} from './use-checkbox.ts'

// Contract: checkbox.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/checkbox/checkbox.e2e.ts.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const declaration = (
  <Field.Root required>
    <Checkbox name="declaration" />
    <Field.Label>Jag intygar att uppgifterna är korrekta</Field.Label>
  </Field.Root>
)

describe('rendering', () => {
  test('renders a native <input type="checkbox"> with its class, outside a Field', async () => {
    const { container } = await render(<Checkbox aria-label="Godkänn" />)
    const checkbox = page.getByRole('checkbox', { name: 'Godkänn' })
    const element = checkbox.element()
    expect(element.tagName).toBe('INPUT')
    expect(element.className).toBe('kv-checkbox')
    await expect.element(checkbox).toHaveAttribute('type', 'checkbox')
    await expect.element(checkbox).toHaveAttribute('data-state', 'unchecked')
    await expect.element(checkbox).not.toHaveAttribute('id')
    await expect.element(checkbox).not.toHaveAttribute('aria-describedby')
    await expect.element(checkbox).not.toHaveAttribute('aria-invalid')
    await expect.element(checkbox).not.toHaveAttribute('aria-required')
    await expect.element(checkbox).not.toHaveAttribute('aria-checked')
    await expect.element(checkbox).not.toHaveAttribute('role')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('forwards its ref, className and native props', async () => {
    const ref = createRef<HTMLInputElement>()
    await render(
      <Checkbox
        ref={ref}
        aria-label="Godkänn"
        className="egen"
        name="terms"
        value="yes"
        form="ansokan"
        data-egen=""
      />,
    )
    const checkbox = page.getByRole('checkbox', { name: 'Godkänn' })
    expect(ref.current).toBe(checkbox.element())
    await expect.element(checkbox).toHaveClass('egen', 'kv-checkbox')
    await expect.element(checkbox).toHaveAttribute('name', 'terms')
    await expect.element(checkbox).toHaveAttribute('value', 'yes')
    await expect.element(checkbox).toHaveAttribute('form', 'ansokan')
    await expect.element(checkbox).toHaveAttribute('data-egen', '')
  })

  test('render as a function gets the part’s props and the state', async () => {
    const seenStates: CheckboxState[] = []
    await render(
      <Field.Root invalid required>
        <Checkbox
          indeterminate
          render={(partProps, state) => {
            seenStates.push(state)
            return <input {...partProps} data-egen="" />
          }}
        />
        <Field.Label>Intyg</Field.Label>
        <Field.ErrorMessage>Bekräfta intyget</Field.ErrorMessage>
      </Field.Root>,
    )
    await expect.element(page.getByRole('checkbox')).toHaveAttribute('data-egen', '')
    expect(seenStates.at(-1)).toEqual({
      isInvalid: true,
      isRequired: true,
      isDisabled: false,
      isFocusVisible: false,
      isIndeterminate: true,
    })
  })

  test('render as an element chains its own onChange', async () => {
    const onChange = vi.fn<(event: React.ChangeEvent<HTMLInputElement>) => void>()
    const onCheckedChange = vi.fn<(checked: boolean, details: CheckboxChangeDetails) => void>()
    await render(
      <Checkbox
        aria-label="Godkänn"
        onCheckedChange={onCheckedChange}
        render={<input data-egen="" onChange={onChange} />}
      />,
    )
    await userEvent.click(page.getByRole('checkbox', { name: 'Godkänn' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
  })
})

describe('in a Field', () => {
  test('the Field’s label is the name, and the description is the option’s hint', async () => {
    const { container } = await render(
      <Field.Root required>
        <Checkbox name="contact" />
        <Field.Label>E-post</Field.Label>
        <Field.Description>Vi mejlar beslutet.</Field.Description>
      </Field.Root>,
    )
    const checkbox = page.getByRole('checkbox', { name: 'E-post' })
    const id = checkbox.element().id
    expect(id).not.toBe('')
    expect(container.querySelector('label')?.getAttribute('for')).toBe(id)
    await expect.element(checkbox).toHaveAccessibleDescription('Vi mejlar beslutet.')
    await expect.element(checkbox).toHaveAttribute('aria-required', 'true')
    expect((checkbox.element() as HTMLInputElement).required).toBe(false)
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('a standalone, non-required Field marks the label optional, and marker="none" removes it', async () => {
    await render(
      <>
        <Field.Root>
          <Checkbox />
          <Field.Label>Nyhetsbrev</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox />
          <Field.Label marker="none">Villkor</Field.Label>
        </Field.Root>
      </>,
    )
    await expect
      .element(page.getByRole('checkbox', { name: 'Nyhetsbrev (optional)' }))
      .toBeVisible()
    await expect.element(page.getByRole('checkbox', { name: 'Villkor', exact: true })).toBeVisible()
  })

  test('an invalid Field gives the standalone checkbox aria-invalid and the error in its description', async () => {
    const { container } = await render(
      <Field.Root invalid required>
        <Checkbox />
        <Field.Label>Jag intygar att uppgifterna är korrekta</Field.Label>
        <Field.Description>Du kan inte skicka utan intyget.</Field.Description>
        <Field.ErrorMessage>Bekräfta att uppgifterna är korrekta</Field.ErrorMessage>
      </Field.Root>,
    )
    const checkbox = page.getByRole('checkbox', { name: 'Jag intygar att uppgifterna är korrekta' })
    await expect.element(checkbox).toHaveAttribute('aria-invalid', 'true')
    await expect.element(checkbox).toHaveAttribute('data-invalid', '')
    await expect
      .element(checkbox)
      .toHaveAccessibleDescription(
        'Du kan inte skicka utan intyget. Error: Bekräfta att uppgifterna är korrekta',
      )
    await expectNoA11yViolations(container)
  })

  test('a disabled Field disables the checkbox, and the checkbox’s own disabled does too', async () => {
    await render(
      <>
        <Field.Root disabled>
          <Checkbox />
          <Field.Label marker="none">Ett</Field.Label>
        </Field.Root>
        <Field.Root>
          <Checkbox disabled />
          <Field.Label marker="none">Två</Field.Label>
        </Field.Root>
      </>,
    )
    await expect.element(page.getByRole('checkbox', { name: 'Ett' })).toBeDisabled()
    const second = page.getByRole('checkbox', { name: 'Två' })
    await expect.element(second).toBeDisabled()
    await expect.element(second).toHaveAttribute('data-disabled', '')
  })

  test('keeps your own aria-describedby ids, after the Field’s', async () => {
    await render(
      <>
        <p id="extra">Mer information.</p>
        <Field.Root required>
          <Checkbox aria-describedby="extra" />
          <Field.Label>Villkor</Field.Label>
          <Field.Description>Läs villkoren.</Field.Description>
        </Field.Root>
      </>,
    )
    await expect
      .element(page.getByRole('checkbox', { name: 'Villkor' }))
      .toHaveAccessibleDescription('Läs villkoren. Mer information.')
  })

  test('the accessible name and description follow the locale', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Field.Root invalid>
          <Checkbox />
          <Field.Label>Nyhetsbrev</Field.Label>
          <Field.ErrorMessage>Välj ett alternativ</Field.ErrorMessage>
        </Field.Root>
      </KvirnProvider>,
    )
    const checkbox = page.getByRole('checkbox', { name: 'Nyhetsbrev (valfritt)' })
    await expect.element(checkbox).toHaveAccessibleDescription('Fel: Välj ett alternativ')
  })

  test('clicking the label toggles the checkbox', async () => {
    await render(declaration)
    const checkbox = page.getByRole('checkbox')
    await userEvent.click(page.getByText('Jag intygar att uppgifterna är korrekta'))
    await expect.element(checkbox).toBeChecked()
    await userEvent.click(page.getByText('Jag intygar att uppgifterna är korrekta'))
    await expect.element(checkbox).not.toBeChecked()
  })
})

describe('checked', () => {
  test('uncontrolled: defaultChecked is kept, and onCheckedChange reports the next value with the reason', async () => {
    const onCheckedChange = vi.fn<(checked: boolean, details: CheckboxChangeDetails) => void>()
    const onChange = vi.fn<(event: React.ChangeEvent<HTMLInputElement>) => void>()
    await render(
      <Checkbox
        aria-label="Godkänn"
        defaultChecked
        onCheckedChange={onCheckedChange}
        onChange={onChange}
      />,
    )
    const checkbox = page.getByRole('checkbox', { name: 'Godkänn' })
    await expect.element(checkbox).toBeChecked()
    await userEvent.click(checkbox)
    await expect.element(checkbox).not.toBeChecked()
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange.mock.calls[0]?.[0]).toBe(false)
    expect(onCheckedChange.mock.calls[0]?.[1].reason).toBe('input')
    expect(onCheckedChange.mock.calls[0]?.[1].event.type).toBe('change')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  test('a controlled checkbox shows the checked it is given', async () => {
    function Controlled() {
      const [checked, setChecked] = useState(false)
      return (
        <>
          <Checkbox aria-label="Godkänn" checked={checked} onCheckedChange={setChecked} />
          <output>{checked ? 'ja' : 'nej'}</output>
        </>
      )
    }
    await render(<Controlled />)
    const checkbox = page.getByRole('checkbox', { name: 'Godkänn' })
    await expect.element(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)
    await expect.element(checkbox).toBeChecked()
    await expect.element(checkbox).toHaveAttribute('data-state', 'checked')
    await expect.element(page.getByRole('status')).toHaveTextContent('ja')
  })

  test('a controlled checkbox stays as it is when the parent does not update checked', async () => {
    const onCheckedChange = vi.fn<(checked: boolean, details: CheckboxChangeDetails) => void>()
    await render(
      <Checkbox aria-label="Godkänn" checked={false} onCheckedChange={onCheckedChange} />,
    )
    const checkbox = page.getByRole('checkbox', { name: 'Godkänn' })
    await userEvent.click(checkbox)
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'input' }))
    await expect.element(checkbox).not.toBeChecked()
    await expect.element(checkbox).toHaveAttribute('data-state', 'unchecked')
  })

  test('works in a plain form: the browser keeps the state and FormData has it', async () => {
    let submitted: FormData | undefined
    await render(
      <form
        aria-label="Ansökan"
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <Field.Root required>
          <Checkbox name="declaration" value="intygat" />
          <Field.Label>Jag intygar</Field.Label>
        </Field.Root>
        <button type="submit">Skicka</button>
      </form>,
    )
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.has('declaration')).toBe(false)
    await userEvent.click(page.getByRole('checkbox', { name: 'Jag intygar' }))
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('declaration')).toBe('intygat')
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
      <Field.Root required>
        <Checkbox {...register('declaration')} />
        <Field.Label>Jag intygar</Field.Label>
      </Field.Root>,
    )
    const checkbox = page.getByRole('checkbox', { name: 'Jag intygar' })
    expect(registered.element).toBe(checkbox.element())
    await userEvent.click(checkbox)
    await userEvent.click(checkbox)
    expect(registered.changes).toEqual([true, false])
  })
})

describe('indeterminate', () => {
  test('indeterminate is the DOM property and data-state', async () => {
    const { container } = await render(
      <Field.Root required>
        <Checkbox indeterminate />
        <Field.Label>Välj alla rader</Field.Label>
      </Field.Root>,
    )
    const checkbox = page.getByRole('checkbox', { name: 'Välj alla rader' })
    expect((checkbox.element() as HTMLInputElement).indeterminate).toBe(true)
    await expect.element(checkbox).toBePartiallyChecked()
    await expect.element(checkbox).toHaveAttribute('data-state', 'indeterminate')
    await expect.element(checkbox).not.toHaveAttribute('aria-checked')
    await expectNoA11yViolations(container)
  })

  test('the property follows the prop when it changes', async () => {
    function Toggle() {
      const [indeterminate, setIndeterminate] = useState(true)
      return (
        <>
          <Checkbox aria-label="Alla" indeterminate={indeterminate} />
          <button type="button" onClick={() => setIndeterminate(false)}>
            Rensa
          </button>
        </>
      )
    }
    await render(<Toggle />)
    const checkbox = page.getByRole('checkbox', { name: 'Alla' })
    await expect.element(checkbox).toBePartiallyChecked()
    await userEvent.click(page.getByRole('button', { name: 'Rensa' }))
    expect((checkbox.element() as HTMLInputElement).indeterminate).toBe(false)
    await expect.element(checkbox).not.toBePartiallyChecked()
    await expect.element(checkbox).toHaveAttribute('data-state', 'unchecked')
  })

  test('a click on an indeterminate checkbox checks it, and the callback clears indeterminate', async () => {
    function SelectAll() {
      const [indeterminate, setIndeterminate] = useState(true)
      const [checked, setChecked] = useState(false)
      return (
        <Checkbox
          aria-label="Alla"
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={(next) => {
            setChecked(next)
            setIndeterminate(false)
          }}
        />
      )
    }
    await render(<SelectAll />)
    const checkbox = page.getByRole('checkbox', { name: 'Alla' })
    await userEvent.click(checkbox)
    await expect.element(checkbox).toBeChecked()
    await expect.element(checkbox).toHaveAttribute('data-state', 'checked')
    expect((checkbox.element() as HTMLInputElement).indeterminate).toBe(false)
  })

  test('the prop wins over the browser: without a new prop the box stays indeterminate after a click', async () => {
    const onCheckedChange = vi.fn<(checked: boolean, details: CheckboxChangeDetails) => void>()
    await render(
      <Checkbox
        aria-label="Alla"
        indeterminate
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    )
    const checkbox = page.getByRole('checkbox', { name: 'Alla' })
    await userEvent.click(checkbox)
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'input' }))
    expect((checkbox.element() as HTMLInputElement).indeterminate).toBe(true)
    await expect.element(checkbox).toHaveAttribute('data-state', 'indeterminate')
  })

  test('server markup is complete except for the DOM property: unchecked, with the id and description', () => {
    const markup = renderToString(
      <Field.Root controlId="fält">
        <Checkbox indeterminate />
        <Field.Label>Alla</Field.Label>
      </Field.Root>,
    )
    expect(markup).toContain('type="checkbox"')
    expect(markup).toContain('id="fält"')
    expect(markup).toContain('data-state="indeterminate"')
    expect(markup).not.toContain('checked=""')
  })
})

describe('data-state', () => {
  test('data-state follows the native state', async () => {
    await render(<Checkbox aria-label="Godkänn" />)
    const checkbox = page.getByRole('checkbox', { name: 'Godkänn' })
    await expect.element(checkbox).toHaveAttribute('data-state', 'unchecked')
    await userEvent.click(checkbox)
    await expect.element(checkbox).toHaveAttribute('data-state', 'checked')
    await userEvent.click(checkbox)
    await expect.element(checkbox).toHaveAttribute('data-state', 'unchecked')
  })

  test('defaultChecked starts as checked', async () => {
    await render(<Checkbox aria-label="Godkänn" defaultChecked />)
    await expect
      .element(page.getByRole('checkbox', { name: 'Godkänn' }))
      .toHaveAttribute('data-state', 'checked')
  })
})

describe('keyboard', () => {
  test('Space toggles the checkbox and Tab moves on', async () => {
    const onCheckedChange = vi.fn<(checked: boolean, details: CheckboxChangeDetails) => void>()
    await render(
      <>
        <Checkbox aria-label="Ett" onCheckedChange={onCheckedChange} />
        <Checkbox aria-label="Två" />
      </>,
    )
    await userEvent.keyboard('{Tab}')
    const first = page.getByRole('checkbox', { name: 'Ett' })
    await expect.element(first).toHaveFocus()
    await expect.element(first).toHaveAttribute('data-focus-visible', '')
    await userEvent.keyboard(' ')
    await expect.element(first).toBeChecked()
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'input' }))
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('checkbox', { name: 'Två' })).toHaveFocus()
    await expect.element(first).not.toHaveAttribute('data-focus-visible')
  })

  test('Enter does not toggle the checkbox', async () => {
    await render(<Checkbox aria-label="Ett" />)
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Enter}')
    await expect.element(page.getByRole('checkbox', { name: 'Ett' })).not.toBeChecked()
  })
})

describe('dev warnings', () => {
  test('a checkbox in a Field with no label warns once', async () => {
    await render(
      <Field.Root>
        <Checkbox />
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Field.Label')
  })

  test('a checkbox with no name at all warns once', async () => {
    await render(<Checkbox />)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('accessible name')
  })

  test('an id inside a Field is ignored with a dev warning: the label stays associated', async () => {
    await render(
      <Field.Root controlId="fältet">
        <Checkbox id="annat" />
        <Field.Label marker="none">Villkor</Field.Label>
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('checkbox', { name: 'Villkor' }))
      .toHaveAttribute('id', 'fältet')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('controlId')
  })
})

describe('useCheckbox', () => {
  test('spreads the same props on your own input, with a ref that sets indeterminate', async () => {
    function Own() {
      const checkbox = useCheckbox({ indeterminate: true })
      return <input aria-label="Egen" {...checkbox.inputProps} />
    }
    await render(<Own />)
    const input = page.getByRole('checkbox', { name: 'Egen' })
    expect((input.element() as HTMLInputElement).indeterminate).toBe(true)
    await expect.element(input).toHaveClass('kv-checkbox')
  })
})

describe('types', () => {
  test('exports the prop, state and hook types', () => {
    expectTypeOf<CheckboxProps['onCheckedChange']>().toEqualTypeOf<
      ((checked: boolean, details: CheckboxChangeDetails) => void) | undefined
    >()
    expectTypeOf<CheckboxProps['indeterminate']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<UseCheckboxOptions['checked']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<CheckboxPartProps['className']>().toEqualTypeOf<'kv-checkbox'>()
    expectTypeOf<UseCheckboxResult['inputProps']>().toEqualTypeOf<CheckboxPartProps>()
  })
})
