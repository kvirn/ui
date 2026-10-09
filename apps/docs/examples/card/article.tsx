'use client'
import { Card, Heading } from '@kvirn-ui/react'
import { useId } from 'react'
import { useCardTexts } from './texts.ts'

export function ArticleCard() {
  const { texts, textLang } = useCardTexts()
  const headingId = useId()
  return (
    <Card.Root as="article" aria-labelledby={headingId} lang={textLang}>
      <Card.Body className="kv-prose">
        <Heading as="h4" id={headingId}>
          {texts.article.title}
        </Heading>
        <p>{texts.article.text}</p>
      </Card.Body>
    </Card.Root>
  )
}
