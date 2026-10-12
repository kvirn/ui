'use client'
import { Field, NumberInput } from '@kvirn-ui/react'
import { useNumberInputTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function PlainTextBox() {
  const { texts, isFallback } = useNumberInputTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
        <Field.Label>{texts.pasted}</Field.Label>
        <NumberInput name="pasted" mask={false} className="kv-input--width-10" />
        <Field.HelpText>{texts.pastedHint}</Field.HelpText>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
