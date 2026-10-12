'use client'
import { Autocomplete, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { streets } from './data.ts'
import { useAutocompleteTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ControlledAutocomplete() {
  const { texts, isFallback } = useAutocompleteTexts()
  const [street, setStreet] = useState('')
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <>
        <Field.Root>
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
        <p>
          {texts.entered}: {street}
        </p>
      </>
    </InEnglishWhenFallback>
  )
}
