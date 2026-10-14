'use client'
import { Button, Field, OneTimeCode } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useOneTimeCodeTexts } from './texts.ts'

const pattern = '999999'

export function PlainForm() {
  const { texts } = useOneTimeCodeTexts()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isIncomplete, setIsIncomplete] = useState(false)
  const [attempts, setAttempts] = useState(0)

  // Focus moves after the error has rendered, so the screen reader reads it with the input.
  useEffect(() => {
    if (attempts > 0 && isIncomplete) {
      inputRef.current?.focus()
    }
  }, [attempts, isIncomplete])

  return (
    <form
      noValidate
      onSubmit={(event) => {
        // A real form sends the data from here.
        event.preventDefault()
        const code = new FormData(event.currentTarget).get('code')
        setIsIncomplete(typeof code !== 'string' || code.length < pattern.length)
        setAttempts((count) => count + 1)
      }}
    >
      <Field.Root invalid={isIncomplete}>
        <Field.Label marker="none">{texts.smsLabel}</Field.Label>
        <Field.Prose>
          <p>{texts.plainHint}</p>
        </Field.Prose>
        <OneTimeCode.Root pattern={pattern} onValueChange={() => setIsIncomplete(false)}>
          <OneTimeCode.Input ref={inputRef} name="code" />
          {Array.from(pattern, (_, index) => (
            <OneTimeCode.Slot key={index} index={index} />
          ))}
        </OneTimeCode.Root>
        <Field.ErrorMessage>{texts.incomplete}</Field.ErrorMessage>
      </Field.Root>
      <Button type="submit" className="kv-button--primary">
        {texts.submit}
      </Button>
    </form>
  )
}
