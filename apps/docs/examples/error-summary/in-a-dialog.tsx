'use client'
import { Button, Dialog, ErrorSummary, Field, TextInput } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useErrorSummaryTexts } from './texts.ts'

export function InADialog() {
  const { texts } = useErrorSummaryTexts()
  const phoneId = `${useId()}-phone`
  const [isOpen, setIsOpen] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [savedPhone, setSavedPhone] = useState('')

  return (
    <>
      <Dialog.Root
        open={isOpen}
        onOpenChange={(nextOpen) => {
          setIsOpen(nextOpen)
          // A closed dialog keeps its content, so clear the summary or it is there when it reopens.
          setHasError(false)
        }}
      >
        <Dialog.Trigger className="kv-button">{texts.changePhone}</Dialog.Trigger>
        <Dialog.Popup>
          <Dialog.Title>{texts.changePhone}</Dialog.Title>
          <Dialog.Close />
          <Dialog.Description>{texts.changePhoneText}</Dialog.Description>
          {hasError ? (
            <ErrorSummary.Root focusKey={submitCount}>
              {/* The dialog's title is an h2, so the summary's is one level down. */}
              <ErrorSummary.Title as="h3" />
              <ErrorSummary.List>
                <ErrorSummary.Item>
                  <ErrorSummary.Link controlId={phoneId}>{texts.phoneError}</ErrorSummary.Link>
                </ErrorSummary.Item>
              </ErrorSummary.List>
            </ErrorSummary.Root>
          ) : null}
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              const phone = new FormData(event.currentTarget).get('phone')
              const isMissing = typeof phone !== 'string' || phone.trim() === ''
              setHasError(isMissing)
              setSubmitCount((count) => count + 1)
              if (!isMissing) {
                setSavedPhone(phone)
                setIsOpen(false)
              }
            }}
          >
            <Dialog.Body>
              <Field.Root controlId={phoneId} required invalid={hasError}>
                <Field.Label>{texts.phone}</Field.Label>
                <TextInput name="phone" type="tel" autoComplete="tel" />
                <Field.ErrorMessage>{texts.phoneError}</Field.ErrorMessage>
              </Field.Root>
            </Dialog.Body>
            <Dialog.Actions>
              <Button type="submit" className="kv-button--primary">
                {texts.saveNumber}
              </Button>
              <Dialog.Close className="kv-button">{texts.keepNumber}</Dialog.Close>
            </Dialog.Actions>
          </form>
        </Dialog.Popup>
      </Dialog.Root>
      <output>{savedPhone === '' ? null : `${texts.numberSaved} ${savedPhone}`}</output>
    </>
  )
}
