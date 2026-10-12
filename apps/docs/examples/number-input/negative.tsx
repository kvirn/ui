'use client'
import { Field, NumberInput } from '@kvirn-ui/react'
import { useNumberInputTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Negative() {
  const { texts, isFallback } = useNumberInputTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
        <Field.Label>{texts.balance}</Field.Label>
        <NumberInput name="balance" allowNegative className="kv-input--width-10" />
        <Field.HelpText>{texts.balanceHint}</Field.HelpText>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
