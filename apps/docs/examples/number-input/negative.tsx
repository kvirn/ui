'use client'
import { Field, NumberInput } from '@kvirn-ui/react'
import { useNumberInputTexts } from './texts.ts'

export function Negative() {
  const { texts } = useNumberInputTexts()
  return (
    <Field.Root>
      <Field.Label>{texts.result}</Field.Label>
      <NumberInput name="result" allowNegative className="kv-input--width-10" />
      <Field.HelpText>{texts.resultHint}</Field.HelpText>
    </Field.Root>
  )
}
