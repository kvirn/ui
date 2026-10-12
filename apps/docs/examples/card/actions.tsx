'use client'
import { Button, Card, Heading } from '@kvirn-ui/react'
import { useCardTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function CardWithActions() {
  const { texts, isFallback } = useCardTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Card.Root>
        <Card.Body className="kv-prose">
          <Heading as="h4">{texts.service.heading}</Heading>
          <p>{texts.service.text}</p>
        </Card.Body>
        <Card.Footer className="kv-button-group">
          <Button className="kv-button--primary">{texts.service.orderExtra}</Button>
          <Button>{texts.service.pause}</Button>
        </Card.Footer>
      </Card.Root>
    </InEnglishWhenFallback>
  )
}
