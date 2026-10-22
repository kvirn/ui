'use client'
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn'
import { AddressInput, Button, Field, Fieldset, Stack } from '@kvirn-ui/react'
import { useState } from 'react'
import { useAddressInputTexts } from './texts.ts'

// Made once, outside the component, so the Root gets the same geocoder on every render.
// This form takes Swedish addresses only, so the service searches Sweden only.
const geocoder = kvirnGeocoder({
  url: 'https://geo.kvirn.com',
  name: 'Kvirn’s map service',
  countries: ['se'],
  attribution: null,
})

export function AddressLookup() {
  const { texts } = useAddressInputTexts()
  const [isReported, setIsReported] = useState(false)

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
        <Button type="submit" className="kv-button--primary">
          {texts.reportChange}
        </Button>
      </form>
      <output>{isReported ? texts.changeReported : null}</output>
    </Stack>
  )
}
