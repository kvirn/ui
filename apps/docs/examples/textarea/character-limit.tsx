'use client'
import { Field, Textarea } from '@kvirn-ui/react'
import { useTextareaTexts } from './texts.ts'

export function CharacterLimit() {
  const { texts, textLang } = useTextareaTexts()
  return (
    <Field.Root required lang={textLang}>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <Textarea name="situation" maxLength={200} characterCount />
    </Field.Root>
  )
}
