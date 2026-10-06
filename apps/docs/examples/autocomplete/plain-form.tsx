'use client'
import { Autocomplete, Button, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { streets } from './data.ts'
import { useAutocompleteTexts } from './texts.ts'

export function PlainFormAutocomplete() {
  const { texts, textLang } = useAutocompleteTexts()
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      lang={textLang}
      onSubmit={(event) => {
        // A real form sends the data from here.
        event.preventDefault()
        const value = new FormData(event.currentTarget).get('street')
        setSent(typeof value === 'string' ? value : '')
      }}
    >
      <Field.Root>
        <Field.Label>{texts.street}</Field.Label>
        <Autocomplete.Root items={streets} name="street" defaultValue="Storgatan">
          <Autocomplete.Control>
            <Autocomplete.Input autoComplete="address-line1" />
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
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
      {sent === undefined ? null : (
        <p>
          {texts.sent}: {sent}
        </p>
      )}
    </form>
  )
}
