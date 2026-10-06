'use client'
import { Combobox, Field } from '@kvirn-ui/react'
import { municipalities } from '../listbox/data.ts'
import type { Municipality } from '../listbox/data.ts'
import { useComboboxTexts } from './texts.ts'

export function OwnFilterCombobox() {
  const { texts, textLang } = useComboboxTexts()
  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.municipality}</Field.Label>
      <Combobox.Root
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        filter={(municipality, query) =>
          municipality.name.toLowerCase().startsWith(query.trim().toLowerCase())
        }
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
  )
}
