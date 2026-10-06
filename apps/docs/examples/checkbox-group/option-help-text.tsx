'use client'
import { Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import { useCheckboxGroupTexts } from './texts.ts'

export function OptionHelpTextCheckboxGroup() {
  const { texts, textLang } = useCheckboxGroupTexts()
  return (
    <CheckboxGroup.Root name="contact" defaultValue={['email']} lang={textLang}>
      <CheckboxGroup.Legend>{texts.legend}</CheckboxGroup.Legend>
      <Field.Root>
        <Checkbox value="email" />
        <Field.Label>{texts.email}</Field.Label>
        <Field.HelpText>{texts.emailHelp}</Field.HelpText>
      </Field.Root>
      <Field.Root>
        <Checkbox value="text" />
        <Field.Label>{texts.text}</Field.Label>
      </Field.Root>
      <Field.Root>
        <Checkbox value="letter" />
        <Field.Label>{texts.letter}</Field.Label>
      </Field.Root>
      <CheckboxGroup.HelpText>{texts.groupHelp}</CheckboxGroup.HelpText>
    </CheckboxGroup.Root>
  )
}
