'use client'
import { Field, OneTimeCode } from '@kvirn-ui/react'
import { useState } from 'react'
import { useOneTimeCodeTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

const pattern = '&&&&-&&&&'

export function TwoGroups() {
  const { texts, isFallback } = useOneTimeCodeTexts()
  const [entered, setEntered] = useState<{ value: string; unmaskedValue: string }>()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
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
    </InEnglishWhenFallback>
  )
}
