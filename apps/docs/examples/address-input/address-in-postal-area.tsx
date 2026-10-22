'use client'
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn'
import { AddressInput, Field, Fieldset } from '@kvirn-ui/react'
import { useAddressInputTexts } from './texts.ts'

const geocoder = kvirnGeocoder({
  url: 'https://geo.kvirn.com',
  name: 'Kvirn’s map service',
  countries: ['se'],
  attribution: null,
})

export function AddressInPostalArea() {
  const { texts } = useAddressInputTexts()

  return (
    <Fieldset.Root>
      <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
      <AddressInput.Root country="SE" geocoder={geocoder}>
        <Field.Root required>
          <Field.Label>{texts.street}</Field.Label>
          <AddressInput.Line1 name="line1" privacyNotice={false} />
          <Field.HelpText>{texts.lookupPrivacy}</Field.HelpText>
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
