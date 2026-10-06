'use client'
import { Button, Field, OneTimeCode, useAnnouncer } from '@kvirn-ui/react'
import { useState } from 'react'
import { useOneTimeCodeTexts } from './texts.ts'

const pattern = '999999'

export function CheckedAsEntered() {
  const { texts, textLang } = useOneTimeCodeTexts()
  const { announce } = useAnnouncer()
  const [value, setValue] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isWrong, setIsWrong] = useState(false)
  return (
    <form noValidate onSubmit={(event) => event.preventDefault()}>
      <Field.Root invalid={isWrong} lang={textLang}>
        <Field.Label marker="none">{texts.smsLabel}</Field.Label>
        <Field.Prose>
          <p>{texts.smsHint}</p>
        </Field.Prose>
        <OneTimeCode.Root
          pattern={pattern}
          value={value}
          onValueChange={(next) => {
            setValue(next)
            setIsWrong(false)
          }}
          onComplete={() => {
            setIsChecking(true)
            announce(texts.checking)
            // Your own check goes here. This one always finds the code wrong.
            setTimeout(() => {
              setIsChecking(false)
              setIsWrong(true)
            }, 1000)
          }}
        >
          <OneTimeCode.Input name="code" readOnly={isChecking} />
          {Array.from(pattern, (_, index) => (
            <OneTimeCode.Slot key={index} index={index} />
          ))}
        </OneTimeCode.Root>
        <Field.ErrorMessage>{texts.wrong}</Field.ErrorMessage>
      </Field.Root>
      <Button type="submit" className="kv-button--primary" lang={textLang}>
        {texts.submit}
      </Button>
    </form>
  )
}
