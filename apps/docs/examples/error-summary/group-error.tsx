'use client'
import { Button, ErrorSummary, Field, Fieldset, Stack, TextInput } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useErrorSummaryTexts } from './texts.ts'

export function GroupError() {
  const { texts } = useErrorSummaryTexts()
  const idPrefix = useId()
  const firstNameId = `${idPrefix}-first-name`
  const lastNameId = `${idPrefix}-last-name`
  const [submitCount, setSubmitCount] = useState(0)
  // The id of the first box left empty: the summary links to it.
  const [firstEmptyId, setFirstEmptyId] = useState<string | undefined>(undefined)

  return (
    <Stack className="kv-stack--gap-8">
      {firstEmptyId === undefined ? null : (
        <ErrorSummary.Root focusKey={submitCount}>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId={firstEmptyId}>{texts.nameError}</ErrorSummary.Link>
            </ErrorSummary.Item>
          </ErrorSummary.List>
        </ErrorSummary.Root>
      )}
      <Stack
        className="kv-stack--gap-8"
        as="form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          setFirstEmptyId(
            data.get('firstName') === ''
              ? firstNameId
              : data.get('lastName') === ''
                ? lastNameId
                : undefined,
          )
          setSubmitCount((count) => count + 1)
        }}
      >
        <Fieldset.Root group required invalid={firstEmptyId !== undefined}>
          <Fieldset.Legend>{texts.nameQuestion}</Fieldset.Legend>
          <Field.Root controlId={firstNameId} required>
            <Field.Label>{texts.firstName}</Field.Label>
            <TextInput name="firstName" autoComplete="given-name" />
          </Field.Root>
          <Field.Root controlId={lastNameId} required>
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
