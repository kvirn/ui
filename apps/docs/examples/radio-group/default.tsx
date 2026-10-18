'use client'
import { Field, RadioGroup } from '@kvirn-ui/react'
import { useRadioGroupTexts } from './texts.ts'

export function DefaultRadioGroup() {
  const { texts } = useRadioGroupTexts()
  return (
    <RadioGroup.Root name="duration">
      <RadioGroup.Legend>{texts.legend}</RadioGroup.Legend>
      <RadioGroup.Prose>
        <p>{texts.hint}</p>
      </RadioGroup.Prose>
      <RadioGroup.Option>
        <RadioGroup.Radio value="1" />
        <Field.Label>{texts.oneMonth}</Field.Label>
      </RadioGroup.Option>
      <RadioGroup.Option>
        <RadioGroup.Radio value="6" />
        <Field.Label>{texts.sixMonths}</Field.Label>
      </RadioGroup.Option>
      <RadioGroup.Option>
        <RadioGroup.Radio value="12" />
        <Field.Label>{texts.twelveMonths}</Field.Label>
      </RadioGroup.Option>
    </RadioGroup.Root>
  )
}
