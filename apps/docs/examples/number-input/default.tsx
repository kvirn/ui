'use client'
import { Field, NumberInput } from '@kvirn-ui/react'
import { useNumberInputTexts } from './texts.ts'

export function DefaultNumberInput() {
  const { texts } = useNumberInputTexts()
  return (
    <Field.Root required>
      <Field.Label>{texts.children}</Field.Label>
      <NumberInput name="children" className="kv-input--width-2" />
    </Field.Root>
  )
}
