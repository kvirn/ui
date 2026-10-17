'use client'
import { AddressInput, Field, Fieldset, Listbox } from '@kvirn-ui/react'
import { useState } from 'react'
import { addressCountries, useAddressInputTexts } from './texts.ts'

export function AddressAbroad() {
  const { texts } = useAddressInputTexts()
  const [country, setCountry] = useState('SE')
  const postalCodeHelp =
    addressCountries.find((candidate) => candidate.code === country)?.postalCodeHelp ?? ''

  return (
    <Fieldset.Root>
      <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
      <AddressInput.Root country={country}>
        <Field.Root required>
          <Field.Label>{texts.country}</Field.Label>
          <Listbox.Root
            native="always"
            items={addressCountries}
            itemToString={(item) => item.name}
            itemToKey={(item) => item.code}
            name="country"
            autoComplete="country"
            value={country}
            onValueChange={(value) => {
              if (typeof value === 'string') {
                setCountry(value)
              }
            }}
          />
        </Field.Root>
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
          <Field.HelpText>{postalCodeHelp}</Field.HelpText>
        </Field.Root>
        <Field.Root required>
          <Field.Label>{texts.city}</Field.Label>
          <AddressInput.City name="city" />
        </Field.Root>
      </AddressInput.Root>
    </Fieldset.Root>
  )
}
