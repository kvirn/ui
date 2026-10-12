'use client'
import { Field, Listbox } from '@kvirn-ui/react'
import { municipalities } from './data.ts'
import type { Municipality } from './data.ts'
import { useListboxTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultListbox() {
  const { texts, isFallback } = useListboxTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root required>
        <Field.Label>{texts.municipality}</Field.Label>
        <Listbox.Root
          native="never"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          placeholder={texts.municipalityPlaceholder}
        >
          <Listbox.Trigger />
          <Listbox.Popup>
            <Listbox.List>
              {(municipality: Municipality) => <Listbox.Option item={municipality} />}
            </Listbox.List>
            <Listbox.Empty />
          </Listbox.Popup>
        </Listbox.Root>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
