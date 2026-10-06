'use client'
import { Button, ErrorSummary, Field, Fieldset, Stack, TextInput } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useErrorSummaryTexts } from './texts.ts'

export function GroupError() {
  const { texts, textLang } = useErrorSummaryTexts()
  const firstNameId = `${useId()}-first-name`
  const [submitCount, setSubmitCount] = useState(0)
  const [isIncomplete, setIsIncomplete] = useState(false)

  return (
    <Stack gap="8" lang={textLang}>
      {isIncomplete ? (
        <ErrorSummary.Root focusKey={submitCount}>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId={firstNameId}>{texts.nameError}</ErrorSummary.Link>
            </ErrorSummary.Item>
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <Stack
        gap="8"
        render={
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              setIsIncomplete(data.get('firstName') === '' || data.get('lastName') === '')
              setSubmitCount((count) => count + 1)
            }}
          />
        }
      >
        <Fieldset.Root group required invalid={isIncomplete}>
          <Fieldset.Legend>{texts.nameQuestion}</Fieldset.Legend>
          <Field.Root controlId={firstNameId} required>
            <Field.Label>{texts.firstName}</Field.Label>
            <TextInput name="firstName" autoComplete="given-name" />
          </Field.Root>
          <Field.Root required>
            <Field.Label>{texts.lastName}</Field.Label>
            <TextInput name="lastName" autoComplete="family-name" />
          </Field.Root>
          <Fieldset.ErrorMessage>{texts.nameError}</Fieldset.ErrorMessage>
        </Fieldset.Root>
        <Button type="submit" className="kv-button--primary">
          {texts.send}
        </Button>
      </Stack>
    </Stack>
  )
}
