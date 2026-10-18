'use client'
import { Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import { useCheckboxGroupTexts } from './texts.ts'

export function OptionHelpTextCheckboxGroup() {
  const { texts } = useCheckboxGroupTexts()
  return (
    <CheckboxGroup.Root name="contact" defaultValue={['email']}>
      <CheckboxGroup.Legend>{texts.legend}</CheckboxGroup.Legend>
      <CheckboxGroup.Option>
        <Checkbox value="email" />
        <Field.Label>{texts.email}</Field.Label>
        <Field.HelpText>{texts.emailHelp}</Field.HelpText>
      </CheckboxGroup.Option>
      <CheckboxGroup.Option>
        <Checkbox value="text" />
        <Field.Label>{texts.text}</Field.Label>
      </CheckboxGroup.Option>
      <CheckboxGroup.Option>
        <Checkbox value="letter" />
        <Field.Label>{texts.letter}</Field.Label>
      </CheckboxGroup.Option>
      <CheckboxGroup.HelpText>{texts.groupHelp}</CheckboxGroup.HelpText>
    </CheckboxGroup.Root>
  )
}
