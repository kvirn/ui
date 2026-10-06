'use client'
import { Button, Field, Stack, TextInput } from '@kvirn-ui/react'
import { useState } from 'react'
import { useTextInputTexts } from './texts.ts'

export function PlainForm() {
  const { texts, textLang } = useTextInputTexts()
  const [sent, setSent] = useState<string | undefined>()
  return (
    <>
      <Stack
        gap="8"
        lang={textLang}
        render={
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              setSent(
                [data.get('name'), data.get('email')]
                  .filter((value) => typeof value === 'string')
                  .join(', '),
              )
            }}
          />
        }
      >
        <Field.Root required>
          <Field.Label>{texts.fullName}</Field.Label>
          <TextInput name="name" autoComplete="name" defaultValue="Anna Andersson" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{texts.email}</Field.Label>
          <TextInput name="email" type="email" autoComplete="email" />
        </Field.Root>
        <Button type="submit" className="kv-button--primary">
          {texts.send}
        </Button>
      </Stack>
      {sent === undefined ? null : (
        <p lang={textLang}>
          {texts.sent}: {sent}
        </p>
      )}
    </>
  )
}
