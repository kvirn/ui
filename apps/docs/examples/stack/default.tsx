'use client'
import { Heading, Stack } from '@kvirn-ui/react'
import { useStackTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultStack() {
  const { texts, isFallback } = useStackTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Stack>
        <Heading as="h2">{texts.sections.contact}</Heading>
        <p>{texts.sections.contactText}</p>
      </Stack>
    </InEnglishWhenFallback>
  )
}
