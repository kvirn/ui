'use client'
import { Combobox, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { municipalities } from '../listbox/data.ts'
import type { Municipality } from '../listbox/data.ts'
import { useComboboxTexts } from './texts.ts'

export function NotInListCombobox() {
  const { texts, textLang } = useComboboxTexts()
  const [value, setValue] = useState<string | null>(null)
  const [text, setText] = useState('Gö')
  const [isTouched, setIsTouched] = useState(false)
  const isInvalid = isTouched && text !== '' && value === null
  return (
    <Field.Root required invalid={isInvalid} lang={textLang}>
      <Field.Label>{texts.municipality}</Field.Label>
      <Combobox.Root
        items={municipalities}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        value={value}
        onValueChange={setValue}
        inputValue={text}
        onInputValueChange={setText}
      >
        <Combobox.Control>
          <Combobox.Input onBlur={() => setIsTouched(true)} />
          <Combobox.Clear />
          <Combobox.Toggle />
        </Combobox.Control>
        <Combobox.Popup>
          <Combobox.List>
            {(municipality: Municipality) => <Combobox.Option item={municipality} />}
          </Combobox.List>
          <Combobox.Empty />
        </Combobox.Popup>
      </Combobox.Root>
      <Field.ErrorMessage>{texts.notInList}</Field.ErrorMessage>
    </Field.Root>
  )
}
