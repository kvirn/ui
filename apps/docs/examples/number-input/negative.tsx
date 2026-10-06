'use client'
import { Field, NumberInput } from '@kvirn-ui/react'
import { useNumberInputTexts } from './texts.ts'

export function Negative() {
  const { texts, textLang } = useNumberInputTexts()
  return (
    <Field.Root lang={textLang}>
      <Field.Label>{texts.balance}</Field.Label>
      <NumberInput name="balance" allowNegative className="kv-input--width-10" />
      <Field.HelpText>{texts.balanceHint}</Field.HelpText>
    </Field.Root>
  )
}
