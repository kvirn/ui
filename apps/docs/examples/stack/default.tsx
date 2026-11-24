'use client'
import { Heading, Stack } from '@kvirn/ui'
import { useStackTexts } from './texts.ts'

export function DefaultStack() {
  const { texts } = useStackTexts()
  return (
    <Stack>
      <Heading as="h3">{texts.sections.contact}</Heading>
      <p>{texts.sections.contactText}</p>
    </Stack>
  )
}
