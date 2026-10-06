'use client'
import { Field, RadioGroup } from '@kvirn-ui/react'
import { useRadioGroupTexts } from './texts.ts'

export function OptionHelpTextRadioGroup() {
  const { texts, textLang } = useRadioGroupTexts()
  return (
    <RadioGroup.Root name="duration" lang={textLang}>
      <RadioGroup.Legend>{texts.legend}</RadioGroup.Legend>
      <Field.Root>
        <RadioGroup.Radio value="1" />
        <Field.Label>{texts.oneMonth}</Field.Label>
      </Field.Root>
      <Field.Root>
        <RadioGroup.Radio value="6" />
        <Field.Label>{texts.sixMonths}</Field.Label>
        <Field.HelpText>{texts.sixMonthsHelp}</Field.HelpText>
      </Field.Root>
      <Field.Root>
        <RadioGroup.Radio value="12" />
        <Field.Label>{texts.twelveMonths}</Field.Label>
      </Field.Root>
      <RadioGroup.HelpText>{texts.groupHelp}</RadioGroup.HelpText>
    </RadioGroup.Root>
  )
}
