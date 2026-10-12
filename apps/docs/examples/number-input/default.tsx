'use client'
import { Field, NumberInput } from '@kvirn-ui/react'
import { useNumberInputTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultNumberInput() {
  const { texts, isFallback } = useNumberInputTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root required>
        <Field.Label>{texts.children}</Field.Label>
        <NumberInput name="children" className="kv-input--width-2" />
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
