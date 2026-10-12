'use client'
import { Button, Field, Switch } from '@kvirn-ui/react'
import { useState } from 'react'
import { useSwitchTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function PlainForm() {
  const { texts, isFallback } = useSwitchTexts()
  const [sent, setSent] = useState<string | undefined>()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const sms = new FormData(event.currentTarget).get('sms')
          setSent(typeof sms === 'string' ? sms : texts.notChosen)
        }}
      >
        <Field.Root>
          <Switch name="sms" value="yes" defaultChecked />
          <Field.Label marker="none">{texts.smsReminders}</Field.Label>
        </Field.Root>
        <Button type="submit" className="kv-button--primary">
          {texts.send}
        </Button>
        {sent === undefined ? null : (
          <p>
            {texts.sent} {sent}
          </p>
        )}
      </form>
    </InEnglishWhenFallback>
  )
}
