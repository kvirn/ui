'use client'
import { Button, ErrorSummary, Field, PhoneInput, Stack } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { usePhoneInputTexts } from './texts.ts'

type PhoneError = 'empty' | 'format' | undefined

// Your own rule: here a number needs at least six digits. The server checks the real number.
function check(value: string): PhoneError {
  if (value.trim() === '') {
    return 'empty'
  }
  return value.replaceAll(/\D/g, '').length < 6 ? 'format' : undefined
}

export function CheckAfterSending() {
  const { texts } = usePhoneInputTexts()
  const phoneId = `${useId()}-phone`
  const [error, setError] = useState<PhoneError>(undefined)
  const [submitCount, setSubmitCount] = useState(0)
  const [isSent, setIsSent] = useState(false)
  const message = error === 'empty' ? texts.errorEmpty : texts.errorFormat

  return (
    <Stack className="kv-stack--gap-8">
      {error === undefined ? null : (
        <ErrorSummary.Root focusKey={submitCount}>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId={phoneId}>{message}</ErrorSummary.Link>
            </ErrorSummary.Item>
          </ErrorSummary.List>
        </ErrorSummary.Root>
      )}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const value = new FormData(event.currentTarget).get('phone')
          const next = check(typeof value === 'string' ? value : '')
          setError(next)
          setSubmitCount((count) => count + 1)
          setIsSent(next === undefined)
        }}
      >
        <Field.Root controlId={phoneId} required invalid={error !== undefined}>
          <Field.Label>{texts.label}</Field.Label>
          <PhoneInput.Number name="phone" defaultValue="070-17" />
          <Field.HelpText>{texts.help}</Field.HelpText>
          <Field.ErrorMessage>{message}</Field.ErrorMessage>
        </Field.Root>
        <Button type="submit" className="kv-button--primary">
          {texts.send}
        </Button>
      </form>
      <output>{isSent ? texts.sent : null}</output>
    </Stack>
  )
}
