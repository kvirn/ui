'use client'
import { Field, RadioGroup } from '@kvirn-ui/react'
import { useRadioGroupTexts } from './texts.ts'

export function DisabledOptionRadioGroup() {
  const { texts, textLang } = useRadioGroupTexts()
  return (
    <RadioGroup.Root name="duration" defaultValue="12" lang={textLang}>
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
  )
}
