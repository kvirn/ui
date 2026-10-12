'use client'
import { Field, Listbox } from '@kvirn-ui/react'
import { municipalities } from './data.ts'
import { useListboxTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function NativeSelect() {
  const { texts, isFallback } = useListboxTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root required>
        <Field.Label>{texts.municipality}</Field.Label>
        <Listbox.Root
          native="always"
          items={municipalities}
          itemToString={(municipality) => municipality.name}
          itemToKey={(municipality) => municipality.code}
          placeholder={texts.municipalityPlaceholder}
          name="municipality"
          autoComplete="address-level2"
        />
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
