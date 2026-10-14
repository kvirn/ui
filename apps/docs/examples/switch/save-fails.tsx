'use client'
import { Field, Switch, useAnnouncer } from '@kvirn-ui/react'
import { useState } from 'react'
import { useSwitchTexts } from './texts.ts'

// Stands in for a save that does not succeed, such as no connection.
function saveSetting(): Promise<void> {
  return Promise.reject(new Error('offline'))
}

export function SaveFails() {
  const { texts } = useSwitchTexts()
  const { announce } = useAnnouncer()
  const [isOn, setIsOn] = useState(false)
  const [failed, setFailed] = useState(false)
  return (
    <Field.Root invalid={failed}>
      <Switch
        name="sms"
        checked={isOn}
        onCheckedChange={(checked) => {
          setIsOn(checked)
          setFailed(false)
          saveSetting().catch(() => {
            // Put the old state back, say why under the switch, and announce it. Focus stays.
            setIsOn(!checked)
            setFailed(true)
            announce(texts.saveFailed)
          })
        }}
      />
      <Field.Label marker="none">{texts.smsReminders}</Field.Label>
      <Field.HelpText>{texts.savedAtOnce}</Field.HelpText>
      <Field.ErrorMessage>{texts.saveFailed}</Field.ErrorMessage>
    </Field.Root>
  )
}
