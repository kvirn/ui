'use client'
import { Field, RadioGroup, TextInput } from '@kvirn-ui/react'
import { useRadioGroupTexts } from './texts.ts'

export function OtherOptionRadioGroup() {
  const { texts } = useRadioGroupTexts()
  return (
    <RadioGroup.Root name="source">
      <RadioGroup.Legend>{texts.sourceLegend}</RadioGroup.Legend>
      <RadioGroup.Option>
        <RadioGroup.Radio value="letter" />
        <Field.Label>{texts.sourceLetter}</Field.Label>
      </RadioGroup.Option>
      <RadioGroup.Option>
        <RadioGroup.Radio value="colleague" />
        <Field.Label>{texts.sourceColleague}</Field.Label>
      </RadioGroup.Option>
      <RadioGroup.Option>
        <RadioGroup.Radio value="other" />
        <Field.Label>{texts.sourceOther}</Field.Label>
      </RadioGroup.Option>
      <RadioGroup.Reveal value="other">
        <Field.Root>
          <Field.Label>{texts.sourceSpecify}</Field.Label>
          <TextInput name="source-other" />
        </Field.Root>
      </RadioGroup.Reveal>
    </RadioGroup.Root>
  )
}
