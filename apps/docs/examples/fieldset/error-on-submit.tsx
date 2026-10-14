'use client'
import { Button, Field, Fieldset, Stack, TextInput } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useFieldsetTexts } from './texts.ts'

type NameField = 'firstName' | 'lastName'

export function GroupError() {
  const { texts } = useFieldsetTexts()
  const inputs = useRef<Record<NameField, HTMLInputElement | null>>({
    firstName: null,
    lastName: null,
  })
  const [invalid, setInvalid] = useState(false)
  const [focusRequest, setFocusRequest] = useState<{ field: NameField } | undefined>(undefined)

  // Focus moves after the error has rendered, so the group's description includes it.
  useEffect(() => {
    if (focusRequest !== undefined) {
      inputs.current[focusRequest.field]?.focus()
    }
  }, [focusRequest])

  return (
    <Stack
      className="kv-stack--gap-8"
      as="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const firstEmpty: NameField | undefined =
          data.get('firstName') === ''
            ? 'firstName'
            : data.get('lastName') === ''
              ? 'lastName'
              : undefined
        setInvalid(firstEmpty !== undefined)
        if (firstEmpty !== undefined) {
          setFocusRequest({ field: firstEmpty })
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
          <TextInput
            ref={(element) => {
              inputs.current.firstName = element
            }}
            name="firstName"
            autoComplete="given-name"
          />
        </Field.Root>
        <Field.Root required>
          <Field.Label>{texts.lastName}</Field.Label>
          <TextInput
            ref={(element) => {
              inputs.current.lastName = element
            }}
            name="lastName"
            autoComplete="family-name"
          />
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
