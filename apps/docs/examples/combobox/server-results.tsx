'use client'
import { Combobox, Field } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { municipalities } from '../listbox/data.ts'
import type { Municipality } from '../listbox/data.ts'
import { useComboboxTexts } from './texts.ts'

// Stands in for your server: it answers after a short wait.
const search = (query: string) =>
  municipalities.filter((municipality) =>
    municipality.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

export function ServerResultsCombobox() {
  const { texts, textLang } = useComboboxTexts()
  const [results, setResults] = useState<readonly Municipality[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.municipality}</Field.Label>
      <Field.Prose>
        <p>{texts.hint}</p>
      </Field.Prose>
      <Combobox.Root
        items={results}
        itemToString={(municipality) => municipality.name}
        itemToKey={(municipality) => municipality.code}
        filter={false}
        isLoading={isLoading}
        onInputValueChange={(text, { reason }) => {
          if (reason !== 'input') {
            return
          }
          clearTimeout(timer.current)
          if (text.trim() === '') {
            setResults([])
            setIsLoading(false)
            return
          }
          setIsLoading(true)
          timer.current = setTimeout(() => {
            setResults(search(text))
            setIsLoading(false)
          }, 800)
        }}
      >
        <Combobox.Control>
          <Combobox.Input />
          <Combobox.Clear />
        </Combobox.Control>
        <Combobox.Popup>
          <Combobox.List>
            {(municipality: Municipality) => <Combobox.Option item={municipality} />}
          </Combobox.List>
          <Combobox.Empty />
        </Combobox.Popup>
      </Combobox.Root>
    </Field.Root>
  )
}
