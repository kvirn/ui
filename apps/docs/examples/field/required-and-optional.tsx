'use client'
import { Field, Stack, TextInput } from '@kvirn-ui/react'
import { useFieldTexts } from './texts.ts'

export function RequiredAndOptional() {
  const { texts, textLang } = useFieldTexts()
  return (
    <Stack className="kv-stack--gap-8" lang={textLang}>
      <Field.Root required>
        <Field.Label>{texts.email}</Field.Label>
        <TextInput name="email" type="email" autoComplete="email" />
      </Field.Root>
      <Field.Root>
        <Field.Label>{texts.phone}</Field.Label>
        <TextInput name="phone" type="tel" autoComplete="tel" />
      </Field.Root>
      <Field.Root>
        <Field.Label marker="none">{texts.search}</Field.Label>
        <TextInput name="search" type="search" />
      </Field.Root>
    </Stack>
  )
}
