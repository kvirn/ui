'use client'
import { Combobox, Field } from '@kvirn-ui/react'
import { municipalities } from '../listbox/data.ts'
import type { Municipality } from '../listbox/data.ts'
import { useComboboxTexts } from './texts.ts'

export function RichOptionsCombobox() {
  const { texts } = useComboboxTexts()
  return (
    <Field.Root>
      <Field.Label>{texts.municipality}</Field.Label>
      <Combobox.Root
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
      >
        <Combobox.Input />
        <Combobox.Popup>
          <Combobox.List>
            {(municipality: Municipality) => (
              <Combobox.Option item={municipality}>
                <Combobox.OptionText>{municipality.name}</Combobox.OptionText>
                <Combobox.OptionDescription>{municipality.county}</Combobox.OptionDescription>
                <Combobox.OptionIndicator />
              </Combobox.Option>
            )}
          </Combobox.List>
          <Combobox.Empty />
        </Combobox.Popup>
      </Combobox.Root>
    </Field.Root>
  )
}
