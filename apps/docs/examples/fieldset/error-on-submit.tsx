'use client'
import { Button, Field, Fieldset, Stack, TextInput } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useFieldsetTexts } from './texts.ts'

export function GroupError() {
  const { texts, textLang } = useFieldsetTexts()
  const firstNameRef = useRef<HTMLInputElement>(null)
  const [invalid, setInvalid] = useState(false)
  const [focusRequest, setFocusRequest] = useState(0)

  useEffect(() => {
    if (focusRequest > 0) {
      firstNameRef.current?.focus()
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
        const data = new FormData(event.currentTarget)
        const isIncomplete = data.get('firstName') === '' || data.get('lastName') === ''
        setInvalid(isIncomplete)
        if (isIncomplete) {
          setFocusRequest((request) => request + 1)
        }
      }}
    >
      <Fieldset.Root group required invalid={invalid}>
        <Fieldset.Legend>{texts.nameQuestion}</Fieldset.Legend>
        <Fieldset.Prose>
          <p>{texts.nameDescription}</p>
        </Fieldset.Prose>
        <Field.Root required>
          <Field.Label>{texts.firstName}</Field.Label>
          <TextInput ref={firstNameRef} name="firstName" autoComplete="given-name" />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{texts.lastName}</Field.Label>
          <TextInput name="lastName" autoComplete="family-name" />
        </Field.Root>
        <Fieldset.HelpText>{texts.nameHelpText}</Fieldset.HelpText>
        <Fieldset.ErrorMessage>{texts.nameError}</Fieldset.ErrorMessage>
      </Fieldset.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.send}
      </Button>
    </Stack>
  )
}
