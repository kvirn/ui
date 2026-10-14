'use client'
import { Field, Stack, TextInput, Textarea, useAnnouncer } from '@kvirn-ui/react'
import { useState } from 'react'
import { useAnnouncerTexts } from './texts.ts'

export function AutosaveAnnouncer() {
  const { texts } = useAnnouncerTexts()
  const { announce } = useAnnouncer()
  const [isSaved, setIsSaved] = useState(false)

  // A real app saves to the server here. Tabbing through the fields saves on every blur, so the
  // spoken message is limited to once every 30 seconds. The visible text stays.
  const save = () => {
    setIsSaved(true)
    announce(texts.draft.saved, { key: 'draft', throttleMilliseconds: 30_000 })
  }

  return (
    <Stack className="kv-stack--gap-4">
      <Field.Root>
        <Field.Label marker="none">{texts.draft.street}</Field.Label>
        <TextInput autoComplete="street-address" onBlur={save} />
      </Field.Root>
      <Field.Root>
        <Field.Label marker="none">{texts.draft.description}</Field.Label>
        <Textarea onBlur={save} />
      </Field.Root>
      {isSaved ? <p>{texts.draft.saved}</p> : null}
    </Stack>
  )
}
