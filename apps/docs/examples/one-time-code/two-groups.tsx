'use client'
import { Field, OneTimeCode } from '@kvirn-ui/react'
import { useState } from 'react'
import { useOneTimeCodeTexts } from './texts.ts'

const pattern = '&&&&-&&&&'

export function TwoGroups() {
  const { texts, textLang } = useOneTimeCodeTexts()
  const [entered, setEntered] = useState<{ value: string; unmaskedValue: string }>()
  return (
    <Field.Root lang={textLang}>
      <Field.Label marker="none">{texts.emailLabel}</Field.Label>
      <Field.Prose>
        <p>{texts.emailHint}</p>
      </Field.Prose>
      <OneTimeCode.Root
        pattern={pattern}
        onComplete={(value, unmaskedValue) => setEntered({ value, unmaskedValue })}
      >
        <OneTimeCode.Input name="code" />
        {Array.from(pattern, (_, index) => (
          <OneTimeCode.Slot key={index} index={index} />
        ))}
      </OneTimeCode.Root>
      {entered === undefined ? null : (
        <p>
          {texts.entered} {entered.value}. {texts.withoutDash} {entered.unmaskedValue}
        </p>
      )}
    </Field.Root>
  )
}
