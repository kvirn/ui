'use client'
import { Button, Card, Heading } from '@kvirn-ui/react'
import { useCardTexts } from './texts.ts'

export function CardWithDividers() {
  const { texts, textLang } = useCardTexts()
  return (
    <Card.Root className="kv-card--dividers kv-card--padding-sm" lang={textLang}>
      <Card.Header>
        <Heading as="h4">{texts.dividers.heading}</Heading>
      </Card.Header>
      <Card.Body className="kv-prose">
        <p>{texts.dividers.text}</p>
        <p>{texts.dividers.next}</p>
      </Card.Body>
      <Card.Footer>
        <Button>{texts.dividers.open}</Button>
      </Card.Footer>
    </Card.Root>
  )
}
