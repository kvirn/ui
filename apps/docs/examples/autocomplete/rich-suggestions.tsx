'use client'
import { Autocomplete, Field, Icon } from '@kvirn-ui/react'
import { streetsWithDistrict } from './data.ts'
import type { Street } from './data.ts'
import { useAutocompleteTexts } from './texts.ts'

export function RichSuggestionsAutocomplete() {
  const { texts, textLang } = useAutocompleteTexts()
  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.street}</Field.Label>
      <Autocomplete.Root items={streetsWithDistrict} itemToString={(street) => street.name}>
        <Autocomplete.Input />
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: Street) => (
              <Autocomplete.Option item={street}>
                <Autocomplete.OptionIcon>
                  <Icon name="document" />
                </Autocomplete.OptionIcon>
                <Autocomplete.OptionText>{street.name}</Autocomplete.OptionText>
                <Autocomplete.OptionDescription>{street.district}</Autocomplete.OptionDescription>
              </Autocomplete.Option>
            )}
          </Autocomplete.List>
          <Autocomplete.Empty />
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}
