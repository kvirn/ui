'use client'
import { Combobox, Field } from '@kvirn-ui/react'
import { municipalities } from '../listbox/data.ts'
import type { Municipality } from '../listbox/data.ts'
import { useComboboxTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function SeveralCombobox() {
  const { texts, isFallback } = useComboboxTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
        <Field.Label>{texts.several}</Field.Label>
        <Field.Prose>
          <p>{texts.severalHint}</p>
        </Field.Prose>
        <Combobox.Root
          multiple
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          defaultValue={['malmo', 'uppsala']}
        >
          <Combobox.ValueList />
          <Combobox.Input />
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
