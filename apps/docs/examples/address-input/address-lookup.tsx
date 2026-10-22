'use client'
import { AddressInput, Button, Field, Fieldset, Stack } from '@kvirn-ui/react'
import { useState } from 'react'
import { addressGeocoder } from './geocoder.ts'
import { useAddressInputTexts } from './texts.ts'

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
          <AddressInput.Root country="SE" geocoder={addressGeocoder}>
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
        <Button type="submit" className="kv-button--primary">
          {texts.reportChange}
        </Button>
      </form>
      <output>{isReported ? texts.changeReported : null}</output>
    </Stack>
  )
}
