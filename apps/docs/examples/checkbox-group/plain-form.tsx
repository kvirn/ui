'use client'
import { Button, Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { useCheckboxGroupTexts } from './texts.ts'

export function PlainFormCheckboxGroup() {
  const { texts } = useCheckboxGroupTexts()
  const [sent, setSent] = useState<string[] | undefined>(undefined)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setSent(new FormData(event.currentTarget).getAll('contact').map(String))
      }}
    >
      <CheckboxGroup.Root name="contact" defaultValue={['text']}>
        <CheckboxGroup.Legend>{texts.legend}</CheckboxGroup.Legend>
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
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
      {sent === undefined ? null : (
        <p>
          {texts.sent}: {sent.join(', ')}
        </p>
      )}
    </form>
  )
}
