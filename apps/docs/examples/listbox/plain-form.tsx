'use client'
import { Button, Field, Listbox } from '@kvirn-ui/react'
import { useState } from 'react'
import { municipalities } from './data.ts'
import type { Municipality } from './data.ts'
import { useListboxTexts } from './texts.ts'

export function PlainFormListbox() {
  const { texts, textLang } = useListboxTexts()
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
        <Listbox.Root
          native="never"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          name="municipality"
          defaultValue="goteborg"
        >
          <Listbox.Trigger />
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
          </Listbox.Popup>
        </Listbox.Root>
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
