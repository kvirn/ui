'use client'
import { Card, Heading } from '@kvirn-ui/react'
import { useCardTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function DefaultCard() {
  const { texts, isFallback } = useCardTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Card.Root className="kv-prose">
        <Heading as="h3">{texts.service.heading}</Heading>
        <p>{texts.service.text}</p>
      </Card.Root>
    </InEnglishWhenFallback>
  )
}
