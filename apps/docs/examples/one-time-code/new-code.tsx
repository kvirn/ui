'use client'
import { Button, Field, OneTimeCode, useAnnouncer } from '@kvirn-ui/react'
import { useState } from 'react'
import { useOneTimeCodeTexts } from './texts.ts'

const pattern = '999999'

export function NewCode() {
  const { texts } = useOneTimeCodeTexts()
  const { announce } = useAnnouncer()
  const [isSent, setIsSent] = useState(false)
  return (
    <form noValidate onSubmit={(event) => event.preventDefault()}>
      <Field.Root>
        <Field.Label marker="none">{texts.smsLabel}</Field.Label>
        <Field.Prose>
          <p>{texts.validHint}</p>
        </Field.Prose>
        {/* The code is not controlled here, and the button below never touches it: what the
            user has typed stays, so they can still fix one digit. */}
        <OneTimeCode.Root pattern={pattern}>
          <OneTimeCode.Input name="code" />
          {Array.from(pattern, (_, index) => (
            <OneTimeCode.Slot key={index} index={index} />
          ))}
        </OneTimeCode.Root>
      </Field.Root>
      <p>
        <Button
          type="button"
          className="kv-button"
          onClick={() => {
            // Your own call that sends the code goes here.
            setIsSent(true)
            // Focus stays on the button, so say what happened aloud as well as on the page.
            announce(texts.newCodeSent)
          }}
        >
          {texts.sendNew}
        </Button>
      </p>
      {isSent ? <p>{texts.newCodeSent}</p> : null}
      <Button type="submit" className="kv-button--primary">
        {texts.submit}
      </Button>
    </form>
  )
}
