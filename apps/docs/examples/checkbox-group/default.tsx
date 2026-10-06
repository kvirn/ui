'use client'
import { Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import { useCheckboxGroupTexts } from './texts.ts'

export function DefaultCheckboxGroup() {
  const { texts, textLang } = useCheckboxGroupTexts()
  return (
    <CheckboxGroup.Root name="contact" lang={textLang}>
      <CheckboxGroup.Legend>{texts.legend}</CheckboxGroup.Legend>
      <CheckboxGroup.Prose>
        <p>{texts.hint}</p>
      </CheckboxGroup.Prose>
      <Field.Root>
        <Checkbox value="email" />
        <Field.Label>{texts.email}</Field.Label>
      </Field.Root>
      <Field.Root>
        <Checkbox value="text" />
        <Field.Label>{texts.text}</Field.Label>
      </Field.Root>
      <Field.Root>
        <Checkbox value="letter" />
        <Field.Label>{texts.letter}</Field.Label>
      </Field.Root>
    </CheckboxGroup.Root>
  )
}
