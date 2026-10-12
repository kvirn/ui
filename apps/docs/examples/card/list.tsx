'use client'
import { Card, Heading, Link } from '@kvirn-ui/react'
import { useCardTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function NewsList() {
  const { texts, isFallback } = useCardTexts()
  const items = [texts.news.recycling, texts.news.snow, texts.news.grants]
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <ul role="list" className="kv-stack">
        {items.map((item) => (
          <Card.Root key={item.title} as="li">
            <Card.Body className="kv-prose">
              <Heading as="h4">
                <Link href="#">{item.title}</Link>
              </Heading>
              <p>{item.excerpt}</p>
            </Card.Body>
          </Card.Root>
        ))}
      </ul>
    </InEnglishWhenFallback>
  )
}
