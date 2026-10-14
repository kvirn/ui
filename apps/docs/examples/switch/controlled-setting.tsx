'use client'
import { Field, Switch } from '@kvirn-ui/react'
import { useState } from 'react'
import { useSwitchTexts } from './texts.ts'

export function ControlledSetting() {
  const { texts } = useSwitchTexts()
  const [isOn, setIsOn] = useState(false)
  return (
    <Field.Root>
      <Switch
        name="sms"
        checked={isOn}
        onCheckedChange={(checked) => {
          setIsOn(checked)
          // A real app saves here. See "When the save fails" for the error path.
        }}
      />
      <Field.Label marker="none">{texts.smsReminders}</Field.Label>
      <Field.HelpText>{texts.savedAtOnce}</Field.HelpText>
    </Field.Root>
  )
}
