'use client'
import { Heading, Stack } from '@kvirn-ui/react'
import { useStackTexts } from './texts.ts'

export function StackOfSections() {
  const { texts, textLang } = useStackTexts()
  return (
    <Stack gap="8" lang={textLang}>
      <Stack gap="2" as="section">
        <Heading as="h2">{texts.sections.contact}</Heading>
        <p>{texts.sections.contactText}</p>
      </Stack>
      <Stack gap="2" as="section">
        <Heading as="h2">{texts.sections.hours}</Heading>
        <p>{texts.sections.hoursText}</p>
      </Stack>
    </Stack>
  )
}
