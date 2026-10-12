'use client'
import { Autocomplete, Field } from '@kvirn-ui/react'
import { addresses } from './data.ts'
import { useAutocompleteTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function LongListAutocomplete() {
  const { texts, isFallback } = useAutocompleteTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
        <Field.Label>{texts.address}</Field.Label>
        <Autocomplete.Root virtualize items={addresses}>
          <Autocomplete.Control>
            <Autocomplete.Input />
            <Autocomplete.Clear />
            <Autocomplete.Toggle />
          </Autocomplete.Control>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(address: string) => <Autocomplete.Option item={address} />}
            </Autocomplete.List>
            <Autocomplete.Empty />
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
