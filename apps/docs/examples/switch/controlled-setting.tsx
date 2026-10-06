'use client'
import { Field, Switch } from '@kvirn-ui/react'
import { useState } from 'react'
import { useSwitchTexts } from './texts.ts'

export function ControlledSetting() {
  const { texts, textLang } = useSwitchTexts()
  const [isOn, setIsOn] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  return (
    <>
      <Field.Root lang={textLang}>
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
      <output lang={textLang}>{message}</output>
    </>
  )
}
