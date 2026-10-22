'use client'
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn'
import { AddressInput, Button, Field, Fieldset, Stack } from '@kvirn-ui/react'
import { useState } from 'react'
import { addressCountries, useAddressInputTexts } from './texts.ts'

// Made once, outside the component, so the Root gets the same geocoder on every render.
const geocoder = kvirnGeocoder({
  url: 'https://geo.kvirn.com',
  name: 'Kvirn’s map service',
  countries: ['no', 'se'],
  attribution: null,
})

export function AddressAbroad() {
  const { texts } = useAddressInputTexts()
  const [country, setCountry] = useState('NO')
  const [isReported, setIsReported] = useState(false)
  // The select changes when the user picks a country and when a suggestion is in another country.
  const postalCodeHelp =
    addressCountries.find((candidate) => candidate.code === country)?.postalCodeHelp ??
    texts.postalCodeHelpOther

  return (
    <Stack className="kv-stack--gap-8">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setIsReported(true)
        }}
      >
        <Fieldset.Root>
          <Fieldset.Legend>{texts.legendNew}</Fieldset.Legend>
          <AddressInput.Root country="NO" geocoder={geocoder}>
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
              <Field.HelpText>{postalCodeHelp}</Field.HelpText>
            </Field.Root>
            <Field.Root required>
              <Field.Label>{texts.city}</Field.Label>
              <AddressInput.City name="city" />
            </Field.Root>
          </AddressInput.Root>
        </Fieldset.Root>
        <Button type="submit" className="kv-button--primary">
          {texts.reportChange}
        </Button>
      </form>
      <output>{isReported ? texts.changeReported : null}</output>
    </Stack>
  )
}
