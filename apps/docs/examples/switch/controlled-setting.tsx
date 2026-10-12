'use client'
import { Field, Switch } from '@kvirn-ui/react'
import { useState } from 'react'
import { useSwitchTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ControlledSetting() {
  const { texts, isFallback } = useSwitchTexts()
  const [isOn, setIsOn] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <>
        <Field.Root>
          <Switch
            name="sms"
            checked={isOn}
            onCheckedChange={(checked) => {
              setIsOn(checked)
              // A real app saves here, and shows an error and restores the old state if it fails.
              setMessage(checked ? texts.savedOn : texts.savedOff)
            }}
          />
          <Field.Label marker="none">{texts.smsReminders}</Field.Label>
          <Field.HelpText>{texts.savedAtOnce}</Field.HelpText>
        </Field.Root>
        <output>{message}</output>
      </>
    </InEnglishWhenFallback>
  )
}
