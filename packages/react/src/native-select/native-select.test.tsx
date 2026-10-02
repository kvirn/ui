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
import { NativeSelect } from './native-select.tsx'
import type {
  NativeSelectChangeDetails,
  NativeSelectProps,
  NativeSelectState,
} from './native-select.tsx'
import { useNativeSelect } from './use-native-select.ts'
import type { NativeSelectPartProps, UseNativeSelectResult } from './use-native-select.ts'

// Contract: native-select.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/native-select/native-select.e2e.ts.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const municipalities = (
  <>
    <option value="">Välj kommun</option>
    <option value="gbg">Göteborg</option>
    <option value="sthlm">Stockholm</option>
    <option value="malmo">Malmö</option>
  </>
)

describe('rendering', () => {
  test('renders a native <select> with its class, outside a Field', async () => {
    const { container } = await render(
      <NativeSelect aria-label="Kommun">{municipalities}</NativeSelect>,
    )
    const select = page.getByRole('combobox', { name: 'Kommun' })
    const element = select.element()
    expect(element.tagName).toBe('SELECT')
    expect(element.className).toBe('kv-native-select')
    await expect.element(select).not.toHaveAttribute('id')
    await expect.element(select).not.toHaveAttribute('aria-describedby')
    await expect.element(select).not.toHaveAttribute('aria-invalid')
    await expect.element(select).not.toHaveAttribute('aria-required')
    await expect.element(select).not.toHaveAttribute('role')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('forwards its ref, className, native props and option groups', async () => {
    const ref = createRef<HTMLSelectElement>()
    await render(
      <NativeSelect
        ref={ref}
        aria-label="Kommun"
        className="egen"
        name="municipality"
        autoComplete="address-level2"
        data-egen=""
      >
        <optgroup label="Västra Götaland">
          <option value="gbg">Göteborg</option>
        </optgroup>
        <optgroup label="Skåne">
          <option value="malmo">Malmö</option>
        </optgroup>
      </NativeSelect>,
    )
    const select = page.getByRole('combobox', { name: 'Kommun' })
    expect(ref.current).toBe(select.element())
    await expect.element(select).toHaveClass('egen', 'kv-native-select')
    await expect.element(select).toHaveAttribute('name', 'municipality')
    await expect.element(select).toHaveAttribute('autocomplete', 'address-level2')
    await expect.element(select).toHaveAttribute('data-egen', '')
    expect(ref.current?.querySelectorAll('optgroup')).toHaveLength(2)
  })

  test('render as a function gets the part’s props and the state', async () => {
    const seenStates: NativeSelectState[] = []
    await render(
      <Field.Root invalid required>
        <Field.Label>Kommun</Field.Label>
        <Field.ErrorMessage>Välj en kommun</Field.ErrorMessage>
        <NativeSelect
          render={(partProps, state) => {
            seenStates.push(state)
            return <select {...partProps} data-egen="" />
          }}
        >
          {municipalities}
        </NativeSelect>
      </Field.Root>,
    )
    await expect.element(page.getByRole('combobox')).toHaveAttribute('data-egen', '')
    expect(seenStates.at(-1)).toEqual({
      isInvalid: true,
      isRequired: true,
      isDisabled: false,
      isFocusVisible: false,
    })
  })

  test('multiple and size warn once: use a CheckboxGroup (ADR-0037)', async () => {
    const props = { 'aria-label': 'Kommun', multiple: true } as unknown as NativeSelectProps
    await render(<NativeSelect {...props}>{municipalities}</NativeSelect>)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('CheckboxGroup')
  })
})

describe('in a Field', () => {
  test('the Field’s label is the name, and the description and error describe it', async () => {
    const { container } = await render(
      <Field.Root invalid required>
        <Field.Label>Kommun</Field.Label>
        <Field.Description>Där du är folkbokförd.</Field.Description>
        <NativeSelect name="municipality">{municipalities}</NativeSelect>
        <Field.ErrorMessage>Välj en kommun</Field.ErrorMessage>
      </Field.Root>,
    )
    const select = page.getByRole('combobox', { name: 'Kommun' })
    const id = select.element().id
    expect(id).not.toBe('')
    expect(container.querySelector('label')?.getAttribute('for')).toBe(id)
    await expect
      .element(select)
      .toHaveAccessibleDescription('Där du är folkbokförd. Error: Välj en kommun')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('invalid, required and disabled come from the Field', async () => {
    await render(
      <>
        <Field.Root invalid required>
          <Field.Label>Kommun</Field.Label>
          <Field.ErrorMessage>Välj en kommun</Field.ErrorMessage>
          <NativeSelect>{municipalities}</NativeSelect>
        </Field.Root>
        <Field.Root disabled>
          <Field.Label marker="none">Land</Field.Label>
          <NativeSelect>{municipalities}</NativeSelect>
        </Field.Root>
      </>,
    )
    const select = page.getByRole('combobox', { name: 'Kommun' })
    await expect.element(select).toHaveAttribute('aria-invalid', 'true')
    await expect.element(select).toHaveAttribute('aria-required', 'true')
    await expect.element(select).toHaveAttribute('data-invalid', '')
    await expect.element(select).toHaveAttribute('data-required', '')
    expect((select.element() as HTMLSelectElement).required).toBe(false)
    const disabled = page.getByRole('combobox', { name: 'Land' })
    await expect.element(disabled).toBeDisabled()
    await expect.element(disabled).toHaveAttribute('data-disabled', '')
  })

  test('the select’s own disabled disables it too', async () => {
    await render(
      <Field.Root>
        <Field.Label marker="none">Kommun</Field.Label>
        <NativeSelect disabled>{municipalities}</NativeSelect>
      </Field.Root>,
    )
    await expect.element(page.getByRole('combobox', { name: 'Kommun' })).toBeDisabled()
  })

  test('a non-required Field marks the label optional', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Field.Root>
          <Field.Label>Kommun</Field.Label>
          <NativeSelect>{municipalities}</NativeSelect>
        </Field.Root>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('combobox', { name: 'Kommun (valfritt)' })).toBeVisible()
  })

  test('keeps your own aria-describedby ids, after the Field’s', async () => {
    await render(
      <>
        <p id="extra">Mer information.</p>
        <Field.Root required>
          <Field.Label>Kommun</Field.Label>
          <Field.Description>Där du bor.</Field.Description>
          <NativeSelect aria-describedby="extra">{municipalities}</NativeSelect>
        </Field.Root>
      </>,
    )
    await expect
      .element(page.getByRole('combobox', { name: 'Kommun' }))
      .toHaveAccessibleDescription('Där du bor. Mer information.')
  })

  test('clicking the label focuses the select', async () => {
    await render(
      <Field.Root required>
        <Field.Label>Kommun</Field.Label>
        <NativeSelect>{municipalities}</NativeSelect>
      </Field.Root>,
    )
    await userEvent.click(page.getByText('Kommun', { exact: true }))
    await expect.element(page.getByRole('combobox')).toHaveFocus()
  })

  test('an id inside a Field is ignored with a dev warning: the label stays associated', async () => {
    await render(
      <Field.Root controlId="fältet" required>
        <Field.Label>Kommun</Field.Label>
        <NativeSelect id="annat">{municipalities}</NativeSelect>
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('combobox', { name: 'Kommun' }))
      .toHaveAttribute('id', 'fältet')
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('controlId')
  })
})

describe('value', () => {
  test('uncontrolled: defaultValue is kept, and onValueChange reports the value with the reason', async () => {
    const onValueChange = vi.fn<(value: string, details: NativeSelectChangeDetails) => void>()
    const onChange = vi.fn<(event: React.ChangeEvent<HTMLSelectElement>) => void>()
    await render(
      <NativeSelect
        aria-label="Kommun"
        defaultValue="sthlm"
        onValueChange={onValueChange}
        onChange={onChange}
      >
        {municipalities}
      </NativeSelect>,
    )
    const select = page.getByRole('combobox', { name: 'Kommun' })
    await expect.element(select).toHaveValue('sthlm')
    await userEvent.selectOptions(select, 'malmo')
    await expect.element(select).toHaveValue('malmo')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]?.[0]).toBe('malmo')
    expect(onValueChange.mock.calls[0]?.[1].reason).toBe('input')
    expect(onValueChange.mock.calls[0]?.[1].event.type).toBe('change')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  test('a controlled select shows the value it is given', async () => {
    function Controlled() {
      const [value, setValue] = useState('gbg')
      return (
        <>
          <NativeSelect aria-label="Kommun" value={value} onValueChange={setValue}>
            {municipalities}
          </NativeSelect>
          <output>{value}</output>
        </>
      )
    }
    await render(<Controlled />)
    const select = page.getByRole('combobox', { name: 'Kommun' })
    await expect.element(select).toHaveValue('gbg')
    await userEvent.selectOptions(select, 'sthlm')
    await expect.element(select).toHaveValue('sthlm')
    await expect.element(page.getByRole('status')).toHaveTextContent('sthlm')
  })

  test('a controlled select stays as it is when the parent does not update the value', async () => {
    const onValueChange = vi.fn<(value: string, details: NativeSelectChangeDetails) => void>()
    await render(
      <NativeSelect aria-label="Kommun" value="gbg" onValueChange={onValueChange}>
        {municipalities}
      </NativeSelect>,
    )
    const select = page.getByRole('combobox', { name: 'Kommun' })
    await userEvent.selectOptions(select, 'malmo')
    expect(onValueChange).toHaveBeenCalledWith(
      'malmo',
      expect.objectContaining({ reason: 'input' }),
    )
    await expect.element(select).toHaveValue('gbg')
  })

  test('works in a plain form: the browser keeps the choice and FormData has it', async () => {
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
          <Field.Label>Kommun</Field.Label>
          <NativeSelect name="municipality" defaultValue="gbg">
            {municipalities}
          </NativeSelect>
        </Field.Root>
        <button type="submit">Skicka</button>
      </form>,
    )
    await userEvent.selectOptions(page.getByRole('combobox', { name: 'Kommun' }), 'malmo')
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    expect(submitted?.get('municipality')).toBe('malmo')
  })

  test('a form library’s spread props and ref reach the native select', async () => {
    const registered: { element: HTMLSelectElement | null; changes: string[] } = {
      element: null,
      changes: [],
    }
    const register = (name: string) => ({
      name,
      ref: (element: HTMLSelectElement | null) => {
        registered.element = element
      },
      onChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
        registered.changes.push(event.currentTarget.value)
      },
    })
    await render(
      <Field.Root required>
        <Field.Label>Kommun</Field.Label>
        <NativeSelect {...register('municipality')}>{municipalities}</NativeSelect>
      </Field.Root>,
    )
    const select = page.getByRole('combobox', { name: 'Kommun' })
    expect(registered.element).toBe(select.element())
    await userEvent.selectOptions(select, 'sthlm')
    expect(registered.changes).toEqual(['sthlm'])
  })
})

describe('focus visible', () => {
  test('sets data-focus-visible on keyboard focus only, and Tab moves on', async () => {
    await render(
      <>
        <NativeSelect aria-label="Ett">{municipalities}</NativeSelect>
        <NativeSelect aria-label="Två">{municipalities}</NativeSelect>
      </>,
    )
    const first = page.getByRole('combobox', { name: 'Ett' })
    await userEvent.keyboard('{Tab}')
    await expect.element(first).toHaveFocus()
    await expect.element(first).toHaveAttribute('data-focus-visible', '')
    await userEvent.keyboard('{Tab}')
    await expect.element(first).not.toHaveAttribute('data-focus-visible')
    await expect.element(page.getByRole('combobox', { name: 'Två' })).toHaveFocus()
  })
})

describe('dev warnings', () => {
  test('a select in a Field with no label warns once', async () => {
    await render(
      <Field.Root>
        <NativeSelect>{municipalities}</NativeSelect>
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Field.Label')
  })

  test('a select with no name at all warns once', async () => {
    await render(<NativeSelect>{municipalities}</NativeSelect>)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('accessible name')
  })
})

describe('useNativeSelect', () => {
  test('spreads the same props on your own select', async () => {
    const onValueChange = vi.fn<(value: string, details: NativeSelectChangeDetails) => void>()
    function Own() {
      const select = useNativeSelect({ onValueChange })
      return (
        <select aria-label="Egen" {...select.selectProps}>
          {municipalities}
        </select>
      )
    }
    await render(<Own />)
    const select = page.getByRole('combobox', { name: 'Egen' })
    await expect.element(select).toHaveClass('kv-native-select')
    await userEvent.selectOptions(select, 'gbg')
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe('gbg')
  })

  test('server markup is complete: id, description and selected option', () => {
    const markup = renderToString(
      <Field.Root controlId="kommun" required>
        <Field.Label>Kommun</Field.Label>
        <NativeSelect defaultValue="gbg">{municipalities}</NativeSelect>
      </Field.Root>,
    )
    expect(markup).toContain('<select')
    expect(markup).toContain('id="kommun"')
    expect(markup).toContain('aria-required="true"')
  })
})

describe('types', () => {
  test('exports the prop, state and hook types', () => {
    expectTypeOf<NativeSelectProps['onValueChange']>().toEqualTypeOf<
      ((value: string, details: NativeSelectChangeDetails) => void) | undefined
    >()
    expectTypeOf<NativeSelectProps['value']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<NativeSelectPartProps['className']>().toEqualTypeOf<'kv-native-select'>()
    expectTypeOf<UseNativeSelectResult['selectProps']>().toEqualTypeOf<NativeSelectPartProps>()
  })
})
