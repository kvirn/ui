'use client'
import { Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import { useCheckboxGroupTexts } from './texts.ts'

export function DisabledCheckboxGroup() {
  const { texts } = useCheckboxGroupTexts()
  return (
    <CheckboxGroup.Root name="contact" defaultValue={['letter']} disabled>
      <CheckboxGroup.Legend>{texts.disabledLegend}</CheckboxGroup.Legend>
      <CheckboxGroup.Option>
        <Checkbox value="text" />
        <Field.Label>{texts.text}</Field.Label>
      </CheckboxGroup.Option>
      <CheckboxGroup.Option>
        <Checkbox value="letter" />
        <Field.Label>{texts.letter}</Field.Label>
      </CheckboxGroup.Option>
      <CheckboxGroup.HelpText>{texts.disabledHelp}</CheckboxGroup.HelpText>
    </CheckboxGroup.Root>
  )
}
