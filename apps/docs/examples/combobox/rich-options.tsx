'use client'
import { Combobox, Field, Icon } from '@kvirn-ui/react'
import { municipalities } from '../listbox/data.ts'
import type { Municipality } from '../listbox/data.ts'
import { useComboboxTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function RichOptionsCombobox() {
  const { texts, isFallback } = useComboboxTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
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
                  <Combobox.OptionIcon>
                    <Icon name="document" />
                  </Combobox.OptionIcon>
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
    </InEnglishWhenFallback>
  )
}
