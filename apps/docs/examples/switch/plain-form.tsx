'use client'
import { Button, Field, Switch } from '@kvirn-ui/react'
import { useState } from 'react'
import { useSwitchTexts } from './texts.ts'

export function PlainForm() {
  const { texts, textLang } = useSwitchTexts()
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const sms = new FormData(event.currentTarget).get('sms')
        setSent(typeof sms === 'string' ? sms : texts.notChosen)
      }}
    >
      <Field.Root lang={textLang}>
        <Switch name="sms" value="yes" defaultChecked />
        <Field.Label marker="none">{texts.smsReminders}</Field.Label>
      </Field.Root>
      <Button type="submit" className="kv-button--primary" lang={textLang}>
        {texts.send}
      </Button>
      {sent === undefined ? null : (
        <p lang={textLang}>
          {texts.sent} {sent}
        </p>
      )}
    </form>
  )
}
