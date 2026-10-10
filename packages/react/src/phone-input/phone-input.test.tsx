import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { PhoneInput } from './phone-input.tsx'
import type { PhoneInputChangeDetails, PhoneInputCountryChangeDetails } from './phone-input.tsx'

// Contract: phone-input.a11y.md. The Field wiring, the mask and the keys are proved by the
// TextInput, Field and mask tests.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

describe('PhoneInput.Number', () => {
  test('sets type tel, inputmode tel, dir ltr and autocomplete tel, and yours wins', async () => {
    await render(
      <>
        <PhoneInput.Number aria-label="Telefonnummer" />
        <PhoneInput.Number aria-label="Någon annans nummer" autoComplete="off" inputMode="text" />
      </>,
    )
    const own = page.getByRole('textbox', { name: 'Telefonnummer' })
    await expect.element(own).toHaveAttribute('type', 'tel')
    await expect.element(own).toHaveAttribute('inputmode', 'tel')
    await expect.element(own).toHaveAttribute('spellcheck', 'false')
    await expect.element(own).toHaveAttribute('dir', 'ltr')
    await expect.element(own).toHaveAttribute('autocomplete', 'tel')
    for (const attribute of ['pattern', 'maxlength']) {
      await expect.element(own).not.toHaveAttribute(attribute)
    }
    const other = page.getByRole('textbox', { name: 'Någon annans nummer' })
    await expect.element(other).toHaveAttribute('autocomplete', 'off')
    await expect.element(other).toHaveAttribute('inputmode', 'text')
  })

  test.each([
    ['the default', undefined],
    ['the telephone mask', 'telephone'],
  ] as const)(
    'keeps the user’s spaces, dashes, brackets and plus as typed and pasted, and blur rewrites nothing (%s)',
    async (_name, mask) => {
      const onValueChange = vi.fn<(value: string) => void>()
      await render(
        <>
          <PhoneInput.Number aria-label="Telefonnummer" mask={mask} onValueChange={onValueChange} />
          <button type="button">Nästa</button>
        </>,
      )
      const input = page.getByRole('textbox', { name: 'Telefonnummer' })
      await userEvent.type(input, '+46 (0)70-174 06 05')
      await expect.element(input).toHaveValue('+46 (0)70-174 06 05')
      expect(onValueChange.mock.lastCall?.[0]).toBe('+46 (0)70-174 06 05')
      await userEvent.fill(input, '070 - 174 06 05')
      await expect.element(input).toHaveValue('070 - 174 06 05')
      await userEvent.tab()
      await expect.element(input).toHaveValue('070 - 174 06 05')
    },
  )

  test('a custom mask in a Field without a help text warns once, the default and telephone do not (3.3.2)', async () => {
    await render(
      <>
        <Field.Root>
          <Field.Label>Standard</Field.Label>
          <PhoneInput.Number />
        </Field.Root>
        <Field.Root>
          <Field.Label>Telefonmask</Field.Label>
          <PhoneInput.Number mask="telephone" />
        </Field.Root>
      </>,
    )
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(consoleWarn).not.toHaveBeenCalled()

    await render(
      <Field.Root>
        <Field.Label>Eget mönster</Field.Label>
        <PhoneInput.Number mask={{ pattern: '999-999 99 99' }} />
      </Field.Root>,
    )
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(1)
    })
    const message = String(consoleWarn.mock.calls[0]?.[0])
    expect(message).toContain('<Field.HelpText>')
    expect(message).toContain('3.3.2')
  })
})

describe('PhoneInput.Root and PhoneInput.Country', () => {
  test('the country is the Root’s prop, then the provider’s, then the locale’s', async () => {
    await render(
      <KvirnProvider locale="fi" country="SE">
        <PhoneInput.Root country="NO">
          <PhoneInput.Country aria-label="Land, Root" />
        </PhoneInput.Root>
        <PhoneInput.Root>
          <PhoneInput.Country aria-label="Land, leverantör" />
        </PhoneInput.Root>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('combobox', { name: 'Land, Root' })).toHaveValue('NO')
    await expect.element(page.getByRole('combobox', { name: 'Land, leverantör' })).toHaveValue('SE')

    await render(
      <KvirnProvider locale="sv-FI">
        <PhoneInput.Root>
          <PhoneInput.Country aria-label="Land, språk" />
        </PhoneInput.Root>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('combobox', { name: 'Land, språk' })).toHaveValue('FI')
  })

  test('changing the country never rewrites the typed number and reports the country and its calling code', async () => {
    const onValueChange = vi.fn<(value: string, details: PhoneInputChangeDetails) => void>()
    const onCountryChange =
      vi.fn<(country: string, details: PhoneInputCountryChangeDetails) => void>()
    await render(
      <KvirnProvider locale="sv" country="SE">
        <PhoneInput.Root onCountryChange={onCountryChange}>
          <PhoneInput.Country aria-label="Land" />
          <PhoneInput.Number aria-label="Nummer" onValueChange={onValueChange} />
        </PhoneInput.Root>
      </KvirnProvider>,
    )
    const number = page.getByRole('textbox', { name: 'Nummer' })
    await userEvent.type(number, '+358 40 123 4567')
    expect(onValueChange.mock.lastCall?.[0]).toBe('+358 40 123 4567')
    expect(onValueChange.mock.lastCall?.[1]).toMatchObject({ country: 'SE', callingCode: '46' })

    await userEvent.selectOptions(page.getByRole('combobox', { name: 'Land' }), 'FI')
    await expect.element(number).toHaveValue('+358 40 123 4567')
    expect(onCountryChange.mock.lastCall?.[0]).toBe('FI')
    expect(onCountryChange.mock.lastCall?.[1]).toMatchObject({ callingCode: '358' })

    await userEvent.type(number, '8')
    expect(onValueChange.mock.lastCall?.[1]).toMatchObject({ country: 'FI', callingCode: '358' })
  })

  test('a controlled country follows country and only reports the change', async () => {
    const onCountryChange = vi.fn<(country: string) => void>()
    await render(
      <PhoneInput.Root country="NO" onCountryChange={onCountryChange}>
        <PhoneInput.Country aria-label="Land" />
      </PhoneInput.Root>,
    )
    const select = page.getByRole('combobox', { name: 'Land' })
    await userEvent.selectOptions(select, 'DK')
    expect(onCountryChange.mock.lastCall?.[0]).toBe('DK')
    await expect.element(select).toHaveValue('NO')
  })

  test('autocomplete is tel-national next to a Country and tel without, and the select is tel-country-code', async () => {
    await render(
      <>
        <PhoneInput.Root>
          <PhoneInput.Country aria-label="Land" />
          <PhoneInput.Number aria-label="Nummer med land" />
        </PhoneInput.Root>
        <PhoneInput.Root>
          <PhoneInput.Number aria-label="Nummer i en Root" />
        </PhoneInput.Root>
        <PhoneInput.Number aria-label="Nummer utan Root" />
      </>,
    )
    await expect
      .element(page.getByRole('combobox', { name: 'Land' }))
      .toHaveAttribute('autocomplete', 'tel-country-code')
    await expect
      .element(page.getByRole('textbox', { name: 'Nummer med land' }))
      .toHaveAttribute('autocomplete', 'tel-national')
    await expect
      .element(page.getByRole('textbox', { name: 'Nummer i en Root' }))
      .toHaveAttribute('autocomplete', 'tel')
    await expect
      .element(page.getByRole('textbox', { name: 'Nummer utan Root' }))
      .toHaveAttribute('autocomplete', 'tel')
  })

  test('Tab goes to the select and then to the number in DOM order, and Shift+Tab goes back', async () => {
    await render(
      <PhoneInput.Root country="SE">
        <PhoneInput.Country aria-label="Land" />
        <PhoneInput.Number aria-label="Nummer" />
      </PhoneInput.Root>,
    )
    const select = page.getByRole('combobox', { name: 'Land' })
    const number = page.getByRole('textbox', { name: 'Nummer' })
    await userEvent.tab()
    await expect.element(select).toHaveFocus()
    await userEvent.tab()
    await expect.element(number).toHaveFocus()
    await userEvent.tab({ shift: true })
    await expect.element(select).toHaveFocus()
  })

  test('a Country with no name warns once', async () => {
    await render(
      <PhoneInput.Root>
        <PhoneInput.Country />
      </PhoneInput.Root>,
    )
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(1)
    })
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('4.1.2')
  })
})
