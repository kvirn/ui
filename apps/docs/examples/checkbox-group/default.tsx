'use client'
import { Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import { useCheckboxGroupTexts } from './texts.ts'

export function DefaultCheckboxGroup() {
  const { texts } = useCheckboxGroupTexts()
  return (
    <CheckboxGroup.Root name="contact">
      <CheckboxGroup.Legend>{texts.legend}</CheckboxGroup.Legend>
      <CheckboxGroup.Prose>
        <p>{texts.hint}</p>
      </CheckboxGroup.Prose>
      <CheckboxGroup.Option>
        <Checkbox value="email" />
        <Field.Label>{texts.email}</Field.Label>
      </CheckboxGroup.Option>
      <CheckboxGroup.Option>
        <Checkbox value="text" />
        <Field.Label>{texts.text}</Field.Label>
      </CheckboxGroup.Option>
      <CheckboxGroup.Option>
        <Checkbox value="letter" />
        <Field.Label>{texts.letter}</Field.Label>
      </CheckboxGroup.Option>
    </CheckboxGroup.Root>
  )
}
