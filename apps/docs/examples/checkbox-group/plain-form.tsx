'use client'
import { Button, Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { useCheckboxGroupTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function PlainFormCheckboxGroup() {
  const { texts, isFallback } = useCheckboxGroupTexts()
  const [sent, setSent] = useState<string[] | undefined>(undefined)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setSent(new FormData(event.currentTarget).getAll('contact').map(String))
        }}
      >
        <CheckboxGroup.Root name="contact" defaultValue={['text']}>
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
        <Button type="submit" className="kv-button--primary">
          {texts.send}
        </Button>
        {sent === undefined ? null : (
          <p>
            {texts.sent}: {sent.join(', ')}
          </p>
        )}
      </form>
    </InEnglishWhenFallback>
  )
}
