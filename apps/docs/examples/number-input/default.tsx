'use client'
import { Field, NumberInput } from '@kvirn-ui/react'
import { useNumberInputTexts } from './texts.ts'

export function DefaultNumberInput() {
  const { texts, textLang } = useNumberInputTexts()
  return (
    <Field.Root required lang={textLang}>
      <Field.Label>{texts.children}</Field.Label>
      <NumberInput name="children" className="kv-input--width-2" />
    </Field.Root>
  )
}
