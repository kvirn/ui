'use client'
import { Field, Listbox } from '@kvirn-ui/react'
import { municipalities } from './data.ts'
import type { Municipality } from './data.ts'
import { useListboxTexts } from './texts.ts'

export function DisabledOptionListbox() {
  const { texts, textLang } = useListboxTexts()
  return (
    <Field.Root required lang={textLang}>
      <Field.Label>{texts.municipality}</Field.Label>
      <Field.Prose>
        <p>{texts.closedHint}</p>
      </Field.Prose>
      <Listbox.Root
        native="never"
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        isItemDisabled={(municipality) => municipality.code === 'stockholm'}
        placeholder={texts.municipalityPlaceholder}
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
