'use client'
import { Heading, Stack } from '@kvirn-ui/react'
import { useStackTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function StackOfSections() {
  const { texts, isFallback } = useStackTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Stack className="kv-stack--gap-8">
        <Stack className="kv-stack--gap-2" as="section">
          <Heading as="h2">{texts.sections.contact}</Heading>
          <p>{texts.sections.contactText}</p>
        </Stack>
        <Stack className="kv-stack--gap-2" as="section">
          <Heading as="h2">{texts.sections.hours}</Heading>
          <p>{texts.sections.hoursText}</p>
        </Stack>
      </Stack>
    </InEnglishWhenFallback>
  )
}
