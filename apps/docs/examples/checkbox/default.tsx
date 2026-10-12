'use client'
import { Checkbox, Field } from '@kvirn-ui/react'
import { useCheckboxTexts } from './texts.ts'

export function DefaultCheckbox() {
  const { texts } = useCheckboxTexts()
  return (
    <Field.Root>
      <Checkbox name="newsletter" />
      <Field.Label>{texts.newsletter}</Field.Label>
    </Field.Root>
  )
}
