'use client'
import { Autocomplete, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { streets } from './data.ts'
import { useAutocompleteTexts } from './texts.ts'

export function ControlledAutocomplete() {
  const { texts, textLang } = useAutocompleteTexts()
  const [street, setStreet] = useState('')
  return (
    <>
      <Field.Root lang={textLang}>
        <Field.Label>{texts.street}</Field.Label>
        <Autocomplete.Root items={streets} value={street} onValueChange={setStreet}>
          <Autocomplete.Control>
            <Autocomplete.Input />
            <Autocomplete.Clear />
          </Autocomplete.Control>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(item: string) => <Autocomplete.Option item={item} />}
            </Autocomplete.List>
            <Autocomplete.Empty />
          </Autocomplete.Popup>
        </Autocomplete.Root>
      </Field.Root>
      <p lang={textLang}>
        {texts.entered}: {street}
      </p>
    </>
  )
}
