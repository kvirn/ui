'use client'
import { Autocomplete, Field } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { streets } from './data.ts'
import { useAutocompleteTexts } from './texts.ts'

// Stands in for your server: it answers after a short wait.
const search = (query: string) =>
  streets.filter((street) => street.toLowerCase().includes(query.trim().toLowerCase()))

export function ServerSuggestionsAutocomplete() {
  const { texts, textLang } = useAutocompleteTexts()
  const [suggestions, setSuggestions] = useState<readonly string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.street}</Field.Label>
      <Autocomplete.Root
        items={suggestions}
        filter={false}
        isLoading={isLoading}
        onValueChange={(text, { reason }) => {
          if (reason !== 'input') {
            return
          }
          clearTimeout(timer.current)
          if (text.trim() === '') {
            setSuggestions([])
            setIsLoading(false)
            return
          }
          setIsLoading(true)
          timer.current = setTimeout(() => {
            setSuggestions(search(text))
            setIsLoading(false)
          }, 800)
        }}
      >
        <Autocomplete.Input />
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(street: string) => <Autocomplete.Option item={street} />}
          </Autocomplete.List>
          <Autocomplete.Empty />
        </Autocomplete.Popup>
      </Autocomplete.Root>
    </Field.Root>
  )
}
