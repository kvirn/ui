'use client'
import {
  Button,
  ButtonGroup,
  ErrorSummary,
  Field,
  Stack,
  TextInput,
  useToast,
} from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useToastTexts } from './texts.ts'

export function ClearBeforeSummary() {
  const { texts } = useToastTexts()
  const toast = useToast()
  const placeId = `${useId()}-place`
  const [submitCount, setSubmitCount] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [isSent, setIsSent] = useState(false)

  return (
    <Stack className="kv-stack--gap-8">
      {hasError ? (
        <ErrorSummary.Root focusKey={submitCount}>
          {/* The docs page already has an h1, so the summary's title is an h4. On your pages the default is h2. */}
          <ErrorSummary.Title as="h4" />
          <ErrorSummary.List>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId={placeId}>{texts.faultPlaceError}</ErrorSummary.Link>
            </ErrorSummary.Item>
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          // A toast from earlier would compete with the summary. The problem is shown in the form.
          toast.dismissAll()
          const place = new FormData(event.currentTarget).get('place')
          const isMissing = place === ''
          setHasError(isMissing)
          setIsSent(!isMissing)
          setSubmitCount((count) => count + 1)
        }}
      >
        <Field.Root controlId={placeId} invalid={hasError}>
          <Field.Label>{texts.faultPlace}</Field.Label>
          <TextInput name="place" />
          <Field.ErrorMessage>{texts.faultPlaceError}</Field.ErrorMessage>
        </Field.Root>
        <ButtonGroup aria-label={texts.reportActions}>
          <Button
            onClick={() => {
              setHasError(false)
              setIsSent(false)
              toast.show({ variant: 'success', title: texts.savedForLater })
            }}
          >
            {texts.saveForLater}
          </Button>
          <Button type="submit" className="kv-button--primary">
            {texts.sendFault}
          </Button>
        </ButtonGroup>
      </form>
      <output>{isSent ? texts.faultSent : null}</output>
    </Stack>
  )
}
