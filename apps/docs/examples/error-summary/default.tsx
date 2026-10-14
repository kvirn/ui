'use client'
import { Button, ErrorSummary, Field, Stack, TextInput } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useErrorSummaryTexts } from './texts.ts'

export function DefaultErrorSummary() {
  const { texts } = useErrorSummaryTexts()
  const idPrefix = useId()
  const [isShown, setIsShown] = useState(false)
  const emailId = `${idPrefix}-email`
  const phoneId = `${idPrefix}-phone`
  return (
    <Stack className="kv-stack--gap-8">
      <Button onClick={() => setIsShown(true)}>{texts.showSummary}</Button>
      {isShown ? (
        <ErrorSummary.Root>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId={emailId}>{texts.emailError}</ErrorSummary.Link>
            </ErrorSummary.Item>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId={phoneId}>{texts.phoneError}</ErrorSummary.Link>
            </ErrorSummary.Item>
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <Field.Root controlId={emailId} invalid={isShown}>
        <Field.Label>{texts.email}</Field.Label>
        <TextInput type="email" autoComplete="email" />
        <Field.ErrorMessage>{texts.emailError}</Field.ErrorMessage>
      </Field.Root>
      <Field.Root controlId={phoneId} invalid={isShown}>
        <Field.Label>{texts.phone}</Field.Label>
        <TextInput type="tel" autoComplete="tel" />
        <Field.ErrorMessage>{texts.phoneError}</Field.ErrorMessage>
      </Field.Root>
    </Stack>
  )
}
