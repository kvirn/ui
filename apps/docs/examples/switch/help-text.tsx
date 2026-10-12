'use client'
import { Field, Switch } from '@kvirn-ui/react'
import { useSwitchTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function WithHelpText() {
  const { texts, isFallback } = useSwitchTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
        <Switch name="sms" />
        <Field.Label marker="none">{texts.smsReminders}</Field.Label>
        <Field.HelpText>{texts.smsRemindersHint}</Field.HelpText>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
