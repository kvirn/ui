'use client'
import { Button, Checkbox, ErrorSummary, Field, RadioGroup, Stack } from '@kvirn-ui/react'
import { useId, useState } from 'react'
import { useErrorSummaryTexts } from './texts.ts'

export function MixedControls() {
  const { texts } = useErrorSummaryTexts()
  const idPrefix = useId()
  // A group of options is linked by the id of its first option.
  const firstVehicleId = `${idPrefix}-car`
  const confirmId = `${idPrefix}-confirm`
  const [submitCount, setSubmitCount] = useState(0)
  const [errors, setErrors] = useState({ vehicle: false, confirm: false })
  const [isSent, setIsSent] = useState(false)
  const hasErrors = errors.vehicle || errors.confirm

  return (
    <Stack className="kv-stack--gap-8">
      {hasErrors ? (
        <ErrorSummary.Root focusKey={submitCount}>
          {/* The docs page already has an h1, so the summary's title is an h4. On your pages the default is h2. */}
          <ErrorSummary.Title as="h4" />
          <ErrorSummary.List>
            {errors.vehicle ? (
              <ErrorSummary.Item>
                <ErrorSummary.Link controlId={firstVehicleId}>
                  {texts.vehicleError}
                </ErrorSummary.Link>
              </ErrorSummary.Item>
            ) : null}
            {errors.confirm ? (
              <ErrorSummary.Item>
                <ErrorSummary.Link controlId={confirmId}>{texts.confirmError}</ErrorSummary.Link>
              </ErrorSummary.Item>
            ) : null}
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          const next = {
            vehicle: data.get('vehicle') === null,
            confirm: data.get('confirm') === null,
          }
          setErrors(next)
          setSubmitCount((count) => count + 1)
          setIsSent(!next.vehicle && !next.confirm)
        }}
      >
        <Stack className="kv-stack--gap-8">
          <RadioGroup.Root name="vehicle" required invalid={errors.vehicle}>
            <RadioGroup.Legend>{texts.vehicleLegend}</RadioGroup.Legend>
            <Field.Root controlId={firstVehicleId}>
              <RadioGroup.Radio value="car" />
              <Field.Label>{texts.car}</Field.Label>
            </Field.Root>
            <Field.Root>
              <RadioGroup.Radio value="motorcycle" />
              <Field.Label>{texts.motorcycle}</Field.Label>
            </Field.Root>
            <RadioGroup.ErrorMessage>{texts.vehicleError}</RadioGroup.ErrorMessage>
          </RadioGroup.Root>
          <Field.Root controlId={confirmId} required invalid={errors.confirm}>
            <Checkbox name="confirm" value="yes" />
            <Field.Label>{texts.confirm}</Field.Label>
            <Field.ErrorMessage>{texts.confirmError}</Field.ErrorMessage>
          </Field.Root>
          <Button type="submit" className="kv-button--primary">
            {texts.send}
          </Button>
        </Stack>
      </form>
      <output>{isSent ? texts.sent : null}</output>
    </Stack>
  )
}
