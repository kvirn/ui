'use client'
import { Field, RadioGroup } from '@kvirn-ui/react'
import { useRadioGroupTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DisabledOptionRadioGroup() {
  const { texts, isFallback } = useRadioGroupTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <RadioGroup.Root name="duration" defaultValue="12">
        <RadioGroup.Legend>{texts.legend}</RadioGroup.Legend>
        <Field.Root>
          <RadioGroup.Radio value="12" />
          <Field.Label>{texts.twelveMonths}</Field.Label>
        </Field.Root>
        <Field.Root>
          <RadioGroup.Radio value="24" disabled />
          <Field.Label>{texts.unavailable}</Field.Label>
          <Field.HelpText>{texts.unavailableHelp}</Field.HelpText>
        </Field.Root>
      </RadioGroup.Root>
    </InEnglishWhenFallback>
  )
}
