'use client'
import {
  DateRangePicker,
  Field,
  Fieldset,
  TextInput,
  isoDateToMaskedDate,
  masks,
  maskedDateToIsoDate,
  useLocale,
} from '@kvirn-ui/react'
import { useState } from 'react'
import { useDateRangePickerTexts } from './texts.ts'

export function StayDates() {
  const { texts, textLang } = useDateRangePickerTexts()
  const { locale } = useLocale()
  const [fieldTexts, setFieldTexts] = useState({ start: '', end: '' })
  const example = masks.date().withLocale(locale).format('2026-10-27')
  return (
    <div lang={textLang}>
      <DateRangePicker.Root
        value={{
          start: maskedDateToIsoDate(fieldTexts.start, locale),
          end: maskedDateToIsoDate(fieldTexts.end, locale),
        }}
        onValueChange={(range) =>
          setFieldTexts({
            start: isoDateToMaskedDate(range.start, locale),
            end: isoDateToMaskedDate(range.end, locale),
          })
        }
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
            <Field.Root>
              <Field.Label>{texts.to}</Field.Label>
              <TextInput
                name="end"
                mask={masks.date()}
                className="kv-input--width-10"
                value={fieldTexts.end}
                onValueChange={(end) => setFieldTexts((current) => ({ ...current, end }))}
              />
              <Field.HelpText>{texts.hint(example)}</Field.HelpText>
            </Field.Root>
            <DateRangePicker.Trigger />
          </div>
        </Fieldset.Root>
        <DateRangePicker.Popup />
      </DateRangePicker.Root>
    </div>
  )
}
