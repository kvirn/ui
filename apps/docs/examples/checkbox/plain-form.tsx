'use client'
import { Button, Checkbox, Field } from '@kvirn-ui/react'
import { useState } from 'react'
import { useCheckboxTexts } from './texts.ts'

export function PlainForm() {
  const { texts, textLang } = useCheckboxTexts()
  const [sent, setSent] = useState<string | undefined>()
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const newsletter = new FormData(event.currentTarget).get('newsletter')
        setSent(typeof newsletter === 'string' ? newsletter : texts.notChosen)
      }}
    >
      <Field.Root lang={textLang}>
        <Checkbox name="newsletter" value="yes" defaultChecked />
        <Field.Label>{texts.newsletter}</Field.Label>
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
