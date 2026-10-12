'use client'
import { Button, Field, OneTimeCode } from '@kvirn-ui/react'
import { useState } from 'react'
import { useOneTimeCodeTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

const pattern = '999999'

export function PlainForm() {
  const { texts, isFallback } = useOneTimeCodeTexts()
  const [isIncomplete, setIsIncomplete] = useState(false)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <form
        noValidate
        onSubmit={(event) => {
          // A real form sends the data from here.
          event.preventDefault()
          const code = new FormData(event.currentTarget).get('code')
          setIsIncomplete(typeof code !== 'string' || code.length < pattern.length)
        }}
      >
        <Field.Root invalid={isIncomplete}>
          <Field.Label marker="none">{texts.smsLabel}</Field.Label>
          <Field.Prose>
            <p>{texts.plainHint}</p>
          </Field.Prose>
          <OneTimeCode.Root pattern={pattern} onValueChange={() => setIsIncomplete(false)}>
            <OneTimeCode.Input name="code" />
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
    </InEnglishWhenFallback>
  )
}
