'use client'
import { AddressInput, Field, Fieldset } from '@kvirn-ui/react'
import { useState } from 'react'
import { addressGeocoder } from './geocoder.ts'
import { addressCountries, useAddressInputTexts } from './texts.ts'

export function AddressAbroad() {
  const { texts } = useAddressInputTexts()
  const [country, setCountry] = useState('SE')
  // The select changes when the user picks a country and when a suggestion is in another country.
  const postalCodeHelp =
    addressCountries.find((candidate) => candidate.code === country)?.postalCodeHelp ??
    texts.postalCodeHelpOther

  return (
    <Fieldset.Root>
      <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
      <AddressInput.Root country="SE" geocoder={addressGeocoder}>
        <Field.Root required>
          <Field.Label>{texts.country}</Field.Label>
          <AddressInput.Country
            name="country"
            value={country}
            onChange={(event) => setCountry(event.currentTarget.value)}
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
