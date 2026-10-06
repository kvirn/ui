'use client'
import { Combobox, Field } from '@kvirn-ui/react'
import { places } from '../listbox/data.ts'
import type { Place } from '../listbox/data.ts'
import { useComboboxTexts } from './texts.ts'

export function LongListCombobox() {
  const { texts, textLang } = useComboboxTexts()
  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.place}</Field.Label>
      <Field.Prose>
        <p>{texts.placeHint}</p>
      </Field.Prose>
      <Combobox.Root
        virtualize
        items={places}
        itemToString={(place) => place.name}
        itemToKey={(place) => place.code}
      >
        <Combobox.Control>
          <Combobox.Input />
          <Combobox.Clear />
          <Combobox.Toggle />
        </Combobox.Control>
        <Combobox.Popup>
          <Combobox.List>{(place: Place) => <Combobox.Option item={place} />}</Combobox.List>
          <Combobox.Empty />
        </Combobox.Popup>
      </Combobox.Root>
    </Field.Root>
  )
}
