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
import { Listbox } from './listbox.tsx'
import { ListboxNative } from './listbox-native.tsx'
import type {
  ListboxNativeChangeDetails,
  ListboxNativeProps,
  ListboxNativeState,
} from './listbox-native.tsx'
import { useListboxNative } from './use-listbox-native.ts'
import type { ListboxNativePartProps, UseListboxNativeResult } from './use-listbox-native.ts'

// Contract: listbox.a11y.md (native rendering). The keyboard rows are also covered end to end in
// apps/storybook/src/components/listbox/listbox.e2e.ts.

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
  test('the native select is an internal part: Listbox has no Native member', () => {
    // NativeSelect became Listbox: the native select is not a part of its own,
    // `Listbox.Root` renders it for `native="always"` and `native="auto"` on touch devices.
    expect('Native' in Listbox).toBe(false)
    expect(ListboxNative.displayName).toBe('ListboxNative')
  })

  test('renders a native <select>, outside a Field', async () => {
    const { container } = await render(
      <ListboxNative aria-label="Kommun">{municipalities}</ListboxNative>,
    )
    const select = page.getByRole('combobox', { name: 'Kommun' })
    const element = select.element()
    expect(element.tagName).toBe('SELECT')
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
      <ListboxNative
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
      </ListboxNative>,
    )
    const select = page.getByRole('combobox', { name: 'Kommun' })
    expect(ref.current).toBe(select.element())
    await expect.element(select).toHaveClass('egen', 'kv-listbox-native')
    await expect.element(select).toHaveAttribute('name', 'municipality')
    await expect.element(select).toHaveAttribute('autocomplete', 'address-level2')
    await expect.element(select).toHaveAttribute('data-egen', '')
    expect(ref.current?.querySelectorAll('optgroup')).toHaveLength(2)
  })

  test('render as a function gets the part’s props and the state', async () => {
    const seenStates: ListboxNativeState[] = []
    await render(
      <Field.Root invalid required>
        <Field.Label>Kommun</Field.Label>
        <Field.ErrorMessage>Välj en kommun</Field.ErrorMessage>
        <ListboxNative
          render={(partProps, state) => {
            seenStates.push(state)
            return <select {...partProps} data-egen="" />
          }}
        >
          {municipalities}
        </ListboxNative>
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

  test('multiple and size warn once: use a CheckboxGroup', async () => {
    const props = { 'aria-label': 'Kommun', multiple: true } as unknown as ListboxNativeProps
    await render(<ListboxNative {...props}>{municipalities}</ListboxNative>)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('CheckboxGroup')
  })
})

describe('in a Field', () => {
  test('the Field’s label is the name, and the description and error describe it', async () => {
    const { container } = await render(
      <Field.Root invalid required>
        <Field.Label>Kommun</Field.Label>
        <Field.Prose>Där du är folkbokförd.</Field.Prose>
        <ListboxNative name="municipality">{municipalities}</ListboxNative>
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
          <ListboxNative>{municipalities}</ListboxNative>
        </Field.Root>
        <Field.Root disabled>
          <Field.Label marker="none">Land</Field.Label>
          <ListboxNative>{municipalities}</ListboxNative>
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
        <ListboxNative disabled>{municipalities}</ListboxNative>
      </Field.Root>,
    )
    await expect.element(page.getByRole('combobox', { name: 'Kommun' })).toBeDisabled()
  })

  test('a non-required Field marks the label optional', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Field.Root>
          <Field.Label>Kommun</Field.Label>
          <ListboxNative>{municipalities}</ListboxNative>
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
          <Field.Prose>Där du bor.</Field.Prose>
          <ListboxNative aria-describedby="extra">{municipalities}</ListboxNative>
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
        <ListboxNative>{municipalities}</ListboxNative>
      </Field.Root>,
    )
    await userEvent.click(page.getByText('Kommun', { exact: true }))
    await expect.element(page.getByRole('combobox')).toHaveFocus()
  })

  test('an id inside a Field is ignored with a dev warning: the label stays associated', async () => {
    await render(
      <Field.Root controlId="fältet" required>
        <Field.Label>Kommun</Field.Label>
        <ListboxNative id="annat">{municipalities}</ListboxNative>
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
    const onValueChange = vi.fn<(value: string, details: ListboxNativeChangeDetails) => void>()
    const onChange = vi.fn<(event: React.ChangeEvent<HTMLSelectElement>) => void>()
    await render(
      <ListboxNative
        aria-label="Kommun"
        defaultValue="sthlm"
        onValueChange={onValueChange}
        onChange={onChange}
      >
        {municipalities}
      </ListboxNative>,
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
          <ListboxNative aria-label="Kommun" value={value} onValueChange={setValue}>
            {municipalities}
          </ListboxNative>
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
    const onValueChange = vi.fn<(value: string, details: ListboxNativeChangeDetails) => void>()
    await render(
      <ListboxNative aria-label="Kommun" value="gbg" onValueChange={onValueChange}>
        {municipalities}
      </ListboxNative>,
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
          <ListboxNative name="municipality" defaultValue="gbg">
            {municipalities}
          </ListboxNative>
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
        <ListboxNative {...register('municipality')}>{municipalities}</ListboxNative>
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
        <ListboxNative aria-label="Ett">{municipalities}</ListboxNative>
        <ListboxNative aria-label="Två">{municipalities}</ListboxNative>
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
        <ListboxNative>{municipalities}</ListboxNative>
      </Field.Root>,
    )
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('Field.Label')
  })

  test('a select with no name at all warns once', async () => {
    await render(<ListboxNative>{municipalities}</ListboxNative>)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('accessible name')
  })
})

describe('useListboxNative', () => {
  test('spreads the same props on your own select', async () => {
    const onValueChange = vi.fn<(value: string, details: ListboxNativeChangeDetails) => void>()
    function Own() {
      const select = useListboxNative({ onValueChange })
      return (
        <select aria-label="Egen" {...select.nativeProps}>
          {municipalities}
        </select>
      )
    }
    await render(<Own />)
    const select = page.getByRole('combobox', { name: 'Egen' })
    await userEvent.selectOptions(select, 'gbg')
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe('gbg')
  })

  test('server markup is complete: id, description and selected option', () => {
    const markup = renderToString(
      <Field.Root controlId="kommun" required>
        <Field.Label>Kommun</Field.Label>
        <ListboxNative defaultValue="gbg">{municipalities}</ListboxNative>
      </Field.Root>,
    )
    expect(markup).toContain('<select')
    expect(markup).toContain('id="kommun"')
    expect(markup).toContain('aria-required="true"')
  })
})

describe('types', () => {
  test('exports the prop, state and hook types', () => {
    expectTypeOf<ListboxNativeProps['onValueChange']>().toEqualTypeOf<
      ((value: string, details: ListboxNativeChangeDetails) => void) | undefined
    >()
    expectTypeOf<ListboxNativeProps['value']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<ListboxNativePartProps['className']>().toEqualTypeOf<'kv-listbox-native'>()
    expectTypeOf<UseListboxNativeResult['nativeProps']>().toEqualTypeOf<ListboxNativePartProps>()
  })
})
