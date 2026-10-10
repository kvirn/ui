'use client'
import { Button, ErrorSummary, Field, Stack, TextInput } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useErrorSummaryTexts } from './texts.ts'

export function FailedSubmit() {
  const { texts, textLang } = useErrorSummaryTexts()
  const idPrefix = useId()
  const emailId = `${idPrefix}-email`
  const phoneId = `${idPrefix}-phone`
  const [submitCount, setSubmitCount] = useState(0)
  const [errors, setErrors] = useState({ email: false, phone: false })
  const [isSent, setIsSent] = useState(false)
  const hasErrors = errors.email || errors.phone

  return (
    <Stack className="kv-stack--gap-8" lang={textLang}>
      {hasErrors ? (
        <ErrorSummary.Root focusKey={submitCount}>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            {errors.email ? (
              <ErrorSummary.Item>
                <ErrorSummary.Link controlId={emailId}>{texts.emailError}</ErrorSummary.Link>
              </ErrorSummary.Item>
            ) : null}
            {errors.phone ? (
              <ErrorSummary.Item>
                <ErrorSummary.Link controlId={phoneId}>{texts.phoneError}</ErrorSummary.Link>
              </ErrorSummary.Item>
            ) : null}
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <Stack
        className="kv-stack--gap-8"

        as="form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          const next = { email: data.get('email') === '', phone: data.get('phone') === '' }
          setErrors(next)
          setSubmitCount((count) => count + 1)
          setIsSent(!next.email && !next.phone)
        }}
      >
        <Field.Root controlId={emailId} invalid={errors.email}>
          <Field.Label>{texts.email}</Field.Label>
          <TextInput name="email" type="email" autoComplete="email" />
          <Field.ErrorMessage>{texts.emailError}</Field.ErrorMessage>
        </Field.Root>
        <Field.Root controlId={phoneId} invalid={errors.phone}>
          <Field.Label>{texts.phone}</Field.Label>
          <TextInput name="phone" type="tel" autoComplete="tel" />
          <Field.ErrorMessage>{texts.phoneError}</Field.ErrorMessage>
        </Field.Root>
        <Button type="submit" className="kv-button--primary">
          {texts.send}
        </Button>
      </Stack>
      {isSent ? <p>{texts.sent}</p> : null}
    </Stack>
  )
}
