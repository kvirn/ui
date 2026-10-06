'use client'
import { Button, Combobox, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { municipalities } from '../listbox/data.ts'
import type { Municipality } from '../listbox/data.ts'
import { useComboboxTexts } from './texts.ts'

export function PlainFormCombobox() {
  const { texts, textLang } = useComboboxTexts()
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      lang={textLang}
      onSubmit={(event) => {
        // A real form sends the data from here.
        event.preventDefault()
        const value = new FormData(event.currentTarget).get('municipality')
        setSent(typeof value === 'string' ? value : '')
      }}
    >
      <Field.Root required>
        <Field.Label>{texts.municipality}</Field.Label>
        <Combobox.Root
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          name="municipality"
          defaultValue="goteborg"
        >
          <Combobox.Control>
            <Combobox.Input />
            <Combobox.Clear />
            <Combobox.Toggle />
          </Combobox.Control>
          <Combobox.Popup>
            <Combobox.List>
              {(municipality: Municipality) => <Combobox.Option item={municipality} />}
            </Combobox.List>
            <Combobox.Empty />
          </Combobox.Popup>
        </Combobox.Root>
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
