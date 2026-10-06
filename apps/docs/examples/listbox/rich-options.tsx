'use client'
import { Field, Icon, Listbox } from '@kvirn-ui/react'
import { findMunicipality } from './data.ts'
import type { Municipality } from './data.ts'
import { useListboxTexts } from './texts.ts'

const richMunicipalities = [
  findMunicipality('goteborg'),
  findMunicipality('malmo'),
  findMunicipality('stockholm'),
  findMunicipality('uppsala'),
]

export function RichOptionsListbox() {
  const { texts, textLang } = useListboxTexts()
  return (
    <Field.Root required lang={textLang}>
      <Field.Label>{texts.municipality}</Field.Label>
      <Listbox.Root
        native="never"
        items={richMunicipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        placeholder={texts.municipalityPlaceholder}
      >
        <Listbox.Trigger />
        <Listbox.Popup>
          <Listbox.List>
            {(municipality: Municipality) => (
              <Listbox.Option item={municipality}>
                <Listbox.OptionIcon>
                  <Icon name="document" />
                </Listbox.OptionIcon>
                <Listbox.OptionText>{municipality.name}</Listbox.OptionText>
                <Listbox.OptionDescription>{municipality.county}</Listbox.OptionDescription>
                <Listbox.OptionIndicator />
              </Listbox.Option>
            )}
          </Listbox.List>
        </Listbox.Popup>
      </Listbox.Root>
    </Field.Root>
  )
}
