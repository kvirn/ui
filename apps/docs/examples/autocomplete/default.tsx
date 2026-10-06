'use client'
import { Autocomplete, Field } from '@kvirn-ui/react'
import { streets } from './data.ts'
import { useAutocompleteTexts } from './texts.ts'

export function DefaultAutocomplete() {
  const { texts, textLang } = useAutocompleteTexts()
  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.street}</Field.Label>
      <Field.Prose>
        <p>{texts.hint}</p>
      </Field.Prose>
      <Autocomplete.Root items={streets}>
        <Autocomplete.Control>
          <Autocomplete.Input />
          <Autocomplete.Clear />
          <Autocomplete.Toggle />
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
