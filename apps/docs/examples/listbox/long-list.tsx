'use client'
import { Field, Listbox } from '@kvirn-ui/react'
import { places } from './data.ts'
import type { Place } from './data.ts'
import { useListboxTexts } from './texts.ts'

export function LongListListbox() {
  const { texts, textLang } = useListboxTexts()
  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.place}</Field.Label>
      <Listbox.Root
        native="never"
        virtualize
        items={places}
        itemToString={(place) => place.name}
        itemToKey={(place) => place.code}
        placeholder={texts.placePlaceholder}
      >
        <Listbox.Trigger />
        <Listbox.Popup>
          <Listbox.List>{(place: Place) => <Listbox.Option item={place} />}</Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}
