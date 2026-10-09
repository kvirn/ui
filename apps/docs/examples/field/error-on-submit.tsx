'use client'
import { Button, Field, Stack, TextInput } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useFieldTexts } from './texts.ts'

export function ErrorOnSubmit() {
  const { texts, textLang } = useFieldTexts()
  const inputRef = useRef<HTMLInputElement>(null)
  const [invalid, setInvalid] = useState(false)
  const [focusRequest, setFocusRequest] = useState(0)

  useEffect(() => {
    if (focusRequest > 0) {
      inputRef.current?.focus()
    }
  }, [focusRequest])

  return (
    <Stack
      gap="8"
      lang={textLang}
      as="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const isEmpty = new FormData(event.currentTarget).get('email') === ''
        setInvalid(isEmpty)
        if (isEmpty) {
          setFocusRequest((request) => request + 1)
        }
      }}
    >
      <Field.Root required invalid={invalid}>
        <Field.Label>{texts.email}</Field.Label>
        <TextInput ref={inputRef} name="email" type="email" autoComplete="email" />
        <Field.HelpText>{texts.emailHelpText}</Field.HelpText>
        <Field.ErrorMessage>{texts.emailError}</Field.ErrorMessage>
      </Field.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
    </Stack>
  )
}
