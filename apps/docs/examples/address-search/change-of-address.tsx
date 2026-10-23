'use client'
import { AddressSearch } from '@kvirn-ui/map'
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn'
import { AddressInput, Button, Field, Fieldset, Stack } from '@kvirn-ui/react'
import { useState } from 'react'
import { useAddressSearchTexts } from './texts.ts'

const geocoder = kvirnGeocoder({
  url: 'https://geo.kvirn.com',
  name: 'Kvirn’s map service',
  countries: ['se'],
})

const emptyAddress = { line1: '', line2: '', postalCode: '', city: '' }

export function ChangeOfAddressSearch() {
  const { texts } = useAddressSearchTexts()
  const [address, setAddress] = useState(emptyAddress)
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
          <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
          <AddressSearch
            geocoder={geocoder}
            label={texts.formSearchLabel}
            messages={{ helpSuggest: ({ min }) => texts.helpInForm(min) }}
            // A result without an address, such as a park, fills nothing, so it is turned down
            // and the visitor is told. Only an address says that the boxes are filled in.
            describePick={(result) =>
              result.address
                ? { announcement: texts.pickedInForm(result.label) }
                : { rejected: texts.noAddress }
            }
            onResult={(result) => {
              if (result?.address) {
                const { line1, postalCode, city } = result.address
                setAddress((current) => ({ ...current, line1, postalCode, city }))
              }
            }}
          />
          <AddressInput.Root country="SE">
            <Field.Root required>
              <Field.Label>{texts.street}</Field.Label>
              <AddressInput.Line1
                name="line1"
                value={address.line1}
                onChange={(event) => setAddress({ ...address, line1: event.target.value })}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>{texts.line2}</Field.Label>
              <AddressInput.Line2
                name="line2"
                value={address.line2}
                onChange={(event) => setAddress({ ...address, line2: event.target.value })}
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label>{texts.postalCode}</Field.Label>
              <AddressInput.PostalCode
                name="postalCode"
                value={address.postalCode}
                onChange={(event) => setAddress({ ...address, postalCode: event.target.value })}
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label>{texts.city}</Field.Label>
              <AddressInput.City
                name="city"
                value={address.city}
                onChange={(event) => setAddress({ ...address, city: event.target.value })}
              />
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
