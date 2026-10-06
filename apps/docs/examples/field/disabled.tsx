'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useFieldTexts } from './texts.ts'

export function DisabledWithReason() {
  const { texts, textLang } = useFieldTexts()
  return (
    <Field.Root disabled lang={textLang}>
      <Field.Label>{texts.lockedName}</Field.Label>
      <TextInput name="name" defaultValue="Anna Andersson" />
      <Field.HelpText>{texts.lockedHelpText}</Field.HelpText>
    </Field.Root>
  )
}
