'use client'
import { Field, Heading, TextInput, useRouteFocus } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useRouteFocusTexts } from './texts.ts'

export function SearchAsYouType() {
  const { texts } = useRouteFocusTexts()
  const [query, setQuery] = useState('')
  const pageRef = useRef<HTMLDivElement>(null)
  const address = query === '' ? '/search' : `/search?q=${encodeURIComponent(query)}`
  // The search is part of the key, so every keystroke changes it. The hook leaves focus in the
  // field while the visitor types.
  useRouteFocus({ key: address, containerRef: pageRef, selector: 'h4' })
  return (
    <div ref={pageRef}>
      <Heading as="h4">{texts.search.title}</Heading>
      <Field.Root>
        <Field.Label>{texts.search.label}</Field.Label>
        <TextInput name="q" autoComplete="off" value={query} onValueChange={setQuery} />
      </Field.Root>
      <p>
        {texts.search.address} <code>{address}</code>
      </p>
    </div>
  )
}
