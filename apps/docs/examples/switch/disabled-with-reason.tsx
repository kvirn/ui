'use client'
import { Field, Switch } from '@kvirn-ui/react'
import { useSwitchTexts } from './texts.ts'

export function DisabledWithReason() {
  const { texts } = useSwitchTexts()
  return (
    <Field.Root disabled>
      <Switch name="sms" />
      <Field.Label marker="none">{texts.smsReminders}</Field.Label>
      <Field.HelpText>{texts.noMobileHint}</Field.HelpText>
    </Field.Root>
  )
}
