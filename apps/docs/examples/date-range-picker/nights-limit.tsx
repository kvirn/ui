'use client'
import {
  Button,
  DateRangePicker,
  Field,
  Fieldset,
  Stack,
  TextInput,
  isoDateToMaskedDate,
  masks,
  maskedDateToIsoDate,
  useLocale,
} from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useDateRangePickerTexts } from './texts.ts'

const maximumNights = 14
const dayInMilliseconds = 24 * 60 * 60 * 1000

export function LimitedStay() {
  const { texts } = useDateRangePickerTexts()
  const { locale } = useLocale()
  const endRef = useRef<HTMLInputElement>(null)
  const [fieldTexts, setFieldTexts] = useState({ start: '', end: '' })
  const [error, setError] = useState<string | undefined>(undefined)
  const [isChecked, setIsChecked] = useState(false)
  const [focusRequest, setFocusRequest] = useState(0)
  const example = masks.date().withLocale(locale).format('2026-10-27')

  useEffect(() => {
    if (focusRequest > 0) {
      endRef.current?.focus()
    }
  }, [focusRequest])

  // A typed range can be reversed or too long, which the picker never produces: check it here.
  const checkStay = () => {
    const start = maskedDateToIsoDate(fieldTexts.start, locale)
    const end = maskedDateToIsoDate(fieldTexts.end, locale)
    if (start === '' || end === '') {
      return texts.errorMissing(example)
    }
    const nights = (Date.parse(end) - Date.parse(start)) / dayInMilliseconds
    if (nights < 0) {
      return texts.errorOrder
    }
    return nights > maximumNights ? texts.errorTooLong : undefined
  }

  return (
    <div>
      <DateRangePicker.Root
        today="2026-10-14"
        minimum="2026-10-14"
        maximumDays={maximumNights + 1}
        value={{
          start: maskedDateToIsoDate(fieldTexts.start, locale),
          end: maskedDateToIsoDate(fieldTexts.end, locale),
        }}
        onValueChange={(range) => {
          setFieldTexts({
            start: isoDateToMaskedDate(range.start, locale),
            end: isoDateToMaskedDate(range.end, locale),
          })
          setError(undefined)
        }}
      >
        <Stack
          className="kv-stack--gap-8"
          as="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            const next = checkStay()
            setError(next)
            setIsChecked(next === undefined)
            if (next !== undefined) {
              setFocusRequest((request) => request + 1)
            }
          }}
        >
          <Fieldset.Root group>
            <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
            <div className="kv-date-range-row">
              <Field.Root>
                <Field.Label>{texts.from}</Field.Label>
                <TextInput
                  name="start"
                  mask={masks.date()}
                  className="kv-input--width-10"
                  value={fieldTexts.start}
                  onValueChange={(start) => setFieldTexts((current) => ({ ...current, start }))}
                />
                <Field.HelpText>{texts.hint(example)}</Field.HelpText>
              </Field.Root>
              <Field.Root invalid={error !== undefined}>
                <Field.Label>{texts.to}</Field.Label>
                <TextInput
                  ref={endRef}
                  name="end"
                  mask={masks.date()}
                  className="kv-input--width-10"
                  value={fieldTexts.end}
                  onValueChange={(end) => setFieldTexts((current) => ({ ...current, end }))}
                />
                <Field.HelpText>{texts.hint(example)}</Field.HelpText>
                <Field.ErrorMessage>{error}</Field.ErrorMessage>
              </Field.Root>
              <DateRangePicker.Trigger />
            </div>
            <Fieldset.HelpText>{texts.limit}</Fieldset.HelpText>
          </Fieldset.Root>
          <Button type="submit" className="kv-button--primary">
            {texts.check}
          </Button>
          <output>{isChecked ? texts.checked : null}</output>
        </Stack>
        <DateRangePicker.Popup />
      </DateRangePicker.Root>
    </div>
  )
}
