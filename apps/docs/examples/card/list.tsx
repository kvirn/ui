'use client'
import { Card, Heading, Link } from '@kvirn-ui/react'
import { useCardTexts } from './texts.ts'

export function NewsList() {
  const { texts, textLang } = useCardTexts()
  const items = [texts.news.recycling, texts.news.snow, texts.news.grants]
  return (
    <ul role="list" className="kv-stack" lang={textLang}>
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
  )
}
