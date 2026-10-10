import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { Fieldset } from '../fieldset/fieldset.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { AddressInput } from './address-input.tsx'
import type { AddressInputRootProps } from './address-input.tsx'

// Contract: address-input.a11y.md. What TextInput, Field, Fieldset, ErrorSummary and the masks
// prove is not proved again here.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

function Address(rootProps: AddressInputRootProps) {
  return (
    <Fieldset.Root>
      <Fieldset.Legend>Your address</Fieldset.Legend>
      <AddressInput.Root {...rootProps}>
        <Field.Root>
          <Field.Label>Street address</Field.Label>
          <AddressInput.Line1 />
        </Field.Root>
        <Field.Root>
          <Field.Label>Address line 2</Field.Label>
          <AddressInput.Line2 autoComplete="off" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Postal code</Field.Label>
          <AddressInput.PostalCode />
        </Field.Root>
        <Field.Root>
          <Field.Label>Town or city</Field.Label>
          <AddressInput.City />
        </Field.Root>
      </AddressInput.Root>
    </Fieldset.Root>
  )
}

const street = () => page.getByRole('textbox', { name: /^Street address/ })
const line2 = () => page.getByRole('textbox', { name: /^Address line 2/ })
const postalCode = () => page.getByRole('textbox', { name: /^Postal code/ })
const city = () => page.getByRole('textbox', { name: /^Town or city/ })

describe('autocomplete tokens (1.3.5)', () => {
  test('each part gets its token, a Root prefix or off, and a part’s own wins', async () => {
    const { rerender } = await render(<Address />)
    await expect.element(street()).toHaveAttribute('autocomplete', 'address-line1')
    await expect.element(postalCode()).toHaveAttribute('autocomplete', 'postal-code')
    await expect.element(city()).toHaveAttribute('autocomplete', 'address-level2')
    // Line 2's own `off` wins over the Root's missing prefix, and the text lines are not spell-checked.
    await expect.element(line2()).toHaveAttribute('autocomplete', 'off')
    for (const line of [street(), city()]) {
      await expect.element(line).toHaveAttribute('spellcheck', 'false')
      await expect.element(line).toHaveAttribute('autocorrect', 'off')
    }

    await rerender(<Address autoComplete="section-postal" />)
    await expect.element(street()).toHaveAttribute('autocomplete', 'section-postal address-line1')
    await expect.element(postalCode()).toHaveAttribute('autocomplete', 'section-postal postal-code')
    await expect.element(line2()).toHaveAttribute('autocomplete', 'off')

    await rerender(<Address autoComplete="off" />)
    for (const part of [street(), postalCode(), city()]) {
      await expect.element(part).toHaveAttribute('autocomplete', 'off')
    }
  })
})

describe('postal code', () => {
  test('follows the Root’s country: SE groups the digits, DE keeps letters with no mask', async () => {
    const { rerender } = await render(<Address country="SE" />)
    await userEvent.type(postalCode(), '12345')
    await expect.element(postalCode()).toHaveValue('123 45')
    await expect.element(postalCode()).toHaveAttribute('inputmode', 'numeric')
    await expect.element(postalCode()).toHaveAttribute('dir', 'ltr')

    await rerender(<Address country="DE" />)
    await userEvent.clear(postalCode())
    await userEvent.type(postalCode(), 'ab-12 c')
    await expect.element(postalCode()).toHaveValue('ab-12 c')
    await expect.element(postalCode()).toHaveAttribute('inputmode', 'text')
    await expect.element(postalCode()).toHaveAttribute('autocapitalize', 'characters')
    await expect.element(postalCode()).toHaveAttribute('dir', 'ltr')
  })

  test('without a country on the Root, the provider’s country is used', async () => {
    await render(
      <KvirnProvider locale="en" country="NO">
        <Address />
      </KvirnProvider>,
    )
    await userEvent.type(postalCode(), '123456')
    await expect.element(postalCode()).toHaveValue('1234')
  })

  test('a full postal code never moves focus, and changing country never rewrites the value', async () => {
    const { rerender } = await render(<Address country="SE" />)
    await userEvent.type(postalCode(), '12345')
    await expect.element(postalCode()).toHaveValue('123 45')
    await expect.element(postalCode()).toHaveFocus()
    await expect.element(city()).not.toHaveFocus()

    await rerender(<Address country="NO" />)
    await expect.element(postalCode()).toHaveValue('123 45')
    await rerender(<Address country="DE" />)
    await expect.element(postalCode()).toHaveValue('123 45')
  })
})

describe('dev warnings', () => {
  test('warns outside a fieldset, in a group fieldset, and for a part outside a Root', async () => {
    await render(
      <>
        <AddressInput.Root />
        <Fieldset.Root group>
          <Fieldset.Legend>Your address</Fieldset.Legend>
          <AddressInput.Root />
        </Fieldset.Root>
        <AddressInput.City aria-label="Town or city" />
      </>,
    )
    const messages = consoleWarn.mock.calls.map(([message]) => String(message))
    expect(messages.some((message) => message.includes('not inside a group'))).toBe(true)
    expect(messages.some((message) => message.includes('in a `group` Fieldset'))).toBe(true)
    expect(messages.some((message) => message.includes('outside an AddressInput.Root'))).toBe(true)
  })
})
