'use client'
import { Field, Switch } from '@kvirn-ui/react'
import { useSwitchTexts } from './texts.ts'

export function WithHelpText() {
  const { texts } = useSwitchTexts()
  return (
    <Field.Root>
      <Switch name="sms" />
      <Field.Label marker="none">{texts.smsReminders}</Field.Label>
      <Field.HelpText>{texts.smsRemindersHint}</Field.HelpText>
    </Field.Root>
  )
}
