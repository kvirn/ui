'use client'
import { Field, Switch } from '@kvirn-ui/react'
import { useSwitchTexts } from './texts.ts'

export function WithHelpText() {
  const { texts, textLang } = useSwitchTexts()
  return (
    <Field.Root lang={textLang}>
      <Switch name="sms" />
      <Field.Label marker="none">{texts.smsReminders}</Field.Label>
      <Field.HelpText>{texts.smsRemindersHint}</Field.HelpText>
    </Field.Root>
  )
}
