'use client'
import { Field, OneTimeCode } from '@kvirn-ui/react'
import { useOneTimeCodeTexts } from './texts.ts'

const pattern = '999999'

export function SmsCode() {
  const { texts, textLang } = useOneTimeCodeTexts()
  return (
    <Field.Root lang={textLang}>
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
  )
}
