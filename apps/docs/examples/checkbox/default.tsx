'use client'
import { Checkbox, Field } from '@kvirn-ui/react'
import { useCheckboxTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultCheckbox() {
  const { texts, isFallback } = useCheckboxTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
        <Checkbox name="newsletter" />
        <Field.Label>{texts.newsletter}</Field.Label>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
