'use client'
import { Button, ButtonGroup, Card } from '@kvirn-ui/react'
import { useButtonGroupTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function CardFooter() {
  const { texts, isFallback } = useButtonGroupTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Card.Root>
        <Card.Body className="kv-prose">
          <h4>{texts.cardTitle}</h4>
          <p>{texts.cardBody}</p>
        </Card.Body>
        <Card.Footer>
          <ButtonGroup>
            <Button className="kv-button--primary">{texts.orderExtra}</Button>
            <Button>{texts.pause}</Button>
          </ButtonGroup>
        </Card.Footer>
      </Card.Root>
    </InEnglishWhenFallback>
  )
}
