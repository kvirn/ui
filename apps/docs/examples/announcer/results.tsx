'use client'
import { Field, Stack, TextInput, useAnnouncer } from '@kvirn-ui/react'
import { useEffect, useState } from 'react'
import { useAnnouncerTexts } from './texts.ts'

export function ResultCountAnnouncer() {
  const { texts } = useAnnouncerTexts()
  const { announce } = useAnnouncer()
  const [query, setQuery] = useState('')
  const needle = query.trim().toLocaleLowerCase()
  const matches = texts.search.services.filter((service) =>
    service.toLocaleLowerCase().includes(needle),
  )
  const message = texts.search.results(matches.length)

  useEffect(() => {
    if (needle === '') {
      return
    }
    // Wait until the user pauses, so one search is one message.
    const timer = setTimeout(() => announce(message), 500)
    return () => clearTimeout(timer)
  }, [announce, message, needle])

  return (
    <Stack className="kv-stack--gap-4">
      <Field.Root>
        <Field.Label marker="none">{texts.search.label}</Field.Label>
        <TextInput
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
      </Field.Root>
      <p>{message}</p>
      <ul>
        {matches.map((service) => (
          <li key={service}>{service}</li>
        ))}
      </ul>
    </Stack>
  )
}
