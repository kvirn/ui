'use client'
import { Field, TextInput, useAnnouncer } from '@kvirn-ui/react'
import { useAnnouncerTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ThrottledAnnouncer() {
  const { texts, isFallback } = useAnnouncerTexts()
  const { announce } = useAnnouncer()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root>
        <Field.Label marker="none">{texts.digits.label}</Field.Label>
        <TextInput
          inputMode="numeric"
          autoComplete="off"
          onChange={(event) => {
            if (/\D/.test(event.currentTarget.value)) {
              announce(texts.digits.message, { key: 'phone-number' })
            }
          }}
        />
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
