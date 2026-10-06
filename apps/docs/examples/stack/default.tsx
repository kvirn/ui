'use client'
import { Heading, Stack } from '@kvirn-ui/react'
import { useStackTexts } from './texts.ts'

export function DefaultStack() {
  const { texts, textLang } = useStackTexts()
  return (
    <Stack lang={textLang}>
      <Heading level={2}>{texts.sections.contact}</Heading>
      <p>{texts.sections.contactText}</p>
    </Stack>
  )
}
