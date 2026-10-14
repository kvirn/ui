'use client'
import { Field, OneTimeCode } from '@kvirn-ui/react'
import { useState } from 'react'
import { useOneTimeCodeTexts } from './texts.ts'

const pattern = '999999'

export function RefusedCharacters() {
  const { texts } = useOneTimeCodeTexts()
  const [hasRefusedLetter, setHasRefusedLetter] = useState(false)
  return (
    <Field.Root>
      <Field.Label marker="none">{texts.smsLabel}</Field.Label>
      <Field.Prose>
        <p>{texts.plainHint}</p>
      </Field.Prose>
      <OneTimeCode.Root
        pattern={pattern}
        // The same words are announced politely and shown below, so what a screen reader user
        // hears and what a sighted user reads match.
        messages={{ characterNotAllowed: () => texts.onlyDigits }}
        onValueChange={(_value, details) => {
          // `rejected` lists what the mask dropped from this change, by reason. A full code is
          // reported as `length`, so only `digits` means a non-digit was typed or pasted.
          setHasRefusedLetter(details.rejected?.some(({ reason }) => reason === 'digits') ?? false)
        }}
      >
        <OneTimeCode.Input name="code" />
        {Array.from(pattern, (_, index) => (
          <OneTimeCode.Slot key={index} index={index} />
        ))}
      </OneTimeCode.Root>
      {hasRefusedLetter ? <Field.HelpText>{texts.onlyDigits}</Field.HelpText> : null}
    </Field.Root>
  )
}
