'use client'
import { Field, Listbox } from '@kvirn-ui/react'
import { languages } from './data.ts'
import type { Language } from './data.ts'
import { useListboxTexts } from './texts.ts'

export function LanguageSwitcherListbox() {
  const { texts, textLang } = useListboxTexts()
  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.language}</Field.Label>
      <Listbox.Root
        native="never"
        items={languages}
        itemToString={(language) => language.name}
        itemToKey={(language) => language.code}
        itemToLang={(language) => language.code}
        defaultValue="sv"
      >
        <Listbox.Trigger />
        <Listbox.Popup>
          <Listbox.List>{(language: Language) => <Listbox.Option item={language} />}</Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}
