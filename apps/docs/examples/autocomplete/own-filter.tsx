'use client'
import { Autocomplete, Field } from '@kvirn-ui/react'
import { streets } from './data.ts'
import { useAutocompleteTexts } from './texts.ts'

export function OwnFilterAutocomplete() {
  const { texts } = useAutocompleteTexts()
  return (
    <Field.Root>
      <Field.Label>{texts.street}</Field.Label>
      <Autocomplete.Root
        items={streets}
        filter={(street, query) => street.toLowerCase().startsWith(query.trim().toLowerCase())}
      >
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
        </Autocomplete.Control>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
          <Autocomplete.Empty />
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}
