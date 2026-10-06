'use client'
import { Field, Listbox } from '@kvirn-ui/react'
import { municipalities } from './data.ts'
import type { Municipality } from './data.ts'
import { useListboxTexts } from './texts.ts'

export function SeveralListbox() {
  const { texts, textLang } = useListboxTexts()
  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.several}</Field.Label>
      <Listbox.Root
        native="never"
        multiple
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        defaultValue={['malmo', 'uppsala']}
        placeholder={texts.severalPlaceholder}
      >
        <Listbox.Trigger />
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => <Listbox.Option item={municipality} />}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}
