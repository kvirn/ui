'use client'
import { AddressInput, Field, Fieldset } from '@kvirn-ui/react'
import { useAddressInputTexts } from './texts.ts'

export function DefaultAddressInput() {
  const { texts } = useAddressInputTexts()
  return (
    <Fieldset.Root>
      <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
      <AddressInput.Root country="SE">
        <Field.Root required>
          <Field.Label>{texts.street}</Field.Label>
          <AddressInput.Line1 name="line1" />
        </Field.Root>
        <Field.Root>
          <Field.Label>{texts.line2}</Field.Label>
          <AddressInput.Line2 name="line2" />
          <Field.HelpText>{texts.line2Help}</Field.HelpText>
        </Field.Root>
        <Field.Root required>
          <Field.Label>{texts.postalCode}</Field.Label>
          <AddressInput.PostalCode name="postalCode" />
          <Field.HelpText>{texts.postalCodeHelp}</Field.HelpText>
        </Field.Root>
        <Field.Root required>
          <Field.Label>{texts.city}</Field.Label>
          <AddressInput.City name="city" />
        </Field.Root>
      </AddressInput.Root>
    </Fieldset.Root>
  )
}
