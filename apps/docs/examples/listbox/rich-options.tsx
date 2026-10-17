'use client'
import { document as documentIcon } from '@kvirn-ui/icons'
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
  const { texts } = useListboxTexts()
  return (
    <Field.Root required>
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
                  <Icon icon={documentIcon} />
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
