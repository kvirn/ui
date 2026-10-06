'use client'
import { Field, TextInput } from '@kvirn-ui/react'
import { useFieldTexts } from './texts.ts'

export function DescriptionAndHelpText() {
  const { texts, textLang } = useFieldTexts()
  return (
    <Field.Root required lang={textLang}>
      <Field.Label>{texts.email}</Field.Label>
      <Field.Prose>
        <p>{texts.emailDescription}</p>
      </Field.Prose>
      <TextInput name="email" type="email" autoComplete="email" />
      <Field.HelpText>{texts.emailHelpText}</Field.HelpText>
    </Field.Root>
  )
}
