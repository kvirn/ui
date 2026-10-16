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
import type { ListboxNativeChangeDetails, ListboxNativeProps } from './listbox-native.tsx'
import { useListboxNative } from './use-listbox-native.ts'
import type { ListboxNativePartProps, UseListboxNativeResult } from './use-listbox-native.ts'

// Contract: listbox.a11y.md (native rendering).

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function asSelect(element: HTMLElement | SVGElement): HTMLSelectElement {
  if (!(element instanceof HTMLSelectElement)) {
    throw new Error('expected a <select>')
  }
  return element
}

const municipalities = (
  <>
    <option value="">Choose a municipality</option>
    <option value="gbg">Goteborg</option>
    <option value="sthlm">Stockholm</option>
    <option value="malmo">Malmo</option>
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
      <ListboxNative aria-label="Municipality">{municipalities}</ListboxNative>,
    )
    const select = page.getByRole('combobox', { name: 'Municipality' })
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
        aria-label="Municipality"
        className="egen"
        name="municipality"
        autoComplete="address-level2"
        data-egen=""
      >
        <optgroup label="Vastra Gotaland">
          <option value="gbg">Goteborg</option>
        </optgroup>
        <optgroup label="Skane">
          <option value="malmo">Malmo</option>
        </optgroup>
      </ListboxNative>,
    )
    const select = page.getByRole('combobox', { name: 'Municipality' })
    expect(ref.current).toBe(select.element())
    await expect.element(select).toHaveClass('egen', 'kv-listbox-native')
    await expect.element(select).toHaveAttribute('name', 'municipality')
    await expect.element(select).toHaveAttribute('autocomplete', 'address-level2')
    await expect.element(select).toHaveAttribute('data-egen', '')
    expect(ref.current?.querySelectorAll('optgroup')).toHaveLength(2)
  })

  test('multiple and size warn once: use a CheckboxGroup', async () => {
    const props = { 'aria-label': 'Municipality', multiple: true } as unknown as ListboxNativeProps
    await render(<ListboxNative {...props}>{municipalities}</ListboxNative>)
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('CheckboxGroup')
  })
})

describe('in a Field', () => {
  test('the Field’s label is the name, and the description and error describe it', async () => {
    const { container } = await render(
      <Field.Root invalid required>
        <Field.Label>Municipality</Field.Label>
        <Field.Prose>Where you are registered.</Field.Prose>
        <ListboxNative name="municipality">{municipalities}</ListboxNative>
        <Field.ErrorMessage>Choose a municipality</Field.ErrorMessage>
      </Field.Root>,
    )
    const select = page.getByRole('combobox', { name: 'Municipality' })
    const id = select.element().id
    expect(id).not.toBe('')
    expect(container.querySelector('label')?.getAttribute('for')).toBe(id)
    await expect
      .element(select)
      .toHaveAccessibleDescription('Where you are registered. Error: Choose a municipality')
    await expectNoA11yViolations(container)
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('invalid, required and disabled come from the Field', async () => {
    await render(
      <>
        <Field.Root invalid required>
          <Field.Label>Municipality</Field.Label>
          <Field.ErrorMessage>Choose a municipality</Field.ErrorMessage>
          <ListboxNative>{municipalities}</ListboxNative>
        </Field.Root>
        <Field.Root disabled>
          <Field.Label marker="none">Land</Field.Label>
          <ListboxNative>{municipalities}</ListboxNative>
        </Field.Root>
      </>,
    )
    const select = page.getByRole('combobox', { name: 'Municipality' })
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
        <Field.Label marker="none">Municipality</Field.Label>
        <ListboxNative disabled>{municipalities}</ListboxNative>
      </Field.Root>,
    )
    await expect.element(page.getByRole('combobox', { name: 'Municipality' })).toBeDisabled()
  })

  test('a non-required Field marks the label optional', async () => {
    await render(
      <KvirnProvider>
        <Field.Root>
          <Field.Label>Municipality</Field.Label>
          <ListboxNative>{municipalities}</ListboxNative>
        </Field.Root>
      </KvirnProvider>,
    )
    await expect
      .element(page.getByRole('combobox', { name: 'Municipality (optional)' }))
      .toBeVisible()
  })

  test('keeps your own aria-describedby ids, after the Field’s', async () => {
    await render(
      <>
        <p id="extra">More information.</p>
        <Field.Root required>
          <Field.Label>Municipality</Field.Label>
          <Field.Prose>Where you live.</Field.Prose>
          <ListboxNative aria-describedby="extra">{municipalities}</ListboxNative>
        </Field.Root>
      </>,
    )
    await expect
      .element(page.getByRole('combobox', { name: 'Municipality' }))
      .toHaveAccessibleDescription('Where you live. More information.')
  })

  test('clicking the label focuses the select', async () => {
    await render(
      <Field.Root required>
        <Field.Label>Municipality</Field.Label>
        <ListboxNative>{municipalities}</ListboxNative>
      </Field.Root>,
    )
    await userEvent.click(page.getByText('Municipality', { exact: true }))
    await expect.element(page.getByRole('combobox')).toHaveFocus()
  })

  test('an id inside a Field is ignored with a dev warning: the label stays associated', async () => {
    await render(
      <Field.Root controlId="the-field" required>
        <Field.Label>Municipality</Field.Label>
        <ListboxNative id="annat">{municipalities}</ListboxNative>
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('combobox', { name: 'Municipality' }))
      .toHaveAttribute('id', 'the-field')
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
        aria-label="Municipality"
        defaultValue="sthlm"
        onValueChange={onValueChange}
        onChange={onChange}
      >
        {municipalities}
      </ListboxNative>,
    )
    const select = page.getByRole('combobox', { name: 'Municipality' })
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
          <ListboxNative aria-label="Municipality" value={value} onValueChange={setValue}>
            {municipalities}
          </ListboxNative>
          <output>{value}</output>
        </>
      )
    }
    await render(<Controlled />)
    const select = page.getByRole('combobox', { name: 'Municipality' })
    await expect.element(select).toHaveValue('gbg')
    await userEvent.selectOptions(select, 'sthlm')
    await expect.element(select).toHaveValue('sthlm')
    await expect.element(page.getByRole('status')).toHaveTextContent('sthlm')
  })

  test('a controlled select stays as it is when the parent does not update the value', async () => {
    const onValueChange = vi.fn<(value: string, details: ListboxNativeChangeDetails) => void>()
    await render(
      <ListboxNative aria-label="Municipality" value="gbg" onValueChange={onValueChange}>
        {municipalities}
      </ListboxNative>,
    )
    const select = page.getByRole('combobox', { name: 'Municipality' })
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
        aria-label="Application"
        onSubmit={(event) => {
          event.preventDefault()
          submitted = new FormData(event.currentTarget)
        }}
      >
        <Field.Root required>
          <Field.Label>Municipality</Field.Label>
          <ListboxNative name="municipality" defaultValue="gbg">
            {municipalities}
          </ListboxNative>
        </Field.Root>
        <button type="submit">Submit</button>
      </form>,
    )
    await userEvent.selectOptions(page.getByRole('combobox', { name: 'Municipality' }), 'malmo')
    await userEvent.click(page.getByRole('button', { name: 'Submit' }))
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
        <Field.Label>Municipality</Field.Label>
        <ListboxNative {...register('municipality')}>{municipalities}</ListboxNative>
      </Field.Root>,
    )
    const select = page.getByRole('combobox', { name: 'Municipality' })
    expect(registered.element).toBe(select.element())
    await userEvent.selectOptions(select, 'sthlm')
    expect(registered.changes).toEqual(['sthlm'])
  })
})

describe('focus visible', () => {
  test('sets data-focus-visible on keyboard focus only, and Tab moves on', async () => {
    await render(
      <>
        <ListboxNative aria-label="One">{municipalities}</ListboxNative>
        <ListboxNative aria-label="Two">{municipalities}</ListboxNative>
      </>,
    )
    const first = page.getByRole('combobox', { name: 'One' })
    await userEvent.keyboard('{Tab}')
    await expect.element(first).toHaveFocus()
    await expect.element(first).toHaveAttribute('data-focus-visible', '')
    await userEvent.keyboard('{Tab}')
    await expect.element(first).not.toHaveAttribute('data-focus-visible')
    await expect.element(page.getByRole('combobox', { name: 'Two' })).toHaveFocus()
  })
})

describe('keyboard: the browser’s own keys', () => {
  test('Shift+Tab leaves the select backwards', async () => {
    await render(
      <>
        <button type="button">Before</button>
        <ListboxNative aria-label="Municipality">{municipalities}</ListboxNative>
      </>,
    )
    page.getByRole('combobox', { name: 'Municipality' }).element().focus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Before' })).toHaveFocus()
  })

  test('Tab skips a disabled select', async () => {
    await render(
      <>
        <ListboxNative aria-label="One">{municipalities}</ListboxNative>
        <ListboxNative aria-label="Two" disabled>
          {municipalities}
        </ListboxNative>
        <button type="button">After</button>
      </>,
    )
    page.getByRole('combobox', { name: 'One' }).element().focus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus()
  })

  test('ArrowDown chooses the next option and ArrowUp the previous one, without wrapping', async () => {
    const onValueChange = vi.fn<(value: string, details: ListboxNativeChangeDetails) => void>()
    await render(
      <ListboxNative aria-label="Municipality" onValueChange={onValueChange}>
        {municipalities}
      </ListboxNative>,
    )
    const select = page.getByRole('combobox', { name: 'Municipality' })
    select.element().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(select).toHaveValue('gbg')
    expect(onValueChange).toHaveBeenCalledWith('gbg', expect.anything())
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(select).toHaveValue('sthlm')
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}')
    await expect.element(select).toHaveValue('')
    await expect.element(select).toHaveFocus()
  })

  test('Home and End choose the first and the last option', async () => {
    await render(<ListboxNative aria-label="Municipality">{municipalities}</ListboxNative>)
    const select = page.getByRole('combobox', { name: 'Municipality' })
    select.element().focus()
    await userEvent.keyboard('{End}')
    await expect.element(select).toHaveValue('malmo')
    await userEvent.keyboard('{Home}')
    await expect.element(select).toHaveValue('')
  })

  test('typing a letter chooses the option that starts with it', async () => {
    await render(<ListboxNative aria-label="Municipality">{municipalities}</ListboxNative>)
    const select = page.getByRole('combobox', { name: 'Municipality' })
    select.element().focus()
    await userEvent.keyboard('s')
    await expect.element(select).toHaveValue('sthlm')
  })

  test('Alt+ArrowDown opens the list without changing the value, and Escape closes it', async () => {
    await render(
      <ListboxNative aria-label="Municipality" defaultValue="sthlm">
        {municipalities}
      </ListboxNative>,
    )
    const select = page.getByRole('combobox', { name: 'Municipality' })
    const element = asSelect(select.element())
    element.focus()
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
    await expect.poll(() => element.matches(':open')).toBe(true)
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => element.matches(':open')).toBe(false)
    await expect.element(select).toHaveValue('sthlm')
    await expect.element(select).toHaveFocus()
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
      <Field.Root controlId="municipality" required>
        <Field.Label>Municipality</Field.Label>
        <ListboxNative defaultValue="gbg">{municipalities}</ListboxNative>
      </Field.Root>,
    )
    expect(markup).toContain('<select')
    expect(markup).toContain('id="municipality"')
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
