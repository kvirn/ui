'use client'
import { Field, OneTimeCode } from '@kvirn-ui/react'
import { useOneTimeCodeTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

const pattern = '999999'

export function SmsCode() {
  const { texts, isFallback } = useOneTimeCodeTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
        <Field.Label marker="none">{texts.smsLabel}</Field.Label>
        <Field.Prose>
          <p>{texts.plainHint}</p>
        </Field.Prose>
        <OneTimeCode.Root pattern={pattern}>
          <OneTimeCode.Input name="code" />
          {Array.from(pattern, (_, index) => (
            <OneTimeCode.Slot key={index} index={index} />
          ))}
        </OneTimeCode.Root>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
