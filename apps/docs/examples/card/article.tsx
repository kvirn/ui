'use client'
import { Card, Heading } from '@kvirn-ui/react'
import { useId } from 'react'
import { useCardTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ArticleCard() {
  const { texts, isFallback } = useCardTexts()
  const headingId = useId()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Card.Root as="article" aria-labelledby={headingId}>
        <Card.Body className="kv-prose">
          <Heading as="h4" id={headingId}>
            {texts.article.title}
          </Heading>
          <p>{texts.article.text}</p>
        </Card.Body>
      </Card.Root>
    </InEnglishWhenFallback>
  )
}
