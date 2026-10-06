'use client'
import { Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { useCheckboxGroupTexts } from './texts.ts'

export function ControlledCheckboxGroup() {
  const { texts, textLang } = useCheckboxGroupTexts()
  // This state stands in for your form library: the group only reports and renders.
  const [contact, setContact] = useState<string[]>(['email'])
  return (
    <div lang={textLang}>
      <CheckboxGroup.Root name="contact" value={contact} onValueChange={setContact}>
        <CheckboxGroup.Legend>{texts.legend}</CheckboxGroup.Legend>
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
      <p>
        {texts.youChose}: {contact.length === 0 ? texts.nothing : contact.join(', ')}
      </p>
    </div>
  )
}
