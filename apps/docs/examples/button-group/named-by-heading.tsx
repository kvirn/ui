'use client'
import { Button, ButtonGroup, Card } from '@kvirn-ui/react'
import { useId } from 'react'
import { useButtonGroupTexts } from './texts.ts'

export function NamedByHeading() {
  const { texts, textLang } = useButtonGroupTexts()
  const headingId = useId()
  return (
    <Card.Root lang={textLang}>
      <Card.Body className="kv-prose">
        <h4 id={headingId}>{texts.cardTitle}</h4>
        <p>{texts.cardBody}</p>
      </Card.Body>
      <Card.Footer>
        <ButtonGroup aria-labelledby={headingId}>
          <Button className="kv-button--primary">{texts.orderExtra}</Button>
          <Button>{texts.pause}</Button>
        </ButtonGroup>
      </Card.Footer>
    </Card.Root>
  )
}
