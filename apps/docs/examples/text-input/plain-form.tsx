'use client'
import { Button, Field, Stack, TextInput } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useTextInputTexts } from './texts.ts'

const valueOf = (data: FormData, name: string) => {
  const value = data.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

export function PlainForm() {
  const { texts } = useTextInputTexts()
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const [nameError, setNameError] = useState<string | undefined>()
  const [emailError, setEmailError] = useState<string | undefined>()
  const [attempts, setAttempts] = useState(0)
  const [sent, setSent] = useState<string | undefined>()

  // Focus moves after the errors have rendered, so the screen reader reads them with the box.
  useEffect(() => {
    if (attempts > 0 && nameError !== undefined) {
      nameRef.current?.focus()
    } else if (attempts > 0 && emailError !== undefined) {
      emailRef.current?.focus()
    }
  }, [attempts, nameError, emailError])

  return (
    <>
      <Stack
        className="kv-stack--gap-8"
        as="form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          const name = valueOf(data, 'name')
          const email = valueOf(data, 'email')
          setNameError(name === '' ? texts.nameMissing : undefined)
          setEmailError(email === '' ? texts.emailMissing : undefined)
          setSent(name === '' || email === '' ? undefined : `${name}, ${email}`)
          setAttempts((count) => count + 1)
        }}
      >
        <Field.Root required invalid={nameError !== undefined}>
          <Field.Label>{texts.fullName}</Field.Label>
          <TextInput ref={nameRef} name="name" autoComplete="name" defaultValue="Anna Andersson" />
          <Field.ErrorMessage>{nameError}</Field.ErrorMessage>
        </Field.Root>
        <Field.Root required invalid={emailError !== undefined}>
          <Field.Label>{texts.email}</Field.Label>
          <TextInput ref={emailRef} name="email" type="email" autoComplete="email" />
          <Field.ErrorMessage>{emailError}</Field.ErrorMessage>
        </Field.Root>
        <Button type="submit" className="kv-button--primary">
          {texts.send}
        </Button>
      </Stack>
      <output>{sent === undefined ? null : `${texts.sent}: ${sent}`}</output>
    </>
  )
}
