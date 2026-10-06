'use client'
import { Button, Checkbox, CheckboxGroup, Field } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useCheckboxGroupTexts } from './texts.ts'

export function ErrorOnSubmitCheckboxGroup() {
  const { texts, textLang } = useCheckboxGroupTexts()
  const [contact, setContact] = useState<string[]>([])
  const [attempts, setAttempts] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  const isInvalid = attempts > 0 && contact.length === 0

  // The group never moves focus: after a failed submit, you move it to the first box.
  useEffect(() => {
    if (attempts > 0) {
      formRef.current?.querySelector('input')?.focus()
    }
  }, [attempts])

  return (
    <form
      ref={formRef}
      lang={textLang}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (contact.length === 0) {
          setAttempts((count) => count + 1)
        }
      }}
    >
      <CheckboxGroup.Root
        name="contact"
        required
        invalid={isInvalid}
        value={contact}
        onValueChange={setContact}
      >
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
        <CheckboxGroup.ErrorMessage>{texts.errorMissing}</CheckboxGroup.ErrorMessage>
      </CheckboxGroup.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
    </form>
  )
}
