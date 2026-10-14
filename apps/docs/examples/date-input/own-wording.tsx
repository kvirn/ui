'use client'
import {
  DateInput,
  Field,
  Fieldset,
  TextInput,
  masks,
  useDateInput,
  useLocale,
} from '@kvirn-ui/react'
import { useDateInputTexts } from './texts.ts'

export function OwnWordingDate() {
  const { texts } = useDateInputTexts()
  const { order } = useDateInput()
  const { locale } = useLocale()
  const example = masks.date().withLocale(locale).format('2026-10-27')
  return (
    <>
      <Fieldset.Root group required>
        <Fieldset.Legend>{texts.legend}</Fieldset.Legend>
        <DateInput.Root name="birth" autoComplete="bday" messages={{ year: texts.birthYear }} />
        <Fieldset.HelpText>
          {order[0] === 'year' ? texts.hintYearFirst : texts.hintDayFirst}
        </Fieldset.HelpText>
      </Fieldset.Root>
      <Field.Root required>
        <Field.Label>{texts.oneFieldLabel}</Field.Label>
        <TextInput
          name="start"
          mask={masks.date()}
          messages={{ characterNotAllowed: () => texts.digitsOnly }}
          className="kv-input--width-10"
        />
        <Field.HelpText>{texts.oneFieldHint(example)}</Field.HelpText>
      </Field.Root>
    </>
  )
}
