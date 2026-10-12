'use client'
import { Field, Textarea } from '@kvirn-ui/react'
import { useTextareaTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

// The server stores a line break as two characters, so the count adds one for each.
const countLikeTheServer = (value: string) => value.replaceAll('\n', '\r\n').length

export function CountYourWay() {
  const { texts, isFallback } = useTextareaTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Field.Root required>
        <Field.Label>{texts.label}</Field.Label>
        <Textarea
          name="situation"
          maxLength={200}
          characterCount
          countCharacters={countLikeTheServer}
        />
        <Field.HelpText>{texts.lineBreakHint}</Field.HelpText>
      </Field.Root>
    </InEnglishWhenFallback>
  )
}
