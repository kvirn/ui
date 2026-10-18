'use client'
import { Field, RadioGroup } from '@kvirn-ui/react'
import { useRadioGroupTexts } from './texts.ts'

export function OptionHelpTextRadioGroup() {
  const { texts } = useRadioGroupTexts()
  return (
    <RadioGroup.Root name="duration">
      <RadioGroup.Legend>{texts.legend}</RadioGroup.Legend>
      <RadioGroup.Option>
        <RadioGroup.Radio value="1" />
        <Field.Label>{texts.oneMonth}</Field.Label>
      </RadioGroup.Option>
      <RadioGroup.Option>
        <RadioGroup.Radio value="6" />
        <Field.Label>{texts.sixMonths}</Field.Label>
        <Field.HelpText>{texts.sixMonthsHelp}</Field.HelpText>
      </RadioGroup.Option>
      <RadioGroup.Option>
        <RadioGroup.Radio value="12" />
        <Field.Label>{texts.twelveMonths}</Field.Label>
      </RadioGroup.Option>
      <RadioGroup.HelpText>{texts.groupHelp}</RadioGroup.HelpText>
    </RadioGroup.Root>
  )
}
