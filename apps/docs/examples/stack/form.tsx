'use client'
import { Button, Heading, Stack } from '@kvirn-ui/react'
import { useId } from 'react'
import { useStackTexts } from './texts.ts'

export function StackedForm() {
  const { texts, textLang } = useStackTexts()
  const nameId = useId()
  const emailId = useId()
  return (
    <Stack gap="4" as="form" onSubmit={(event) => event.preventDefault()} lang={textLang}>
      <Heading as="h2">{texts.form.title}</Heading>
      <Stack gap="2">
        <label htmlFor={nameId}>{texts.form.name}</label>
        <input id={nameId} autoComplete="name" />
      </Stack>
      <Stack gap="2">
        <label htmlFor={emailId}>{texts.form.email}</label>
        <input id={emailId} type="email" autoComplete="email" />
      </Stack>
      <Button type="submit">{texts.form.send}</Button>
    </Stack>
  )
}
