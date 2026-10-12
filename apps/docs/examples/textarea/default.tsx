'use client'
import { Field, Textarea } from '@kvirn-ui/react'
import { useTextareaTexts } from './texts.ts'

export function DefaultTextarea() {
  const { texts } = useTextareaTexts()
  return (
    <Field.Root required>
      <Field.Label>{texts.label}</Field.Label>
      <Field.Prose>
        <p>{texts.description}</p>
      </Field.Prose>
      <Textarea name="situation" />
    </Field.Root>
  )
}
