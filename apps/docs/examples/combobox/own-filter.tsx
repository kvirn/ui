'use client'
import { Combobox, Field } from '@kvirn-ui/react'
import { municipalities } from '../listbox/data.ts'
import type { Municipality } from '../listbox/data.ts'
import { useComboboxTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function OwnFilterCombobox() {
  const { texts, isFallback } = useComboboxTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
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
    </InEnglishWhenFallback>
  )
}
