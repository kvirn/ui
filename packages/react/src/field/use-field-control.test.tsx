import { describe, expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Field } from './field.tsx'
import { useFieldControl } from './use-field-control.ts'

// The wiring `TextInput`, `Textarea`, `NumberInput` and `PhoneInput` share. Each component's own
// test proves what it adds: here only the shared members, through a bare `<input>`.

function Control({ disabled }: { disabled?: boolean }) {
  const { controlProps, isInvalid, isRequired, isDisabled, isFocused, isFocusVisible } =
    useFieldControl({ disabled })
  return (
    <>
      <input aria-label="Namn" {...controlProps} />
      <output aria-label="state">
        {JSON.stringify({ isInvalid, isRequired, isDisabled, isFocused, isFocusVisible })}
      </output>
    </>
  )
}

function readState() {
  const text = document.querySelector('output')?.textContent ?? '{}'
  return JSON.parse(text) as Record<string, boolean>
}

describe('field state', () => {
  test('a Field gives the control its id, description and aria attributes', async () => {
    await render(
      <Field.Root invalid required>
        <Field.Label>Namn</Field.Label>
        <Field.HelpText>Som i passet</Field.HelpText>
        <Control />
      </Field.Root>,
    )
    const input = page.getByRole('textbox', { name: 'Namn' })
    await expect.element(input).toHaveAttribute('aria-invalid', 'true')
    await expect.element(input).toHaveAttribute('aria-required', 'true')
    await expect.element(input).toHaveAttribute('data-invalid', '')
    await expect.element(input).toHaveAttribute('data-required', '')
    await expect.element(input).toHaveAttribute('aria-describedby')
    await expect.element(input).toHaveAttribute('id')
  })

  test('isInvalid and isRequired follow the Field', async () => {
    await render(
      <Field.Root invalid required>
        <Control />
      </Field.Root>,
    )
    expect(readState()).toMatchObject({ isInvalid: true, isRequired: true })
  })

  test('a disabled Field disables the control', async () => {
    await render(
      <Field.Root disabled>
        <Control />
      </Field.Root>,
    )
    await expect.element(page.getByRole('textbox')).toBeDisabled()
    expect(readState()).toMatchObject({ isDisabled: true })
  })
})

describe('disabled', () => {
  test('the option disables the control and sets data-disabled', async () => {
    await render(<Control disabled />)
    const input = page.getByRole('textbox')
    await expect.element(input).toBeDisabled()
    await expect.element(input).toHaveAttribute('data-disabled', '')
    expect(readState()).toMatchObject({ isDisabled: true })
  })

  test('without the option or a Field the control is enabled', async () => {
    await render(<Control />)
    const input = page.getByRole('textbox')
    await expect.element(input).toBeEnabled()
    await expect.element(input).not.toHaveAttribute('data-disabled')
    expect(readState()).toEqual({
      isInvalid: false,
      isRequired: false,
      isDisabled: false,
      isFocused: false,
      isFocusVisible: false,
    })
  })
})

describe('focus', () => {
  test('focus sets data-focused and isFocused, blur removes them', async () => {
    await render(
      <>
        <Control />
        <button type="button">Skicka</button>
      </>,
    )
    const input = page.getByRole('textbox')
    await userEvent.click(input)
    await expect.element(input).toHaveAttribute('data-focused', '')
    expect(readState()).toMatchObject({ isFocused: true })
    await userEvent.click(page.getByRole('button', { name: 'Skicka' }))
    await expect.element(input).not.toHaveAttribute('data-focused')
    expect(readState()).toMatchObject({ isFocused: false })
  })

  test('keyboard focus sets data-focus-visible and isFocusVisible, blur removes them', async () => {
    await render(
      <>
        <Control />
        <button type="button">Skicka</button>
      </>,
    )
    const input = page.getByRole('textbox')
    await userEvent.keyboard('{Tab}')
    await expect.element(input).toHaveAttribute('data-focus-visible', '')
    expect(readState()).toMatchObject({ isFocusVisible: true })
    await userEvent.keyboard('{Tab}')
    await expect.element(input).not.toHaveAttribute('data-focus-visible')
    expect(readState()).toMatchObject({ isFocusVisible: false })
  })
})
