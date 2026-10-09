'use client'
import { Card, Heading } from '@kvirn-ui/react'
import { useCardTexts } from './texts.ts'

export function DefaultCard() {
  const { texts, textLang } = useCardTexts()
  return (
    <Card.Root className="kv-prose" lang={textLang}>
      <Heading as="h3">{texts.service.heading}</Heading>
      <p>{texts.service.text}</p>
    </Card.Root>
  )
}
